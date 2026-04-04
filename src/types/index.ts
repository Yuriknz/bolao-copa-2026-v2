export type MatchPhase = 'groups' | 'r16' | 'qf' | 'sf' | 'final'
export type MatchStatus = 'open' | 'locked' | 'live' | 'finished'

export interface User {
  id: string
  name: string
  champion_pick: string | null
  total_points: number
  exact_scores: number
  created_at: string
}

export interface Match {
  id: string
  api_id: string | null
  team_home: string
  flag_home: string
  team_away: string
  flag_away: string
  score_home: number | null
  score_away: number | null
  match_time: string
  phase: MatchPhase
  status: MatchStatus
  multiplier: number
  group_name: string | null
  created_at: string
}

export interface Pick {
  id: string
  user_id: string
  match_id: string
  pick_home: number
  pick_away: number
  points_earned: number
  created_at: string
  match?: Match
}

export interface RankingEntry {
  position: number
  user: User
}

export const PHASE_LABELS: Record<MatchPhase, string> = {
  groups: 'Fase de Grupos',
  r16: 'Oitavas de Final',
  qf: 'Quartas de Final',
  sf: 'Semifinal',
  final: 'Final',
}

export const PHASE_MULTIPLIERS: Record<MatchPhase, number> = {
  groups: 1,
  r16: 2,
  qf: 3,
  sf: 4,
  final: 5,
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  open: 'Aberto',
  locked: 'Travado',
  live: 'Ao Vivo',
  finished: 'Encerrado',
}
