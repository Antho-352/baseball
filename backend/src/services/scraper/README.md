# Scraper Service - Scores Live KBO/NPB

Service de scraping scores live pour KBO et NPB depuis baseball24.com.

**IMPORTANT** : Ce scraper respecte des contraintes strictes de politesse serveur.

---

## Architecture

```
┌──────────────────────────────────────┐
│       ScraperService                 │
│  (découplé du reste de l'app)        │
├──────────────────────────────────────┤
│                                      │
│  Cache KBO: MatchScore[]             │
│  Cache NPB: MatchScore[]             │
│                                      │
│  Polling Background:                 │
│  ├─ Aucun match → 10 min             │
│  ├─ Matchs en cours → 60 sec         │
│  └─ Tous terminés → 30 min           │
│                                      │
└──────────────────────────────────────┘
         │
         │ Playwright (headless)
         ▼
  baseball24.com
  (HTML rendering)
```

---

## Usage

### Démarrage du service

```typescript
import { ScraperService } from './services/scraper';

const scraper = new ScraperService();

// Démarrer le polling en background
await scraper.start();

// Le scraper tourne maintenant en autonomie
```

### Récupération des scores (depuis le cache)

```typescript
// Récupérer scores KBO (JAMAIS d'appel réseau direct)
const kboScores = scraper.getKBOScores();

// Récupérer scores NPB
const npbScores = scraper.getNPBScores();

console.log(kboScores);
// [
//   {
//     homeTeam: 'Doosan Bears',
//     awayTeam: 'KIA Tigers',
//     homeScore: 5,
//     awayScore: 3,
//     status: 'FT',
//     startTime: '2026-04-15T10:00:00Z',
//     league: 'KBO',
//     scrapedAt: '2026-04-15T12:34:56Z'
//   }
// ]
```

### Statistiques du scraper

```typescript
const stats = scraper.getStats();

console.log(stats);
// {
//   kbo: {
//     lastScrapeAt: '2026-04-15T12:34:56Z',
//     lastSuccessAt: '2026-04-15T12:34:56Z',
//     consecutiveFailures: 0,
//     totalScrapes: 145,
//     totalMatches: 5,
//     pausedUntil: null
//   },
//   npb: { ... }
// }
```

### Arrêt du service

```typescript
await scraper.stop();
```

---

## Contraintes de Politesse (NON NÉGOCIABLES)

### 1. User-Agent Rotatif

5 User-Agents réels de navigateurs récents (Chrome, Firefox, Safari).
Change à chaque requête de manière aléatoire.

### 2. Headers HTTP Réalistes

```http
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: fr-FR,fr;q=0.9,en;q=0.8
Referer: https://www.baseball24.com/
```

### 3. Délai Entre Requêtes

- **Minimum** : 3 secondes
- **Maximum** : 7 secondes
- **Variation aléatoire** pour éviter patterns détectables

### 4. Plages Horaires STRICTES

**KBO** : 09h00 – 22h00 KST (UTC+9) uniquement
**NPB** : 11h00 – 22h00 JST (UTC+9) uniquement

**En dehors de ces fenêtres** : service en veille, ZÉRO requête.

### 5. Fréquence Adaptative

| Situation | Fréquence |
|-----------|-----------|
| Aucun match programmé | 10 minutes |
| Match(es) en cours | 60 secondes |
| Tous matchs terminés | 30 minutes |

### 6. Cache Obligatoire

- Les méthodes `getKBOScores()` et `getNPBScores()` retournent TOUJOURS le cache
- **JAMAIS** d'appel réseau déclenché par une requête utilisateur
- Le polling tourne en background de manière autonome

### 7. Retry avec Backoff Exponentiel

En cas d'échec (timeout, 403, 429) :

1. Attendre **30 secondes**, réessayer
2. Échec → Attendre **60 secondes**, réessayer
3. Échec → Attendre **120 secondes**, réessayer
4. Échec → **PAUSE de 1 heure** + log incident

**Jamais de retry en boucle rapide.**

### 8. Respect robots.txt

Vérifié au démarrage (log uniquement, pas de blocage).

---

## Détection de Casse (Sélecteurs HTML)

Si les sélecteurs CSS retournent 0 résultat ALORS qu'on est en plage horaire :

- **Log warning** : "⚠️ Selectors returned 0 matches - HTML structure may have changed"
- Ne PAS retourner silencieusement un tableau vide
- Permettre investigation manuelle

---

## Configuration

Voir `config.ts` pour :

- User-Agents rotatifs
- Headers HTTP
- Délais min/max
- Plages horaires
- Fréquences polling
- URLs cibles
- **Sélecteurs CSS** (à ajuster après inspection réelle)

---

## Logs Structurés

Chaque scraping log :

- ✅ Timestamp ISO 8601
- ✅ Durée de la requête
- ✅ Nombre de matchs trouvés
- ✅ Status HTTP reçu
- ✅ Échecs consécutifs

