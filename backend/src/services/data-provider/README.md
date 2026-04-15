# Data Provider Service

Abstraction pour les sources de données baseball (MLB, KBO, NPB).

Pattern Strategy permettant de changer de source sans refactoring du code applicatif.

---

## Architecture (Solution 100% Gratuite)

```
┌─────────────────────────────────────────────────┐
│            DataProvider (interface)              │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐        ┌─────────▼─────────┐
│  MLB Stats API │        │  TheSportsDB      │
│   (gratuit)    │        │   (free tier)     │
├────────────────┤        ├───────────────────┤
│ • MLB scores   │        │ • KBO/NPB teams   │
│ • Classements  │        │ • Fixtures        │
│ • Stats adv.   │        │ • Résultats       │
│ • Gratuit      │        │ • Clé: 123        │
└────────────────┘        └───────────────────┘
        │                           │
        └─────────────┬─────────────┘
                      │
              ┌───────▼────────┐
              │UnifiedProvider │
              │  (recommandé)  │
              │   Coût: 0€     │
              └────────────────┘
```

---

## Installation

```bash
npm install
```

### Variables d'environnement

```bash
# .env

# TheSportsDB (free tier - pas besoin de config, clé hardcodée = "123")
# Aucune config nécessaire

# MLB Stats API (officielle gratuite)
# Aucune config nécessaire

# API-Sports (optionnel, payant, legacy)
# API_SPORTS_KEY=your_key_here
```

---

## Usage

### 1. Créer un provider

```typescript
import { createDataProvider } from './services/data-provider';

// Provider unifié - 100% gratuit (recommandé)
const provider = createDataProvider('unified');

// Ou providers spécifiques
const mlbStats = createDataProvider('mlb-stats');      // MLB uniquement
const theSportsDB = createDataProvider('thesportsdb'); // KBO/NPB uniquement

// Legacy (API-Sports payant)
const apiSports = createDataProvider('api-sports');    // Nécessite clé API payante
```

### 2. Récupérer des matchs

```typescript
// Matchs du jour pour MLB
const today = new Date();
const games = await provider.getGames('mlb', today);

console.log(games);
// [
//   {
//     id: 'mlb-746136',
//     leagueId: 'mlb',
//     homeTeamId: 'mlb-147',
//     awayTeamId: 'mlb-111',
//     gameDate: 2024-04-15T23:05:00.000Z,
//     status: 'final',
//     homeScore: 5,
//     awayScore: 3,
//     ...
//   }
// ]
```

### 3. Récupérer le classement

```typescript
const standings = await provider.getStandings('mlb', 2024);

console.log(standings);
// [
//   {
//     teamId: 'mlb-147',
//     position: 1,
//     wins: 30,
//     losses: 20,
//     winPercentage: 0.600,
//     gamesBehind: 0,
//     ...
//   }
// ]
```

### 4. Récupérer les cotes

```typescript
const odds = await provider.getOdds('mlb-746136');

console.log(odds);
// [
//   {
//     gameId: 'mlb-746136',
//     bookmaker: 'Betclic',
//     homeWin: 1.85,
//     awayWin: 2.10,
//     overUnderLine: 8.5,
//     overOdds: 1.90,
//     underOdds: 1.90,
//     ...
//   }
// ]
```

### 5. Récupérer H2H

```typescript
const h2h = await provider.getH2H('mlb-147', 'mlb-111', 10);

console.log(h2h);
// [
//   {
//     gameId: 'mlb-746100',
//     gameDate: 2024-04-10T...,
//     homeTeamId: 'mlb-147',
//     awayTeamId: 'mlb-111',
//     homeScore: 7,
//     awayScore: 4,
//     winner: 'home'
//   }
// ]
```

### 6. Stats joueurs (MLB uniquement)

```typescript
// Avec HybridProvider
const stats = await provider.getPlayerStats('mlb-660271', 2024);

console.log(stats);
// {
//   playerId: 'mlb-660271',
//   season: 2024,
//   statType: 'batting',
//   gamesPlayed: 50,
//   atBats: 180,
//   hits: 54,
//   homeRuns: 12,
//   battingAvg: 0.300,
//   ...
// }
```

---

## Fallback automatique (HybridProvider)

Si API-Sports échoue pour MLB, fallback automatique vers MLB Stats API :

```typescript
const provider = createDataProvider('hybrid');

// Essaie API-Sports, si échec → MLB Stats API (pour MLB seulement)
const games = await provider.getGamesWithFallback('mlb', new Date());
const standings = await provider.getStandingsWithFallback('mlb', 2024);
```

**KBO/NPB** : Pas de fallback (MLB Stats API ne couvre pas ces ligues).

---

## Cache

Cache en mémoire automatique (voir `cache.ts`) :

- **Games** : 5 minutes (données live)
- **Standings** : 1 heure (changent moins fréquemment)
- **Odds** : Pas de cache (fetch en temps réel)

### Vider le cache

```typescript
import { APISportsProvider } from './services/data-provider';

const provider = new APISportsProvider(apiKey);
provider.cache.clear();
```

---

## Mapping League IDs

### Nos IDs internes
- `mlb` → Major League Baseball
- `kbo` → Korean Baseball Organization
- `npb` → Nippon Professional Baseball

### IDs API-Sports (à confirmer)
- `mlb` → `1`
- `kbo` → `TBD` ⚠️
- `npb` → `TBD` ⚠️

**Action** : Tester avec API-Sports une fois l'authentification résolue.

```typescript
// Mettre à jour le mapping après test
const provider = new APISportsProvider(apiKey);
provider.updateLeagueMapping('kbo', '5'); // Exemple
provider.updateLeagueMapping('npb', '7'); // Exemple
```

---

## Types TypeScript

Tous les types sont exportés :

```typescript
import {
  Game,
  Standing,
  Odds,
  H2HResult,
  PlayerStats,
  Team,
  Player,
  DataProvider
} from './services/data-provider';
```

---

## Tests

```bash
# Tests unitaires (TODO)
npm test

# Test manuel avec curl
curl -H "x-apisports-key: YOUR_KEY" \
  "https://v1.baseball.api-sports.io/games?league=1&season=2024&date=2024-04-15"
```

---

## Troubleshooting

### Erreur "API_SPORTS_KEY not configured"

**Solution** : Ajouter `API_SPORTS_KEY=...` dans `.env`

### Erreur "Missing application key" (API-Sports)

**Cause** : Clé API invalide ou baseball pas activé sur le compte.

**Solution** : Vérifier dashboard API-Sports → Sports activés.

**Workaround** : Utiliser `mlb-stats` provider uniquement pour MVP MLB :
```typescript
const provider = createDataProvider('mlb-stats');
```

### Aucun résultat pour KBO/NPB

**Cause** : League IDs pas configurés ou API-Sports pas activé.

**Solution** : Voir `/docs/API-SPORTS-STATUS.md`

---

## Roadmap

- [x] Interface DataProvider
- [x] APISportsProvider (MLB + KBO + NPB)
- [x] MLBStatsProvider (MLB uniquement)
- [x] HybridProvider (fallback auto)
- [x] Cache en mémoire
- [x] Mappers complets
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration
- [ ] League IDs mapping KBO/NPB confirmés
- [ ] Retry logic + exponential backoff
- [ ] Metrics/logging (Prometheus?)

---

## Références

- **API-Sports Baseball** : https://api-sports.io/documentation/baseball/v1
- **MLB Stats API** : https://statsapi.mlb.com/docs/
- **Status tests** : `/docs/API-SPORTS-STATUS.md`
- **Architecture** : `/docs/API-SPORTS-ARCHITECTURE.md`
