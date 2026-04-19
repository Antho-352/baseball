/**
 * Game Controller
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Get games with filters
 */
export async function getGames(req: Request, res: Response, next: NextFunction) {
  try {
    const { league, date, status, team } = req.query;

    let sql = `
      SELECT
        g.*,
        l.code as league_code,
        ht.name as home_team_name,
        ht.abbreviation as home_team_abbr,
        at.name as away_team_name,
        at.abbreviation as away_team_abbr
      FROM games g
      INNER JOIN leagues l ON g.league_id = l.id
      INNER JOIN teams ht ON g.home_team_id = ht.id
      INNER JOIN teams at ON g.away_team_id = at.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (league) {
      sql += ' AND l.code = ?';
      params.push(league);
    }

    if (date) {
      sql += ' AND DATE(g.game_date) = ?';
      params.push(date);
    }

    if (status) {
      sql += ' AND g.status = ?';
      params.push(status);
    }

    if (team) {
      sql += ' AND (ht.slug = ? OR at.slug = ?)';
      params.push(team, team);
    }

    sql += ' ORDER BY g.game_date DESC, g.game_time DESC LIMIT 100';

    const games = await db.query<any[]>(sql, params);

    res.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get game by ID
 */
export async function getGameById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        g.*,
        l.code as league_code,
        l.name as league_name,
        ht.name as home_team_name,
        ht.slug as home_team_slug,
        ht.abbreviation as home_team_abbr,
        at.name as away_team_name,
        at.slug as away_team_slug,
        at.abbreviation as away_team_abbr
      FROM games g
      INNER JOIN leagues l ON g.league_id = l.id
      INNER JOIN teams ht ON g.home_team_id = ht.id
      INNER JOIN teams at ON g.away_team_id = at.id
      WHERE g.id = ?
      LIMIT 1
    `;

    const games = await db.query<any[]>(sql, [id]);

    if (games.length === 0) {
      throw createError('Game not found', 404);
    }

    res.json({
      success: true,
      data: games[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get today's games (all leagues)
 */
export async function getTodayGames(req: Request, res: Response, next: NextFunction) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const sql = `
      SELECT
        g.*,
        l.code as league_code,
        ht.name as home_team_name,
        ht.abbreviation as home_team_abbr,
        at.name as away_team_name,
        at.abbreviation as away_team_abbr
      FROM games g
      INNER JOIN leagues l ON g.league_id = l.id
      INNER JOIN teams ht ON g.home_team_id = ht.id
      INNER JOIN teams at ON g.away_team_id = at.id
      WHERE DATE(g.game_date) = ?
      ORDER BY l.code, g.game_time
    `;

    const games = await db.query<any[]>(sql, [today]);

    // Group by league
    const grouped: Record<string, any[]> = {
      mlb: [],
      kbo: [],
      npb: [],
    };

    for (const game of games) {
      const league = game.league_code;
      if (grouped[league]) {
        grouped[league].push(game);
      }
    }

    res.json({
      success: true,
      date: today,
      total: games.length,
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
}
