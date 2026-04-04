import { MatchStatus } from '@/types'
import { minutesUntilMatch, isLockingSoon } from '@/lib/points'

interface Props {
  status: MatchStatus
  matchTime: string
}

const CONFIG: Record<MatchStatus, { label: string; color: string; bg: string }> = {
  open:     { label: 'Aberto',    color: 'var(--accent)',  bg: 'var(--accent-dim)' },
  locked:   { label: 'Travado',   color: 'var(--amber)',   bg: 'var(--amber-dim)' },
  live:     { label: 'Ao Vivo',   color: 'var(--red)',     bg: 'var(--red-dim)' },
  finished: { label: 'Encerrado', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' },
}

export default function StatusBadge({ status, matchTime }: Props) {
  const cfg = CONFIG[status]
  const soon = status === 'open' && isLockingSoon(matchTime)
  const mins = minutesUntilMatch(matchTime)

  const color = soon ? 'var(--amber)' : cfg.color
  const bg = soon ? 'var(--amber-dim)' : cfg.bg

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-semibold"
      style={{
        color,
        background: bg,
        fontSize: '10px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '3px 8px',
      }}
    >
      {status === 'live' && (
        <span
          className="rounded-full animate-pulse-badge"
          style={{ width: '5px', height: '5px', background: 'var(--red)', flexShrink: 0 }}
        />
      )}
      {soon ? `⚡ ${mins}min` : cfg.label}
    </span>
  )
}
