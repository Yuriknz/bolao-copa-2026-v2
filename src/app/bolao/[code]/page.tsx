'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { Bolao, BolaoMember, User } from '@/types'
import Logo from '@/components/Logo'

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

  return (
    <div className="min-h-screen max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="px-4 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.push('/meus-boloes')}
          style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '12px', display: 'block' }}>
          ← Meus Bolões
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>{bolao?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'var(--accent-dim)', color: 'var(--accent)', letterSpacing: '0.12em' }}>
                #{bolao?.code}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {members.length} participante{members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button onClick={copyInvite}
            style={{
              fontSize: '12px', fontWeight: 700, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
              background: copied ? 'var(--accent-dim)' : 'var(--surface-2)',
              color: copied ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${copied ? 'rgba(0,230,118,0.3)' : 'var(--border-bright)'}`,
              transition: 'all 0.2s',
            }}>
            {copied ? '✓ Copiado!' : '🔗 Convidar'}
          </button>
        </div>
      </div>

      {/* Ações */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-3">
        <button onClick={() => router.push(`/bolao/${code}/cartela`)}
          style={{ padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', color: '#08090e', background: 'var(--accent)', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,230,118,0.15)' }}>
          ⚽ Palpitar
        </button>
        <button onClick={() => router.push(`/bolao/${code}/historico`)}
          style={{ padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border-bright)', cursor: 'pointer' }}>
          📋 Histórico
        </button>
      </div>

      {/* Ranking */}
      <div className="px-4 mt-5">
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Ranking
        </p>
        {members.length === 0 ? (
          <div className="text-center mt-10" style={{ color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>👥</p>
            <p style={{ fontWeight: 600 }}>Ninguém aqui ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {members.map((m, idx) => {
              const isMe = m.user_id === myId
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl p-4"
                  style={{
                    background: isMe ? 'var(--accent-dim)' : 'var(--surface)',
                    border: `1px solid ${isMe ? 'rgba(0,230,118,0.25)' : 'var(--border-bright)'}`,
                  }}>
                  <div style={{ width: '28px', textAlign: 'center', fontSize: '16px', fontWeight: 900, color: idx < 3 ? 'var(--gold)' : 'var(--text-muted)', flexShrink: 0 }}>
                    {medal(idx + 1)}
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: isMe ? 'rgba(0,230,118,0.2)' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isMe ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>
                    {m.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.user?.name} {isMe && <span style={{ color: 'var(--accent)', fontSize: '11px' }}>(você)</span>}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {m.exact_scores} exatos
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: isMe ? 'var(--accent)' : 'var(--text)' }}>
                      {m.total_points}
                    </p>
                    <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info pontuação */}
      <div className="mx-4 mt-5 p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Pontuação</p>
        <div className="flex flex-col gap-2" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <div className="flex justify-between"><span>Placar exato</span><span style={{ color: 'var(--accent)', fontWeight: 700 }}>3 pts × multiplicador fase</span></div>
          <div className="flex justify-between"><span>Só o vencedor</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>1 pt × multiplicador fase</span></div>
          <div className="flex justify-between"><span>Campeão certo</span><span style={{ color: '#c084fc', fontWeight: 700 }}>+20 pts bônus</span></div>
        </div>
      </div>
    </div>
  )
}
