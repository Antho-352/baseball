/**
 * Types communs pour tous les data providers
 */

export interface Game {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  gameDate: Date;
  gameTime?: string;
  venue?: string;
  status: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  innings?: number;
  apiGameId?: string; // ID dans l'API source
}

export interface Standing {
  teamId: string;
  leagueId: string;
  season: number;
  division?: string;
  position: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winPercentage: number;
  gamesBehind?: number;
  homeRecord?: string; // "25-10"
  awayRecord?: string; // "20-15"
  last10Games?: string; // "6-4"
  streak?: string; // "W3" ou "L2"
  form?: string; // "WWLWW"
  runsScored?: number;
  runsAllowed?: number;
  runDifferential?: number;
}

export interface Odds {
  gameId: string;
  bookmaker: string;
  bookmakerApiId?: string;
  homeWin?: number;
  awayWin?: number;
  draw?: number; // Rare en baseball, mais existe
  overUnderLine?: number; // 8.5 runs
  overOdds?: number;
  underOdds?: number;
  fetchedAt: Date;
}

export interface H2HResult {
  gameId: string;
  gameDate: Date;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  winner: 'home' | 'away' | 'draw';
}

export interface PlayerStats {
  playerId: string;
  season: number;
  statType: 'batting' | 'pitching';

  // Batting stats
  gamesPlayed?: number;
  atBats?: number;
  runs?: number;
  hits?: number;
  doubles?: number;
  triples?: number;
  homeRuns?: number;
  rbis?: number;
  stolenBases?: number;
  battingAvg?: number;
  onBasePct?: number;
  sluggingPct?: number;
  ops?: number;

  // Pitching stats
  wins?: number;
  losses?: number;
  saves?: number;
  inningsPitched?: number;
  strikeouts?: number;
  walks?: number;
  earnedRuns?: number;
  era?: number;
  whip?: number;
}

export interface Team {
  id: string;
  leagueId: string;
  name: string;
  shortName?: string;
  city?: string;
  logoUrl?: string;
  apiTeamId?: string; // ID dans l'API source
}

export interface Player {
  id: string;
  teamId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  jerseyNumber?: number;
  birthDate?: Date;
  photoUrl?: string;
  apiPlayerId?: string; // ID dans l'API source
}
