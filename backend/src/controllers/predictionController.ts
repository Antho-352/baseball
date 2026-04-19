/**
 * Prediction Controller
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * GET /api/predictions
 * Get all predictions with filters
 */
export async function getAllPredictions(req: Request, res: Response, next: NextFunction) {
  try {
    const { league, status, game_id, limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT
        p.*,
        g.game_date,
        g.status as game_status,
        ht.name as home_team_name,
        ht.slug as home_team_slug,
        ht.abbreviation as home_team_abbr,
        at.name as away_team_name,
        at.slug as away_team_slug,
        at.abbreviation as away_team_abbr,
        l.code as league_code,
        l.name as league_name
      FROM predictions p
      INNER JOIN games g ON p.game_id = g.id
      INNER JOIN teams ht ON g.home_team_id = ht.id
      INNER JOIN teams at ON g.away_team_id = at.id
      INNER JOIN leagues l ON g.league_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Only show published predictions if not authenticated
    if (!req.user) {
      sql += ' AND p.status = ?';
      params.push('published');
    } else if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (league) {
      sql += ' AND l.code = ?';
      params.push(league);
    }

    if (game_id) {
      sql += ' AND p.game_id = ?';
      params.push(game_id);
    }

    sql += ' ORDER BY g.game_date DESC, p.published_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const predictions = await db.query<any[]>(sql, params);

    res.json({
      success: true,
      count: predictions.length,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/predictions/:slug
 * Get prediction by slug
 */
export async function getPredictionBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const sql = `
      SELECT
        p.*,
        g.game_date,
        g.game_time,
        g.status as game_status,
        g.venue,
        g.home_score,
        g.away_score,
        ht.id as home_team_id,
        ht.name as home_team_name,
        ht.slug as home_team_slug,
        ht.abbreviation as home_team_abbr,
        ht.logo_url as home_team_logo,
        at.id as away_team_id,
        at.name as away_team_name,
        at.slug as away_team_slug,
        at.abbreviation as away_team_abbr,
        at.logo_url as away_team_logo,
        l.code as league_code,
        l.name as league_name
      FROM predictions p
      INNER JOIN games g ON p.game_id = g.id
      INNER JOIN teams ht ON g.home_team_id = ht.id
      INNER JOIN teams at ON g.away_team_id = at.id
      INNER JOIN leagues l ON g.league_id = l.id
      WHERE p.slug = ?
      LIMIT 1
    `;

    const predictions = await db.query<any[]>(sql, [slug]);

    if (predictions.length === 0) {
      throw createError('Prediction not found', 404);
    }

    const prediction = predictions[0];

    // Only allow non-published if authenticated
    if (prediction.status !== 'published' && !req.user) {
      throw createError('Prediction not found', 404);
    }

    // Get odds for this game
    const odds = await db.query<any[]>(
      'SELECT * FROM odds WHERE game_id = ? ORDER BY fetched_at DESC',
      [prediction.game_id]
    );

    res.json({
      success: true,
      data: {
        ...prediction,
        odds,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/predictions
 * Create new prediction (admin only)
 */
export async function createPrediction(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      game_id,
      slug,
      title,
      prediction_type,
      prediction_value,
      confidence,
      analysis_html,
      key_factors,
      status,
    } = req.body;

    if (!game_id || !slug || !title || !prediction_value) {
      throw createError('Missing required fields: game_id, slug, title, prediction_value', 400);
    }

    // Check slug uniqueness
    const existing = await db.query<any[]>('SELECT id FROM predictions WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      throw createError('Prediction with this slug already exists', 400);
    }

    // Check game exists
    const games = await db.query<any[]>('SELECT id FROM games WHERE id = ?', [game_id]);
    if (games.length === 0) {
      throw createError('Game not found', 404);
    }

    const author = req.user?.email || 'Baseball FR';
    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const result = await db.execute(
      `INSERT INTO predictions
       (game_id, slug, title, prediction_type, prediction_value, confidence, analysis_html, key_factors, status, author, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        game_id,
        slug,
        title,
        prediction_type || 'winner',
        prediction_value,
        confidence || 'medium',
        analysis_html || null,
        key_factors ? JSON.stringify(key_factors) : null,
        status || 'draft',
        author,
        publishedAt,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Prediction created successfully',
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
 * PUT /api/predictions/:id
 * Update prediction (admin only)
 */
export async function updatePrediction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if prediction exists
    const existing = await db.query<any[]>('SELECT * FROM predictions WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw createError('Prediction not found', 404);
    }

    const prediction = existing[0];

    // Build update query
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.prediction_type !== undefined) {
      fields.push('prediction_type = ?');
      values.push(updates.prediction_type);
    }
    if (updates.prediction_value !== undefined) {
      fields.push('prediction_value = ?');
      values.push(updates.prediction_value);
    }
    if (updates.confidence !== undefined) {
      fields.push('confidence = ?');
      values.push(updates.confidence);
    }
    if (updates.analysis_html !== undefined) {
      fields.push('analysis_html = ?');
      values.push(updates.analysis_html);
    }
    if (updates.key_factors !== undefined) {
      fields.push('key_factors = ?');
      values.push(JSON.stringify(updates.key_factors));
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);

      // Set published_at if publishing
      if (updates.status === 'published' && prediction.status !== 'published') {
        fields.push('published_at = ?');
        values.push(new Date().toISOString());
      }
    }
    if (updates.result !== undefined) {
      fields.push('result = ?');
      values.push(updates.result);
    }

    if (fields.length === 0) {
      throw createError('No fields to update', 400);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE predictions SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, values);

    res.json({
      success: true,
      message: 'Prediction updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/predictions/:id
 * Delete prediction (admin only)
 */
export async function deletePrediction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const result = await db.execute('DELETE FROM predictions WHERE id = ?', [id]);

    if ((result as any).changes === 0) {
      throw createError('Prediction not found', 404);
    }

    res.json({
      success: true,
      message: 'Prediction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
