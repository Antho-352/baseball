/**
 * Provider MLB Stats API (officielle gratuite)
 * Source secondaire pour stats avancées MLB uniquement
 */

import { DataProvider } from '../DataProvider.interface';
import { Game, Standing, Odds, H2HResult, PlayerStats } from '../types';

const MLB_STATS_API_BASE = 'https://statsapi.mlb.com/api/v1';

export class MLBStatsProvider implements DataProvider {
  getProviderName(): string {
    return 'MLB Stats API (Official)';
  }

  /**
   * Récupère les matchs MLB
   */
  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    if (leagueId !== 'mlb') {
      console.warn('[MLBStatsProvider] Only supports MLB league');
      return [];
    }

    const dateStr = date.toISOString().split('T')[0];

    try {
      const response = await fetch(
        `${MLB_STATS_API_BASE}/schedule?sportId=1&date=${dateStr}`
      );

      if (!response.ok) {
        throw new Error(`MLB API error: ${response.status}`);
      }

      const data = await response.json();

      return this.mapMLBGames(data.dates?.[0]?.games || []);
    } catch (error) {
      console.error('[MLBStatsProvider] Error fetching games:', error);
      return [];
    }
  }

  /**
   * Récupère un match spécifique
   */
  async getGame(gameId: string): Promise<Game | null> {
    const mlbGameId = this.extractMLBGameId(gameId);

    try {
      const response = await fetch(
        `${MLB_STATS_API_BASE}/game/${mlbGameId}/feed/live`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return this.mapMLBGame(data.gameData);
    } catch (error) {
      console.error('[MLBStatsProvider] Error fetching game:', error);
      return null;
    }
  }

  /**
   * Récupère le classement MLB
   */
  async getStandings(leagueId: string, season: number): Promise<Standing[]> {
    if (leagueId !== 'mlb') {
      return [];
    }

    try {
      const response = await fetch(
        `${MLB_STATS_API_BASE}/standings?leagueId=103,104&season=${season}`
      );

      if (!response.ok) {
        throw new Error(`MLB API error: ${response.status}`);
      }

      const data = await response.json();

      return this.mapMLBStandings(data.records || [], season);
    } catch (error) {
      console.error('[MLBStatsProvider] Error fetching standings:', error);
      return [];
    }
  }

  /**
   * Les cotes ne sont pas disponibles via MLB Stats API
   */
  async getOdds(gameId: string): Promise<Odds[]> {
    return [];
  }

  /**
   * H2H pas directement disponible (nécessite récupération manuelle des matchs)
   */
  async getH2H(
    team1Id: string,
    team2Id: string,
    limit?: number
  ): Promise<H2HResult[]> {
    // TODO: Implémenter si nécessaire en récupérant l'historique des matchs
    return [];
  }

  /**
   * Récupère les stats avancées d'un joueur MLB
   * Spécifique à ce provider (pas dans l'interface de base)
   */
  async getPlayerStats(
    playerId: string,
    season: number
  ): Promise<PlayerStats | null> {
    const mlbPlayerId = this.extractMLBPlayerId(playerId);

    try {
      const response = await fetch(
        `${MLB_STATS_API_BASE}/people/${mlbPlayerId}/stats?stats=season&season=${season}&group=hitting,pitching`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return this.mapPlayerStats(data.stats || [], season, playerId);
    } catch (error) {
      console.error('[MLBStatsProvider] Error fetching player stats:', error);
      return null;
    }
  }

  /**
   * Mappe les matchs MLB vers notre format
   */
  private mapMLBGames(mlbGames: any[]): Game[] {
    return mlbGames.map((g) => ({
      id: `mlb-${g.gamePk}`,
      leagueId: 'mlb',
      homeTeamId: `mlb-${g.teams.home.team.id}`,
      awayTeamId: `mlb-${g.teams.away.team.id}`,
      gameDate: new Date(g.gameDate),
      gameTime: g.gameDate.split('T')[1]?.substring(0, 5),
      venue: g.venue?.name,
      status: this.mapMLBStatus(g.status.detailedState),
      homeScore: g.teams.home.score,
      awayScore: g.teams.away.score,
      innings: g.linescore?.currentInning,
      apiGameId: String(g.gamePk),
    }));
  }

  /**
   * Mappe un match MLB
   */
  private mapMLBGame(gameData: any): Game {
    return {
      id: `mlb-${gameData.game.id}`,
      leagueId: 'mlb',
      homeTeamId: `mlb-${gameData.teams.home.id}`,
      awayTeamId: `mlb-${gameData.teams.away.id}`,
      gameDate: new Date(gameData.datetime.dateTime),
      gameTime: gameData.datetime.time,
      venue: gameData.venue?.name,
      status: this.mapMLBStatus(gameData.status.detailedState),
      homeScore: gameData.teams.home.score,
      awayScore: gameData.teams.away.score,
      apiGameId: String(gameData.game.id),
    };
  }

  /**
   * Mappe le classement MLB
   */
  private mapMLBStandings(records: any[], season: number): Standing[] {
    const standings: Standing[] = [];

    records.forEach((division: any) => {
      division.teamRecords?.forEach((team: any) => {
        standings.push({
          teamId: `mlb-${team.team.id}`,
          leagueId: 'mlb',
          season,
          division: division.division?.name,
          position: team.divisionRank,
          gamesPlayed: team.gamesPlayed,
          wins: team.wins,
          losses: team.losses,
          winPercentage: parseFloat(team.winningPercentage),
          gamesBehind: parseFloat(team.gamesBack),
          homeRecord: team.records?.splitRecords?.find((r: any) => r.type === 'home')
            ?.wins
            ? `${team.records.splitRecords.find((r: any) => r.type === 'home').wins}-${team.records.splitRecords.find((r: any) => r.type === 'home').losses}`
            : undefined,
          awayRecord: team.records?.splitRecords?.find((r: any) => r.type === 'away')
            ?.wins
            ? `${team.records.splitRecords.find((r: any) => r.type === 'away').wins}-${team.records.splitRecords.find((r: any) => r.type === 'away').losses}`
            : undefined,
          streak: team.streak?.streakCode,
          runsScored: team.runsScored,
          runsAllowed: team.runsAllowed,
          runDifferential: team.runDifferential,
        });
      });
    });

    return standings;
  }

  /**
   * Mappe les stats d'un joueur
   */
  private mapPlayerStats(
    stats: any[],
    season: number,
    playerId: string
  ): PlayerStats | null {
    const hittingStats = stats.find((s) => s.group.displayName === 'hitting');
    const pitchingStats = stats.find((s) => s.group.displayName === 'pitching');

    if (!hittingStats && !pitchingStats) {
      return null;
    }

    const stat = hittingStats?.splits?.[0]?.stat || pitchingStats?.splits?.[0]?.stat;

    if (!stat) {
      return null;
    }

    const result: PlayerStats = {
      playerId,
      season,
      statType: hittingStats ? 'batting' : 'pitching',
    };

    if (hittingStats) {
      Object.assign(result, {
        gamesPlayed: stat.gamesPlayed,
        atBats: stat.atBats,
        runs: stat.runs,
        hits: stat.hits,
        doubles: stat.doubles,
        triples: stat.triples,
        homeRuns: stat.homeRuns,
        rbis: stat.rbi,
        stolenBases: stat.stolenBases,
        battingAvg: parseFloat(stat.avg),
        onBasePct: parseFloat(stat.obp),
        sluggingPct: parseFloat(stat.slg),
        ops: parseFloat(stat.ops),
      });
    }

    if (pitchingStats) {
      Object.assign(result, {
        wins: stat.wins,
        losses: stat.losses,
        saves: stat.saves,
        inningsPitched: parseFloat(stat.inningsPitched),
        strikeouts: stat.strikeOuts,
        walks: stat.baseOnBalls,
        earnedRuns: stat.earnedRuns,
        era: parseFloat(stat.era),
        whip: parseFloat(stat.whip),
      });
    }

    return result;
  }

  /**
   * Mappe le statut MLB vers notre enum
   */
  private mapMLBStatus(mlbStatus: string): Game['status'] {
    const statusMap: Record<string, Game['status']> = {
      Scheduled: 'scheduled',
      'Pre-Game': 'scheduled',
      'In Progress': 'live',
      Final: 'final',
      'Game Over': 'final',
      Postponed: 'postponed',
      Cancelled: 'cancelled',
      Suspended: 'postponed',
    };

    return statusMap[mlbStatus] || 'scheduled';
  }

  /**
   * Extrait l'ID MLB depuis notre format
   */
  private extractMLBGameId(ourGameId: string): string {
    return ourGameId.replace('mlb-', '');
  }

  /**
   * Extrait l'ID MLB joueur depuis notre format
   */
  private extractMLBPlayerId(ourPlayerId: string): string {
    return ourPlayerId.replace('mlb-', '');
  }
}
