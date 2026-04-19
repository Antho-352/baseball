/**
 * Prediction Routes
 */

import { Router } from 'express';
import {
  getAllPredictions,
  getPredictionBySlug,
  createPrediction,
  updatePrediction,
  deletePrediction,
} from '../controllers/predictionController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public routes (optionalAuth = includes drafts if authenticated)
router.get('/', optionalAuth, getAllPredictions);
router.get('/:slug', optionalAuth, getPredictionBySlug);

// Protected routes (require authentication)
router.post('/', authenticateToken, createPrediction);
router.put('/:id', authenticateToken, updatePrediction);
router.delete('/:id', authenticateToken, deletePrediction);

export default router;
