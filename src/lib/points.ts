export function calcPoints(
  pickHome: number, pickAway: number,
  scoreHome: number, scoreAway: number,
  multiplier: number
): number {
  if (pickHome === scoreHome && pickAway === scoreAway) return 3 * multiplier
  const pickWinner = pickHome > pickAway ? 'home' : pickHome < pickAway ? 'away' : 'draw'
  const realWinner = scoreHome > scoreAway ? 'home' : scoreHome < scoreAway ? 'away' : 'draw'
  if (pickWinner === realWinner) return 1 * multiplier
  return 0
}

export function minutesUntilMatch(matchTime: string): number {
  return Math.floor((new Date(matchTime).getTime() - Date.now()) / 60000)
}

export function isLockingSoon(matchTime: string): boolean {
  const mins = minutesUntilMatch(matchTime)
  return mins > 0 && mins <= 30
}
