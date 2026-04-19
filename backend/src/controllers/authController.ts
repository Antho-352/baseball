/**
 * Authentication Controller
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/database.js';
import { generateToken, JWTPayload } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'editor';
  active: number;
}

/**
 * POST /api/auth/login
 * Login with email and password
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    // Find user
    const users = await db.query<AdminUser[]>(
      'SELECT * FROM admin_users WHERE email = ? AND active = 1 LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      throw createError('Invalid credentials', 401);
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw createError('Invalid credentials', 401);
    }

    // Update last login
    await db.execute(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/register
 * Register new admin user (admin only)
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      throw createError('Email, password, and name are required', 400);
    }

    // Check if user already exists
    const existing = await db.query<AdminUser[]>(
      'SELECT id FROM admin_users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      throw createError('User with this email already exists', 400);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await db.execute(
      'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, role || 'editor']
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: (result as any).lastInsertRowid,
        email,
        name,
        role: role || 'editor',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current user info (requires auth)
 */
export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const users = await db.query<AdminUser[]>(
      'SELECT id, email, name, role, last_login FROM admin_users WHERE id = ? AND active = 1',
      [req.user.userId]
    );

    if (users.length === 0) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/change-password
 * Change user password (requires auth)
 */
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw createError('Current and new passwords are required', 400);
    }

    if (newPassword.length < 8) {
      throw createError('New password must be at least 8 characters', 400);
    }

    // Get user
    const users = await db.query<AdminUser[]>(
      'SELECT * FROM admin_users WHERE id = ? AND active = 1',
      [req.user.userId]
    );

    if (users.length === 0) {
      throw createError('User not found', 404);
    }

    const user = users[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      throw createError('Current password is incorrect', 401);
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.execute(
      'UPDATE admin_users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
}
