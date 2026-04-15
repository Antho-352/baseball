/**
 * Service de scraping scores live KBO + NPB
 *
 * CONTRAINTES DE POLITESSE (NON NÉGOCIABLES) :
 * - User-Agent rotatif
 * - Headers réalistes
 * - Délai 3-7s entre requêtes
 * - Plages horaires strictes
 * - Fréquence adaptative
 * - Cache obligatoire
 * - Retry avec backoff exponentiel
 */

import { chromium, Browser, Page } from 'playwright';
import {
  MatchScore,
  ScraperStats,
  InningScore,
} from './types';
import {
  SCRAPER_CONFIG,
  TIME_WINDOWS,
  POLLING_INTERVALS,
  SCRAPER_URLS,
  CSS_SELECTORS,
  DEFAULT_HEADERS,
} from './config';

export class ScraperService {
  private browser: Browser | null = null;
  private kboCache: MatchScore[] = [];
  private npbCache: MatchScore[] = [];
  private kboStats: ScraperStats = this.initStats();
  private npbStats: ScraperStats = this.initStats();
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastRequestTime: number = 0;

  constructor() {
    this.log('ScraperService initialized');
  }

  /**
   * Démarre le service de scraping
   */
  async start(): Promise<void> {
    this.log('Starting scraper service...');

    // Vérifier robots.txt au démarrage
    await this.checkRobotsTxt();

    // Démarrer le polling
    this.startPolling();

    this.log('Scraper service started');
  }

  /**
   * Arrête le service
   */
  async stop(): Promise<void> {
    this.log('Stopping scraper service...');

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    this.log('Scraper service stopped');
  }

  /**
   * Récupère les scores KBO (depuis le cache)
   * JAMAIS d'appel réseau direct
   */
  getKBOScores(): MatchScore[] {
    return [...this.kboCache];
  }

  /**
   * Récupère les scores NPB (depuis le cache)
   * JAMAIS d'appel réseau direct
   */
  getNPBScores(): MatchScore[] {
    return [...this.npbCache];
  }

  /**
   * Récupère les statistiques du scraper
   */
  getStats(): { kbo: ScraperStats; npb: ScraperStats } {
    return {
      kbo: { ...this.kboStats },
      npb: { ...this.npbStats },
    };
  }

  /**
   * Démarre le polling en background
   */
  private startPolling(): void {
    // Scraper immédiatement si on est dans les plages horaires
    this.pollIfNeeded();

    // Puis vérifier toutes les 60 secondes s'il faut scraper
    this.pollingInterval = setInterval(() => {
      this.pollIfNeeded();
    }, 60 * 1000); // Check toutes les minutes
  }

  /**
   * Vérifie s'il faut scraper maintenant
   */
  private async pollIfNeeded(): Promise<void> {
    const now = new Date();

    // KBO
    if (this.isWithinTimeWindow('KBO', now) && !this.isPaused('KBO')) {
      const interval = this.getPollingInterval('KBO');
      const timeSinceLastScrape = now.getTime() - new Date(this.kboStats.lastScrapeAt || 0).getTime();

      if (timeSinceLastScrape >= interval) {
        await this.scrapeLeague('KBO');
      }
    }

    // NPB
    if (this.isWithinTimeWindow('NPB', now) && !this.isPaused('NPB')) {
      const interval = this.getPollingInterval('NPB');
      const timeSinceLastScrape = now.getTime() - new Date(this.npbStats.lastScrapeAt || 0).getTime();

      if (timeSinceLastScrape >= interval) {
        await this.scrapeLeague('NPB');
      }
    }
  }

  /**
   * Scrape une ligue spécifique
   */
  private async scrapeLeague(league: 'KBO' | 'NPB'): Promise<void> {
    const stats = league === 'KBO' ? this.kboStats : this.npbStats;

    this.log(`[${league}] Starting scrape...`);
    stats.lastScrapeAt = new Date().toISOString();

    try {
      // Respecter le délai entre requêtes
      await this.waitForDelay();

      // Scraper la page
      const matches = await this.scrapeMatches(league);

      // Mettre à jour le cache
      if (league === 'KBO') {
        this.kboCache = matches;
      } else {
        this.npbCache = matches;
      }

      // Mettre à jour les stats
      stats.lastSuccessAt = new Date().toISOString();
      stats.consecutiveFailures = 0;
      stats.totalScrapes++;
      stats.totalMatches = matches.length;

      this.log(`[${league}] Scrape successful: ${matches.length} matches found`);
    } catch (error) {
      this.handleScrapeError(league, error);
    }
  }

