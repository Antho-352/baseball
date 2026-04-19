/**
 * Article Validation Schemas
 */

import { z } from 'zod';

export const createArticleSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  content: z.string().min(1, 'Content is required').max(100000, 'Content too long'),
  category: z.enum(['news', 'analysis', 'history', 'transfers', 'injuries'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  league_code: z
    .string()
    .regex(/^[a-z]+$/, 'League code must be lowercase letters')
    .max(10)
    .optional(),
  featured_image: z.string().url('Invalid image URL').max(500).optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1).max(100000).optional(),
  category: z.enum(['news', 'analysis', 'history', 'transfers', 'injuries']).optional(),
  featured_image: z.string().url().max(500).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
