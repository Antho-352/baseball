/**
 * Provider API-Sports Baseball
 * Source principale pour MLB, KBO, NPB (scores, classements, cotes)
 */

import { DataProvider } from '../DataProvider.interface';
import { Game, Standing, Odds, H2HResult } from '../types';
import { APISportsClient } from './api-sports-client';
import { mapGame, mapStanding, mapOdds, mapH2H } from './mappers';
import { CacheManager } from './cache';

export class APISportsProvider implements DataProvider {
  private client: APISportsClient;
  private cache: CacheManager;

  // Mapping de nos IDs de ligues vers les IDs API-Sports
  private leagueMapping: Record<string, string> = {
    mlb: '1', // À confirmer via test API
    kbo: 'TBD', // À déterminer après test
    npb: 'TBD', // À déterminer après test
  };

  constructor(apiKey: string) {
    this.client = new APISportsClient(apiKey);
    this.cache = new CacheManager();
  }

  getProviderName(): string {
    return 'API-Sports Baseball';
  }

  /**
   * Récupère les matchs d'une ligue pour une date
   */
  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    const cacheKey = `games:${leagueId}:${date.toISOString().split('T')[0]}`;
    const cached = this.cache.get<Game[]>(cacheKey);
    if (cached) return cached;

    const apiLeagueId = this.leagueMapping[leagueId];
    if (!apiLeagueId || apiLeagueId === 'TBD') {
      console.warn(`[APISportsProvider] League ID mapping missing for: ${leagueId}`);
      return [];
    }

    const dateStr = date.toISOString().split('T')[0];

    try {
      const response = await this.client.get('/games', {
        league: apiLeagueId,
        season: date.getFullYear(),
        date: dateStr,
      });

      const games = response.response.map((g: any) => mapGame(g, leagueId));

      // Cache 5 minutes pour les scores (peuvent changer rapidement)
      this.cache.set(cacheKey, games, 300);

      return games;
    } catch (error) {
      console.error('[APISportsProvider] Error fetching games:', error);
      return [];
    }
  }

  /**
   * Récupère un match spécifique
   */
  async getGame(gameId: string): Promise<Game | null> {
    const apiGameId = this.extractApiGameId(gameId);
    const leagueId = this.extractLeagueFromGameId(gameId);

    try {
      const response = await this.client.get('/games', {
        id: apiGameId,
      });

      if (!response.response || response.response.length === 0) {
        return null;
      }

      return mapGame(response.response[0], leagueId);
    } catch (error) {
      console.error('[APISportsProvider] Error fetching game:', error);
      return null;
    }
  }

  /**
   * Récupère le classement d'une ligue
   */
  async getStandings(leagueId: string, season: number): Promise<Standing[]> {
    const cacheKey = `standings:${leagueId}:${season}`;
    const cached = this.cache.get<Standing[]>(cacheKey);
    if (cached) return cached;

    const apiLeagueId = this.leagueMapping[leagueId];
    if (!apiLeagueId || apiLeagueId === 'TBD') {
      console.warn(`[APISportsProvider] League ID mapping missing for: ${leagueId}`);
      return [];
    }

    try {
      const response = await this.client.get('/standings', {
        league: apiLeagueId,
        season,
      });

      const standings = response.response.map((s: any) =>
        mapStanding(s, leagueId)
      );

      // Cache 1 heure pour les classements
      this.cache.set(cacheKey, standings, 3600);

      return standings;
    } catch (error) {
      console.error('[APISportsProvider] Error fetching standings:', error);
      return [];
    }
  }

  /**
   * Récupère les cotes pour un match
   */
  async getOdds(gameId: string): Promise<Odds[]> {
    const apiGameId = this.extractApiGameId(gameId);

    try {
      const response = await this.client.get('/odds', {
        game: apiGameId,
      });

      if (!response.response || response.response.length === 0) {
        return [];
      }

      return mapOdds(response.response[0], gameId);
    } catch (error) {
      console.error('[APISportsProvider] Error fetching odds:', error);
      return [];
    }
  }

  /**
   * Récupère l'historique H2H entre 2 équipes
   */
  async getH2H(
    team1Id: string,
    team2Id: string,
    limit: number = 10
  ): Promise<H2HResult[]> {
    // Note: API-Sports nécessite les IDs API internes, pas nos IDs
    // Pour l'instant, retourner tableau vide en attendant mapping complet
    console.warn('[APISportsProvider] H2H not fully implemented - needs team ID mapping');
    return [];

    /*
    // TODO: Implémenter après avoir mapping complet teams
    const apiTeam1Id = await this.getApiTeamId(team1Id);
    const apiTeam2Id = await this.getApiTeamId(team2Id);

    const response = await this.client.get('/games/h2h', {
      h2h: `${apiTeam1Id}-${apiTeam2Id}`,
      last: limit,
    });

    const leagueId = this.extractLeagueFromTeamId(team1Id);
    return response.response.map((g: any) => mapH2H(g, leagueId));
    */
  }

  /**
   * Extrait l'ID API du match depuis notre format ID
   * Exemple: "mlb-12345" → "12345"
   */
  private extractApiGameId(ourGameId: string): string {
    const parts = ourGameId.split('-');
    return parts[parts.length - 1];
  }

  /**
   * Extrait la ligue depuis notre format ID de match
   * Exemple: "mlb-12345" → "mlb"
   */
  private extractLeagueFromGameId(gameId: string): string {
    return gameId.split('-')[0];
  }

  /**
   * Met à jour le mapping league IDs
   * À appeler après tests API pour configurer les bons IDs
   */
  updateLeagueMapping(leagueId: string, apiLeagueId: string): void {
    this.leagueMapping[leagueId] = apiLeagueId;
  }
}
