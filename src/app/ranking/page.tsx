'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { User } from '@/types'
import BottomNav from '@/components/BottomNav'
import PageHeader from '@/components/PageHeader'

const PODIUM_COLORS = [
  { bg: 'var(--gold-dim)', border: 'rgba(251,191,36,0.25)', text: 'var(--gold)' },
  { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', text: '#94a3b8' },
  { bg: 'rgba(180,120,60,0.08)', border: 'rgba(180,120,60,0.2)', text: '#cd853f' },
]

export default function RankingPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const myId = typeof window !== 'undefined' ? getLocalUserId() : null

  useEffect(() => { loadRanking() }, [])

  async function loadRanking() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('total_points', { ascending: false })
      .order('exact_scores', { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  const podium = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div>
        <PageHeader label="Ranking" />
        <div className="px-4 flex items-center gap-2 pb-3">
          <span
            className="rounded-full"
            style={{ width: '6px', height: '6px', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px var(--accent)' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Atualizado ao vivo
          </span>
        </div>
      </div>

      <div className="px-4">
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
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Carregando ranking...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center mt-24">
            <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👥</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Ninguém no bolão ainda
            </p>
          </div>
        ) : (
          <>
            {/* Podium - top 3 */}
            {podium.length > 0 && (
              <div className="space-y-2 mb-4">
                {podium.map((user, idx) => {
                  const isMe = user.id === myId
                  const colors = PODIUM_COLORS[idx]
                  const MEDALS = ['🥇', '🥈', '🥉']

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-2xl p-4 transition-all animate-slide-up"
                      style={{
                        background: isMe ? 'var(--accent-dim)' : colors.bg,
                        border: `1px solid ${isMe ? 'rgba(0,230,118,0.3)' : colors.border}`,
                        animationDelay: `${idx * 0.07}s`,
                      }}
                    >
                      {/* Medal */}
                      <span style={{ fontSize: '1.5rem', width: '32px', textAlign: 'center', flexShrink: 0 }}>
                        {MEDALS[idx]}
                      </span>

                      {/* Avatar */}
                      <div
                        className="rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{
                          width: '40px',
                          height: '40px',
                          background: isMe ? 'var(--accent)' : colors.border,
                          color: isMe ? '#08090e' : colors.text,
                          fontSize: '14px',
                          border: `2px solid ${isMe ? 'transparent' : colors.border}`,
                        }}
                      >
                        {user.name[0].toUpperCase()}
                      </div>

                      {/* Name + subtitle */}
                      <div className="flex-1 min-w-0">
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', lineHeight: 1.2 }} className="truncate">
                          {user.name}
                          {isMe && (
                            <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, marginLeft: '6px' }}>
                              você
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {user.exact_scores} placar{user.exact_scores !== 1 ? 'es' : ''} exato{user.exact_scores !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right shrink-0">
                        <div
                          style={{
                            fontFamily: 'Bebas Neue, system-ui',
                            fontSize: '1.8rem',
                            color: isMe ? 'var(--accent)' : colors.text,
                            lineHeight: 1,
                          }}
                        >
                          {user.total_points}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
                          PTS
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Divider */}
            {rest.length > 0 && (
              <div className="flex items-center gap-3 my-4">
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Restantes
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>
            )}

            {/* Rest of ranking */}
            {rest.length > 0 && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                {rest.map((user, idx) => {
                  const pos = idx + 4
                  const isMe = user.id === myId
                  const isLast = idx === rest.length - 1
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors"
                      style={{
                        background: isMe ? 'var(--accent-glow)' : 'var(--surface)',
                        borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <span
                        style={{
                          width: '28px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          flexShrink: 0,
                          fontFamily: 'Bebas Neue, system-ui',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {pos}°
                      </span>
                      <div
                        className="rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: isMe ? 'var(--accent)' : 'var(--surface-2)',
                          color: isMe ? '#08090e' : 'var(--text-muted)',
                          fontSize: '12px',
                        }}
                      >
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }} className="truncate">
                          {user.name}
                          {isMe && <span style={{ color: 'var(--accent)', fontSize: '10px', marginLeft: '5px' }}>você</span>}
                        </p>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {user.exact_scores} exatos
                        </p>
                      </div>
                      <p
                        style={{
                          fontFamily: 'Bebas Neue, system-ui',
                          fontSize: '1.3rem',
                          color: isMe ? 'var(--accent)' : 'var(--text)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {user.total_points}
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: '3px', fontFamily: 'Space Grotesk' }}>
                          pts
                        </span>
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Scoring legend */}
            <div
              className="mt-5 mb-4 rounded-2xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Como funciona
              </p>
              <div className="space-y-2.5">
                {[
                  { label: 'Placar exato', value: '3 pts × mult', color: 'var(--accent)' },
                  { label: 'Só o vencedor', value: '1 pt × mult', color: 'var(--gold)' },
                  { label: 'Campeão certo', value: '+20 pts bônus', color: '#a78bfa' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
