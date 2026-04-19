/**
 * Prediction Validation Schemas
 */

import { z } from 'zod';

export const createPredictionSchema = z.object({
  game_id: z.number().int().positive('Game ID must be a positive integer'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  prediction_type: z.enum(['winner', 'over_under', 'spread']).optional(),
  prediction_value: z.string().min(1, 'Prediction value is required').max(255, 'Value too long'),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
  analysis_html: z.string().max(50000, 'Analysis too long').optional(),
  key_factors: z.array(z.string().max(500)).max(10, 'Too many key factors').optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const updatePredictionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  prediction_type: z.enum(['winner', 'over_under', 'spread']).optional(),
  prediction_value: z.string().min(1).max(255).optional(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
  analysis_html: z.string().max(50000).optional(),
  key_factors: z.array(z.string().max(500)).max(10).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  result: z.enum(['pending', 'win', 'loss', 'void']).optional(),
});

export type CreatePredictionInput = z.infer<typeof createPredictionSchema>;
export type UpdatePredictionInput = z.infer<typeof updatePredictionSchema>;
