/**
 * Bookmaker Controller
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * GET /api/bookmakers
 * Get all bookmakers (ordered by priority)
 */
export async function getAllBookmakers(req: Request, res: Response, next: NextFunction) {
  try {
    const { active = '1' } = req.query;

    let sql = 'SELECT * FROM bookmakers WHERE 1=1';
    const params: any[] = [];

    if (active === '1') {
      sql += ' AND active = 1';
    }

    sql += ' ORDER BY priority DESC, name ASC';

    const bookmakers = await db.query<any[]>(sql, params);

    res.json({
      success: true,
      count: bookmakers.length,
      data: bookmakers,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/bookmakers/:slug
 * Get bookmaker by slug
 */
export async function getBookmakerBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const bookmakers = await db.query<any[]>('SELECT * FROM bookmakers WHERE slug = ? LIMIT 1', [
      slug,
    ]);

    if (bookmakers.length === 0) {
      throw createError('Bookmaker not found', 404);
    }

    const bookmaker = bookmakers[0];

    // Get click stats (last 30 days)
    const clickStats = await db.query<any[]>(
      `SELECT COUNT(*) as total_clicks
       FROM clicks_tracking
       WHERE bookmaker_id = ?
       AND clicked_at >= datetime('now', '-30 days')`,
      [bookmaker.id]
    );

    res.json({
      success: true,
      data: {
        ...bookmaker,
        stats: {
          clicks_30d: clickStats[0]?.total_clicks || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/bookmakers/:id/click
 * Track affiliate click (RGPD-compliant)
 */
export async function trackClick(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { referer, page_url } = req.body;

    // Check bookmaker exists
    const bookmakers = await db.query<any[]>(
      'SELECT id, affiliate_url FROM bookmakers WHERE id = ? AND active = 1',
      [id]
    );

    if (bookmakers.length === 0) {
      throw createError('Bookmaker not found', 404);
    }

    const bookmaker = bookmakers[0];

    // Hash IP for RGPD compliance (no storage of raw IP)
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');

    // Hash user agent
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userAgentHash = crypto.createHash('sha256').update(userAgent).digest('hex');

    // Insert click tracking
    await db.execute(
      `INSERT INTO clicks_tracking (bookmaker_id, ip_hash, user_agent_hash, referer, page_url)
       VALUES (?, ?, ?, ?, ?)`,
      [id, ipHash, userAgentHash, referer || null, page_url || null]
    );

    res.json({
      success: true,
      affiliate_url: bookmaker.affiliate_url,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/bookmakers
 * Create new bookmaker (admin only)
 */
export async function createBookmaker(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug, name, logo_url, bonus_text, affiliate_url, anj_license, rating, features } =
      req.body;

    if (!slug || !name || !affiliate_url) {
      throw createError('Missing required fields: slug, name, affiliate_url', 400);
    }

    // Check slug uniqueness
    const existing = await db.query<any[]>('SELECT id FROM bookmakers WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      throw createError('Bookmaker with this slug already exists', 400);
    }

    const result = await db.execute(
      `INSERT INTO bookmakers
       (slug, name, logo_url, bonus_text, affiliate_url, anj_license, rating, features, active, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        name,
        logo_url || null,
        bonus_text || null,
        affiliate_url,
        anj_license || null,
        rating || null,
        features ? JSON.stringify(features) : null,
        1,
        0,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Bookmaker created successfully',
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
 * PUT /api/bookmakers/:id
 * Update bookmaker (admin only)
 */
export async function updateBookmaker(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if bookmaker exists
    const existing = await db.query<any[]>('SELECT id FROM bookmakers WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw createError('Bookmaker not found', 404);
    }

    // Build update query
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.logo_url !== undefined) {
      fields.push('logo_url = ?');
      values.push(updates.logo_url);
    }
    if (updates.bonus_text !== undefined) {
      fields.push('bonus_text = ?');
      values.push(updates.bonus_text);
    }
    if (updates.affiliate_url !== undefined) {
      fields.push('affiliate_url = ?');
      values.push(updates.affiliate_url);
    }
    if (updates.anj_license !== undefined) {
      fields.push('anj_license = ?');
      values.push(updates.anj_license);
    }
    if (updates.rating !== undefined) {
      fields.push('rating = ?');
      values.push(updates.rating);
    }
    if (updates.features !== undefined) {
      fields.push('features = ?');
      values.push(JSON.stringify(updates.features));
    }
    if (updates.active !== undefined) {
      fields.push('active = ?');
      values.push(updates.active);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }

    if (fields.length === 0) {
      throw createError('No fields to update', 400);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE bookmakers SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, values);

    res.json({
      success: true,
      message: 'Bookmaker updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/bookmakers/:id
 * Delete bookmaker (admin only)
 */
export async function deleteBookmaker(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const result = await db.execute('DELETE FROM bookmakers WHERE id = ?', [id]);

    if ((result as any).changes === 0) {
      throw createError('Bookmaker not found', 404);
    }

    res.json({
      success: true,
      message: 'Bookmaker deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
