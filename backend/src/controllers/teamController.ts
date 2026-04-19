/**
 * Team Controller
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { Team } from '../models/Team.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Get all teams with optional filters
 */
export async function getAllTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const { league, active } = req.query;

    let sql = `
      SELECT t.*, l.code as league_code, l.name as league_name
      FROM teams t
      INNER JOIN leagues l ON t.league_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (league) {
      sql += ' AND l.code = ?';
      params.push(league);
    }

    if (active !== undefined) {
      sql += ' AND t.active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY l.code, t.name';

    const teams = await db.query<any[]>(sql, params);

    res.json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get team by slug
 */
export async function getTeamBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { league, slug } = req.params;

    const sql = `
      SELECT t.*, l.code as league_code, l.name as league_name
      FROM teams t
      INNER JOIN leagues l ON t.league_id = l.id
      WHERE l.code = ? AND t.slug = ?
      LIMIT 1
    `;

    const teams = await db.query<any[]>(sql, [league, slug]);

    if (teams.length === 0) {
      throw createError('Team not found', 404);
    }

    res.json({
      success: true,
      data: teams[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get team roster
 */
export async function getTeamRoster(req: Request, res: Response, next: NextFunction) {
  try {
    const { league, slug } = req.params;

    // Get team first
    const teamSql = `
      SELECT t.id
      FROM teams t
      INNER JOIN leagues l ON t.league_id = l.id
      WHERE l.code = ? AND t.slug = ?
      LIMIT 1
    `;

    const teams = await db.query<any[]>(teamSql, [league, slug]);

    if (teams.length === 0) {
      throw createError('Team not found', 404);
    }

    const teamId = teams[0].id;

    // Get roster
    const rosterSql = `
      SELECT *
      FROM players
      WHERE team_id = ? AND active = 1
      ORDER BY position, jersey_number
    `;

    const roster = await db.query<any[]>(rosterSql, [teamId]);

    res.json({
      success: true,
      count: roster.length,
      data: roster,
    });
  } catch (error) {
    next(error);
  }
}
