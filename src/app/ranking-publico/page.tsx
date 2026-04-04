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

const PODIUM = [
  { emoji: '🥇', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
  { emoji: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' },
  { emoji: '🥉', color: '#cd853f', bg: 'rgba(180,120,60,0.08)', border: 'rgba(180,120,60,0.15)' },
]

export default async function PublicRankingPage() {
  const users = await getRanking()

  return (
    <div
      className="min-h-screen px-4 py-10 max-w-md mx-auto"
      style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex flex-col items-center gap-1.5 mb-6">
          {/* Logo wordmark */}
          <span
            style={{
              fontFamily: 'Bebas Neue, system-ui',
              fontSize: '3rem',
              lineHeight: 1,
              letterSpacing: '0.03em',
              color: '#00e676',
            }}
          >
            BOLÃO
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            da Resenha
          </span>
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: 'rgba(0,230,118,0.1)',
            border: '1px solid rgba(0,230,118,0.2)',
          }}
        >
          <span
            className="rounded-full"
            style={{ width: '6px', height: '6px', background: '#00e676', display: 'inline-block' }}
          />
          <span style={{ fontSize: '11px', color: '#00e676', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Ranking ao vivo
          </span>
        </div>
      </div>

      {users.length === 0 ? (
        <p
          className="text-center mt-20"
          style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}
        >
          Ninguém no bolão ainda
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((user: { id: string; name: string; total_points: number; exact_scores: number }, idx: number) => {
            const podium = idx < 3 ? PODIUM[idx] : null
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-2xl p-4"
                style={{
                  background: podium ? podium.bg : 'rgba(13,16,25,0.8)',
                  border: `1px solid ${podium ? podium.border : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {/* Position */}
                <div
                  style={{
                    width: '28px',
                    textAlign: 'center',
                    flexShrink: 0,
                    fontSize: podium ? '1.4rem' : '13px',
                    fontFamily: podium ? undefined : 'Bebas Neue, system-ui',
                    fontWeight: podium ? undefined : 700,
                    color: podium ? undefined : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {podium ? podium.emoji : `${idx + 1}°`}
                </div>

                {/* Avatar */}
                <div
                  className="rounded-full flex items-center justify-center font-bold shrink-0"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: podium ? podium.border : 'rgba(255,255,255,0.07)',
                    color: podium ? podium.color : 'rgba(255,255,255,0.4)',
                    fontSize: '13px',
                  }}
                >
                  {user.name[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate"
                    style={{ fontWeight: 600, fontSize: '14px', color: '#dde1ed' }}
                  >
                    {user.name}
                  </p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '1px' }}>
                    {user.exact_scores} exatos
                  </p>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  <p
                    style={{
                      fontFamily: 'Bebas Neue, system-ui',
                      fontSize: '1.6rem',
                      color: podium ? podium.color : '#dde1ed',
                      lineHeight: 1,
                    }}
                  >
                    {user.total_points}
                  </p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.06em', marginTop: '2px' }}>
                    PTS
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p
        className="text-center mt-10"
        style={{ fontSize: '11px', color: 'rgba(255,255,255,0.12)', letterSpacing: '0.05em' }}
      >
        Atualizado em tempo real · Bolão da Resenha
      </p>
    </div>
  )
}
