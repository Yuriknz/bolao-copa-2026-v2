'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { Match, Pick, PHASE_LABELS, MatchPhase } from '@/types'
import MatchCard from '@/components/MatchCard'
import PageHeader from '@/components/PageHeader'
import BottomNav from '@/components/BottomNav'

const PHASE_ORDER: MatchPhase[] = ['groups', 'r16', 'qf', 'sf', 'final']

export default function CartelaBolaoPage() {
  const router = useRouter()
  const { code } = useParams<{ code: string }>()
  const [matches, setMatches] = useState<Match[]>([])
  const [picks, setPicks] = useState<Record<string, Pick>>({})
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<MatchPhase>('groups')

  useEffect(() => {
    const id = getLocalUserId()
    if (!id) { router.replace('/'); return }
    loadData(id)
  }, [])

  async function loadData(userId: string) {
    setLoading(true)
    const [{ data: matchData }, { data: pickData }] = await Promise.all([
      supabase.from('matches').select('*').order('match_time'),
      supabase.from('picks').select('*').eq('user_id', userId),
    ])
    if (matchData) setMatches(matchData)
    if (pickData) {
      const map: Record<string, Pick> = {}
      pickData.forEach(p => { map[p.match_id] = p })
      setPicks(map)
    }
    setLoading(false)
  }

  const byPhase = PHASE_ORDER.reduce((acc, phase) => {
    acc[phase] = matches.filter(m => m.phase === phase)
    return acc
  }, {} as Record<MatchPhase, Match[]>)

  const availablePhases = PHASE_ORDER.filter(p => byPhase[p].length > 0)

  return (
    <div className="min-h-screen pb-24">
      <div
        className="sticky top-0 z-40 px-4 pt-5 pb-3"
        style={{ background: 'rgba(8,9,14,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={() => router.push(`/bolao/${code}`)}
          style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '8px', display: 'block' }}>
          ← Ranking
        </button>
        <PageHeader label="Cartela" />
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {availablePhases.map(phase => (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: activePhase === phase ? 'var(--accent)' : 'var(--surface-2)',
                color: activePhase === phase ? '#08090e' : 'var(--text-muted)',
                border: activePhase === phase ? 'none' : '1px solid var(--border-bright)',
              }}
            >
              {PHASE_LABELS[phase]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="animate-spin rounded-full" style={{ width: '28px', height: '28px', border: '2px solid var(--accent-dim)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : byPhase[activePhase]?.length === 0 ? (
          <div className="text-center mt-20" style={{ color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '36px', marginBottom: '10px' }}>📅</p>
            <p style={{ fontWeight: 600 }}>Jogos ainda não disponíveis</p>
          </div>
        ) : activePhase === 'groups'
          ? Object.entries(
              byPhase['groups'].reduce((acc, m) => {
                const g = m.group_name ?? 'Grupo'
                if (!acc[g]) acc[g] = []
                acc[g].push(m)
                return acc
              }, {} as Record<string, Match[]>)
            ).map(([group, gMatches]) => (
              <div key={group}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '16px 0 8px' }}>
                  {group}
                </p>
                {gMatches.map(m => <MatchCard key={m.id} match={m} existingPick={picks[m.id]} />)}
              </div>
            ))
          : byPhase[activePhase].map(m => <MatchCard key={m.id} match={m} existingPick={picks[m.id]} />)
        }
      </div>
      <BottomNav />
    </div>
  )
}
