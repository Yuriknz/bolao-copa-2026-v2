export const dynamic = 'force-dynamic'

import { getSupabase } from '@/lib/supabase'

async function getRanking() {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('users')
    .select('id, name, total_points, exact_scores')
    .order('total_points', { ascending: false })
    .order('exact_scores', { ascending: false })
  return data ?? []
}

export default async function PublicRankingPage() {
  const users = await getRanking()
  const medal = (pos: number) => pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`

  return (
    <div className="min-h-screen px-4 py-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-extrabold text-white">Bolão Copa 2026</h1>
        <p className="text-green-400 text-sm font-semibold mt-1">Ranking público</p>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-slate-600 mt-20">Ninguém no bolão ainda</p>
      ) : (
        <div className="space-y-2">
          {users.map((user: any, idx: number) => (
            <div key={user.id} className="flex items-center gap-3 p-4 rounded-2xl border"
              style={{ background: '#111118', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="w-8 text-center font-black text-lg" style={{ color: idx < 3 ? '#facc15' : '#475569' }}>
                {medal(idx + 1)}
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-sm"
                style={{ background: '#1e2433' }}>
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.exact_scores} exatos</p>
              </div>
              <p className="text-lg font-extrabold text-white">
                {user.total_points} <span className="text-xs text-slate-500">pts</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-slate-700 text-xs mt-8">Atualizado em tempo real</p>
    </div>
  )
}
