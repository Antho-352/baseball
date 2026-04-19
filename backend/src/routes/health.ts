/**
 * Health Check Routes
 * Simple endpoint to verify API is running
 */

import { Router, Request, Response } from 'express';
import { db } from '../config/database.js';

const router = Router();

/**
 * GET /api/health
 * Basic health check
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await db.testConnection();
    const poolStats = db.getPoolStats();

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: poolStats,
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
