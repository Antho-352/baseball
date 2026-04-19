/**
 * Cron Routes
 * Protected by API key
 */

import { Router, Request, Response } from 'express';
import { syncTeams, syncGames, syncStandings } from '../cron/syncData.js';

const router = Router();

// Middleware to check API key
function checkCronKey(req: Request, res: Response, next: Function) {
  const apiKey = req.headers['x-api-key'] || req.query.key;
  const validKey = process.env.CRON_API_KEY || 'dev_cron_key_change_in_production';

  if (apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid API key',
    });
  }

  next();
}

router.use(checkCronKey);

// POST /api/cron/sync-teams
router.post('/sync-teams', async (req: Request, res: Response) => {
  try {
    await syncTeams();
    res.json({
      success: true,
      message: 'Teams synchronized successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/cron/sync-games
router.post('/sync-games', async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    await syncGames(date);
    res.json({
      success: true,
      message: `Games synchronized successfully${date ? ` for ${date}` : ''}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/cron/sync-standings
router.post('/sync-standings', async (req: Request, res: Response) => {
  try {
    const { season } = req.body;
    await syncStandings(season);
    res.json({
      success: true,
      message: `Standings synchronized successfully${season ? ` for ${season}` : ''}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/cron/sync-all
router.post('/sync-all', async (req: Request, res: Response) => {
  try {
    console.log('[CRON] Starting full sync...');
    await syncTeams();
    await syncGames();
    await syncStandings();
    res.json({
      success: true,
      message: 'Full synchronization completed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
