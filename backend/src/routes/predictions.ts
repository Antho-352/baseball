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
import { validateBody } from '../middleware/validate.js';
import {
  createPredictionSchema,
  updatePredictionSchema,
} from '../validators/prediction.validator.js';

const router = Router();

// Public routes (optionalAuth = includes drafts if authenticated)
router.get('/', optionalAuth, getAllPredictions);
router.get('/:slug', optionalAuth, getPredictionBySlug);

// Protected routes (require authentication)
router.post('/', authenticateToken, validateBody(createPredictionSchema), createPrediction);
router.put('/:id', authenticateToken, validateBody(updatePredictionSchema), updatePrediction);
router.delete('/:id', authenticateToken, deletePrediction);

export default router;
