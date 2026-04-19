/**
 * Request Logger Middleware
 */

import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log after response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    // Color code based on status
    if (res.statusCode >= 500) {
      console.error(`\x1b[31m${logMessage}\x1b[0m`); // Red for 5xx
    } else if (res.statusCode >= 400) {
      console.warn(`\x1b[33m${logMessage}\x1b[0m`); // Yellow for 4xx
    } else if (res.statusCode >= 300) {
      console.log(`\x1b[36m${logMessage}\x1b[0m`); // Cyan for 3xx
    } else {
      console.log(`\x1b[32m${logMessage}\x1b[0m`); // Green for 2xx
    }
  });

  next();
}
