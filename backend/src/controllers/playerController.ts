/**
 * Player Controller
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * GET /api/players
 * Get all players with filters
 */
export async function getAllPlayers(req: Request, res: Response, next: NextFunction) {
  try {
    const { league, team, is_star, position, limit = '100', offset = '0' } = req.query;

    let sql = `
      SELECT
        p.*,
        t.name as team_name,
        t.slug as team_slug,
        t.abbreviation as team_abbr,
        l.code as league_code,
        l.name as league_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      INNER JOIN leagues l ON p.league_id = l.id
      WHERE p.active = 1
    `;
    const params: any[] = [];

    if (league) {
      sql += ' AND l.code = ?';
      params.push(league);
    }

    if (team) {
      sql += ' AND t.slug = ?';
      params.push(team);
    }

    if (is_star === '1') {
      sql += ' AND p.is_star = 1';
    }

    if (position) {
      sql += ' AND p.position = ?';
      params.push(position);
    }

    sql += ' ORDER BY p.is_star DESC, p.full_name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const players = await db.query<any[]>(sql, params);

    res.json({
      success: true,
      count: players.length,
      data: players,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/players/:slug
 * Get player by slug with stats
 */
export async function getPlayerBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const sql = `
      SELECT
        p.*,
        t.id as team_id,
        t.name as team_name,
        t.slug as team_slug,
        t.abbreviation as team_abbr,
        t.logo_url as team_logo,
        l.code as league_code,
        l.name as league_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      INNER JOIN leagues l ON p.league_id = l.id
      WHERE p.slug = ?
      LIMIT 1
    `;

    const players = await db.query<any[]>(sql, [slug]);

    if (players.length === 0) {
      throw createError('Player not found', 404);
    }

    const player = players[0];

    // Get player stats (all seasons)
    const stats = await db.query<any[]>(
      `SELECT *
       FROM player_stats
       WHERE player_id = ?
       ORDER BY season DESC, stat_type ASC`,
      [player.id]
    );

    res.json({
      success: true,
      data: {
        ...player,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/players
 * Create new player (admin only)
 */
export async function createPlayer(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      league_code,
      team_slug,
      external_id,
      first_name,
      last_name,
      full_name,
      slug,
      jersey_number,
      position,
      bat_side,
      throw_side,
      birth_date,
      birth_country,
      height_cm,
      weight_kg,
      photo_url,
      is_star,
    } = req.body;

    if (!league_code || !full_name || !slug) {
      throw createError('Missing required fields: league_code, full_name, slug', 400);
    }

    // Get league_id
    const leagues = await db.query<any[]>('SELECT id FROM leagues WHERE code = ?', [league_code]);
    if (leagues.length === 0) {
      throw createError('League not found', 404);
    }
    const leagueId = leagues[0].id;

    // Get team_id if team_slug provided
    let teamId = null;
    if (team_slug) {
      const teams = await db.query<any[]>(
        'SELECT id FROM teams WHERE slug = ? AND league_id = ?',
        [team_slug, leagueId]
      );
      if (teams.length > 0) {
        teamId = teams[0].id;
      }
    }

    // Check slug uniqueness within league
    const existing = await db.query<any[]>(
      'SELECT id FROM players WHERE slug = ? AND league_id = ?',
      [slug, leagueId]
    );
    if (existing.length > 0) {
      throw createError('Player with this slug already exists in this league', 400);
    }

    const result = await db.execute(
      `INSERT INTO players
       (league_id, team_id, external_id, first_name, last_name, full_name, slug, jersey_number,
        position, bat_side, throw_side, birth_date, birth_country, height_cm, weight_kg, photo_url, is_star, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leagueId,
        teamId,
        external_id || null,
        first_name || null,
        last_name || null,
        full_name,
        slug,
        jersey_number || null,
        position || null,
        bat_side || null,
        throw_side || null,
        birth_date || null,
        birth_country || null,
        height_cm || null,
        weight_kg || null,
        photo_url || null,
        is_star || 0,
        1,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Player created successfully',
      data: {
        id: (result as any).lastInsertRowid,
        slug,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/players/:id
 * Update player (admin only)
 */
export async function updatePlayer(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if player exists
    const existing = await db.query<any[]>('SELECT * FROM players WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw createError('Player not found', 404);
    }

    const player = existing[0];

    // Build update query
    const fields: string[] = [];
    const values: any[] = [];

    // Handle team_slug -> team_id conversion
    if (updates.team_slug !== undefined) {
      if (updates.team_slug === null) {
        fields.push('team_id = ?');
        values.push(null);
      } else {
        const teams = await db.query<any[]>(
          'SELECT id FROM teams WHERE slug = ? AND league_id = ?',
          [updates.team_slug, player.league_id]
        );
        if (teams.length > 0) {
          fields.push('team_id = ?');
          values.push(teams[0].id);
        }
      }
    }

    if (updates.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(updates.first_name);
    }
    if (updates.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(updates.last_name);
    }
    if (updates.full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(updates.full_name);
    }
    if (updates.jersey_number !== undefined) {
      fields.push('jersey_number = ?');
      values.push(updates.jersey_number);
    }
    if (updates.position !== undefined) {
      fields.push('position = ?');
      values.push(updates.position);
    }
    if (updates.bat_side !== undefined) {
      fields.push('bat_side = ?');
      values.push(updates.bat_side);
    }
    if (updates.throw_side !== undefined) {
      fields.push('throw_side = ?');
      values.push(updates.throw_side);
    }
    if (updates.birth_date !== undefined) {
      fields.push('birth_date = ?');
      values.push(updates.birth_date);
    }
    if (updates.birth_country !== undefined) {
      fields.push('birth_country = ?');
      values.push(updates.birth_country);
    }
    if (updates.height_cm !== undefined) {
      fields.push('height_cm = ?');
      values.push(updates.height_cm);
    }
    if (updates.weight_kg !== undefined) {
      fields.push('weight_kg = ?');
      values.push(updates.weight_kg);
    }
    if (updates.photo_url !== undefined) {
      fields.push('photo_url = ?');
      values.push(updates.photo_url);
    }
    if (updates.is_star !== undefined) {
      fields.push('is_star = ?');
      values.push(updates.is_star);
    }
    if (updates.active !== undefined) {
      fields.push('active = ?');
      values.push(updates.active);
    }

    if (fields.length === 0) {
      throw createError('No fields to update', 400);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE players SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, values);

    res.json({
      success: true,
      message: 'Player updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/players/:id
 * Delete player (admin only)
 */
export async function deletePlayer(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const result = await db.execute('DELETE FROM players WHERE id = ?', [id]);

    if ((result as any).changes === 0) {
      throw createError('Player not found', 404);
    }

    res.json({
      success: true,
      message: 'Player deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
