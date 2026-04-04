'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getLocalUserId, getLocalUserName, clearLocalUser } from '@/lib/supabase'
import { Bolao, BolaoMember } from '@/types'
import Logo from '@/components/Logo'
import TeamFlag from '@/components/TeamFlag'

// Prazo: início do primeiro jogo — 11/06/2026 19:00 UTC
const CHAMPION_DEADLINE = new Date('2026-06-11T19:00:00Z')

const TEAMS = [
  { name: 'Brasil', flag: '🇧🇷' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'França', flag: '🇫🇷' },
  { name: 'Alemanha', flag: '🇩🇪' },
  { name: 'Espanha', flag: '🇪🇸' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Itália', flag: '🇮🇹' },
  { name: 'Holanda', flag: '🇳🇱' },
  { name: 'Bélgica', flag: '🇧🇪' },
  { name: 'Uruguai', flag: '🇺🇾' },
  { name: 'México', flag: '🇲🇽' },
  { name: 'Estados Unidos', flag: '🇺🇸' },
  { name: 'Japão', flag: '🇯🇵' },
  { name: 'Coreia do Sul', flag: '🇰🇷' },
  { name: 'Marrocos', flag: '🇲🇦' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Austrália', flag: '🇦🇺' },
  { name: 'Canadá', flag: '🇨🇦' },
  { name: 'Croácia', flag: '🇭🇷' },
  { name: 'Suíça', flag: '🇨🇭' },
  { name: 'Polônia', flag: '🇵🇱' },
  { name: 'Equador', flag: '🇪🇨' },
  { name: 'Gana', flag: '🇬🇭' },
]

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

  // Campeão
  const [champion, setChampion] = useState<string | null>(null)
  const [showChampionEdit, setShowChampionEdit] = useState(false)
  const [champDraft, setChampDraft] = useState('')
  const [champDropOpen, setChampDropOpen] = useState(false)
  const [savingChamp, setSavingChamp] = useState(false)
  const [champSaved, setChampSaved] = useState(false)
  const champDropRef = useRef<HTMLDivElement>(null)

  const userName = getLocalUserName() ?? ''
  const canEditChampion = new Date() < CHAMPION_DEADLINE

  useEffect(() => {
    const id = getLocalUserId()
    if (!id) { router.replace('/'); return }
    loadData(id)
    loadChampion(id)
  }, [router])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (champDropRef.current && !champDropRef.current.contains(e.target as Node)) {
        setChampDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function loadChampion(userId: string) {
    const { data } = await supabase.from('users').select('champion_pick').eq('id', userId).single()
    if (data) setChampion(data.champion_pick ?? null)
  }

  async function saveChampion() {
    const userId = getLocalUserId()
    if (!userId) return
    setSavingChamp(true)
    const { error: err } = await supabase
      .from('users')
      .update({ champion_pick: champDraft || null })
      .eq('id', userId)
    if (!err) {
      setChampion(champDraft || null)
      setChampSaved(true)
      setTimeout(() => { setChampSaved(false); setShowChampionEdit(false) }, 1500)
    }
    setSavingChamp(false)
  }

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

      {/* Palpite de campeão */}
      {!showChampionEdit ? (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center justify-between gap-3"
          style={{
            background: 'var(--surface)',
            border: champion ? '1px solid rgba(251,191,36,0.25)' : '1px solid var(--border-bright)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {champion ? (
              <>
                <TeamFlag
                  teamName={champion}
                  emoji={TEAMS.find(t => t.name === champion)?.flag ?? '🏳️'}
                  width={36} height={27}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Seu campeão <span style={{ color: 'var(--gold)' }}>+20 pts</span>
                  </p>
                  <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {champion}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Campeão <span style={{ color: 'var(--gold)' }}>+20 pts</span>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Nenhum palpite feito</p>
              </div>
            )}
          </div>

          {canEditChampion ? (
            <button
              onClick={() => { setChampDraft(champion ?? ''); setShowChampionEdit(true) }}
              className="flex-shrink-0 transition-all active:scale-[0.95]"
              style={{ fontSize: '12px', fontWeight: 700, padding: '7px 13px', borderRadius: '9px', cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border-bright)' }}
            >
              {champion ? 'Trocar' : 'Escolher'}
            </button>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', flexShrink: 0 }}>🔒 Encerrado</span>
          )}
        </div>
      ) : (
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--surface)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Trocar campeão
          </p>

          <div ref={champDropRef} className="relative mb-3">
            <button
              type="button"
              onClick={() => setChampDropOpen(o => !o)}
              className="w-full text-left outline-none flex items-center justify-between gap-2"
              style={{ borderRadius: '12px', padding: '11px 14px', fontSize: '14px', fontWeight: 500, background: 'var(--surface-2)', border: champDraft ? '1.5px solid rgba(251,191,36,0.4)' : '1.5px solid var(--border-bright)', color: champDraft ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer' }}
            >
              <span className="flex items-center gap-2">
                {champDraft && (
                  <TeamFlag teamName={champDraft} emoji={TEAMS.find(t => t.name === champDraft)?.flag ?? '🏳️'} width={22} height={16} />
                )}
                {champDraft || 'Selecionar seleção...'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', transform: champDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▾</span>
            </button>

            {champDropOpen && (
              <div className="absolute z-50 w-full mt-1 rounded-2xl overflow-hidden animate-fade-in"
                style={{ background: 'var(--surface-3)', border: '1px solid var(--border-bright)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', maxHeight: '220px', overflowY: 'auto' }}>
                <div
                  onClick={() => { setChampDraft(''); setChampDropOpen(false) }}
                  className="px-4 py-2.5 cursor-pointer"
                  style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Sem palpite
                </div>
                {TEAMS.map(t => {
                  const sel = champDraft === t.name
                  return (
                    <div key={t.name}
                      onClick={() => { setChampDraft(t.name); setChampDropOpen(false) }}
                      className="px-4 py-2.5 cursor-pointer flex items-center gap-2.5"
                      style={{ fontSize: '14px', fontWeight: sel ? 600 : 500, color: sel ? 'var(--gold)' : 'var(--text)', background: sel ? 'var(--gold-dim)' : 'transparent' }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}
                    >
                      <TeamFlag teamName={t.name} emoji={t.flag} width={24} height={18} />
                      {t.name}
                      {sel && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={saveChampion} disabled={savingChamp}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', color: '#08090e', background: champSaved ? 'var(--accent)' : 'var(--gold)', cursor: 'pointer', opacity: savingChamp ? 0.6 : 1, transition: 'background 0.2s' }}>
              {champSaved ? '✓ Salvo!' : savingChamp ? 'Salvando...' : 'Confirmar'}
            </button>
            <button onClick={() => setShowChampionEdit(false)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)', background: 'var(--surface-2)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

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
