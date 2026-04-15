/**
 * Provider TheSportsDB (KBO + NPB)
 * Free tier : API key = "123"
 */

import { DataProvider } from '../DataProvider.interface';
import { Game, Standing, Odds, H2HResult, Team, Player } from '../types';

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
const API_KEY = '123'; // Free tier

export class TheSportsDBProvider implements DataProvider {
  private leagueMapping: Record<string, { id: string; name: string }> = {
    kbo: { id: '4830', name: 'Korean_KBO_League' },
    npb: { id: '4831', name: 'Nippon_Baseball_League' }, // À confirmer
  };

  getProviderName(): string {
    return 'TheSportsDB (KBO/NPB Free)';
  }

  /**
   * Récupère les matchs d'une ligue pour une date
   */
  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    const league = this.leagueMapping[leagueId];
    if (!league) {
      console.warn(`[TheSportsDB] Unsupported league: ${leagueId}`);
      return [];
    }

    const season = date.getFullYear();
    const url = `${BASE_URL}/${API_KEY}/eventsseason.php?id=${league.id}&s=${season}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const events = data.events || [];

      // Filtrer par date
      const targetDate = date.toISOString().split('T')[0];
      const filteredEvents = events.filter((e: any) => {
        return e.dateEvent === targetDate;
      });

      return filteredEvents.map((e: any) => this.mapGame(e, leagueId));
    } catch (error) {
      console.error('[TheSportsDB] Error fetching games:', error);
      return [];
    }
  }

  /**
   * Récupère un match spécifique
   */
  async getGame(gameId: string): Promise<Game | null> {
    const eventId = this.extractEventId(gameId);
    const url = `${BASE_URL}/${API_KEY}/lookupevent.php?id=${eventId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = await response.json();
      const events = data.events || [];

      if (events.length === 0) return null;

      const leagueId = this.extractLeagueFromGameId(gameId);
      return this.mapGame(events[0], leagueId);
    } catch (error) {
      console.error('[TheSportsDB] Error fetching game:', error);
      return null;
    }
  }

  /**
   * Récupère le classement d'une ligue
   * Note: TheSportsDB ne fournit pas les classements directement
   * On doit calculer à partir des résultats de la saison
   */
  async getStandings(leagueId: string, season: number): Promise<Standing[]> {
    const league = this.leagueMapping[leagueId];
    if (!league) {
      return [];
    }

    const url = `${BASE_URL}/${API_KEY}/eventsseason.php?id=${league.id}&s=${season}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const events = data.events || [];

      // Calculer standings à partir des résultats
      return this.calculateStandings(events, leagueId, season);
    } catch (error) {
      console.error('[TheSportsDB] Error fetching standings:', error);
      return [];
    }
  }

  /**
   * TheSportsDB ne fournit pas les cotes
   */
  async getOdds(gameId: string): Promise<Odds[]> {
    return [];
  }

  /**
   * H2H via récupération historique matchs
   */
  async getH2H(
    team1Id: string,
    team2Id: string,
    limit: number = 10
  ): Promise<H2HResult[]> {
    // TODO: Implémenter en récupérant l'historique des matchs entre 2 équipes
    // Nécessite de filtrer eventsseason par teams
    return [];
  }

  /**
   * Récupère les équipes d'une ligue
   */
  async getTeams(leagueId: string): Promise<Team[]> {
    const league = this.leagueMapping[leagueId];
    if (!league) {
      return [];
    }

    const url = `${BASE_URL}/${API_KEY}/search_all_teams.php?l=${league.name}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const teams = data.teams || [];

      return teams.map((t: any) => ({
        id: `${leagueId}-${t.idTeam}`,
        leagueId,
        name: t.strTeam,
        shortName: t.strTeamShort,
        city: t.strLocation,
        logoUrl: t.strTeamBadge,
        apiTeamId: t.idTeam,
      }));
    } catch (error) {
      console.error('[TheSportsDB] Error fetching teams:', error);
      return [];
    }
  }

  /**
   * Récupère les joueurs d'une équipe
   */
  async getPlayers(teamId: string): Promise<Player[]> {
    const apiTeamId = this.extractApiTeamId(teamId);
    const url = `${BASE_URL}/${API_KEY}/lookup_all_players.php?id=${apiTeamId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const players = data.player || [];

      return players.map((p: any) => ({
        id: `${teamId.split('-')[0]}-${p.idPlayer}`,
        teamId,
        name: p.strPlayer,
        position: p.strPosition,
        jerseyNumber: p.strNumber ? parseInt(p.strNumber) : undefined,
        birthDate: p.dateBorn ? new Date(p.dateBorn) : undefined,
        photoUrl: p.strThumb,
        apiPlayerId: p.idPlayer,
      }));
    } catch (error) {
      console.error('[TheSportsDB] Error fetching players:', error);
      return [];
    }
  }

  /**
   * Mappe un event TheSportsDB vers notre type Game
   */
  private mapGame(event: any, leagueId: string): Game {
    const status = this.mapStatus(event.strStatus);

    return {
      id: `${leagueId}-${event.idEvent}`,
      leagueId,
      homeTeamId: `${leagueId}-${event.idHomeTeam}`,
      awayTeamId: `${leagueId}-${event.idAwayTeam}`,
      gameDate: new Date(event.dateEvent + 'T' + (event.strTime || '00:00:00')),
      gameTime: event.strTime,
      venue: event.strVenue,
      status,
      homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : undefined,
      awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : undefined,
      apiGameId: event.idEvent,
    };
  }

  /**
   * Mappe le statut TheSportsDB vers notre enum
   */
  private mapStatus(dbStatus: string): Game['status'] {
    const statusMap: Record<string, Game['status']> = {
      NS: 'scheduled',
      'Not Started': 'scheduled',
      LIVE: 'live',
      'In Play': 'live',
      FT: 'final',
      'Match Finished': 'final',
      AOT: 'final',
      PST: 'postponed',
      Postponed: 'postponed',
      CANC: 'cancelled',
      Cancelled: 'cancelled',
    };

    return statusMap[dbStatus] || 'scheduled';
  }

  /**
   * Calcule les classements à partir des résultats de matchs
   */
  private calculateStandings(
    events: any[],
    leagueId: string,
    season: number
  ): Standing[] {
    const teamStats = new Map<string, any>();

    // Parcourir tous les matchs terminés
    events
      .filter((e) => e.strStatus === 'FT' || e.strStatus === 'Match Finished')
      .forEach((event) => {
        const homeTeamId = `${leagueId}-${event.idHomeTeam}`;
        const awayTeamId = `${leagueId}-${event.idAwayTeam}`;
        const homeScore = parseInt(event.intHomeScore) || 0;
        const awayScore = parseInt(event.intAwayScore) || 0;

        // Initialiser stats si nécessaire
        if (!teamStats.has(homeTeamId)) {
          teamStats.set(homeTeamId, {
            teamId: homeTeamId,
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
          });
        }
        if (!teamStats.has(awayTeamId)) {
          teamStats.set(awayTeamId, {
            teamId: awayTeamId,
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
          });
        }

        // Mettre à jour stats
        const homeStats = teamStats.get(homeTeamId);
        const awayStats = teamStats.get(awayTeamId);

        homeStats.gamesPlayed++;
        awayStats.gamesPlayed++;

        if (homeScore > awayScore) {
          homeStats.wins++;
          awayStats.losses++;
        } else if (awayScore > homeScore) {
          awayStats.wins++;
          homeStats.losses++;
        }
      });

    // Convertir en Standing[]
    const standings: Standing[] = Array.from(teamStats.values()).map((stats) => ({
      teamId: stats.teamId,
      leagueId,
      season,
      position: 0, // Calculé après tri
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      losses: stats.losses,
      winPercentage:
        stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0,
    }));

    // Trier par win percentage
    standings.sort((a, b) => b.winPercentage - a.winPercentage);

    // Assigner positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return standings;
  }

  /**
   * Extrait l'event ID depuis notre format ID
   */
  private extractEventId(ourGameId: string): string {
    return ourGameId.split('-')[1];
  }

  /**
   * Extrait la ligue depuis notre format ID de match
   */
  private extractLeagueFromGameId(gameId: string): string {
    return gameId.split('-')[0];
  }

  /**
   * Extrait l'ID API équipe depuis notre format ID
   */
  private extractApiTeamId(ourTeamId: string): string {
    return ourTeamId.split('-')[1];
  }
}
