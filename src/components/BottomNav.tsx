'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4h10v7a5 5 0 0 1-10 0V4Z" />
    <path d="M5 8H4a2 2 0 0 1-2-2V5" />
    <path d="M19 8h1a2 2 0 0 0 2-2V5" />
    <path d="M12 16v4" />
    <path d="M8 21h8" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 15.5" />
  </svg>
)

const NAV = [
  { href: '/cartela', label: 'Cartela', Icon: CartIcon },
  { href: '/ranking', label: 'Ranking', Icon: TrophyIcon },
  { href: '/historico', label: 'Histórico', Icon: HistoryIcon },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: 'rgba(8,9,14,0.96)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {NAV.map(({ href, label, Icon }) => {
        const active = path === href
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 relative transition-colors"
            style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {active && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                style={{
                  width: '36px',
                  height: '2px',
                  background: 'var(--accent)',
                  boxShadow: '0 0 8px var(--accent)',
                }}
              />
            )}
            <span
              style={{
                padding: active ? '5px 12px' : '5px',
                borderRadius: '10px',
                background: active ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <Icon />
            </span>
            <span
              className="text-[10px] font-semibold tracking-wide"
              style={{ letterSpacing: '0.06em' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
