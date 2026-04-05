'use client'
import { useState, useEffect } from 'react'
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
  const [, setTick] = useState(0)

  useEffect(() => {
    if (status !== 'open') return
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [status])

  const cfg = CONFIG[status]
  const mins = minutesUntilMatch(matchTime)
  const locking = status === 'open' && mins > 0 && mins <= 5
  const soon = status === 'open' && mins > 0 && mins <= 30

  const color = locking ? 'var(--red)' : soon ? 'var(--amber)' : cfg.color
  const bg    = locking ? 'var(--red-dim)' : soon ? 'var(--amber-dim)' : cfg.bg
  const label = locking ? 'Travando...' : soon ? `⚡ Trava em ${mins}min` : cfg.label

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${locking || soon ? 'animate-pulse-badge' : ''}`}
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
      {label}
    </span>
  )
}
