/**
 * Unified Data Provider
 * Coordinates MLB and TheSportsDB providers
 */

import { MLBProvider } from './MLBProvider.js';
import { TheSportsDBProvider } from './TheSportsDBProvider.js';
import { Game, Team, Standing } from './types.js';

export class UnifiedProvider {
  private mlb: MLBProvider;
  private sportsDB: TheSportsDBProvider;

  constructor() {
    this.mlb = new MLBProvider();
    this.sportsDB = new TheSportsDBProvider();
  }

  /**
   * Get games for any league
   */
  async getGames(league: 'mlb' | 'kbo' | 'npb', date?: string): Promise<Game[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    if (league === 'mlb') {
      return this.mlb.getGames(targetDate);
    } else {
      return this.sportsDB.getGames(league, targetDate);
    }
  }

  /**
   * Get teams for any league
   */
  async getTeams(league: 'mlb' | 'kbo' | 'npb'): Promise<Team[]> {
    if (league === 'mlb') {
      return this.mlb.getTeams();
    } else {
      return this.sportsDB.getTeams(league);
    }
  }

  /**
   * Get standings for any league
   */
  async getStandings(league: 'mlb' | 'kbo' | 'npb', season?: number): Promise<Standing[]> {
    if (league === 'mlb') {
      return this.mlb.getStandings(season);
    } else {
      return this.sportsDB.getStandings(league, season);
    }
  }

  /**
   * Get all games for all leagues on a specific date
   */
  async getAllGames(date?: string): Promise<Record<string, Game[]>> {
    const [mlbGames, kboGames, npbGames] = await Promise.all([
      this.getGames('mlb', date),
      this.getGames('kbo', date),
      this.getGames('npb', date),
    ]);

    return {
      mlb: mlbGames,
      kbo: kboGames,
      npb: npbGames,
    };
  }

  /**
   * Get all teams for all leagues
   */
  async getAllTeams(): Promise<Record<string, Team[]>> {
    const [mlbTeams, kboTeams, npbTeams] = await Promise.all([
      this.getTeams('mlb'),
      this.getTeams('kbo'),
      this.getTeams('npb'),
    ]);

    return {
      mlb: mlbTeams,
      kbo: kboTeams,
      npb: npbTeams,
    };
  }
}

// Export singleton instance
export const dataProvider = new UnifiedProvider();
