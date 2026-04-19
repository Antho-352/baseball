/**
 * Standing Routes
 */

import { Router } from 'express';
import { getStandings } from '../controllers/standingController.js';

const router = Router();

// GET /api/standings?league=mlb&season=2026
router.get('/', getStandings);

export default router;
