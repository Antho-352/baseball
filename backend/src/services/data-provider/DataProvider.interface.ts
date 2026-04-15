/**
 * Interface commune pour tous les data providers
 *
 * Pattern Strategy : permet de changer de source de données sans refactoring
 */

import {
  Game,
  Standing,
  Odds,
  H2HResult,
  PlayerStats,
  Team,
  Player
} from './types';

export interface DataProvider {
  /**
   * Récupère les matchs d'une ligue pour une date donnée
   * @param leagueId - ID de la ligue ('mlb', 'kbo', 'npb')
   * @param date - Date des matchs
   */
  getGames(leagueId: string, date: Date): Promise<Game[]>;

  /**
   * Récupère un match spécifique par son ID
   * @param gameId - ID du match
   */
  getGame(gameId: string): Promise<Game | null>;

  /**
   * Récupère le classement d'une ligue pour une saison
   * @param leagueId - ID de la ligue ('mlb', 'kbo', 'npb')
   * @param season - Année de la saison (ex: 2024)
   */
  getStandings(leagueId: string, season: number): Promise<Standing[]>;

  /**
   * Récupère les cotes bookmakers pour un match
   * @param gameId - ID du match
   */
  getOdds(gameId: string): Promise<Odds[]>;

  /**
   * Récupère l'historique des confrontations entre 2 équipes
   * @param team1Id - ID de l'équipe 1
   * @param team2Id - ID de l'équipe 2
   * @param limit - Nombre max de matchs à retourner (défaut: 10)
   */
  getH2H(team1Id: string, team2Id: string, limit?: number): Promise<H2HResult[]>;

  /**
   * Récupère les statistiques d'un joueur pour une saison
   * @param playerId - ID du joueur
   * @param season - Année de la saison
   */
  getPlayerStats?(playerId: string, season: number): Promise<PlayerStats | null>;

  /**
   * Récupère les équipes d'une ligue
   * @param leagueId - ID de la ligue
   */
  getTeams?(leagueId: string): Promise<Team[]>;

  /**
   * Récupère les joueurs d'une équipe
   * @param teamId - ID de l'équipe
   */
  getPlayers?(teamId: string): Promise<Player[]>;

  /**
   * Retourne le nom du provider (pour logs/debug)
   */
  getProviderName(): string;
}
