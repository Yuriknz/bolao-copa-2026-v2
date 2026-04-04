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
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setErr('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const matchDate = new Date(match.match_time)
  const dateLabel = format(matchDate, "dd/MM • HH'h'mm", { locale: ptBR })

  return (
    <div className="rounded-2xl p-4 border mb-3 animate-slide-up"
      style={{ background: '#111118', borderColor: 'rgba(255,255,255,0.07)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-semibold">{dateLabel}</span>
        <StatusBadge status={match.status} matchTime={match.match_time} />
      </div>

      {/* Placar row */}
      <div className="flex items-center gap-2">
        {/* Time casa */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-3xl">{match.flag_home}</span>
          <span className="text-xs font-bold text-slate-300 text-center leading-tight">{match.team_home}</span>
        </div>

        {/* Inputs ou placar real */}
        <div className="flex items-center gap-2">
          {match.status === 'finished' ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-2xl font-extrabold text-white">{match.score_home}</span>
              <span className="text-slate-500 font-bold">×</span>
              <span className="text-2xl font-extrabold text-white">{match.score_away}</span>
            </div>
          ) : (
            <>
              <input type="number" min="0" max="20" value={home}
                onChange={e => setHome(e.target.value)}
                disabled={!canPick}
                placeholder="0"
                className="w-12 h-12 rounded-xl text-center text-xl font-extrabold text-white outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40 transition"
                style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.1)' }}
              />
              <span className="text-slate-600 font-bold text-lg">×</span>
              <input type="number" min="0" max="20" value={away}
                onChange={e => setAway(e.target.value)}
                disabled={!canPick}
                placeholder="0"
                className="w-12 h-12 rounded-xl text-center text-xl font-extrabold text-white outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40 transition"
                style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.1)' }}
              />
            </>
          )}
        </div>

        {/* Time visitante */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-3xl">{match.flag_away}</span>
          <span className="text-xs font-bold text-slate-300 text-center leading-tight">{match.team_away}</span>
        </div>
      </div>

      {/* Palpite do usuário (se encerrado) */}
      {match.status === 'finished' && hasPick && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-xs text-slate-500">
            Seu palpite: <strong className="text-slate-300">{existingPick.pick_home} × {existingPick.pick_away}</strong>
          </span>
          <span className="text-xs font-extrabold" style={{
            color: existingPick.points_earned > 0 ? '#22c55e' : '#475569'
          }}>
            {existingPick.points_earned > 0 ? `+${existingPick.points_earned} pts` : '0 pts'}
          </span>
        </div>
      )}

      {/* Botão salvar */}
      {canPick && (
        <div className="mt-3">
          {err && <p className="text-red-400 text-xs mb-2">{err}</p>}
          <button onClick={savePick} disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: saved ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.12)',
              border: `1px solid ${saved ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)'}`,
              color: saved ? '#4ade80' : '#22c55e',
            }}>
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : hasPick ? 'Atualizar palpite' : 'Confirmar palpite'}
          </button>
        </div>
      )}
    </div>
  )
}
