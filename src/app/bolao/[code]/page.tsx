'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { Bolao, BolaoMember, User } from '@/types'
import Logo from '@/components/Logo'
import BottomNav from '@/components/BottomNav'

export default function BolaoPage() {
  const router = useRouter()
  const { code } = useParams<{ code: string }>()
  const [bolao, setBolao] = useState<Bolao | null>(null)
  const [members, setMembers] = useState<(BolaoMember & { user: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const myId = getLocalUserId()

  useEffect(() => {
    if (!myId) { router.replace('/'); return }
    loadBolao()
  }, [code])

  async function loadBolao() {
    setLoading(true)
    const { data: bolaoData } = await supabase
      .from('boloes').select('*').eq('code', code.toUpperCase()).single()
    if (!bolaoData) { setNotFound(true); setLoading(false); return }
    setBolao(bolaoData)

    const { data: membersData } = await supabase
      .from('bolao_members')
      .select('*, user:users(*)')
      .eq('bolao_id', bolaoData.id)
      .order('total_points', { ascending: false })
      .order('exact_scores', { ascending: false })
    if (membersData) setMembers(membersData as any)
    setLoading(false)
  }

  function copyCode() {
    navigator.clipboard.writeText(bolao?.code ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyInvite() {
    navigator.clipboard.writeText(`${window.location.origin}/bolao/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const medal = (pos: number) => pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full" style={{ width: '28px', height: '28px', border: '2px solid var(--accent-dim)', borderTopColor: 'var(--accent)' }} />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</p>
      <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '18px' }}>Bolão não encontrado</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '6px 0 20px' }}>O código {code} não existe</p>
      <button onClick={() => router.push('/meus-boloes')} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>
        ← Meus Bolões
      </button>
    </div>
  )

  const myEntry = members.find(m => m.user_id === myId)
  const myPos = members.findIndex(m => m.user_id === myId) + 1

  return (
    <div className="min-h-screen pb-28 md:pb-0">

      {/* ── Top bar (desktop only) ── */}
      <div
        className="hidden md:flex items-center justify-between px-8 py-4 sticky top-0 z-40"
        style={{
          background: 'rgba(8,9,14,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Logo size="sm" />
        <button onClick={() => router.push('/meus-boloes')}
          style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Meus Bolões
        </button>
      </div>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden px-4 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.push('/meus-boloes')}
          style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '12px', display: 'block' }}>
          ← Meus Bolões
        </button>
        <div className="flex items-start justify-between gap-3">
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {bolao?.name}
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              {members.length} participante{members.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button onClick={copyInvite} className="transition-all active:scale-[0.96] flex-shrink-0"
            style={{ fontSize: '12px', fontWeight: 700, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', background: copied ? 'var(--accent-dim)' : 'var(--surface-2)', color: copied ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${copied ? 'rgba(0,230,118,0.3)' : 'var(--border-bright)'}`, transition: 'all 0.2s' }}>
            {copied ? '✓ Copiado!' : '🔗 Convidar'}
          </button>
        </div>

        {/* Mobile code block */}
        <div className="mt-4 rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-bright)' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Código do bolão
            </p>
            <p style={{ fontFamily: 'Bebas Neue, system-ui, sans-serif', fontSize: '2rem', letterSpacing: '0.25em', color: 'var(--accent)', lineHeight: 1, filter: 'drop-shadow(0 0 8px rgba(0,230,118,0.35))' }}>
              {bolao?.code}
            </p>
          </div>
          <button onClick={copyCode} className="transition-all active:scale-[0.93]"
            style={{ fontSize: '11px', fontWeight: 700, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', background: copied ? 'var(--accent)' : 'var(--surface-3)', color: copied ? '#08090e' : 'var(--text-muted)', border: `1px solid ${copied ? 'var(--accent)' : 'var(--border-bright)'}`, transition: 'all 0.2s', letterSpacing: '0.04em' }}>
            {copied ? '✓ Copiado' : 'Copiar código'}
          </button>
        </div>

        {/* Mobile actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={() => router.push(`/bolao/${code}/cartela`)} className="transition-all active:scale-[0.97]"
            style={{ padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', color: '#08090e', background: 'linear-gradient(135deg,#00e676,#00c853)', cursor: 'pointer', boxShadow: '0 0 28px rgba(0,230,118,0.28), 0 4px 16px rgba(0,0,0,0.3)' }}>
            ⚽ Palpitar
          </button>
          <button onClick={() => router.push(`/bolao/${code}/historico`)} className="card-hover transition-all active:scale-[0.97]"
            style={{ padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border-bright)', cursor: 'pointer' }}>
            📋 Histórico
          </button>
        </div>
      </div>

      {/* ── Desktop: 2-column grid ── */}
      <div className="md:grid md:gap-6 md:px-8 md:pt-6 md:items-start" style={{ gridTemplateColumns: '340px 1fr' } as React.CSSProperties}>

        {/* ── LEFT PANEL (desktop sidebar / mobile hidden) ── */}
        <div className="hidden md:flex md:flex-col md:gap-4 md:sticky md:top-[65px]">

          {/* Bolão identity card */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-bright)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
              {bolao?.name}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {members.length} participante{members.length !== 1 ? 's' : ''}
            </p>

            {/* Code display */}
            <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-bright)' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Código do bolão
              </p>
              <div className="flex items-center justify-between gap-3">
                <p style={{ fontFamily: 'Bebas Neue, system-ui, sans-serif', fontSize: '2.2rem', letterSpacing: '0.28em', color: 'var(--accent)', lineHeight: 1, filter: 'drop-shadow(0 0 10px rgba(0,230,118,0.4))' }}>
                  {bolao?.code}
                </p>
                <button onClick={copyCode} className="transition-all active:scale-[0.93]"
                  style={{ fontSize: '11px', fontWeight: 700, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', background: copied ? 'var(--accent)' : 'var(--surface-3)', color: copied ? '#08090e' : 'var(--text-muted)', border: `1px solid ${copied ? 'var(--accent)' : 'var(--border-bright)'}`, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <button onClick={copyInvite} className="w-full transition-all active:scale-[0.97] mt-3"
              style={{ padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border-bright)', transition: 'all 0.2s', letterSpacing: '0.02em' }}>
              🔗 Copiar link de convite
            </button>
          </div>

          {/* Your position card (desktop only) */}
          {myEntry && (
            <div className="rounded-2xl p-5" style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,230,118,0.2)' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(0,230,118,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Sua posição
              </p>
              <div className="flex items-center gap-4">
                <div style={{ fontFamily: 'Bebas Neue, system-ui', fontSize: '3rem', color: 'var(--accent)', lineHeight: 1 }}>
                  {myPos}º
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text)' }}>{myEntry.user?.name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{myEntry.total_points} pts</span>
                    {' · '}{myEntry.exact_scores} exatos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons (desktop) */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push(`/bolao/${code}/cartela`)} className="transition-all active:scale-[0.97]"
              style={{ padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', color: '#08090e', background: 'linear-gradient(135deg,#00e676,#00c853)', cursor: 'pointer', boxShadow: '0 0 28px rgba(0,230,118,0.25)' }}>
              ⚽ Palpitar
            </button>
            <button onClick={() => router.push(`/bolao/${code}/historico`)} className="card-hover transition-all active:scale-[0.97]"
              style={{ padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border-bright)', cursor: 'pointer' }}>
              📋 Histórico
            </button>
          </div>

          {/* Scoring info (desktop) */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Pontuação</p>
            <div className="flex flex-col gap-2.5" style={{ fontSize: '12px' }}>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>Placar exato</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>3 pts × fase</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>Só o vencedor</span>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>1 pt × fase</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>Campeão certo</span>
                <span style={{ color: '#c084fc', fontWeight: 700 }}>+20 pts bônus</span>
              </div>
              <div className="mt-1 pt-2.5" style={{ borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-dim)' }}>
                Fases: Grupos ×1 · Oitavas ×2 · Quartas ×3 · Semi ×4 · Final ×5
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Ranking ── */}
        <div className="px-4 pt-5 md:px-0 md:pt-0">
          {/* Ranking header */}
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Ranking — {members.length} participante{members.length !== 1 ? 's' : ''}
            </p>
          </div>

          {members.length === 0 ? (
            <div className="text-center mt-16" style={{ color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>👥</p>
              <p style={{ fontWeight: 600 }}>Ninguém aqui ainda</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((m, idx) => {
                const isMe = m.user_id === myId
                const isTop = idx === 0
                return (
                  <div key={m.id}
                    className={`flex items-center gap-3 rounded-2xl p-4 card-hover animate-slide-up ${isTop ? 'shimmer-once' : ''}`}
                    style={{
                      animationDelay: `${Math.min(idx * 0.04, 0.3)}s`,
                      background: isMe
                        ? 'var(--accent-dim)'
                        : isTop
                          ? 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, var(--surface) 60%)'
                          : 'var(--surface)',
                      border: `1px solid ${isMe ? 'rgba(0,230,118,0.25)' : isTop ? 'rgba(251,191,36,0.25)' : 'var(--border-bright)'}`,
                      boxShadow: isTop ? '0 4px 24px rgba(251,191,36,0.06)' : undefined,
                    }}>

                    {/* Position */}
                    <div style={{ width: '32px', textAlign: 'center', fontSize: isTop ? '22px' : '14px', fontWeight: 900, color: idx < 3 ? 'var(--gold)' : 'var(--text-muted)', flexShrink: 0, lineHeight: 1 }}>
                      {medal(idx + 1)}
                    </div>

                    {/* Avatar */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isMe ? 'rgba(0,230,118,0.2)' : isTop ? 'rgba(251,191,36,0.12)' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isMe ? 'var(--accent)' : isTop ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 800, fontSize: '15px', flexShrink: 0, border: `1.5px solid ${isMe ? 'rgba(0,230,118,0.3)' : isTop ? 'rgba(251,191,36,0.3)' : 'var(--border)'}` }}>
                      {m.user?.name?.[0]?.toUpperCase()}
                    </div>

                    {/* Name + stats */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.user?.name}
                        {isMe && <span style={{ color: 'var(--accent)', fontSize: '11px', marginLeft: '6px', fontWeight: 600 }}>(você)</span>}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {m.exact_scores} placar{m.exact_scores !== 1 ? 'es' : ''} exato{m.exact_scores !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Points */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'Bebas Neue, system-ui', fontSize: '1.6rem', color: isMe ? 'var(--accent)' : isTop ? 'var(--gold)' : 'var(--text)', lineHeight: 1, letterSpacing: '0.02em' }}>
                        {m.total_points}
                      </p>
                      <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>PTS</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Mobile: scoring info */}
          <div className="md:hidden mt-5 p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Pontuação</p>
            <div className="flex flex-col gap-2" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              <div className="flex justify-between"><span>Placar exato</span><span style={{ color: 'var(--accent)', fontWeight: 700 }}>3 pts × multiplicador fase</span></div>
              <div className="flex justify-between"><span>Só o vencedor</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>1 pt × multiplicador fase</span></div>
              <div className="flex justify-between"><span>Campeão certo</span><span style={{ color: '#c084fc', fontWeight: 700 }}>+20 pts bônus</span></div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav bolaoCode={code} />
    </div>
  )
}
