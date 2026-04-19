/**
 * Bookmaker Routes
 */

import { Router } from 'express';
import {
  getAllBookmakers,
  getBookmakerBySlug,
  trackClick,
  createBookmaker,
  updateBookmaker,
  deleteBookmaker,
} from '../controllers/bookmakerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllBookmakers);
router.get('/:slug', getBookmakerBySlug);
router.post('/:id/click', trackClick);

// Protected routes (require authentication)
router.post('/', authenticateToken, createBookmaker);
router.put('/:id', authenticateToken, updateBookmaker);
router.delete('/:id', authenticateToken, deleteBookmaker);

export default router;
