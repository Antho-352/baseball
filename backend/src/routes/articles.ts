/**
 * Article Routes
 */

import { Router } from 'express';
import {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public routes (optionalAuth = includes drafts if authenticated)
router.get('/', optionalAuth, getAllArticles);
router.get('/:slug', optionalAuth, getArticleBySlug);

// Protected routes (require authentication)
router.post('/', authenticateToken, createArticle);
router.put('/:id', authenticateToken, updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);

export default router;
