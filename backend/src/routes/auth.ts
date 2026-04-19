/**
 * Authentication Routes
 */

import { Router } from 'express';
import {
  login,
  register,
  getCurrentUser,
  changePassword,
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);

// Admin only routes
router.post('/register', authenticateToken, requireAdmin, register);

export default router;
