interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const scales = {
    sm: { title: '1.25rem', sub: '0.6rem', gap: '1px', iconSize: 14 },
    md: { title: '1.75rem', sub: '0.7rem', gap: '2px', iconSize: 18 },
    lg: { title: '2.8rem', sub: '0.85rem', gap: '4px', iconSize: 24 },
  }
  const s = scales[size]

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: s.gap }}>
      <span
        style={{
          fontFamily: 'Bebas Neue, system-ui, sans-serif',
          fontSize: s.title,
          lineHeight: 1,
          letterSpacing: '0.03em',
          color: 'var(--accent)',
        }}
      >
        BOLÃO
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <FootballIcon size={s.iconSize} />
        <span
          style={{
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            fontSize: s.sub,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          da Resenha
        </span>
      </div>
    </div>
  )
}

function FootballIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="9.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
      {/* Pentagon patches */}
      <path
        d="M12 5.5 L14.8 7.6 L13.8 10.8 L10.2 10.8 L9.2 7.6 Z"
        fill="rgba(255,255,255,0.25)"
      />
      <path
        d="M5.8 10.2 L8.7 8.9 L10.2 10.8 L8.6 13.6 L5.5 13.1 Z"
        fill="rgba(255,255,255,0.18)"
      />
      <path
        d="M18.2 10.2 L15.3 8.9 L13.8 10.8 L15.4 13.6 L18.5 13.1 Z"
        fill="rgba(255,255,255,0.18)"
      />
      <path
        d="M7.5 16.8 L8.6 13.6 L12 14.9 L15.4 13.6 L16.5 16.8 L12 18.8 Z"
        fill="rgba(255,255,255,0.2)"
      />
    </svg>
  )
}
