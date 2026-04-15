/**
 * Types pour le scraper de scores live
 */

export interface InningScore {
  inning: number;
  home: number;
  away: number;
}

export interface MatchScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'NS' | 'IN_PROGRESS' | 'FT' | 'POSTPONED';
  startTime: string; // ISO 8601
  league: 'KBO' | 'NPB';
  innings?: InningScore[];
  scrapedAt: string; // ISO 8601
}

export interface ScraperConfig {
  userAgents: string[];
  minDelayMs: number;
  maxDelayMs: number;
  retryDelays: number[]; // [30s, 60s, 120s]
  maxConsecutiveFailures: number;
  pauseDurationAfterFailures: number; // 1h = 3600000ms
}

export interface TimeWindow {
  startHour: number; // 0-23
  endHour: number; // 0-23
  timezone: string; // 'Asia/Seoul', 'Asia/Tokyo'
}

export interface ScraperStats {
  lastScrapeAt: string | null;
  lastSuccessAt: string | null;
  consecutiveFailures: number;
  totalScrapes: number;
  totalMatches: number;
  pausedUntil: string | null;
}
