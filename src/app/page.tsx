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
  { name: 'EUA', flag: '🇺🇸' },
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

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [champion, setChampion] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = getLocalUserId()
    if (id) router.replace('/cartela')
    else setChecking(false)
  }, [router])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleEnter() {
    if (!name.trim()) { setError('Digite seu nome'); return }
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
      router.push('/cartela')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'tente novamente'
      setError('Erro ao entrar: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const selectedTeam = TEAMS.find(t => t.name === champion)

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="animate-spin rounded-full"
        style={{
          width: '28px',
          height: '28px',
          border: '2px solid var(--accent-dim)',
          borderTopColor: 'var(--accent)',
        }}
      />
    </div>
  )

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-14 relative"
      style={{ zIndex: 1 }}
    >
      {/* Ambient glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(0,230,118,0.06) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <div className="w-full max-w-sm animate-slide-up relative" style={{ zIndex: 1 }}>

        {/* Logo block */}
        <div className="mb-10 flex flex-col items-center">
          <Logo size="lg" className="items-center" />
          <div className="mt-5 flex items-center gap-3">
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              Copa do Mundo 2026
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-bright)',
          }}
        >
          {/* Name input */}
          <div className="mb-5">
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Seu nome
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnter()}
              placeholder="Como te chamam?"
              maxLength={30}
              className="w-full outline-none transition-all"
              style={{
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text)',
                background: 'var(--surface-2)',
                border: name ? '1.5px solid rgba(0,230,118,0.3)' : '1.5px solid var(--border-bright)',
                fontFamily: 'Space Grotesk, system-ui',
              }}
            />
          </div>

          {/* Champion dropdown */}
          <div className="mb-6">
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Campeão{' '}
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>+20 pts</span>
            </label>

            <div ref={dropRef} className="relative">
              <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full text-left outline-none transition-all flex items-center justify-between gap-2"
                style={{
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '15px',
                  fontWeight: 500,
                  background: 'var(--surface-2)',
                  border: champion ? '1.5px solid rgba(0,230,118,0.3)' : '1.5px solid var(--border-bright)',
                  color: champion ? 'var(--text)' : 'var(--text-muted)',
                  fontFamily: 'Space Grotesk, system-ui',
                  cursor: 'pointer',
                }}
              >
                <span className="flex items-center gap-2">
                  {selectedTeam && (
                    <TeamFlag teamName={selectedTeam.name} emoji={selectedTeam.flag} width={22} height={16} />
                  )}
                  {champion || 'Selecionar seleção...'}
                </span>
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    transform: open ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  ▾
                </span>
              </button>

              {open && (
                <div
                  className="absolute z-50 w-full mt-1 rounded-2xl overflow-hidden animate-fade-in"
                  style={{
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border-bright)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  <div
                    onClick={() => { setChampion(''); setOpen(false) }}
                    className="px-4 py-2.5 cursor-pointer transition-colors"
                    style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Sem palpite
                  </div>
                  {TEAMS.map(t => {
                    const isSelected = champion === t.name
                    return (
                      <div
                        key={t.name}
                        onClick={() => { setChampion(t.name); setOpen(false) }}
                        className="px-4 py-2.5 cursor-pointer transition-colors flex items-center gap-2.5"
                        style={{
                          fontSize: '14px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? 'var(--accent)' : 'var(--text)',
                          background: isSelected ? 'var(--accent-dim)' : 'transparent',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                      >
                        <TeamFlag teamName={t.name} emoji={t.flag} width={24} height={18} />
                        {t.name}
                        {isSelected && (
                          <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
              Disponível só antes do 1º jogo
            </p>
          </div>

          {error && (
            <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '14px', fontWeight: 500 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              padding: '13px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.02em',
              color: '#08090e',
              background: 'var(--accent)',
              boxShadow: '0 0 24px rgba(0,230,118,0.25)',
              fontFamily: 'Space Grotesk, system-ui',
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no Bolão →'}
          </button>
        </div>

        {/* Footer tagline */}
        <p
          className="text-center mt-6 flex items-center justify-center gap-3"
          style={{ fontSize: '11px', color: 'var(--text-dim)' }}
        >
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
