/**
 * Player Routes
 */

import { Router } from 'express';
import {
  getAllPlayers,
  getPlayerBySlug,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/playerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllPlayers);
router.get('/:slug', getPlayerBySlug);

// Protected routes (require authentication)
router.post('/', authenticateToken, createPlayer);
router.put('/:id', authenticateToken, updatePlayer);
router.delete('/:id', authenticateToken, deletePlayer);

export default router;
