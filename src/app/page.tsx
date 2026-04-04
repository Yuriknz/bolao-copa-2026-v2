'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getLocalUserId, setLocalUserId, setLocalUserName } from '@/lib/supabase'
import Logo from '@/components/Logo'
import TeamFlag from '@/components/TeamFlag'

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

type FoundUser = {
  id: string
  name: string
  champion_pick: string | null
  boloes: { name: string }[]
}

type Step = 'name' | 'found' | 'new'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [champion, setChampion] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const [step, setStep] = useState<Step>('name')
  const [foundUsers, setFoundUsers] = useState<FoundUser[]>([])
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = getLocalUserId()
    if (id) router.replace('/meus-boloes')
    else setChecking(false)
  }, [router])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Step 1: lookup by name
  async function handleLookup() {
    if (!name.trim()) { setError('Digite seu nome'); return }
    setLoading(true); setError('')
    try {
      const { data } = await supabase
        .from('users')
        .select('id, name, champion_pick')
        .ilike('name', name.trim())

      if (data && data.length > 0) {
        // Fetch bolões for each found user
        const withBoloes = await Promise.all(
          data.map(async (u) => {
            const { data: members } = await supabase
              .from('bolao_members')
              .select('bolao:boloes(name)')
              .eq('user_id', u.id)
            const boloes = (members ?? []).map((m: any) => ({ name: m.bolao?.name ?? '' }))
            return { ...u, boloes }
          })
        )
        setFoundUsers(withBoloes)
        setStep('found')
      } else {
        setStep('new')
      }
    } catch {
      setError('Erro ao buscar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Restore existing session
  function handleRestore(user: FoundUser) {
    setLocalUserId(user.id)
    setLocalUserName(user.name)
    router.push('/meus-boloes')
  }

  // Step 2b: create new user
  async function handleCreate() {
    setLoading(true); setError('')
    try {
      const { data, error: err } = await supabase
        .from('users')
        .insert({ name: name.trim(), champion_pick: champion || null })
        .select()
        .single()
      if (err) throw err
      setLocalUserId(data.id)
      setLocalUserName(data.name)
      router.push('/meus-boloes')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'tente novamente'
      setError('Erro ao criar conta: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const selectedTeam = TEAMS.find(t => t.name === champion)

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full" style={{ width: '28px', height: '28px', border: '2px solid var(--accent-dim)', borderTopColor: 'var(--accent)' }} />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-14 relative" style={{ zIndex: 1 }}>
      {/* Ambient glows */}
      <div className="fixed pointer-events-none" style={{ top: '-5%', left: '50%', transform: 'translateX(-50%)', width: '640px', height: '360px', background: 'radial-gradient(ellipse, rgba(0,230,118,0.10) 0%, rgba(0,230,118,0.03) 45%, transparent 70%)', zIndex: 0 }} />
      <div className="fixed pointer-events-none" style={{ bottom: '-5%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(0,230,118,0.04) 0%, transparent 70%)', zIndex: 0 }} />

      <div className="w-full max-w-sm animate-slide-up relative" style={{ zIndex: 1 }}>

        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <Logo size="lg" className="items-center" />
          <div className="mt-5 flex items-center gap-3">
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Copa do Mundo 2026
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
        </div>

        {/* ── STEP: name ── */}
        {step === 'name' && (
          <div className="gradient-border-animated shimmer-once rounded-2xl p-6">
            <div className="mb-5">
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Seu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="Como te chamam?"
                maxLength={30}
                autoFocus
                className="w-full outline-none transition-all"
                style={{ borderRadius: '12px', padding: '12px 14px', fontSize: '15px', fontWeight: 500, color: 'var(--text)', background: 'var(--surface-2)', border: name ? '1.5px solid rgba(0,230,118,0.3)' : '1.5px solid var(--border-bright)', fontFamily: 'Space Grotesk, system-ui' }}
              />
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '14px', fontWeight: 500 }}>{error}</p>}

            <button onClick={handleLookup} disabled={loading}
              className="w-full transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', letterSpacing: '0.02em', color: '#08090e', background: 'var(--accent)', boxShadow: '0 0 24px rgba(0,230,118,0.25)', fontFamily: 'Space Grotesk, system-ui', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Buscando...' : 'Continuar →'}
            </button>
          </div>
        )}

        {/* ── STEP: found existing users ── */}
        {step === 'found' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid rgba(0,230,118,0.2)' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>
                Conta encontrada!
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Escolha seu perfil para continuar de onde parou:
              </p>
            </div>

            {foundUsers.map(u => (
              <button
                key={u.id}
                onClick={() => handleRestore(u)}
                className="w-full text-left rounded-2xl p-4 card-hover transition-all active:scale-[0.98]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-bright)', cursor: 'pointer' }}
              >
                <div className="flex items-center gap-3">
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 800, fontSize: '18px', flexShrink: 0, border: '1.5px solid rgba(0,230,118,0.3)' }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>{u.name}</p>
                    {u.boloes.length > 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.boloes.map(b => b.name).join(' · ')}
                      </p>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Nenhum bolão ainda</p>
                    )}
                    {u.champion_pick && (
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        🏆 {u.champion_pick}
                      </p>
                    )}
                  </div>
                  <span style={{ color: 'var(--accent)', fontSize: '18px', flexShrink: 0 }}>→</span>
                </div>
              </button>
            ))}

            {/* Option to create new anyway */}
            <button
              onClick={() => setStep('new')}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border-bright)', cursor: 'pointer', letterSpacing: '0.02em' }}>
              Não sou nenhum desses — criar novo perfil
            </button>

            <button onClick={() => { setStep('name'); setError('') }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer', textAlign: 'center', padding: '4px' }}>
              ← Voltar
            </button>
          </div>
        )}

        {/* ── STEP: new user form ── */}
        {step === 'new' && (
          <div className="gradient-border-animated shimmer-once rounded-2xl p-6">
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
              Criar perfil para <span style={{ color: 'var(--accent)' }}>{name}</span>
            </p>

            {/* Champion dropdown */}
            <div className="mb-6">
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Campeão{' '}<span style={{ color: 'var(--accent)', fontWeight: 700 }}>+20 pts</span>
              </label>

              <div ref={dropRef} className="relative">
                <button type="button" onClick={() => setOpen(o => !o)}
                  className="w-full text-left outline-none transition-all flex items-center justify-between gap-2"
                  style={{ borderRadius: '12px', padding: '12px 14px', fontSize: '15px', fontWeight: 500, background: 'var(--surface-2)', border: champion ? '1.5px solid rgba(0,230,118,0.3)' : '1.5px solid var(--border-bright)', color: champion ? 'var(--text)' : 'var(--text-muted)', fontFamily: 'Space Grotesk, system-ui', cursor: 'pointer' }}>
                  <span className="flex items-center gap-2">
                    {selectedTeam && <TeamFlag teamName={selectedTeam.name} emoji={selectedTeam.flag} width={22} height={16} />}
                    {champion || 'Selecionar seleção...'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▾</span>
                </button>

                {open && (
                  <div className="absolute z-50 w-full mt-1 rounded-2xl overflow-hidden animate-fade-in"
                    style={{ background: 'var(--surface-3)', border: '1px solid var(--border-bright)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', maxHeight: '220px', overflowY: 'auto' }}>
                    <div onClick={() => { setChampion(''); setOpen(false) }}
                      className="px-4 py-2.5 cursor-pointer transition-colors"
                      style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      Sem palpite
                    </div>
                    {TEAMS.map(t => {
                      const isSelected = champion === t.name
                      return (
                        <div key={t.name} onClick={() => { setChampion(t.name); setOpen(false) }}
                          className="px-4 py-2.5 cursor-pointer transition-colors flex items-center gap-2.5"
                          style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--accent)' : 'var(--text)', background: isSelected ? 'var(--accent-dim)' : 'transparent' }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
                          <TeamFlag teamName={t.name} emoji={t.flag} width={24} height={18} />
                          {t.name}
                          {isSelected && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>Disponível só antes do 1º jogo</p>
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '14px', fontWeight: 500 }}>{error}</p>}

            <button onClick={handleCreate} disabled={loading}
              className="w-full transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', color: '#08090e', background: 'var(--accent)', boxShadow: '0 0 24px rgba(0,230,118,0.25)', fontFamily: 'Space Grotesk, system-ui', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Criando...' : 'Criar perfil →'}
            </button>

            <button onClick={() => { setStep('name'); setError('') }}
              style={{ display: 'block', width: '100%', marginTop: '12px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
              ← Voltar
            </button>
          </div>
        )}

        <p className="text-center mt-6 flex items-center justify-center gap-3" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          <span>Sem senha</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Sem cadastro</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Só diversão</span>
        </p>
      </div>
    </div>
  )
}
