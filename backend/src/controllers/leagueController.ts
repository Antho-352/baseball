/**
 * League Controller
 * Handles league-related business logic
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { League, CreateLeagueDTO, UpdateLeagueDTO } from '../models/League.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Get all leagues
 */
export async function getAllLeagues(req: Request, res: Response, next: NextFunction) {
  try {
    const activeOnly = req.query.active === 'true';

    const sql = activeOnly
      ? 'SELECT * FROM leagues WHERE active = 1 ORDER BY code'
      : 'SELECT * FROM leagues ORDER BY code';

    const leagues = await db.query<League[]>(sql);

    res.json({
      success: true,
      count: leagues.length,
      data: leagues,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get league by code
 */
export async function getLeagueByCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.params;

    const sql = 'SELECT * FROM leagues WHERE code = ? LIMIT 1';
    const leagues = await db.query<League[]>(sql, [code]);

    if (leagues.length === 0) {
      throw createError('League not found', 404);
    }

    res.json({
      success: true,
      data: leagues[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new league (Admin only)
 */
export async function createLeague(req: Request, res: Response, next: NextFunction) {
  try {
    const dto: CreateLeagueDTO = req.body;

    // Validation
    if (!dto.code || !dto.name || !dto.country) {
      throw createError('Missing required fields: code, name, country', 400);
    }

    const sql = `
      INSERT INTO leagues (code, name, country, logo_url, active)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.execute(sql, [
      dto.code,
      dto.name,
      dto.country,
      dto.logo_url || null,
      dto.active !== undefined ? dto.active : 1,
    ]);

    res.status(201).json({
      success: true,
      message: 'League created successfully',
      data: { id: (result as any).insertId, ...dto },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update league (Admin only)
 */
export async function updateLeague(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.params;
    const dto: UpdateLeagueDTO = req.body;

    // Check if league exists
    const existing = await db.query<League[]>('SELECT * FROM leagues WHERE code = ?', [code]);
    if (existing.length === 0) {
      throw createError('League not found', 404);
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (dto.name !== undefined) {
      updates.push('name = ?');
      values.push(dto.name);
    }
    if (dto.country !== undefined) {
      updates.push('country = ?');
      values.push(dto.country);
    }
    if (dto.logo_url !== undefined) {
      updates.push('logo_url = ?');
      values.push(dto.logo_url);
    }
    if (dto.active !== undefined) {
      updates.push('active = ?');
      values.push(dto.active);
    }

    if (updates.length === 0) {
      throw createError('No fields to update', 400);
    }

    values.push(code);
    const sql = `UPDATE leagues SET ${updates.join(', ')} WHERE code = ?`;
    await db.execute(sql, values);

    res.json({
      success: true,
      message: 'League updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete league (Admin only)
 */
export async function deleteLeague(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.params;

    const result = await db.execute('DELETE FROM leagues WHERE code = ?', [code]);

    if ((result as any).affectedRows === 0) {
      throw createError('League not found', 404);
    }

    res.json({
      success: true,
      message: 'League deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
