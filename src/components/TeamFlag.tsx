'use client'
import { useState } from 'react'
import { getFlagUrl } from '@/lib/teamFlags'

interface TeamFlagProps {
  /** Nome da seleção em PT-BR — usado para buscar a bandeira */
  teamName: string
  /** Emoji de fallback caso não exista mapeamento */
  emoji?: string
  width?: number
  height?: number
  className?: string
}

export default function TeamFlag({
  teamName,
  emoji,
  width = 40,
  height = 30,
  className = '',
}: TeamFlagProps) {
  const [errored, setErrored] = useState(false)
  const fetchW = width <= 40 ? 40 : width <= 80 ? 80 : 160
  const url = getFlagUrl(teamName, fetchW as 40 | 80 | 160)

  if (!url || errored) {
    return (
      <span
        className={className}
        style={{ fontSize: `${Math.min(width * 0.8, 30)}px`, lineHeight: 1, display: 'block' }}
      >
        {emoji ?? '🏳️'}
      </span>
    )
  }

  return (
    <img
      src={url}
      alt={teamName}
      width={width}
      height={height}
      onError={() => setErrored(true)}
      className={className}
      style={{
        borderRadius: '4px',
        objectFit: 'cover',
        display: 'block',
        boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  )
}
