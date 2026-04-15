/**
 * Cache en mémoire simple pour API-Sports
 * Évite les requêtes répétées inutiles
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Récupère une valeur du cache
   * @returns La valeur ou null si expirée/inexistante
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   * @param key - Clé du cache
   * @param data - Données à stocker
   * @param ttlSeconds - Durée de vie en secondes
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Supprime une clé du cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retourne le nombre d'entrées en cache
   */
  size(): number {
    return this.cache.size;
  }
}
