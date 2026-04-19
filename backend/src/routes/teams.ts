/**
 * Team Routes
 */

import { Router } from 'express';
import {
  getAllTeams,
  getTeamBySlug,
  getTeamRoster,
} from '../controllers/teamController.js';

const router = Router();

// GET /api/teams?league=mlb&active=true
router.get('/', getAllTeams);

// GET /api/teams/:league/:slug
router.get('/:league/:slug', getTeamBySlug);

// GET /api/teams/:league/:slug/roster
router.get('/:league/:slug/roster', getTeamRoster);

export default router;
