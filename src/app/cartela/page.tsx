'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { Match, Pick, PHASE_LABELS, MatchPhase } from '@/types'
import MatchCard from '@/components/MatchCard'
import BottomNav from '@/components/BottomNav'
import PageHeader from '@/components/PageHeader'

const PHASE_ORDER: MatchPhase[] = ['groups', 'r16', 'qf', 'sf', 'final']

const PHASE_SHORT: Record<MatchPhase, string> = {
  groups: 'Grupos',
  r16: 'Oitavas',
  qf: 'Quartas',
  sf: 'Semi',
  final: 'Final',
}

export default function CartelaPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [picks, setPicks] = useState<Record<string, Pick>>({})
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<MatchPhase>('groups')

  useEffect(() => {
    const id = getLocalUserId()
    if (!id) { router.replace('/'); return }
    loadData(id)
  }, [router])

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
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,9,14,1) 0%, rgba(8,9,14,0.97) 80%, transparent 100%)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <PageHeader label="Cartela" sticky={false} />

        {/* Phase tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 px-4 scrollbar-hide">
          {availablePhases.map(phase => {
            const active = activePhase === phase
            return (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className="shrink-0 transition-all"
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.02em',
                  background: active ? 'var(--accent)' : 'var(--surface)',
                  color: active ? '#08090e' : 'var(--text-muted)',
                  border: active ? 'none' : '1px solid var(--border-bright)',
                  boxShadow: active ? '0 0 12px rgba(0,230,118,0.2)' : 'none',
                }}
              >
                {PHASE_SHORT[phase]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-24 gap-4">
            <div
              className="animate-spin rounded-full"
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid var(--surface-2)',
                borderTopColor: 'var(--accent)',
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Carregando jogos...</p>
          </div>
        ) : byPhase[activePhase]?.length === 0 ? (
          <div className="text-center mt-24">
            <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📅</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {PHASE_LABELS[activePhase]}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '6px' }}>
              Jogos ainda não disponíveis
            </p>
          </div>
        ) : (
          <>
            {activePhase === 'groups'
              ? Object.entries(
                  byPhase['groups'].reduce((acc, m) => {
                    const g = m.group_name ?? 'Grupo'
                    if (!acc[g]) acc[g] = []
                    acc[g].push(m)
                    return acc
                  }, {} as Record<string, Match[]>)
                ).map(([group, gMatches]) => (
                  <div key={group}>
                    <div className="flex items-center gap-3 mt-5 mb-2">
                      <div style={{ width: '3px', height: '14px', background: 'var(--accent)', borderRadius: '2px' }} />
                      <h2
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {group}
                      </h2>
                    </div>
                    {gMatches.map(m => (
                      <MatchCard key={m.id} match={m} existingPick={picks[m.id]} />
                    ))}
                  </div>
                ))
              : (
                <>
                  <div className="flex items-center gap-3 mt-5 mb-3">
                    <div style={{ width: '3px', height: '14px', background: 'var(--accent)', borderRadius: '2px' }} />
                    <h2
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {PHASE_LABELS[activePhase]}
                    </h2>
                  </div>
                  {byPhase[activePhase].map(m => (
                    <MatchCard key={m.id} match={m} existingPick={picks[m.id]} />
                  ))}
                </>
              )
            }
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
