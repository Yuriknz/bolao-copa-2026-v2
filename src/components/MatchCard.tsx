'use client'
import { useState } from 'react'
import { Match, Pick } from '@/types'
import { supabase, getLocalUserId } from '@/lib/supabase'
import StatusBadge from './StatusBadge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  match: Match
  existingPick?: Pick
}

const STATUS_BORDER: Record<string, string> = {
  open: 'gradient-border-open',
  locked: '',
  live: 'gradient-border-live',
  finished: '',
}

export default function MatchCard({ match, existingPick }: Props) {
  const canPick = match.status === 'open'
  const [home, setHome] = useState<string>(existingPick?.pick_home?.toString() ?? '')
  const [away, setAway] = useState<string>(existingPick?.pick_away?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const hasPick = existingPick != null

  async function savePick() {
    const userId = getLocalUserId()
    if (!userId) { setErr('Faça login novamente'); return }
    if (home === '' || away === '') { setErr('Preencha o placar'); return }
    setSaving(true); setErr('')
    try {
      await supabase.from('picks').upsert({
        user_id: userId,
        match_id: match.id,
        pick_home: parseInt(home),
        pick_away: parseInt(away),
      }, { onConflict: 'user_id,match_id' })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setErr('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const matchDate = new Date(match.match_time)
  const dateLabel = format(matchDate, "dd 'de' MMM · HH'h'mm", { locale: ptBR })

  const cardClass = STATUS_BORDER[match.status] || ''
  const defaultBorder = (match.status === 'locked' || match.status === 'finished')
    ? '1px solid var(--border)'
    : undefined

  return (
    <div
      className={`rounded-2xl p-4 mb-3 animate-slide-up ${cardClass}`}
      style={{
        background: 'var(--surface)',
        border: defaultBorder,
      }}
    >
      {/* Header: date + badge */}
      <div className="flex items-center justify-between mb-3.5">
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {dateLabel}
        </span>
        <StatusBadge status={match.status} matchTime={match.match_time} />
      </div>

      {/* Match row */}
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{match.flag_home}</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text)',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {match.team_home}
          </span>
        </div>

        {/* Score / Inputs */}
        <div className="flex items-center gap-2">
          {match.status === 'finished' ? (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'var(--surface-2)' }}
            >
              <span
                style={{
                  fontFamily: 'Bebas Neue, system-ui',
                  fontSize: '2rem',
                  color: 'var(--text)',
                  lineHeight: 1,
                }}
              >
                {match.score_home}
              </span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.2rem' }}>:</span>
              <span
                style={{
                  fontFamily: 'Bebas Neue, system-ui',
                  fontSize: '2rem',
                  color: 'var(--text)',
                  lineHeight: 1,
                }}
              >
                {match.score_away}
              </span>
            </div>
          ) : (
            <>
              <input
                type="number" min="0" max="20" value={home}
                onChange={e => setHome(e.target.value)}
                disabled={!canPick}
                placeholder="0"
                className="outline-none transition-all disabled:opacity-30"
                style={{
                  width: '48px',
                  height: '52px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontFamily: 'Bebas Neue, system-ui',
                  fontSize: '1.8rem',
                  color: 'var(--text)',
                  background: 'var(--surface-2)',
                  border: home !== '' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-bright)',
                  caretColor: 'var(--accent)',
                }}
              />
              <span style={{ color: 'var(--text-dim)', fontWeight: 700, fontSize: '1.1rem' }}>:</span>
              <input
                type="number" min="0" max="20" value={away}
                onChange={e => setAway(e.target.value)}
                disabled={!canPick}
                placeholder="0"
                className="outline-none transition-all disabled:opacity-30"
                style={{
                  width: '48px',
                  height: '52px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontFamily: 'Bebas Neue, system-ui',
                  fontSize: '1.8rem',
                  color: 'var(--text)',
                  background: 'var(--surface-2)',
                  border: away !== '' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-bright)',
                  caretColor: 'var(--accent)',
                }}
              />
            </>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{match.flag_away}</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text)',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {match.team_away}
          </span>
        </div>
      </div>

      {/* Result row - finished matches */}
      {match.status === 'finished' && hasPick && (
        <div
          className="mt-3.5 pt-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
              Seu palpite
            </p>
            <p style={{ fontFamily: 'Bebas Neue, system-ui', fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '0.04em' }}>
              {existingPick.pick_home} : {existingPick.pick_away}
            </p>
          </div>
          <div
            className="px-3 py-1.5 rounded-lg"
            style={{
              background: existingPick.points_earned > 0 ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
            }}
          >
            <p
              style={{
                fontFamily: 'Bebas Neue, system-ui',
                fontSize: '1.4rem',
                letterSpacing: '0.04em',
                color: existingPick.points_earned > 0 ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {existingPick.points_earned > 0 ? `+${existingPick.points_earned} pts` : '— pts'}
            </p>
          </div>
        </div>
      )}

      {/* Save button - open matches */}
      {canPick && (
        <div className="mt-3.5">
          {err && (
            <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '8px', fontWeight: 500 }}>
              {err}
            </p>
          )}
          <button
            onClick={savePick}
            disabled={saving}
            className="w-full transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              padding: '10px 0',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              background: saved ? 'var(--accent-dim)' : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${saved ? 'rgba(0,230,118,0.4)' : 'var(--border-bright)'}`,
              color: saved ? 'var(--accent)' : 'var(--text)',
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : hasPick ? 'Atualizar palpite' : 'Confirmar palpite'}
          </button>
        </div>
      )}
    </div>
  )
}
