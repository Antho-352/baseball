/**
 * Data Synchronization Cron Job
 * Fetches data from external APIs and updates database
 */

import { dataProvider } from '../services/data-provider/UnifiedProvider.js';
import { db } from '../config/database.js';

/**
 * Sync teams for all leagues
 */
export async function syncTeams(): Promise<void> {
  console.log('[CRON] Syncing teams...');

  try {
    const allTeams = await dataProvider.getAllTeams();

    for (const [leagueCode, teams] of Object.entries(allTeams)) {
      // Get league_id from code
      const leagues = await db.query<any[]>('SELECT id FROM leagues WHERE code = ?', [leagueCode]);

      if (leagues.length === 0) {
        console.log(`[CRON] League ${leagueCode} not found, skipping`);
        continue;
      }

      const leagueId = leagues[0].id;

      for (const team of teams) {
        // Check if team exists
        const existing = await db.query<any[]>(
          'SELECT id FROM teams WHERE league_id = ? AND external_id = ?',
          [leagueId, team.apiTeamId]
        );

        if (existing.length > 0) {
          // Update
          await db.execute(
            `UPDATE teams SET name = ?, city = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [team.name, team.city, team.logoUrl, existing[0].id]
          );
        } else {
          // Insert
          const slug = team.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          await db.execute(
            `INSERT INTO teams (league_id, external_id, name, slug, city, logo_url, abbreviation)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [leagueId, team.apiTeamId, team.name, slug, team.city, team.logoUrl, team.shortName]
          );
        }
      }

      console.log(`[CRON] Synced ${teams.length} teams for ${leagueCode}`);
    }

    console.log('[CRON] Teams sync completed');
  } catch (error) {
    console.error('[CRON] Teams sync failed:', error);
    throw error;
  }
}

/**
 * Sync games for a specific date
 */
export async function syncGames(date?: string): Promise<void> {
  const targetDate = date || new Date().toISOString().split('T')[0];
  console.log(`[CRON] Syncing games for ${targetDate}...`);

  try {
    const allGames = await dataProvider.getAllGames(targetDate);

    for (const [leagueCode, games] of Object.entries(allGames)) {
      // Get league_id
      const leagues = await db.query<any[]>('SELECT id FROM leagues WHERE code = ?', [leagueCode]);

      if (leagues.length === 0) continue;

      const leagueId = leagues[0].id;

      for (const game of games) {
        // Find teams in database
        const homeTeams = await db.query<any[]>(
          'SELECT id FROM teams WHERE league_id = ? AND external_id = ?',
          [leagueId, game.homeTeamId]
        );

        const awayTeams = await db.query<any[]>(
          'SELECT id FROM teams WHERE league_id = ? AND external_id = ?',
          [leagueId, game.awayTeamId]
        );

        if (homeTeams.length === 0 || awayTeams.length === 0) {
          console.log(`[CRON] Teams not found for game ${game.id}, skipping`);
          continue;
        }

        const homeTeamId = homeTeams[0].id;
        const awayTeamId = awayTeams[0].id;

        // Check if game exists
        const existing = await db.query<any[]>(
          'SELECT id FROM games WHERE league_id = ? AND external_id = ?',
          [leagueId, game.apiGameId]
        );

        if (existing.length > 0) {
          // Update
          await db.execute(
            `UPDATE games SET
               home_score = ?, away_score = ?, status = ?, inning = ?,
               game_data_json = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              game.homeScore,
              game.awayScore,
              game.status,
              game.innings?.toString(),
              JSON.stringify(game),
              existing[0].id
            ]
          );
        } else {
          // Insert
          await db.execute(
            `INSERT INTO games
             (league_id, external_id, game_date, game_time, home_team_id, away_team_id,
              home_score, away_score, status, inning, venue, game_data_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              leagueId,
              game.apiGameId,
              game.gameDate.toISOString().split('T')[0],
              game.gameTime,
              homeTeamId,
              awayTeamId,
              game.homeScore,
              game.awayScore,
              game.status,
              game.innings?.toString(),
              game.venue,
              JSON.stringify(game)
            ]
          );
        }
      }

      console.log(`[CRON] Synced ${games.length} games for ${leagueCode}`);
    }

    console.log('[CRON] Games sync completed');
  } catch (error) {
    console.error('[CRON] Games sync failed:', error);
    throw error;
  }
}

/**
 * Sync standings for all leagues
 */
export async function syncStandings(season?: number): Promise<void> {
  const year = season || new Date().getFullYear();
  console.log(`[CRON] Syncing standings for ${year}...`);

  try {
    const leagues = ['mlb', 'kbo', 'npb'] as const;

    for (const leagueCode of leagues) {
      const standings = await dataProvider.getStandings(leagueCode, year);

      // Get league_id
      const leagueRows = await db.query<any[]>('SELECT id FROM leagues WHERE code = ?', [leagueCode]);

      if (leagueRows.length === 0) continue;

      const leagueId = leagueRows[0].id;

      for (const standing of standings) {
        // Find team
        const teams = await db.query<any[]>(
          'SELECT id FROM teams WHERE league_id = ? AND external_id = ?',
          [leagueId, standing.teamId]
        );

        if (teams.length === 0) continue;

        const teamId = teams[0].id;

        // Check if standing exists
        const existing = await db.query<any[]>(
          'SELECT id FROM standings WHERE team_id = ? AND season = ?',
          [teamId, year]
        );

        if (existing.length > 0) {
          // Update
          await db.execute(
            `UPDATE standings SET
               wins = ?, losses = ?, win_pct = ?, games_behind = ?,
               streak = ?, runs_scored = ?, runs_allowed = ?,
               last_updated = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              standing.wins,
              standing.losses,
              standing.winPercentage,
              standing.gamesBehind,
              standing.streak,
              standing.runsScored,
              standing.runsAllowed,
              existing[0].id
            ]
          );
        } else {
          // Insert
          await db.execute(
            `INSERT INTO standings
             (league_id, team_id, season, division, wins, losses, win_pct, games_behind,
              streak, runs_scored, runs_allowed)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              leagueId,
              teamId,
              year,
              standing.division,
              standing.wins,
              standing.losses,
              standing.winPercentage,
              standing.gamesBehind,
              standing.streak,
              standing.runsScored,
              standing.runsAllowed
            ]
          );
        }
      }

      console.log(`[CRON] Synced standings for ${leagueCode}`);
    }

    console.log('[CRON] Standings sync completed');
  } catch (error) {
    console.error('[CRON] Standings sync failed:', error);
    throw error;
  }
}
