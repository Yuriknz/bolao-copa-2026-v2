'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { Match, Pick, PHASE_LABELS, MatchPhase } from '@/types'
import MatchCard from '@/components/MatchCard'
import BottomNav from '@/components/BottomNav'

const PHASE_ORDER: MatchPhase[] = ['groups', 'r16', 'qf', 'sf', 'final']

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
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 pt-6 pb-3"
        style={{ background: 'linear-gradient(to bottom, #0a0a0f 80%, transparent)' }}>
        <h1 className="text-2xl font-extrabold text-white">Cartela</h1>
        <p className="text-slate-500 text-xs mt-0.5">Todos os jogos da Copa 2026</p>

        {/* Phase tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {availablePhases.map(phase => (
            <button key={phase} onClick={() => setActivePhase(phase)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: activePhase === phase ? '#22c55e' : 'rgba(255,255,255,0.06)',
                color: activePhase === phase ? '#fff' : '#64748b',
              }}>
              {PHASE_LABELS[phase]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : byPhase[activePhase]?.length === 0 ? (
          <div className="text-center mt-20 text-slate-600">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-semibold">Jogos ainda não disponíveis</p>
          </div>
        ) : (
          <>
            {/* Group by group_name if groups phase */}
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
                    <h2 className="text-xs font-bold text-slate-500 mb-2 mt-4 uppercase tracking-widest">
                      {group}
                    </h2>
                    {gMatches.map(m => (
                      <MatchCard key={m.id} match={m} existingPick={picks[m.id]} />
                    ))}
                  </div>
                ))
              : byPhase[activePhase].map(m => (
                  <MatchCard key={m.id} match={m} existingPick={picks[m.id]} />
                ))
            }
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
