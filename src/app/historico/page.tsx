'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { Pick, Match } from '@/types'
import BottomNav from '@/components/BottomNav'
import StatusBadge from '@/components/StatusBadge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PickWithMatch extends Pick { match: Match }

export default function HistoricoPage() {
  const router = useRouter()
  const [picks, setPicks] = useState<PickWithMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPts, setTotalPts] = useState(0)
  const [exactCount, setExactCount] = useState(0)

  useEffect(() => {
    const id = getLocalUserId()
    if (!id) { router.replace('/'); return }
    loadHistory(id)
  }, [router])

  async function loadHistory(userId: string) {
    setLoading(true)
    const { data: userData } = await supabase
      .from('users').select('total_points, exact_scores').eq('id', userId).single()
    if (userData) {
      setTotalPts(userData.total_points)
      setExactCount(userData.exact_scores)
    }

    const { data } = await supabase
      .from('picks')
      .select('*, match:matches(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setPicks(data as PickWithMatch[])
    setLoading(false)
  }

  const resultLabel = (pick: PickWithMatch) => {
    const { match } = pick
    if (match.status !== 'finished' || match.score_home == null) return null
    if (pick.pick_home === match.score_home && pick.pick_away === match.score_away)
      return { label: 'Placar exato!', color: '#22c55e' }
    if (pick.points_earned > 0)
      return { label: 'Acertou vencedor', color: '#facc15' }
    return { label: 'Errou', color: '#ef4444' }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-extrabold text-white">Histórico</h1>
        <p className="text-slate-500 text-xs mt-0.5">Seus palpites e resultados</p>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 border" style={{ background: '#111118', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="text-3xl font-extrabold text-green-400">{totalPts}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Pontos totais</div>
        </div>
        <div className="rounded-2xl p-4 border" style={{ background: '#111118', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="text-3xl font-extrabold text-yellow-400">{exactCount}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Placares exatos</div>
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="flex justify-center mt-16">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : picks.length === 0 ? (
          <div className="text-center mt-16 text-slate-600">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">Nenhum palpite ainda</p>
            <p className="text-sm mt-1">Vá na Cartela e palpite nos jogos!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {picks.map(pick => {
              const result = resultLabel(pick)
              const m = pick.match
              return (
                <div key={pick.id} className="rounded-2xl p-4 border"
                  style={{ background: '#111118', borderColor: 'rgba(255,255,255,0.07)' }}>
                  {/* Match info */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 font-semibold">
                      {format(new Date(m.match_time), "dd/MM • HH'h'mm", { locale: ptBR })}
                    </span>
                    <StatusBadge status={m.status} matchTime={m.match_time} />
                  </div>

                  {/* Times */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{m.flag_home}</span>
                      <span className="text-sm font-bold text-white">{m.team_home}</span>
                    </div>
                    <span className="text-slate-600 font-bold">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{m.team_away}</span>
                      <span className="text-2xl">{m.flag_away}</span>
                    </div>
                  </div>

                  {/* Palpite vs real */}
                  <div className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-[10px] text-slate-600 font-semibold mb-0.5">SEU PALPITE</p>
                      <p className="text-base font-extrabold text-white">
                        {pick.pick_home} × {pick.pick_away}
                      </p>
                    </div>

                    {m.status === 'finished' && m.score_home != null && (
                      <div className="text-right">
                        <p className="text-[10px] text-slate-600 font-semibold mb-0.5">RESULTADO</p>
                        <p className="text-base font-extrabold text-white">
                          {m.score_home} × {m.score_away}
                        </p>
                      </div>
                    )}

                    <div className="text-right">
                      {result && (
                        <p className="text-xs font-bold mb-0.5" style={{ color: result.color }}>{result.label}</p>
                      )}
                      <p className="text-lg font-extrabold" style={{
                        color: pick.points_earned > 0 ? '#22c55e' : '#475569'
                      }}>
                        {pick.points_earned > 0 ? `+${pick.points_earned}` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
