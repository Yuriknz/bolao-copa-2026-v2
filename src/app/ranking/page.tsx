'use client'
import { useEffect, useState } from 'react'
import { supabase, getLocalUserId } from '@/lib/supabase'
import { User } from '@/types'
import BottomNav from '@/components/BottomNav'

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

  const medal = (pos: number) => {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return `${pos}º`
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4"
        style={{ background: 'linear-gradient(135deg, #064e1a, #111118)' }}>
        <h1 className="text-2xl font-extrabold text-white">Ranking</h1>
        <p className="text-green-400 text-xs mt-0.5 font-semibold">Tabela de pontuação ao vivo</p>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center mt-20 text-slate-600">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-semibold">Ninguém no bolão ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user, idx) => {
              const pos = idx + 1
              const isMe = user.id === myId
              return (
                <div key={user.id}
                  className="flex items-center gap-3 p-4 rounded-2xl border transition-all"
                  style={{
                    background: isMe ? 'rgba(34,197,94,0.08)' : '#111118',
                    borderColor: isMe ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)',
                  }}>
                  {/* Posição */}
                  <div className="w-10 text-center text-lg font-black" style={{ color: pos <= 3 ? '#facc15' : '#475569' }}>
                    {medal(pos)}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                    style={{ background: isMe ? '#16a34a' : '#1e2433' }}>
                    {user.name[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">
                      {user.name} {isMe && <span className="text-green-400 text-xs">(você)</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {user.exact_scores} placar{user.exact_scores !== 1 ? 'es' : ''} exato{user.exact_scores !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Pontos */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-extrabold" style={{ color: isMe ? '#22c55e' : '#f1f5f9' }}>
                      {user.total_points}
                    </div>
                    <div className="text-[10px] text-slate-600 font-semibold">pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Legenda pontuação */}
        <div className="mt-6 p-4 rounded-2xl border" style={{ background: '#111118', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Como funciona</p>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Placar exato</span>
              <span className="text-green-400 font-bold">3 pts × multiplicador</span>
            </div>
            <div className="flex justify-between">
              <span>Só o vencedor</span>
              <span className="text-yellow-400 font-bold">1 pt × multiplicador</span>
            </div>
            <div className="flex justify-between">
              <span>Campeão certo</span>
              <span className="text-purple-400 font-bold">+20 pts bônus</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
