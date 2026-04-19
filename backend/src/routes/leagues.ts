/**
 * League Routes
 */

import { Router } from 'express';
import {
  getAllLeagues,
  getLeagueByCode,
  createLeague,
  updateLeague,
  deleteLeague,
} from '../controllers/leagueController.js';

const router = Router();

// Public routes
router.get('/', getAllLeagues);
router.get('/:code', getLeagueByCode);

// Admin routes (TODO: Add auth middleware)
router.post('/', createLeague);
router.put('/:code', updateLeague);
router.delete('/:code', deleteLeague);

export default router;
