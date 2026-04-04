'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { Pick, Match } from '@/types'
import BottomNav from '@/components/BottomNav'
import StatusBadge from '@/components/StatusBadge'
import TeamFlag from '@/components/TeamFlag'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PickWithMatch extends Pick { match: Match }

export default function HistoricoBolaoPage() {
  const router = useRouter()
  const { code } = useParams<{ code: string }>()
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
    // Busca pontos específicos deste bolão
    const { data: bolaoData } = await supabase.from('boloes').select('id').eq('code', code.toUpperCase()).single()
    if (bolaoData) {
      const { data: member } = await supabase.from('bolao_members')
        .select('total_points, exact_scores').eq('bolao_id', bolaoData.id).eq('user_id', userId).single()
      if (member) { setTotalPts(member.total_points); setExactCount(member.exact_scores) }
    }
    const { data } = await supabase
      .from('picks')
      .select('*, match:matches(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setPicks(data as PickWithMatch[])
    setLoading(false)
  }

  const resultInfo = (pick: PickWithMatch) => {
    const { match } = pick
    if (match.status !== 'finished' || match.score_home == null) return null
    if (pick.pick_home === match.score_home && pick.pick_away === match.score_away)
      return { label: 'Placar exato!', color: 'var(--accent)', bg: 'var(--accent-dim)' }
    if (pick.points_earned > 0)
      return { label: 'Acertou vencedor', color: 'var(--gold)', bg: 'var(--gold-dim)' }
    return { label: 'Errou', color: 'var(--red)', bg: 'var(--red-dim)' }
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.push(`/bolao/${code}`)}
          style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px', display: 'block' }}>
          ← Ranking
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>Histórico</h1>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl p-4" style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,230,118,0.2)' }}>
            <div style={{ fontFamily: 'Bebas Neue, system-ui', fontSize: '2.8rem', color: 'var(--accent)', lineHeight: 1 }}>{totalPts}</div>
            <div style={{ fontSize: '11px', color: 'rgba(0,230,118,0.6)', fontWeight: 600, marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pontos neste bolão</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--gold-dim)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div style={{ fontFamily: 'Bebas Neue, system-ui', fontSize: '2.8rem', color: 'var(--gold)', lineHeight: 1 }}>{exactCount}</div>
            <div style={{ fontSize: '11px', color: 'rgba(251,191,36,0.6)', fontWeight: 600, marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Placares exatos</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center mt-16">
            <div className="animate-spin rounded-full" style={{ width: '28px', height: '28px', border: '2px solid var(--surface-2)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : picks.length === 0 ? (
          <div className="text-center mt-16">
            <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>Nenhum palpite ainda</p>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '6px' }}>Vá na Cartela e palpite nos jogos!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {picks.map((pick, i) => {
              const result = resultInfo(pick)
              const m = pick.match
              return (
                <div key={pick.id} className="rounded-2xl p-4 animate-slide-up"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {format(new Date(m.match_time), "dd 'de' MMM · HH'h'mm", { locale: ptBR })}
                    </span>
                    <StatusBadge status={m.status} matchTime={m.match_time} />
                  </div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <TeamFlag teamName={m.team_home} emoji={m.flag_home} width={28} height={21} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{m.team_home}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.08em' }}>VS</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{m.team_away}</span>
                      <TeamFlag teamName={m.team_away} emoji={m.flag_away} width={28} height={21} />
                    </div>
                  </div>
                  <div className="flex items-stretch justify-between pt-3 gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: 'var(--surface-2)' }}>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Palpite</p>
                      <p style={{ fontFamily: 'Bebas Neue, system-ui', fontSize: '1.4rem', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>
                        {pick.pick_home} : {pick.pick_away}
                      </p>
                    </div>
                    {m.status === 'finished' && m.score_home != null && (
                      <>
                        <div className="flex items-center px-1"><div style={{ width: '1px', height: '100%', background: 'var(--border)' }} /></div>
                        <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: 'var(--surface-2)' }}>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Resultado</p>
                          <p style={{ fontFamily: 'Bebas Neue, system-ui', fontSize: '1.4rem', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>
                            {m.score_home} : {m.score_away}
                          </p>
                        </div>
                      </>
                    )}
                    <div className="flex flex-col items-end justify-center">
                      {result && (
                        <span className="rounded-lg px-2 py-1 text-right mb-1"
                          style={{ fontSize: '10px', fontWeight: 700, color: result.color, background: result.bg }}>
                          {result.label}
                        </span>
                      )}
                      <p style={{ fontFamily: 'Bebas Neue, system-ui', fontSize: '1.5rem', color: pick.points_earned > 0 ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.02em', lineHeight: 1 }}>
                        {pick.points_earned > 0 ? `+${pick.points_earned}` : '—'}
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.55rem', color: 'var(--text-muted)', marginLeft: '2px' }}>
                          {pick.points_earned > 0 ? 'pts' : ''}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav bolaoCode={code} />
    </div>
  )
}
