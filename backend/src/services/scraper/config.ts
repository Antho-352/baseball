/**
 * Configuration du scraper - Contraintes de politesse NON NÉGOCIABLES
 */

import { ScraperConfig, TimeWindow } from './types';

/**
 * User-Agents rotatifs (vrais navigateurs récents)
 */
export const USER_AGENTS = [
  // Chrome Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  // Chrome Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  // Firefox Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  // Firefox Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
  // Safari Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  // Chrome Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];

/**
 * Headers HTTP réalistes (comme un vrai navigateur)
 */
export const DEFAULT_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
};

/**
 * Configuration scraper
 */
export const SCRAPER_CONFIG: ScraperConfig = {
  userAgents: USER_AGENTS,
  minDelayMs: 3000, // 3 secondes minimum
  maxDelayMs: 7000, // 7 secondes maximum
  retryDelays: [30000, 60000, 120000], // 30s, 60s, 120s
  maxConsecutiveFailures: 3,
  pauseDurationAfterFailures: 3600000, // 1 heure
};

/**
 * Plages horaires de scraping (NON NÉGOCIABLE)
 */
export const TIME_WINDOWS: Record<'KBO' | 'NPB', TimeWindow> = {
  KBO: {
    startHour: 9, // 09:00 KST
    endHour: 22, // 22:00 KST
    timezone: 'Asia/Seoul',
  },
  NPB: {
    startHour: 11, // 11:00 JST
    endHour: 22, // 22:00 JST
    timezone: 'Asia/Tokyo',
  },
};

/**
 * Fréquences de polling adaptatives
 */
export const POLLING_INTERVALS = {
  NO_MATCHES: 10 * 60 * 1000, // 10 minutes
  MATCHES_IN_PROGRESS: 60 * 1000, // 60 secondes
  ALL_FINISHED: 30 * 60 * 1000, // 30 minutes
};

/**
 * URLs cibles
 */
export const SCRAPER_URLS = {
  KBO: 'https://www.baseball24.com/south-korea/kbo/results/',
  NPB: 'https://www.baseball24.com/japan/npb/results/',
};

/**
 * Sélecteurs CSS (✅ VALIDÉS via inspection Playwright 2026-04-15)
 * Source: baseball24.com (Flashscore skin)
 * Tests: 60 matchs KBO, 73 matchs MLB trouvés
 */
export const CSS_SELECTORS = {
  // Container principal: chaque match a un ID de type g_6_XXXXXXXX
  matchRow: '[id^="g_6_"]',

  // Équipes - classe .wcl-name_jjfMf contient le nom
  homeTeam: '.event__homeParticipant .wcl-name_jjfMf',
  awayTeam: '.event__awayParticipant .wcl-name_jjfMf',

  // Scores - classes event__score--home/away
  homeScore: '.event__score--home',
  awayScore: '.event__score--away',

  // Heure/Date - format "14.04. 18:30"
  startTime: '.event__time',

  // Pitchers (bonus info si besoin)
  pitchers: '.event__pitchers',

  // Status: déterminé par présence des scores
  // - Si scores présents → "FT" (Finished)
  // - Si pas de scores → "NS" (Not Started)
  // - Si data-live="true" → "IN_PROGRESS"
  // (Pas de sélecteur direct, logique dans extractMatches)
};
