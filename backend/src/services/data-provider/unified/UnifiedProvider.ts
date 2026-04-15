/**
 * Unified Provider - Solution 100% gratuite
 *
 * Combine :
 * - MLB Stats API (officielle gratuite) pour MLB
 * - TheSportsDB (free tier) pour KBO + NPB
 */

import { DataProvider } from '../DataProvider.interface';
import { Game, Standing, Odds, H2HResult, PlayerStats, Team, Player } from '../types';
import { MLBStatsProvider } from '../mlb-stats/MLBStatsProvider';
import { TheSportsDBProvider } from '../thesportsdb/TheSportsDBProvider';

export class UnifiedProvider implements DataProvider {
  constructor(
    private mlbStats: MLBStatsProvider,
    private theSportsDB: TheSportsDBProvider
  ) {}

  getProviderName(): string {
    return 'Unified (MLB Stats + TheSportsDB) - 100% Free';
  }

  /**
   * Récupère les matchs selon la ligue
   */
  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    if (leagueId === 'mlb') {
      return this.mlbStats.getGames(leagueId, date);
    } else {
      return this.theSportsDB.getGames(leagueId, date);
    }
  }

  /**
   * Récupère un match spécifique
   */
  async getGame(gameId: string): Promise<Game | null> {
    const leagueId = gameId.split('-')[0];

    if (leagueId === 'mlb') {
      return this.mlbStats.getGame(gameId);
    } else {
      return this.theSportsDB.getGame(gameId);
    }
  }

  /**
   * Récupère le classement
   */
  async getStandings(leagueId: string, season: number): Promise<Standing[]> {
    if (leagueId === 'mlb') {
      return this.mlbStats.getStandings(leagueId, season);
    } else {
      return this.theSportsDB.getStandings(leagueId, season);
    }
  }

  /**
   * Les cotes ne sont pas disponibles via les APIs gratuites
   * Seront récupérées via flux affiliation bookmakers (à implémenter)
   */
  async getOdds(gameId: string): Promise<Odds[]> {
    return [];
  }

  /**
   * H2H via provider approprié
   */
  async getH2H(
    team1Id: string,
    team2Id: string,
    limit?: number
  ): Promise<H2HResult[]> {
    const leagueId = team1Id.split('-')[0];

    if (leagueId === 'mlb') {
      return this.mlbStats.getH2H(team1Id, team2Id, limit);
    } else {
      return this.theSportsDB.getH2H(team1Id, team2Id, limit);
    }
  }

  /**
   * Stats joueurs - MLB uniquement (officielle)
   */
  async getPlayerStats(
    playerId: string,
    season: number
  ): Promise<PlayerStats | null> {
    if (playerId.startsWith('mlb-')) {
      return this.mlbStats.getPlayerStats(playerId, season);
    }

    // KBO/NPB : stats basiques via TheSportsDB (scraping V2 pour stats avancées)
    console.warn(
      `[UnifiedProvider] Advanced stats not available for ${playerId} (use scraper V2)`
    );
    return null;
  }

  /**
   * Récupère les équipes d'une ligue
   */
  async getTeams(leagueId: string): Promise<Team[]> {
    if (leagueId === 'mlb') {
      // MLB Stats API ne fournit pas directement liste équipes
      // TODO: Implémenter ou utiliser données hardcodées
      console.warn('[UnifiedProvider] MLB teams not implemented yet');
      return [];
    } else {
      return this.theSportsDB.getTeams(leagueId);
    }
  }

  /**
   * Récupère les joueurs d'une équipe
   */
  async getPlayers(teamId: string): Promise<Player[]> {
    const leagueId = teamId.split('-')[0];

    if (leagueId === 'mlb') {
      // MLB Stats API players endpoint à implémenter
      console.warn('[UnifiedProvider] MLB players not implemented yet');
      return [];
    } else {
      return this.theSportsDB.getPlayers(teamId);
    }
  }
}