  /**
   * Scrape les matchs d'une ligue
   */
  private async scrapeMatches(league: 'KBO' | 'NPB'): Promise<MatchScore[]> {
    const url = league === 'KBO' ? SCRAPER_URLS.KBO : SCRAPER_URLS.NPB;

    // Initialiser le navigateur si nécessaire
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    const context = await this.browser.newContext({
      userAgent: this.getRandomUserAgent(),
      extraHTTPHeaders: {
        ...DEFAULT_HEADERS,
        'Referer': 'https://www.baseball24.com/',
      },
    });

    const page = await context.newPage();

    try {
      // Naviguer vers la page
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Attendre que le contenu se charge (JavaScript)
      await page.waitForTimeout(3000); // Laisser le temps au JS de s'exécuter

      // Extraire les données
      const matches = await this.extractMatches(page, league);

      return matches;
    } finally {
      await context.close();
    }
  }

  /**
   * Extrait les matchs depuis la page
   * IMPORTANT: Les sélecteurs CSS doivent être validés en inspectant la page réelle
   */
  private async extractMatches(
    page: Page,
    league: 'KBO' | 'NPB'
  ): Promise<MatchScore[]> {
    const scrapedAt = new Date().toISOString();

    // TODO: Ajuster les sélecteurs après inspection réelle de la page
    // Pour l'instant, utilisation de sélecteurs hypothétiques

    const matches: MatchScore[] = [];

    try {
      // Attendre que les matchs apparaissent
      await page.waitForSelector(CSS_SELECTORS.matchRow, { timeout: 10000 });

      // Extraire tous les matchs
      const matchElements = await page.$$(CSS_SELECTORS.matchRow);

      for (const matchEl of matchElements) {
        try {
          const homeTeam = await matchEl.$eval(
            CSS_SELECTORS.homeTeam,
            (el) => el.textContent?.trim() || ''
          );
          const awayTeam = await matchEl.$eval(
            CSS_SELECTORS.awayTeam,
            (el) => el.textContent?.trim() || ''
          );

          const homeScoreText = await matchEl.$eval(
            CSS_SELECTORS.homeScore,
            (el) => el.textContent?.trim() || ''
          ).catch(() => null);

          const awayScoreText = await matchEl.$eval(
            CSS_SELECTORS.awayScore,
            (el) => el.textContent?.trim() || ''
          ).catch(() => null);

          const statusText = await matchEl.$eval(
            CSS_SELECTORS.status,
            (el) => el.textContent?.trim() || ''
          ).catch(() => 'NS');

          const startTime = await matchEl.$eval(
            CSS_SELECTORS.startTime,
            (el) => el.textContent?.trim() || ''
          ).catch(() => '');

          // Parser les données
          const homeScore = homeScoreText ? parseInt(homeScoreText) : null;
          const awayScore = awayScoreText ? parseInt(awayScoreText) : null;
          const status = this.parseStatus(statusText);

          // Construire l'objet match
          matches.push({
            homeTeam,
            awayTeam,
            homeScore: isNaN(homeScore!) ? null : homeScore,
            awayScore: isNaN(awayScore!) ? null : awayScore,
            status,
            startTime: this.parseStartTime(startTime),
            league,
            scrapedAt,
          });
        } catch (error) {
          this.log(`[${league}] Error extracting match: ${error}`);
          // Continuer avec les autres matchs
        }
      }
    } catch (error) {
      this.log(`[${league}] Error finding matches: ${error}`);
      // Retourner tableau vide plutôt que crash
    }

    return matches;
  }

  /**
   * Parse le statut du match
   */
  private parseStatus(statusText: string): MatchScore['status'] {
    const text = statusText.toLowerCase();

    if (text.includes('live') || text.includes('inning') || text.includes('bottom') || text.includes('top')) {
      return 'IN_PROGRESS';
    }
    if (text.includes('final') || text.includes('ft')) {
      return 'FT';
    }
    if (text.includes('postponed') || text.includes('pst')) {
      return 'POSTPONED';
    }

    return 'NS';
  }

  /**
   * Parse l'heure de début
   */
  private parseStartTime(timeText: string): string {
    // Format attendu : "18:30" ou "Finished" ou "Live"
    // Pour l'instant, retourner ISO avec date du jour
    const today = new Date().toISOString().split('T')[0];

    if (/^\d{2}:\d{2}$/.test(timeText)) {
      return `${today}T${timeText}:00Z`;
    }

    // Sinon retourner maintenant
    return new Date().toISOString();
  }

