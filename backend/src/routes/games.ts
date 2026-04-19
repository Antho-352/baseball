/**
 * Game Routes
 */

import { Router } from 'express';
import {
  getGames,
  getGameById,
  getTodayGames,
} from '../controllers/gameController.js';

const router = Router();

// GET /api/games/today
router.get('/today', getTodayGames);

// GET /api/games?league=mlb&date=2026-04-17&status=live
router.get('/', getGames);

// GET /api/games/:id
router.get('/:id', getGameById);

export default router;
