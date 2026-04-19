/**
 * Sitemap Routes
 */

import { Router } from 'express';
import { generateSitemap } from '../controllers/sitemapController.js';

const router = Router();

// Public route - Generate sitemap XML
router.get('/', generateSitemap);

export default router;
