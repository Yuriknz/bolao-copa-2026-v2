'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const scales = {
    sm: { title: '1.3rem', sub: '0.62rem', gap: '2px', iconSize: 13 },
    md: { title: '1.8rem', sub: '0.72rem', gap: '3px', iconSize: 17 },
    lg: { title: '3rem',   sub: '0.9rem',  gap: '6px', iconSize: 28 },
  }
  const s = scales[size]

  return (
    <div className={`flex items-center ${className}`} style={{ gap: '9px' }}>
      {/* Emblem / crest */}
      <Emblem size={size} />

      {/* Wordmark */}
      <div className="flex flex-col" style={{ gap: s.gap }}>
        <span
          style={{
            fontFamily: 'Bebas Neue, system-ui, sans-serif',
            fontSize: s.title,
            lineHeight: 1,
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, #00e676 0%, #69ffb4 55%, #00c853 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 10px rgba(0,230,118,0.45))',
          }}
        >
          BOLÃO
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              display: 'block',
              width: size === 'lg' ? '20px' : size === 'md' ? '14px' : '10px',
              height: '1px',
              background: 'linear-gradient(90deg, var(--accent), transparent)',
              borderRadius: '1px',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'Space Grotesk, system-ui, sans-serif',
              fontSize: s.sub,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(220,230,255,0.72)',
            }}
          >
            da Resenha
          </span>
        </div>
      </div>
    </div>
  )
}

function Emblem({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 44 : size === 'md' ? 34 : 26

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 44 44"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      {/* Outer glow ring */}
      <circle cx="22" cy="22" r="20" stroke="rgba(0,230,118,0.18)" strokeWidth="1" />

      {/* Shield shape */}
      <path
        d="M22 4 L36 10 L36 24 Q36 34 22 40 Q8 34 8 24 L8 10 Z"
        fill="rgba(0,230,118,0.06)"
        stroke="rgba(0,230,118,0.28)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Top accent bar inside shield */}
      <rect x="14" y="12" width="16" height="1.5" rx="0.75" fill="rgba(0,230,118,0.5)" />

      {/* Soccer ball icon centered */}
      <g transform="translate(22,23)">
        {/* Ball circle */}
        <circle r="7" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        {/* Central pentagon patch */}
        <polygon
          points="0,-4 3.8,-1.2 2.4,3.2 -2.4,3.2 -3.8,-1.2"
          fill="rgba(0,230,118,0.55)"
          stroke="rgba(0,230,118,0.2)"
          strokeWidth="0.4"
        />
        {/* Surrounding patches (simplified) */}
        <polygon
          points="0,-4 3.8,-1.2 5.5,-4 2.5,-6.5 -2.5,-6.5 -5.5,-4 -3.8,-1.2"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.5"
        />
        <line x1="-3.8" y1="-1.2" x2="-6.5" y2="1.5" stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" />
        <line x1="3.8" y1="-1.2" x2="6.5" y2="1.5" stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" />
        <line x1="2.4" y1="3.2" x2="5" y2="5.5" stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" />
        <line x1="-2.4" y1="3.2" x2="-5" y2="5.5" stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" />
      </g>

      {/* Bottom shield star/dot accent */}
      <circle cx="22" cy="37" r="1" fill="rgba(0,230,118,0.6)" />
    </svg>
  )
}
