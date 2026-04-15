/**
 * Mappers pour transformer les réponses API-Sports
 * en types internes standardisés
 */

import { Game, Standing, Odds, H2HResult } from '../types';

/**
 * Response type from API-Sports /games endpoint
 */
interface APISportsGame {
  id: number;
  date: string; // ISO 8601
  time: string;
  timestamp: number;
  status: {
    long: string; // "Game Finished", "In Progress", "Not Started"
    short: string; // "FT", "LIVE", "NS"
  };
  league: {
    id: number;
    name: string;
    season: number;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  scores: {
    home: {
      total: number | null;
      innings?: Record<string, number>;
    };
    away: {
      total: number | null;
      innings?: Record<string, number>;
    };
  };
  venue?: string;
}

/**
 * Response type from API-Sports /standings endpoint
 */
interface APISportsStanding {
  league: {
    id: number;
    name: string;
    season: number;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  position: number;
  games: {
    played: number;
    win: {
      total: number;
      percentage: string; // ".600"
    };
    lose: {
      total: number;
      percentage: string; // ".400"
    };
  };
  form?: string; // "WWLWW"
}

/**
 * Response type from API-Sports /odds endpoint
 */
interface APISportsOdds {
  game: {
    id: number;
  };
  bookmakers: Array<{
    id: number;
    name: string;
    bets: Array<{
      id: number;
      name: string; // "Home/Away", "Over/Under"
      values: Array<{
        value: string; // "Home", "Away", "Over 8.5", "Under 8.5"
        odd: string; // "1.85"
      }>;
    }>;
  }>;
}

/**
 * Mappe le statut API-Sports vers notre enum
 */
function mapGameStatus(apiStatus: string): Game['status'] {
  const statusMap: Record<string, Game['status']> = {
    NS: 'scheduled',
    LIVE: 'live',
    FT: 'final',
    CANC: 'cancelled',
    PST: 'postponed',
    SUSP: 'postponed',
  };

  return statusMap[apiStatus] || 'scheduled';
}

/**
 * Mappe un match API-Sports vers notre type Game
 */
export function mapGame(apiGame: APISportsGame, leagueId: string): Game {
  return {
    id: `${leagueId}-${apiGame.id}`,
    leagueId,
    homeTeamId: `${leagueId}-${apiGame.teams.home.id}`,
    awayTeamId: `${leagueId}-${apiGame.teams.away.id}`,
    gameDate: new Date(apiGame.date),
    gameTime: apiGame.time,
    venue: apiGame.venue,
    status: mapGameStatus(apiGame.status.short),
    homeScore: apiGame.scores.home.total ?? undefined,
    awayScore: apiGame.scores.away.total ?? undefined,
    innings: apiGame.scores.home.innings
      ? Object.keys(apiGame.scores.home.innings).length
      : undefined,
    apiGameId: String(apiGame.id),
  };
}

/**
 * Mappe un classement API-Sports vers notre type Standing
 */
export function mapStanding(
  apiStanding: APISportsStanding,
  leagueId: string
): Standing {
  const winPct = parseFloat(apiStanding.games.win.percentage);

  return {
    teamId: `${leagueId}-${apiStanding.team.id}`,
    leagueId,
    season: apiStanding.league.season,
    position: apiStanding.position,
    gamesPlayed: apiStanding.games.played,
    wins: apiStanding.games.win.total,
    losses: apiStanding.games.lose.total,
    winPercentage: isNaN(winPct) ? 0 : winPct,
    form: apiStanding.form,
  };
}

/**
 * Mappe les cotes API-Sports vers notre type Odds[]
 */
export function mapOdds(apiOdds: APISportsOdds, gameId: string): Odds[] {
  const results: Odds[] = [];

  apiOdds.bookmakers.forEach((bookmaker) => {
    const odds: Partial<Odds> = {
      gameId,
      bookmaker: bookmaker.name,
      bookmakerApiId: String(bookmaker.id),
      fetchedAt: new Date(),
    };

    bookmaker.bets.forEach((bet) => {
      if (bet.name === 'Home/Away') {
        bet.values.forEach((value) => {
          const odd = parseFloat(value.odd);
          if (value.value === 'Home') {
            odds.homeWin = odd;
          } else if (value.value === 'Away') {
            odds.awayWin = odd;
          } else if (value.value === 'Draw') {
            odds.draw = odd;
          }
        });
      } else if (bet.name === 'Over/Under') {
        bet.values.forEach((value) => {
          const odd = parseFloat(value.odd);
          if (value.value.startsWith('Over')) {
            const line = parseFloat(value.value.replace('Over ', ''));
            odds.overUnderLine = line;
            odds.overOdds = odd;
          } else if (value.value.startsWith('Under')) {
            odds.underOdds = odd;
          }
        });
      }
    });

    results.push(odds as Odds);
  });

  return results;
}

/**
 * Mappe un résultat H2H
 */
export function mapH2H(apiGame: APISportsGame, leagueId: string): H2HResult {
  const homeScore = apiGame.scores.home.total ?? 0;
  const awayScore = apiGame.scores.away.total ?? 0;

  return {
    gameId: `${leagueId}-${apiGame.id}`,
    gameDate: new Date(apiGame.date),
    homeTeamId: `${leagueId}-${apiGame.teams.home.id}`,
    awayTeamId: `${leagueId}-${apiGame.teams.away.id}`,
    homeScore,
    awayScore,
    winner: homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw',
  };
}