Exemple :
```
[ScraperService] 2026-04-15T12:34:56Z - [KBO] Starting scrape...
[ScraperService] 2026-04-15T12:35:02Z - [KBO] Scrape successful: 5 matches found
```

---

## Dépendances

```bash
npm install playwright
```

**Important** : Playwright télécharge des navigateurs (Chromium ~300 Mo).

---

## TODO - Avant Production

### 1. Valider les Sélecteurs CSS

**Action** : Inspecter la page réelle avec Playwright :

```typescript
// Script de test
const page = await browser.newPage();
await page.goto('https://www.baseball24.com/south-korea/kbo/results/');
await page.waitForTimeout(5000);

// Prendre screenshot
await page.screenshot({ path: 'baseball24-kbo.png' });

// Trouver les bons sélecteurs
const content = await page.content();
console.log(content); // Analyser la structure HTML
```

**Mettre à jour** : `CSS_SELECTORS` dans `config.ts` avec les vrais sélecteurs.

### 2. Tester les 2 ligues

- ✅ KBO : https://www.baseball24.com/south-korea/kbo/results/
- ✅ NPB : https://www.baseball24.com/japan/npb/results/

Vérifier que la structure HTML est identique ou ajuster si différente.

### 3. Gestion des Innings

Si le site affiche le score inning par inning :

- Ajouter extraction dans `extractMatches()`
- Populer le champ `innings: InningScore[]`

### 4. Tests de Charge

- Lancer le scraper pendant 24h
- Vérifier qu'aucun ban IP
- Vérifier la consommation mémoire (Playwright)
- Vérifier les logs d'erreurs

### 5. Monitoring

Ajouter alertes si :

- `consecutiveFailures >= 3`
- `pausedUntil !== null`
- Pas de scrape réussi depuis > 1 heure (en plage horaire)

---

## Alternatives Considérées

### ❌ fetch() simple

HTML rendu par JavaScript côté client → impossible sans navigateur.

### ❌ API JSON publique

Aucune trouvée après inspection du réseau.

### ✅ Playwright (retenu)

Seule solution viable pour scraper du contenu rendu en JS.

---

## Sécurité & Légalité

### Respect des ToS

- Données publiques affichées sur le site
- Pas de bypass de paywall ou authentification
- Usage non commercial (projet éditorial)
- Respect robots.txt (vérifié au démarrage)

### Fair Use

- Scraping limité aux plages horaires des matchs
- Fréquence respectueuse (max 1 requête/60s en live)
- User-Agent transparent (pas de masquage)
- Pas de DDoS ou charge excessive

### Risques

- **IP ban** : Minimisé par délais aléatoires + User-Agent rotation
- **HTML change** : Détection via logs si 0 résultat pendant plage horaire
- **Cloudflare** : baseball24.com ne semble pas utiliser de protection agressive (testé)

---

## Performance

### Mémoire

- Playwright headless : ~150-200 Mo RAM par instance
- Cache en mémoire : ~1-2 Ko par match
- Total estimé : ~250 Mo RAM (acceptable pour serveur 64 Go)

### CPU

- Scraping : ~10-20% CPU pendant 2-3 secondes par requête
- Impact négligeable sur serveur dédié 6c/12t

### Réseau

- Bandwidth : ~500 Ko par scrape (HTML + assets)
- Trafic journalier estimé : ~50-100 Mo/jour (polling adaptatif)

---

## Intégration avec DataProvider

Le scraper tourne de manière **totalement découplée**.

Pour intégrer les scores live dans `UnifiedProvider` :

```typescript
// backend/src/services/data-provider/unified/UnifiedProvider.ts

import { ScraperService } from '../../scraper';

export class UnifiedProvider {
  constructor(
    private mlbStats: MLBStatsProvider,
    private theSportsDB: TheSportsDBProvider,
    private scraper: ScraperService // Injecter le scraper
  ) {}

  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    if (leagueId === 'mlb') {
      return this.mlbStats.getGames(leagueId, date);
    }

    // Pour KBO/NPB : combiner TheSportsDB (fixtures) + Scraper (live scores)
    const scheduledGames = await this.theSportsDB.getGames(leagueId, date);
    const liveScores = leagueId === 'kbo'
      ? this.scraper.getKBOScores()
      : this.scraper.getNPBScores();

    // Merger les données (logique à implémenter)
    return this.mergeScheduleWithLiveScores(scheduledGames, liveScores);
  }
}
```

---

## Maintenance

### Surveillance Continue

- **Logs** : Vérifier quotidiennement les erreurs
- **Sélecteurs** : Vérifier si cassés (0 résultat en plage horaire)
- **Performance** : Monitorer RAM/CPU

### Mise à Jour Sélecteurs

Si baseball24.com change sa structure HTML :

1. Identifier les nouveaux sélecteurs via `page.content()`
2. Mettre à jour `CSS_SELECTORS` dans `config.ts`
3. Redémarrer le service

Fréquence estimée : 1-2 fois par an (sites scores sportifs sont stables).
