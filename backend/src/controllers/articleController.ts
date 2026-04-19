/**
 * Article Controller (CMS)
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * GET /api/articles
 * Get all articles with filters
 */
export async function getAllArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const { league, category, status, limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT a.*, l.code as league_code, l.name as league_name
      FROM articles a
      LEFT JOIN leagues l ON a.league_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Only show published articles if not authenticated
    if (!req.user) {
      sql += ' AND a.status = ?';
      params.push('published');
    } else if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (league) {
      sql += ' AND l.code = ?';
      params.push(league);
    }

    if (category) {
      sql += ' AND a.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY a.published_at DESC, a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const articles = await db.query<any[]>(sql, params);

    res.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/articles/:slug
 * Get article by slug
 */
export async function getArticleBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const sql = `
      SELECT a.*, l.code as league_code, l.name as league_name
      FROM articles a
      LEFT JOIN leagues l ON a.league_id = l.id
      WHERE a.slug = ?
      LIMIT 1
    `;

    const articles = await db.query<any[]>(sql, [slug]);

    if (articles.length === 0) {
      throw createError('Article not found', 404);
    }

    const article = articles[0];

    // Only allow non-published if authenticated
    if (article.status !== 'published' && !req.user) {
      throw createError('Article not found', 404);
    }

    // Increment view count
    await db.execute('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [article.id]);

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/articles
 * Create new article (admin only)
 */
export async function createArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, slug, excerpt, content, category, league_code, featured_image, tags, status } = req.body;

    if (!title || !slug || !content || !category) {
      throw createError('Missing required fields: title, slug, content, category', 400);
    }

    // Check slug uniqueness
    const existing = await db.query<any[]>('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      throw createError('Article with this slug already exists', 400);
    }

    // Get league_id if league_code provided
    let leagueId = null;
    if (league_code) {
      const leagues = await db.query<any[]>('SELECT id FROM leagues WHERE code = ?', [league_code]);
      if (leagues.length > 0) {
        leagueId = leagues[0].id;
      }
    }

    const author = req.user?.email || 'Baseball FR';
    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const result = await db.execute(
      `INSERT INTO articles
       (slug, title, excerpt, content, category, league_id, author, featured_image, tags, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        title,
        excerpt || null,
        content,
        category,
        leagueId,
        author,
        featured_image || null,
        tags ? JSON.stringify(tags) : null,
        status || 'draft',
        publishedAt,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
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
 * PUT /api/articles/:id
 * Update article (admin only)
 */
export async function updateArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if article exists
    const existing = await db.query<any[]>('SELECT * FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw createError('Article not found', 404);
    }

    const article = existing[0];

    // Build update query
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.excerpt !== undefined) {
      fields.push('excerpt = ?');
      values.push(updates.excerpt);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.featured_image !== undefined) {
      fields.push('featured_image = ?');
      values.push(updates.featured_image);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);

      // Set published_at if publishing
      if (updates.status === 'published' && article.status !== 'published') {
        fields.push('published_at = ?');
        values.push(new Date().toISOString());
      }
    }

    if (fields.length === 0) {
      throw createError('No fields to update', 400);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE articles SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, values);

    res.json({
      success: true,
      message: 'Article updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/articles/:id
 * Delete article (admin only)
 */
export async function deleteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const result = await db.execute('DELETE FROM articles WHERE id = ?', [id]);

    if ((result as any).changes === 0) {
      throw createError('Article not found', 404);
    }

    res.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
