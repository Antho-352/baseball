/**
 * Standing Controller
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * GET /api/standings?league=mlb&season=2026
 * Get standings with filters
 */
export async function getStandings(req: Request, res: Response, next: NextFunction) {
  try {
    const { league, season, division } = req.query;
    const targetSeason = season ? parseInt(season as string) : new Date().getFullYear();

    let sql = `
      SELECT
        s.*,
        t.name as team_name,
        t.abbreviation as team_abbr,
        t.slug as team_slug,
        l.code as league_code,
        l.name as league_name
      FROM standings s
      INNER JOIN teams t ON s.team_id = t.id
      INNER JOIN leagues l ON s.league_id = l.id
      WHERE s.season = ?
    `;
    const params: any[] = [targetSeason];

    if (league) {
      sql += ' AND l.code = ?';
      params.push(league);
    }

    if (division) {
      sql += ' AND s.division = ?';
      params.push(division);
    }

    sql += ' ORDER BY l.code, s.division, s.win_pct DESC';

    const standings = await db.query<any[]>(sql, params);

    // Group by league and division
    const grouped: Record<string, any> = {};

    for (const standing of standings) {
      const leagueCode = standing.league_code;
      const division = standing.division || 'Overall';

      if (!grouped[leagueCode]) {
        grouped[leagueCode] = {};
      }

      if (!grouped[leagueCode][division]) {
        grouped[leagueCode][division] = [];
      }

      grouped[leagueCode][division].push(standing);
    }

    res.json({
      success: true,
      season: targetSeason,
      total: standings.length,
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
}
