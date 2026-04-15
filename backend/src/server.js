/**
 * Backend API - home-run.fr
 *
 * Express API qui expose les données des providers (MLB, KBO, NPB)
 * via des endpoints REST pour le frontend Astro
 *
 * Port: 3000 (localhost:3000)
 * CORS: Autorisé pour localhost:4321 (Astro dev)
 */

import express from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import { createDataProvider } from './services/data-provider/index.ts';

const app = express();
const PORT = process.env.PORT || 3210;

// Cache (TTL en secondes)
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes par défaut
  checkperiod: 60, // Vérification toutes les 60s
});

// Middleware
app.use(cors({
  origin: ['http://localhost:4321', 'http://localhost:3210'],
  credentials: true,
}));
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize UnifiedProvider
const provider = createDataProvider('unified');

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: provider.getProviderName(),
  });
});

/**
 * GET /api/games/:league/:date?
 * Récupère les matchs d'une ligue pour une date
 *
 * Params:
 * - league: 'mlb' | 'kbo' | 'npb'
 * - date: YYYY-MM-DD (optionnel, défaut: aujourd'hui)
 *
 * Response:
 * {
 *   league: string,
 *   date: string,
 *   games: Game[]
 * }
 */
app.get('/api/games/:league/:date?', async (req, res) => {
  try {
    const { league, date } = req.params;

    // Validation league
    if (!['mlb', 'kbo', 'npb'].includes(league)) {
      return res.status(400).json({
        error: 'Invalid league. Must be: mlb, kbo, or npb',
      });
    }

    // Parse date
    const targetDate = date ? new Date(date) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Cache key
    const cacheKey = `games:${league}:${targetDate.toISOString().split('T')[0]}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cached);
    }

    // Fetch from provider
    console.log(`[FETCH] Games for ${league} on ${targetDate.toISOString()}`);
    const games = await provider.getGames(league, targetDate);

    const response = {
      league,
      date: targetDate.toISOString().split('T')[0],
      games,
      cached: false,
    };

    // Cache for 5 minutes (live data)
    cache.set(cacheKey, response, 300);

    res.json(response);
  } catch (error) {
    console.error('[ERROR] /api/games:', error);
    res.status(500).json({
      error: 'Failed to fetch games',
      message: error.message,
    });
  }
});

/**
 * GET /api/standings/:league/:season?
 * Récupère le classement d'une ligue
 *
 * Params:
 * - league: 'mlb' | 'kbo' | 'npb'
 * - season: YYYY (optionnel, défaut: année en cours)
 *
 * Response:
 * {
 *   league: string,
 *   season: number,
 *   standings: Standing[]
 * }
 */
app.get('/api/standings/:league/:season?', async (req, res) => {
  try {
    const { league, season } = req.params;

    // Validation
    if (!['mlb', 'kbo', 'npb'].includes(league)) {
      return res.status(400).json({
        error: 'Invalid league. Must be: mlb, kbo, or npb',
      });
    }

    const targetSeason = season ? parseInt(season) : new Date().getFullYear();
    if (isNaN(targetSeason) || targetSeason < 2000 || targetSeason > 2100) {
      return res.status(400).json({
        error: 'Invalid season. Must be a year between 2000-2100',
      });
    }

    // Cache key
    const cacheKey = `standings:${league}:${targetSeason}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cached);
    }

    // Fetch from provider
    console.log(`[FETCH] Standings for ${league} season ${targetSeason}`);
    const standings = await provider.getStandings(league, targetSeason);

    const response = {
      league,
      season: targetSeason,
      standings,
      cached: false,
    };

    // Cache for 1 hour (standings don't change frequently)
    cache.set(cacheKey, response, 3600);

    res.json(response);
  } catch (error) {
    console.error('[ERROR] /api/standings:', error);
    res.status(500).json({
      error: 'Failed to fetch standings',
      message: error.message,
    });
  }
});

/**
 * GET /api/players/:league/top/:stat?
 * Récupère les meilleurs joueurs d'une ligue
 *
 * Params:
 * - league: 'mlb' | 'kbo' | 'npb'
 * - stat: 'avg' | 'hr' | 'rbi' | 'era' | 'strikeouts' (optionnel, défaut: 'avg')
 *
 * Query:
 * - limit: nombre de joueurs (défaut: 10)
 *
 * Response:
 * {
 *   league: string,
 *   stat: string,
 *   players: Player[]
 * }
 */
app.get('/api/players/:league/top/:stat?', async (req, res) => {
  try {
    const { league, stat = 'avg' } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Validation
    if (!['mlb', 'kbo', 'npb'].includes(league)) {
      return res.status(400).json({
        error: 'Invalid league. Must be: mlb, kbo, or npb',
      });
    }

    const validStats = ['avg', 'hr', 'rbi', 'era', 'strikeouts'];
    if (!validStats.includes(stat)) {
      return res.status(400).json({
        error: `Invalid stat. Must be one of: ${validStats.join(', ')}`,
      });
    }

    // Cache key
    const cacheKey = `players:${league}:${stat}:${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cached);
    }

    // Fetch from provider
    console.log(`[FETCH] Top ${limit} players for ${league} by ${stat}`);
    const players = await provider.getPlayerStats(league, stat, limit);

    const response = {
      league,
      stat,
      players,
      cached: false,
    };

    // Cache for 1 hour
    cache.set(cacheKey, response, 3600);

    res.json(response);
  } catch (error) {
    console.error('[ERROR] /api/players:', error);
    res.status(500).json({
      error: 'Failed to fetch players',
      message: error.message,
    });
  }
});

/**
 * GET /api/cache/stats
 * Statistiques du cache (debug)
 */
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();

  res.json({
    stats,
    keys,
    count: keys.length,
  });
});

/**
 * DELETE /api/cache/clear
 * Vider le cache (debug)
 */
app.delete('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({
    message: 'Cache cleared',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`
🚀 Backend API started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  URL:      http://localhost:${PORT}
  Provider: ${provider.getProviderName()}
  Cache:    Enabled (5min TTL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available endpoints:
  GET  /api/health
  GET  /api/games/:league/:date?
  GET  /api/standings/:league/:season?
  GET  /api/players/:league/top/:stat?
  GET  /api/cache/stats
  DEL  /api/cache/clear
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});
