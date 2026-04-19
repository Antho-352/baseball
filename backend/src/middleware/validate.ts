/**
 * Validation Middleware
 * Uses Zod schemas to validate request data
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createError } from './errorHandler.js';

/**
 * Validate request body against a Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        return next(createError(`Validation failed: ${messages.join(', ')}`, 400));
      }
      next(error);
    }
  };
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        return next(createError(`Validation failed: ${messages.join(', ')}`, 400));
      }
      next(error);
    }
  };
}

/**
 * Validate request params against a Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        return next(createError(`Validation failed: ${messages.join(', ')}`, 400));
      }
      next(error);
    }
  };
}
