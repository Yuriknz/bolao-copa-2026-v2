import { MatchStatus } from '@/types'
import { minutesUntilMatch, isLockingSoon } from '@/lib/points'

interface Props {
  status: MatchStatus
  matchTime: string
}

const CONFIG: Record<MatchStatus, { label: string; color: string; bg: string }> = {
  open:     { label: 'Aberto',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  locked:   { label: 'Travado',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  live:     { label: 'Ao Vivo',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  finished: { label: 'Encerrado', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
}

export default function StatusBadge({ status, matchTime }: Props) {
  const cfg = CONFIG[status]
  const soon = status === 'open' && isLockingSoon(matchTime)
  const mins = minutesUntilMatch(matchTime)

  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ color: soon ? '#f59e0b' : cfg.color, background: soon ? 'rgba(245,158,11,0.12)' : cfg.bg }}>
      {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-badge" />}
      {soon ? `⚠ Trava em ${mins}min` : cfg.label}
    </span>
  )
}
