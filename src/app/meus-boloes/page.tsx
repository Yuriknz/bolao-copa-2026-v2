'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getLocalUserId, getLocalUserName, clearLocalUser } from '@/lib/supabase'
import { Bolao, BolaoMember } from '@/types'
import Logo from '@/components/Logo'

export default function MeusBoloes() {
  const router = useRouter()
  const [boloes, setBoloes] = useState<(BolaoMember & { bolao: Bolao })[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [newName, setNewName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const userName = getLocalUserName() ?? ''

  useEffect(() => {
    const id = getLocalUserId()
    if (!id) { router.replace('/'); return }
    loadData(id)
  }, [router])

  async function loadData(userId: string) {
    setLoading(true)
    const { data } = await supabase
      .from('bolao_members')
      .select('*, bolao:boloes(*)')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
    if (data) setBoloes(data as any)
    setLoading(false)
  }

  async function createBolao() {
    if (!newName.trim()) { setError('Digite o nome do bolão'); return }
    const userId = getLocalUserId()!
    setCreating(true); setError('')
    try {
      const { data: bolao, error: e1 } = await supabase
        .from('boloes')
        .insert({ name: newName.trim(), created_by: userId, code: '' })
        .select().single()
      if (e1) throw e1
      await supabase.from('bolao_members').insert({ bolao_id: bolao.id, user_id: userId })
      setNewName(''); setShowCreate(false)
      loadData(userId)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao criar')
    } finally {
      setCreating(false)
    }
  }

  async function joinBolao() {
    const code = joinCode.trim().toUpperCase()
    if (!code) { setError('Digite o código'); return }
    const userId = getLocalUserId()!
    setJoining(true); setError('')
    try {
      const { data: bolao, error: e1 } = await supabase
        .from('boloes').select('*').eq('code', code).single()
      if (e1 || !bolao) throw new Error('Bolão não encontrado.')
      const { error: e2 } = await supabase
        .from('bolao_members').insert({ bolao_id: bolao.id, user_id: userId })
      if (e2) {
        if (e2.code === '23505') throw new Error('Você já está neste bolão!')
        throw e2
      }
      setJoinCode(''); setShowJoin(false)
      loadData(userId)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao entrar')
    } finally {
      setJoining(false)
    }
  }

  const inputStyle = {
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text)',
    background: 'var(--surface-2)',
    border: '1.5px solid var(--border-bright)',
    fontFamily: 'Space Grotesk, system-ui',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties

  return (
    <div className="min-h-screen pb-10 max-w-md mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-8 pb-6">
        <div>
          <Logo size="sm" />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Olá, <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{userName}</span>
          </p>
        </div>
        <button
          onClick={() => { clearLocalUser(); router.replace('/') }}
          style={{ fontSize: '12px', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }}
          className="transition-all active:scale-[0.97]"
          style={{
            padding: '13px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            color: '#08090e',
            background: 'var(--accent)',
            boxShadow: '0 0 20px rgba(0,230,118,0.2)',
            cursor: 'pointer',
          }}
        >
          + Criar Bolão
        </button>
        <button
          onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }}
          className="transition-all active:scale-[0.97]"
          style={{
            padding: '13px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            border: '1px solid var(--border-bright)',
            cursor: 'pointer',
          }}
        >
          Entrar com Código
        </button>
      </div>

      {/* Form criar */}
      {showCreate && (
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid rgba(0,230,118,0.2)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Novo Bolão
          </p>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createBolao()}
            placeholder="Ex: Família Silva, Trampo..." style={inputStyle} />
          {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={createBolao} disabled={creating}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', color: '#08090e', background: 'var(--accent)', cursor: 'pointer', opacity: creating ? 0.6 : 1 }}>
              {creating ? 'Criando...' : 'Criar'}
            </button>
            <button onClick={() => setShowCreate(false)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)', background: 'var(--surface-2)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Form entrar */}
      {showJoin && (
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Entrar em Bolão
          </p>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && joinBolao()}
            placeholder="Código (ex: ABC123)" maxLength={6}
            style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.2em', fontWeight: 700, fontSize: '18px' }} />
          {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={joinBolao} disabled={joining}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', color: '#08090e', background: 'var(--gold)', cursor: 'pointer', opacity: joining ? 0.6 : 1 }}>
              {joining ? 'Entrando...' : 'Entrar'}
            </button>
            <button onClick={() => setShowJoin(false)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)', background: 'var(--surface-2)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de bolões */}
      {loading ? (
        <div className="flex justify-center mt-16">
          <div className="animate-spin rounded-full" style={{ width: '28px', height: '28px', border: '2px solid var(--accent-dim)', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : boloes.length === 0 ? (
        <div className="text-center mt-16" style={{ color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</p>
          <p style={{ fontWeight: 600 }}>Nenhum bolão ainda</p>
          <p style={{ fontSize: '13px', marginTop: '4px', color: 'var(--text-dim)' }}>Crie um ou entre com um código</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {boloes.map(({ bolao, total_points, exact_scores }) => (
            <div key={bolao.id}
              onClick={() => router.push(`/bolao/${bolao.code}`)}
              className="rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-bright)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,230,118,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>{bolao.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'var(--accent-dim)', color: 'var(--accent)', letterSpacing: '0.12em' }}>
                  #{bolao.code}
                </span>
              </div>
              <div className="flex items-center gap-4" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <span><strong style={{ color: 'var(--text)' }}>{total_points}</strong> pts</span>
                <span><strong style={{ color: 'var(--text)' }}>{exact_scores}</strong> exatos</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
