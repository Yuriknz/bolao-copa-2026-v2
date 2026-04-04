'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getLocalUserId, setLocalUserId } from '@/lib/supabase'

const TEAMS = [
  'Brasil','Argentina','França','Alemanha','Espanha','Portugal',
  'Inglaterra','Itália','Holanda','Bélgica','Uruguai','México',
  'EUA','Japão','Coreia do Sul','Marrocos','Senegal','Austrália',
  'Canadá','Croácia','Suíça','Polônia','Equador','Gana',
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

  // Fecha dropdown ao clicar fora
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
      router.push('/cartela')
    } catch (e: any) {
      setError('Erro ao entrar: ' + (e?.message ?? 'tente novamente'))
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #facc15, transparent)' }} />

      <div className="w-full max-w-sm animate-slide-up relative z-10">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Bolão</h1>
          <p className="text-green-400 font-bold text-lg mt-1">Copa 2026</p>
          <p className="text-slate-500 text-sm mt-2">Palpite nos jogos com seus amigos</p>
        </div>

        <div className="rounded-2xl p-6 border" style={{ background: '#111118', borderColor: 'rgba(255,255,255,0.08)' }}>
          {/* Nome */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-400 mb-2">Seu nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnter()}
              placeholder="Como te chamam?"
              maxLength={30}
              className="w-full rounded-xl px-4 py-3 text-white font-semibold outline-none focus:ring-2 focus:ring-green-500 transition"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Dropdown customizado */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Palpite do Campeão <span className="text-green-500 font-bold">+20 pts bônus</span>
            </label>
            <div ref={dropRef} className="relative">
              <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full rounded-xl px-4 py-3 text-left font-semibold outline-none focus:ring-2 focus:ring-green-500 transition flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: champion ? '#f1f5f9' : '#475569' }}
              >
                <span>{champion || 'Selecionar seleção...'}</span>
                <span className="text-slate-500 ml-2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
              </button>

              {open && (
                <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden border shadow-2xl"
                  style={{ background: '#1a1a24', borderColor: 'rgba(255,255,255,0.12)', maxHeight: '220px', overflowY: 'auto' }}>
                  <div
                    onClick={() => { setChampion(''); setOpen(false) }}
                    className="px-4 py-2.5 text-sm text-slate-500 cursor-pointer hover:bg-white/5 transition"
                  >
                    Sem palpite
                  </div>
                  {TEAMS.map(t => (
                    <div key={t}
                      onClick={() => { setChampion(t); setOpen(false) }}
                      className="px-4 py-2.5 text-sm font-semibold cursor-pointer transition"
                      style={{
                        color: champion === t ? '#22c55e' : '#e2e8f0',
                        background: champion === t ? 'rgba(34,197,94,0.1)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (champion !== t) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { if (champion !== t) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-slate-600 text-xs mt-1">Disponível só antes do primeiro jogo</p>
          </div>

          {error && <p className="text-red-400 text-sm mb-4 font-medium">{error}</p>}

          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full py-3 rounded-xl font-extrabold text-white text-base tracking-wide transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}
          >
            {loading ? 'Entrando...' : 'Entrar no Bolão →'}
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Sem senha • Sem cadastro • Só diversão
        </p>
      </div>
    </div>
  )
}
