'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getLocalUserName, clearLocalUser } from '@/lib/supabase'
import Logo from './Logo'

interface PageHeaderProps {
  label: string
  sticky?: boolean
}

export default function PageHeader({ label, sticky = true }: PageHeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserName(getLocalUserName())
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    clearLocalUser()
    router.replace('/')
  }

  const initial = userName ? userName[0].toUpperCase() : '?'

  return (
    <div
      className={sticky ? 'sticky top-0 z-40' : ''}
      style={{
        padding: '16px 16px 12px',
        background: sticky
          ? 'linear-gradient(to bottom, rgba(8,9,14,1) 0%, rgba(8,9,14,0.97) 80%, transparent 100%)'
          : undefined,
        backdropFilter: sticky ? 'blur(4px)' : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          {/* Page chip */}
          <div
            style={{
              padding: '5px 12px',
              borderRadius: '100px',
              background: 'var(--surface)',
              border: '1px solid var(--border-bright)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>

          {/* User avatar + logout */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              title={userName ?? 'Usuário'}
              className="flex items-center justify-center rounded-full transition-all active:scale-95"
              style={{
                width: '32px',
                height: '32px',
                background: menuOpen ? 'var(--accent)' : 'var(--surface-2)',
                border: `1.5px solid ${menuOpen ? 'var(--accent)' : 'var(--border-bright)'}`,
                color: menuOpen ? '#08090e' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {initial}
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 rounded-2xl overflow-hidden animate-fade-in"
                style={{
                  minWidth: '180px',
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border-bright)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  zIndex: 100,
                }}
              >
                {/* User name header */}
                {userName && (
                  <div
                    style={{
                      padding: '12px 14px 8px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Jogando como
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                      {userName}
                    </p>
                  </div>
                )}

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left transition-colors flex items-center gap-2.5"
                  style={{
                    padding: '12px 14px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--red)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-dim)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogoutIcon />
                  Trocar de usuário
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
