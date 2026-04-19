/**
 * TheSportsDB API Provider
 * For KBO and NPB data
 * Free tier API key: 3
 * Docs: https://www.thesportsdb.com/api.php
 */

import axios, { AxiosInstance } from 'axios';
import { Game, Team, Standing } from './types.js';

const SPORTSDB_API_BASE = 'https://www.thesportsdb.com/api/v1/json';
const API_KEY = process.env.THESPORTSDB_API_KEY || '3';

export class TheSportsDBProvider {
  private client: AxiosInstance;
  private leagueIds: Record<string, string> = {
    kbo: '4424', // KBO League ID
    npb: '4328', // NPB League ID (Central + Pacific)
  };

  constructor() {
    this.client = axios.create({
      baseURL: `${SPORTSDB_API_BASE}/${API_KEY}`,
      timeout: 10000,
    });
  }

  /**
   * Get games/events for a specific date
   * Note: Free tier has limited live scores
   */
  async getGames(league: 'kbo' | 'npb', date?: string): Promise<Game[]> {
    try {
      const leagueId = this.leagueIds[league];

      // TheSportsDB uses format: 2026-04-17
      const targetDate = date || new Date().toISOString().split('T')[0];

      // Get events by date
      const response = await this.client.get(`/eventsday.php`, {
        params: {
          d: targetDate,
          l: leagueId,
        },
      });

      const games: Game[] = [];

      if (!response.data.events) return [];

      for (const event of response.data.events) {
        games.push({
          id: event.idEvent,
          leagueId: league,
          homeTeamId: event.idHomeTeam,
          awayTeamId: event.idAwayTeam,
          gameDate: new Date(event.dateEvent + 'T' + (event.strTime || '00:00:00')),
          gameTime: event.strTime,
          venue: event.strVenue,
          status: this.mapStatus(event.strStatus),
          homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : undefined,
          awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : undefined,
          apiGameId: event.idEvent,
        });
      }

      return games;
    } catch (error) {
      console.error(`TheSportsDB API error (getGames ${league}):`, error);
      return [];
    }
  }

  /**
   * Get all teams for a league
   */
  async getTeams(league: 'kbo' | 'npb'): Promise<Team[]> {
    try {
      const leagueId = this.leagueIds[league];

      const response = await this.client.get(`/lookup_all_teams.php`, {
        params: {
          id: leagueId,
        },
      });

      const teams: Team[] = [];

      if (!response.data.teams) return [];

      for (const team of response.data.teams) {
        teams.push({
          id: team.idTeam,
          leagueId: league,
          name: team.strTeam,
          shortName: team.strTeamShort || team.strTeam,
          city: team.strLocation,
          logoUrl: team.strTeamBadge,
          apiTeamId: team.idTeam,
        });
      }

      return teams;
    } catch (error) {
      console.error(`TheSportsDB API error (getTeams ${league}):`, error);
      return [];
    }
  }

  /**
   * Get standings/table for a league
   * Note: TheSportsDB free tier may have limited standings data
   */
  async getStandings(league: 'kbo' | 'npb', season?: number): Promise<Standing[]> {
    try {
      const leagueId = this.leagueIds[league];
      const year = season || new Date().getFullYear();

      const response = await this.client.get(`/lookuptable.php`, {
        params: {
          l: leagueId,
          s: year,
        },
      });

      const standings: Standing[] = [];

      if (!response.data.table) return [];

      for (const entry of response.data.table) {
        standings.push({
          teamId: entry.idTeam,
          leagueId: league,
          season: year,
          position: parseInt(entry.intRank) || 0,
          gamesPlayed: parseInt(entry.intPlayed) || 0,
          wins: parseInt(entry.intWin) || 0,
          losses: parseInt(entry.intLoss) || 0,
          winPercentage: parseFloat(entry.intWinPercent) / 100 || 0,
          gamesBehind: parseFloat(entry.intGB) || 0,
        });
      }

      return standings;
    } catch (error) {
      console.error(`TheSportsDB API error (getStandings ${league}):`, error);
      return [];
    }
  }

  /**
   * Get team details including squad
   */
  async getTeamDetails(teamId: string): Promise<any> {
    try {
      const response = await this.client.get(`/lookupteam.php`, {
        params: {
          id: teamId,
        },
      });

      return response.data.teams?.[0] || null;
    } catch (error) {
      console.error('TheSportsDB API error (getTeamDetails):', error);
      return null;
    }
  }

  /**
   * Search for players (limited in free tier)
   */
  async searchPlayers(teamName: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/searchplayers.php`, {
        params: {
          t: teamName,
        },
      });

      return response.data.player || [];
    } catch (error) {
      console.error('TheSportsDB API error (searchPlayers):', error);
      return [];
    }
  }

  /**
   * Map TheSportsDB status to our status enum
   */
  private mapStatus(sportsDBStatus: string): Game['status'] {
    const statusLower = sportsDBStatus?.toLowerCase() || '';

    if (statusLower.includes('finished') || statusLower.includes('ft')) {
      return 'final';
    }
    if (statusLower.includes('live') || statusLower.includes('in progress')) {
      return 'live';
    }
    if (statusLower.includes('postponed')) {
      return 'postponed';
    }
    if (statusLower.includes('cancelled')) {
      return 'cancelled';
    }

    return 'scheduled';
  }
}
