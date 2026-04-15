/**
 * Data Provider Factory
 *
 * Point d'entrée unique pour créer des providers
 * Permet de changer la source de données via config
 */

import { DataProvider } from './DataProvider.interface';
import { APISportsProvider } from './api-sports/APISportsProvider';
import { MLBStatsProvider } from './mlb-stats/MLBStatsProvider';
import { TheSportsDBProvider } from './thesportsdb/TheSportsDBProvider';
import { HybridProvider } from './hybrid/HybridProvider';
import { UnifiedProvider } from './unified/UnifiedProvider';

export type ProviderType = 'api-sports' | 'mlb-stats' | 'thesportsdb' | 'hybrid' | 'unified';

/**
 * Crée un data provider selon le type spécifié
 *
 * @param type - Type de provider à créer
 * @returns Instance du provider
 *
 * @example
 * ```typescript
 * // Utilisation recommandée : unified (100% gratuit)
 * const provider = createDataProvider('unified');
 *
 * // Récupérer les scores du jour
 * const games = await provider.getGames('mlb', new Date());
 *
 * // Récupérer le classement
 * const standings = await provider.getStandings('mlb', 2024);
 * ```
 */
export function createDataProvider(
  type: ProviderType = 'unified'
): DataProvider {
  const apiSportsKey = process.env.API_SPORTS_KEY;

  switch (type) {
    case 'api-sports':
      if (!apiSportsKey) {
        throw new Error('API_SPORTS_KEY environment variable is required');
      }
      return new APISportsProvider(apiSportsKey);

    case 'mlb-stats':
      return new MLBStatsProvider();

    case 'thesportsdb':
      return new TheSportsDBProvider();

    case 'unified':
      // Solution 100% gratuite (recommandée)
      return new UnifiedProvider(
        new MLBStatsProvider(),
        new TheSportsDBProvider()
      );

    case 'hybrid':
      // Legacy : API-Sports payant + MLB Stats
      if (!apiSportsKey) {
        console.warn(
          '[DataProvider] API_SPORTS_KEY not set, falling back to unified provider'
        );
        return new UnifiedProvider(
          new MLBStatsProvider(),
          new TheSportsDBProvider()
        );
      }
      return new HybridProvider(
        new APISportsProvider(apiSportsKey),
        new MLBStatsProvider()
      );

    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

/**
 * Instance singleton du provider par défaut
 * Créée au démarrage de l'application
 */
let defaultProvider: DataProvider | null = null;

/**
 * Récupère l'instance du provider par défaut
 * Crée l'instance si elle n'existe pas
 */
export function getDefaultProvider(): DataProvider {
  if (!defaultProvider) {
    defaultProvider = createDataProvider('unified');
  }
  return defaultProvider;
}

/**
 * Réinitialise le provider par défaut
 * Utile pour les tests
 */
export function resetDefaultProvider(): void {
  defaultProvider = null;
}

// Exports des types et interfaces
export { DataProvider } from './DataProvider.interface';
export * from './types';
export { APISportsProvider } from './api-sports/APISportsProvider';
export { MLBStatsProvider } from './mlb-stats/MLBStatsProvider';
export { TheSportsDBProvider } from './thesportsdb/TheSportsDBProvider';
export { HybridProvider } from './hybrid/HybridProvider';
export { UnifiedProvider } from './unified/UnifiedProvider';
