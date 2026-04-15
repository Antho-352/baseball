/**
 * Hybrid Provider - Combine API-Sports + MLB Stats API
 *
 * Stratégie :
 * - API-Sports = source primaire (tous les matchs, cotes, KBO/NPB)
 * - MLB Stats = source secondaire (stats avancées MLB uniquement)
 */

import { DataProvider } from '../DataProvider.interface';
import { Game, Standing, Odds, H2HResult, PlayerStats } from '../types';
import { APISportsProvider } from '../api-sports/APISportsProvider';
import { MLBStatsProvider } from '../mlb-stats/MLBStatsProvider';

export class HybridProvider implements DataProvider {
  constructor(
    private apiSports: APISportsProvider,
    private mlbStats: MLBStatsProvider
  ) {}

  getProviderName(): string {
    return 'Hybrid (API-Sports + MLB Stats)';
  }

  /**
   * Scores et calendrier → API-Sports (toutes ligues)
   */
  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    return this.apiSports.getGames(leagueId, date);
  }

  /**
   * Match individuel → API-Sports
   */
  async getGame(gameId: string): Promise<Game | null> {
    return this.apiSports.getGame(gameId);
  }

  /**
   * Classement → API-Sports (toutes ligues)
   */
  async getStandings(leagueId: string, season: number): Promise<Standing[]> {
    return this.apiSports.getStandings(leagueId, season);
  }

  /**
   * Cotes → API-Sports uniquement
   */
  async getOdds(gameId: string): Promise<Odds[]> {
    return this.apiSports.getOdds(gameId);
  }

  /**
   * H2H → API-Sports
   */
  async getH2H(
    team1Id: string,
    team2Id: string,
    limit?: number
  ): Promise<H2HResult[]> {
    return this.apiSports.getH2H(team1Id, team2Id, limit);
  }

  /**
   * Stats joueurs → MLB Stats API pour MLB, undefined pour KBO/NPB
   */
  async getPlayerStats(
    playerId: string,
    season: number
  ): Promise<PlayerStats | null> {
    // Si le joueur est MLB, utiliser MLB Stats API (plus complet)
    if (playerId.startsWith('mlb-')) {
      return this.mlbStats.getPlayerStats(playerId, season);
    }

    // KBO/NPB : pas de stats avancées disponibles
    console.warn(
      `[HybridProvider] Advanced stats not available for non-MLB player: ${playerId}`
    );
    return null;
  }

  /**
   * Fallback MLB Stats si API-Sports échoue (pour MLB uniquement)
   */
  async getGamesWithFallback(leagueId: string, date: Date): Promise<Game[]> {
    // Essayer API-Sports d'abord
    const games = await this.apiSports.getGames(leagueId, date);

    // Si échec ET que c'est MLB, fallback sur MLB Stats
    if (games.length === 0 && leagueId === 'mlb') {
      console.log('[HybridProvider] Fallback to MLB Stats API for games');
      return this.mlbStats.getGames(leagueId, date);
    }

    return games;
  }

  /**
   * Fallback MLB Stats pour classement MLB
   */
  async getStandingsWithFallback(
    leagueId: string,
    season: number
  ): Promise<Standing[]> {
    // Essayer API-Sports d'abord
    const standings = await this.apiSports.getStandings(leagueId, season);

    // Si échec ET que c'est MLB, fallback sur MLB Stats
    if (standings.length === 0 && leagueId === 'mlb') {
      console.log('[HybridProvider] Fallback to MLB Stats API for standings');
      return this.mlbStats.getStandings(leagueId, season);
    }

    return standings;
  }
}
