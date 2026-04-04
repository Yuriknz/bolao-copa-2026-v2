'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/cartela',   icon: '⚽', label: 'Cartela' },
  { href: '/ranking',   icon: '🏆', label: 'Ranking' },
  { href: '/historico', icon: '📋', label: 'Histórico' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{ background: '#0d0d14', borderColor: 'rgba(255,255,255,0.07)' }}>
      {NAV.map(item => {
        const active = path === item.href
        return (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
            style={{ color: active ? '#22c55e' : '#475569' }}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold">{item.label}</span>
            {active && (
              <span className="absolute bottom-0 w-8 h-0.5 rounded-full"
                style={{ background: '#22c55e' }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
