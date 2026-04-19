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
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/login', validateBody(loginSchema), login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);

// Admin only routes
router.post('/register', authenticateToken, requireAdmin, validateBody(registerSchema), register);

export default router;
