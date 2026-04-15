/**
 * API Client - Frontend
 *
 * Fonctions pour appeler le backend API (port 3210)
 * Utilisé par les pages Astro pour fetcher les vraies données
 */

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3210';

/**
 * Generic fetch wrapper avec error handling
 */
async function apiFetch<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Types (correspond aux réponses API backend)
 */
export interface Game {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  gameDate: string;
  status: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  inning?: string;
}

export interface Standing {
  rank: number;
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  pct: number;
  gamesBack: number;
  streak?: string;
  division?: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  position: string;
  stats: {
    [key: string]: string | number;
  };
}

export interface GamesResponse {
  league: string;
  date: string;
  games: Game[];
  cached: boolean;
}

export interface StandingsResponse {
  league: string;
  season: number;
  standings: Standing[];
  cached: boolean;
}

export interface PlayersResponse {
  league: string;
  stat: string;
  players: Player[];
  cached: boolean;
}

/**
 * GET /api/games/:league/:date?
 * Récupère les matchs d'une ligue pour une date
 */
export async function getGames(
  league: 'mlb' | 'kbo' | 'npb',
  date?: Date
): Promise<GamesResponse> {
  const dateStr = date ? formatDate(date) : formatDate(new Date());
  return apiFetch<GamesResponse>(`/api/games/${league}/${dateStr}`);
}

/**
 * GET /api/standings/:league/:season?
 * Récupère le classement d'une ligue
 */
export async function getStandings(
  league: 'mlb' | 'kbo' | 'npb',
  season?: number
): Promise<StandingsResponse> {
  const seasonStr = season ? `/${season}` : '';
  return apiFetch<StandingsResponse>(`/api/standings/${league}${seasonStr}`);
}

/**
 * GET /api/players/:league/top/:stat?
 * Récupère les meilleurs joueurs d'une ligue
 */
export async function getTopPlayers(
  league: 'mlb' | 'kbo' | 'npb',
  stat: 'avg' | 'hr' | 'rbi' | 'era' | 'strikeouts' = 'avg',
  limit: number = 10
): Promise<PlayersResponse> {
  return apiFetch<PlayersResponse>(`/api/players/${league}/top/${stat}?limit=${limit}`);
}

/**
 * GET /api/health
 * Health check
 */
export async function healthCheck(): Promise<{
  status: string;
  timestamp: string;
  provider: string;
}> {
  return apiFetch('/api/health');
}

/**
 * Helpers
 */

/**
 * Format Date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Transform API Game to GameCard props
 */
export function transformGameToCardProps(game: Game) {
  return {
    homeTeam: game.homeTeamName,
    awayTeam: game.awayTeamName,
    homeScore: game.homeScore ?? null,
    awayScore: game.awayScore ?? null,
    status: game.status as 'live' | 'final' | 'scheduled' | 'postponed',
    startTime: new Date(game.gameDate),
    gameId: game.id,
    league: game.leagueId.toUpperCase(),
  };
}

/**
 * Transform API Standing to StandingsTable props
 */
export function transformStandingToTableProps(standing: Standing) {
  return {
    rank: standing.rank,
    teamName: standing.teamName,
    wins: standing.wins,
    losses: standing.losses,
    pct: standing.pct,
    gb: standing.gamesBack,
    streak: standing.streak,
  };
}

/**
 * Transform API Player to PlayerCard props
 */
export function transformPlayerToCardProps(player: Player) {
  // Extract top 3 stats for card display
  const statsArray = Object.entries(player.stats)
    .slice(0, 3)
    .map(([label, value]) => ({
      label: label.toUpperCase(),
      value: String(value),
    }));

  return {
    name: player.name,
    position: player.position,
    teamName: player.teamName,
    stats: statsArray,
    playerId: player.id,
  };
}
