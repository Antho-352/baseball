/**
 * Sitemap Controller
 * Generates dynamic sitemap.xml based on database content
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';

const BASE_URL = process.env.BASE_URL || 'https://home-run.fr';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/**
 * GET /api/sitemap.xml
 * Generate dynamic sitemap
 */
export async function generateSitemap(req: Request, res: Response, next: NextFunction) {
  try {
    const urls: SitemapUrl[] = [];

    // Static pages (high priority)
    urls.push({
      loc: `${BASE_URL}/`,
      changefreq: 'daily',
      priority: '1.0',
    });

    // League hubs
    const leagues = await db.query<any[]>('SELECT code FROM leagues WHERE active = 1');
    for (const league of leagues) {
      urls.push({
        loc: `${BASE_URL}/${league.code}/`,
        changefreq: 'daily',
        priority: '0.9',
      });
      urls.push({
        loc: `${BASE_URL}/${league.code}/scores/`,
        changefreq: 'hourly',
        priority: '0.9',
      });
      urls.push({
        loc: `${BASE_URL}/${league.code}/classement/`,
        changefreq: 'daily',
        priority: '0.8',
      });
      urls.push({
        loc: `${BASE_URL}/${league.code}/calendrier/`,
        changefreq: 'daily',
        priority: '0.8',
      });
      urls.push({
        loc: `${BASE_URL}/${league.code}/equipes/`,
        changefreq: 'weekly',
        priority: '0.7',
      });
      urls.push({
        loc: `${BASE_URL}/${league.code}/joueurs/`,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    // Teams
    const teams = await db.query<any[]>(
      `SELECT t.slug, l.code as league_code, t.updated_at
       FROM teams t
       INNER JOIN leagues l ON t.league_id = l.id
       WHERE t.active = 1
       ORDER BY l.code, t.name`
    );
    for (const team of teams) {
      urls.push({
        loc: `${BASE_URL}/${team.league_code}/equipes/${team.slug}/`,
        lastmod: team.updated_at,
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    // Players (stars only)
    const players = await db.query<any[]>(
      `SELECT p.slug, l.code as league_code, p.updated_at
       FROM players p
       INNER JOIN leagues l ON p.league_id = l.id
       WHERE p.is_star = 1 AND p.active = 1
       ORDER BY l.code, p.full_name`
    );
    for (const player of players) {
      urls.push({
        loc: `${BASE_URL}/${player.league_code}/joueurs/${player.slug}/`,
        lastmod: player.updated_at,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    // Predictions (published only, last 90 days)
    const predictions = await db.query<any[]>(
      `SELECT p.slug, p.published_at
       FROM predictions p
       WHERE p.status = 'published'
       AND p.published_at >= datetime('now', '-90 days')
       ORDER BY p.published_at DESC`
    );
    for (const prediction of predictions) {
      urls.push({
        loc: `${BASE_URL}/pronostics/${prediction.slug}/`,
        lastmod: prediction.published_at,
        changefreq: 'never',
        priority: '0.9',
      });
    }

    // Pronostics hub
    urls.push({
      loc: `${BASE_URL}/pronostics/`,
      changefreq: 'daily',
      priority: '0.9',
    });

    // Articles (published only, last 180 days)
    const articles = await db.query<any[]>(
      `SELECT a.slug, a.published_at, a.category
       FROM articles a
       WHERE a.status = 'published'
       AND a.published_at >= datetime('now', '-180 days')
       ORDER BY a.published_at DESC`
    );
    for (const article of articles) {
      urls.push({
        loc: `${BASE_URL}/news/${article.slug}/`,
        lastmod: article.published_at,
        changefreq: 'never',
        priority: '0.6',
      });
    }

    // News hubs
    urls.push({
      loc: `${BASE_URL}/news/`,
      changefreq: 'daily',
      priority: '0.7',
    });
    for (const league of leagues) {
      urls.push({
        loc: `${BASE_URL}/news/${league.code}/`,
        changefreq: 'daily',
        priority: '0.7',
      });
    }

    // Affiliation pages
    urls.push({
      loc: `${BASE_URL}/paris-sportifs/`,
      changefreq: 'weekly',
      priority: '0.8',
    });
    urls.push({
      loc: `${BASE_URL}/paris-sportifs/bonus/`,
      changefreq: 'weekly',
      priority: '0.8',
    });

    const bookmakers = await db.query<any[]>(
      'SELECT slug FROM bookmakers WHERE active = 1'
    );
    for (const bookmaker of bookmakers) {
      urls.push({
        loc: `${BASE_URL}/paris-sportifs/${bookmaker.slug}/`,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    // Generate XML
    const xml = generateSitemapXML(urls);

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
}

/**
 * Generate XML from URLs array
 */
function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlStrings = urls.map((url) => {
    let urlXml = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n`;

    if (url.lastmod) {
      // Format date as ISO 8601
      const date = new Date(url.lastmod);
      urlXml += `    <lastmod>${date.toISOString().split('T')[0]}</lastmod>\n`;
    }

    if (url.changefreq) {
      urlXml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }

    if (url.priority) {
      urlXml += `    <priority>${url.priority}</priority>\n`;
    }

    urlXml += `  </url>`;
    return urlXml;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlStrings.join('\n')}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
