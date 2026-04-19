/**
 * Baseball FR - Backend API Server
 * Main entry point for Express API & CMS
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { db } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

// Routes
import healthRouter from './routes/health.js';
import leaguesRouter from './routes/leagues.js';
import teamsRouter from './routes/teams.js';
import playersRouter from './routes/players.js';
import gamesRouter from './routes/games.js';
import standingsRouter from './routes/standings.js';
import predictionsRouter from './routes/predictions.js';
import articlesRouter from './routes/articles.js';
import bookmakersRouter from './routes/bookmakers.js';
import cronRouter from './routes/cron.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Security & Performance Middleware
// ============================================

// Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4321', 'https://home-run.fr'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(logger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15min
  message: 'Too many login attempts, please try again later.',
});
app.use('/api/auth/login', authLimiter);

// ============================================
// Routes
// ============================================

// Health check
app.use('/api/health', healthRouter);

// Public API
app.use('/api/leagues', leaguesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/games', gamesRouter);
app.use('/api/standings', standingsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/bookmakers', bookmakersRouter);

// Cron endpoints (protected by API key)
app.use('/api/cron', cronRouter);

// Authentication
app.use('/api/auth', authRouter);

// Admin/CMS (protected by JWT)
app.use('/api/admin', adminRouter);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// Database Connection & Server Start
// ============================================

async function startServer() {
  try {
    // Test database connection
    await db.testConnection();
    console.log('✓ Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Baseball FR API running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