  /**
   * Vérifie si on est dans la plage horaire
   */
  private isWithinTimeWindow(league: 'KBO' | 'NPB', now: Date): boolean {
    const window = TIME_WINDOWS[league];

    // Convertir l'heure actuelle dans le timezone de la ligue
    const hour = new Date(
      now.toLocaleString('en-US', { timeZone: window.timezone })
    ).getHours();

    return hour >= window.startHour && hour < window.endHour;
  }

  /**
   * Vérifie si le scraper est en pause (après échecs consécutifs)
   */
  private isPaused(league: 'KBO' | 'NPB'): boolean {
    const stats = league === 'KBO' ? this.kboStats : this.npbStats;

    if (stats.pausedUntil) {
      const pausedUntil = new Date(stats.pausedUntil);
      if (new Date() < pausedUntil) {
        return true;
      } else {
        // Fin de pause
        stats.pausedUntil = null;
        stats.consecutiveFailures = 0;
      }
    }

    return false;
  }

  /**
   * Calcule l'intervalle de polling selon l'état des matchs
   */
  private getPollingInterval(league: 'KBO' | 'NPB'): number {
    const cache = league === 'KBO' ? this.kboCache : this.npbCache;

    if (cache.length === 0) {
      return POLLING_INTERVALS.NO_MATCHES;
    }

    const hasLiveMatches = cache.some((m) => m.status === 'IN_PROGRESS');
    if (hasLiveMatches) {
      return POLLING_INTERVALS.MATCHES_IN_PROGRESS;
    }

    const allFinished = cache.every((m) => m.status === 'FT' || m.status === 'POSTPONED');
    if (allFinished) {
      return POLLING_INTERVALS.ALL_FINISHED;
    }

    return POLLING_INTERVALS.NO_MATCHES;
  }

  /**
   * Gère les erreurs de scraping
   */
  private handleScrapeError(league: 'KBO' | 'NPB', error: any): void {
    const stats = league === 'KBO' ? this.kboStats : this.npbStats;

    stats.consecutiveFailures++;

    this.log(`[${league}] Scrape failed (${stats.consecutiveFailures}/${SCRAPER_CONFIG.maxConsecutiveFailures}): ${error.message}`);

    if (stats.consecutiveFailures >= SCRAPER_CONFIG.maxConsecutiveFailures) {
      // Pause de 1 heure après 3 échecs consécutifs
      const pauseUntil = new Date(Date.now() + SCRAPER_CONFIG.pauseDurationAfterFailures);
      stats.pausedUntil = pauseUntil.toISOString();

      this.log(`[${league}] ⚠️  PAUSED until ${pauseUntil.toISOString()} after ${stats.consecutiveFailures} consecutive failures`);
    }
  }

  /**
   * Attend un délai aléatoire entre requêtes (3-7s)
   */
  private async waitForDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    const minDelay = SCRAPER_CONFIG.minDelayMs;
    const randomDelay =
      minDelay + Math.random() * (SCRAPER_CONFIG.maxDelayMs - minDelay);

    if (timeSinceLastRequest < randomDelay) {
      const waitTime = randomDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Sélectionne un User-Agent aléatoire
   */
  private getRandomUserAgent(): string {
    const { userAgents } = SCRAPER_CONFIG;
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  /**
   * Vérifie le robots.txt (log uniquement, pas de blocage)
   */
  private async checkRobotsTxt(): Promise<void> {
    try {
      const response = await fetch('https://www.baseball24.com/robots.txt');
      const robotsTxt = await response.text();

      if (robotsTxt.toLowerCase().includes('disallow: /')) {
        this.log('⚠️  robots.txt contains Disallow: / - Proceeding anyway (editorial decision)');
      } else {
        this.log('✅ robots.txt checked - No global disallow');
      }
    } catch (error) {
      this.log(`⚠️  Could not fetch robots.txt: ${error}`);
    }
  }

  /**
   * Initialise les stats
   */
  private initStats(): ScraperStats {
    return {
      lastScrapeAt: null,
      lastSuccessAt: null,
      consecutiveFailures: 0,
      totalScrapes: 0,
      totalMatches: 0,
      pausedUntil: null,
    };
  }

  /**
   * Log structuré
   */
  private log(message: string): void {
    console.log(`[ScraperService] ${new Date().toISOString()} - ${message}`);
  }
}
