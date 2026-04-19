/**
 * MLB Stats API Provider
 * Official MLB API - free, no rate limits
 * Docs: https://statsapi.mlb.com/docs/
 */

import axios, { AxiosInstance } from 'axios';
import { Game, Team, Standing, PlayerStats } from './types.js';

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';

export class MLBProvider {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: MLB_API_BASE,
      timeout: 10000,
      headers: {
        'User-Agent': 'Baseball-FR/1.0',
      },
    });
  }

  /**
   * Get games for a specific date
   * @param date YYYY-MM-DD format
   */
  async getGames(date: string): Promise<Game[]> {
    try {
      const response = await this.client.get(`/schedule`, {
        params: {
          sportId: 1, // MLB
          date,
          hydrate: 'team,linescore',
        },
      });

      const games: Game[] = [];
      const schedule = response.data.dates?.[0];

      if (!schedule) return [];

      for (const game of schedule.games) {
        games.push({
          id: game.gamePk.toString(),
          leagueId: 'mlb',
          homeTeamId: game.teams.home.team.id.toString(),
          awayTeamId: game.teams.away.team.id.toString(),
          gameDate: new Date(game.gameDate),
          gameTime: game.gameDate,
          venue: game.venue?.name,
          status: this.mapStatus(game.status.detailedState),
          homeScore: game.teams.home.score,
          awayScore: game.teams.away.score,
          innings: game.linescore?.currentInning,
          apiGameId: game.gamePk.toString(),
        });
      }

      return games;
    } catch (error) {
      console.error('MLB API error (getGames):', error);
      return [];
    }
  }

  /**
   * Get all MLB teams
   */
  async getTeams(): Promise<Team[]> {
    try {
      const response = await this.client.get(`/teams`, {
        params: {
          sportId: 1,
          season: new Date().getFullYear(),
        },
      });

      const teams: Team[] = [];

      for (const team of response.data.teams) {
        teams.push({
          id: team.id.toString(),
          leagueId: 'mlb',
          name: team.name,
          shortName: team.teamName,
          city: team.locationName,
          logoUrl: null, // MLB API doesn't provide logos
          apiTeamId: team.id.toString(),
        });
      }

      return teams;
    } catch (error) {
      console.error('MLB API error (getTeams):', error);
      return [];
    }
  }

  /**
   * Get standings for current season
   */
  async getStandings(season?: number): Promise<Standing[]> {
    try {
      const year = season || new Date().getFullYear();

      const response = await this.client.get(`/standings`, {
        params: {
          leagueId: '103,104', // AL + NL
          season: year,
        },
      });

      const standings: Standing[] = [];
      let position = 1;

      for (const record of response.data.records) {
        for (const teamRecord of record.teamRecords) {
          standings.push({
            teamId: teamRecord.team.id.toString(),
            leagueId: 'mlb',
            season: year,
            division: record.division?.name,
            position: position++,
            gamesPlayed: teamRecord.gamesPlayed,
            wins: teamRecord.wins,
            losses: teamRecord.losses,
            winPercentage: parseFloat(teamRecord.winningPercentage),
            gamesBehind: parseFloat(teamRecord.gamesBack) || 0,
            homeRecord: teamRecord.records?.splitRecords?.find((r: any) => r.type === 'home')?.wins + '-' +
                        teamRecord.records?.splitRecords?.find((r: any) => r.type === 'home')?.losses,
            awayRecord: teamRecord.records?.splitRecords?.find((r: any) => r.type === 'away')?.wins + '-' +
                        teamRecord.records?.splitRecords?.find((r: any) => r.type === 'away')?.losses,
            streak: teamRecord.streak?.streakCode,
            runsScored: teamRecord.runsScored,
            runsAllowed: teamRecord.runsAllowed,
            runDifferential: teamRecord.runDifferential,
          });
        }
      }

      return standings;
    } catch (error) {
      console.error('MLB API error (getStandings):', error);
      return [];
    }
  }

  /**
   * Get team roster
   */
  async getTeamRoster(teamId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/teams/${teamId}/roster`, {
        params: {
          rosterType: 'active',
        },
      });

      return response.data.roster || [];
    } catch (error) {
      console.error('MLB API error (getTeamRoster):', error);
      return [];
    }
  }

  /**
   * Get player stats
   */
  async getPlayerStats(playerId: string, season?: number): Promise<PlayerStats | null> {
    try {
      const year = season || new Date().getFullYear();

      const response = await this.client.get(`/people/${playerId}/stats`, {
        params: {
          stats: 'season',
          season: year,
          group: 'hitting,pitching',
        },
      });

      // Parse stats from response
      // TODO: Implement proper parsing
      return null;
    } catch (error) {
      console.error('MLB API error (getPlayerStats):', error);
      return null;
    }
  }

  /**
   * Map MLB status to our status enum
   */
  private mapStatus(mlbStatus: string): Game['status'] {
    const statusMap: Record<string, Game['status']> = {
      'Scheduled': 'scheduled',
      'Pre-Game': 'scheduled',
      'Warmup': 'scheduled',
      'In Progress': 'live',
      'Final': 'final',
      'Game Over': 'final',
      'Postponed': 'postponed',
      'Cancelled': 'cancelled',
      'Suspended': 'postponed',
    };

    return statusMap[mlbStatus] || 'scheduled';
  }
}
