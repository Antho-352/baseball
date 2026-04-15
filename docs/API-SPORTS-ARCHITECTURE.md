# Architecture API-Sports Baseball

## Décision : Source de données unifiée

**API-Sports Baseball** (`api-sports.io`) remplace TheSportsDB.

### Avantages

✅ **Une seule API pour 3 ligues** : MLB + KBO + NPB
✅ **Cotes bookmakers intégrées** : plus besoin de flux séparés
✅ **Scores live** : latence acceptable
✅ **H2H** (head-to-head) : historique matchs pour pronostics IA
✅ **Données unifiées** : structure JSON cohérente entre ligues

### Inconvénients

❌ **Payant** : nécessite abonnement (prix à vérifier)
❌ **Rate limits** : à documenter selon plan
❌ **Stats avancées MLB** : moins riches que MLB Stats API officielle

---

## Architecture hybride retenue

```
┌─────────────────────────────────────────────────┐
│            DataProvider (abstraction)            │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐        ┌─────────▼─────────┐
│  API-Sports    │        │   MLB Stats API   │
│   (primaire)   │        │   (secondaire)    │
├────────────────┤        ├───────────────────┤
│ • Scores live  │        │ • Stats avancées  │
│ • Classements  │        │   (Sabermetrics)  │
│ • Cotes        │        │ • Blessures       │
│ • H2H          │        │ • Transactions    │
│ • KBO/NPB      │        │                   │
└────────────────┘        └───────────────────┘
```

**Stratégie** :
1. **API-Sports** = source principale pour tous les matchs/scores/cotes
2. **MLB Stats API** = complément pour stats avancées MLB uniquement

---

## Endpoints API-Sports

### Base URL
```
https://v1.baseball.api-sports.io/
```

### Authentication
```http
x-apisports-key: YOUR_API_KEY
```

### Leagues (Ligues disponibles)
```
GET /leagues
```

**Réponse attendue** :
```json
{
  "response": [
    {
      "id": 1,
      "name": "Major League Baseball",
      "type": "League",
      "logo": "https://...",
      "country": {
        "name": "USA",
        "code": "US",
        "flag": "https://..."
      },
      "seasons": [2024, 2023, ...]
    },
    {
      "id": X,
      "name": "Korean Baseball Organization",
      "country": { "name": "South Korea", "code": "KR" }
    },
    {
      "id": Y,
      "name": "Nippon Professional Baseball",
      "country": { "name": "Japan", "code": "JP" }
    }
  ]
}
```

### Games (Matchs)
```
GET /games?league={leagueId}&season=2024&date=2024-04-15
```

**Réponse attendue** :
```json
{
  "response": [
    {
      "id": 12345,
      "date": "2024-04-15T23:05:00+00:00",
      "time": "23:05",
      "timestamp": 1713223500,
      "timezone": "UTC",
      "week": null,
      "status": {
        "long": "Game Finished",
        "short": "FT"
      },
      "league": {
        "id": 1,
        "name": "Major League Baseball",
        "season": 2024
      },
      "country": {
        "id": 2,
        "name": "USA",
        "code": "US"
      },
      "teams": {
        "home": {
          "id": 147,
          "name": "New York Yankees",
          "logo": "https://..."
        },
        "away": {
          "id": 111,
          "name": "Boston Red Sox",
          "logo": "https://..."
        }
      },
      "scores": {
        "home": {
          "total": 5,
          "innings": {
            "1": 1,
            "2": 0,
            "3": 2,
            // ...
          }
        },
        "away": {
          "total": 3,
          "innings": { ... }
        }
      }
    }
  ]
}
```

### Standings (Classements)
```
GET /standings?league={leagueId}&season=2024
```

**Réponse attendue** :
```json
{
  "response": [
    {
      "league": {
        "id": 1,
        "name": "Major League Baseball",
        "season": 2024
      },
      "team": {
        "id": 147,
        "name": "New York Yankees",
        "logo": "https://..."
      },
      "position": 1,
      "games": {
        "played": 50,
        "win": {
          "total": 30,
          "percentage": ".600"
        },
        "lose": {
          "total": 20,
          "percentage": ".400"
        }
      },
      "form": "WWLWW"
    }
  ]
}
```

### Odds (Cotes)
```
GET /odds?game={gameId}
```

**Réponse attendue** :
```json
{
  "response": [
    {
      "game": {
        "id": 12345
      },
      "bookmakers": [
        {
          "id": 5,
          "name": "Betclic",
          "bets": [
            {
              "id": 1,
              "name": "Home/Away",
              "values": [
                {
                  "value": "Home",
                  "odd": "1.85"
                },
                {
                  "value": "Away",
                  "odd": "2.10"
                }
              ]
            },
            {
              "id": 2,
              "name": "Over/Under",
              "values": [
                {
                  "value": "Over 8.5",
                  "odd": "1.90"
                },
                {
                  "value": "Under 8.5",
                  "odd": "1.90"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### H2H (Head to Head)
```
GET /games/h2h?h2h={team1Id}-{team2Id}
```

**Utilité** : Historique des confrontations pour pronostics IA.

---

## DataProvider - Abstraction

### Principe

**Pattern Strategy** : abstraction permettant de changer de source sans refactoring.

### Structure fichiers

```
backend/src/services/data-provider/
├── index.ts                        # Factory + exports
├── DataProvider.interface.ts       # Interface commune
├── types.ts                        # Types TypeScript
├── api-sports/
│   ├── APISportsProvider.ts       # Implémentation API-Sports
│   ├── api-sports-client.ts       # HTTP client
│   ├── mappers.ts                 # Mapping API → nos types
│   └── cache.ts                   # Cache en mémoire
├── mlb-stats/
│   ├── MLBStatsProvider.ts        # Implémentation MLB Stats API
│   ├── mlb-api-client.ts
│   └── mappers.ts
└── hybrid/
    └── HybridProvider.ts           # Combine API-Sports + MLB Stats
```

### Interface DataProvider

```typescript
// DataProvider.interface.ts

export interface Game {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  gameDate: Date;
  status: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  // API-Sports specific
  apiGameId?: string;
}

export interface Standing {
  teamId: string;
  leagueId: string;
  season: number;
  position: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winPercentage: number;
  form?: string; // "WWLWW"
}

export interface Odds {
  gameId: string;
  bookmaker: string;
  homeWin: number;
  awayWin: number;
  overUnderLine?: number;
  overOdds?: number;
  underOdds?: number;
  fetchedAt: Date;
}

export interface H2HResult {
  gameId: string;
  gameDate: Date;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}

export interface DataProvider {
  /**
   * Récupère les matchs d'une ligue pour une date donnée
   */
  getGames(leagueId: string, date: Date): Promise<Game[]>;

  /**
   * Récupère un match spécifique
   */
  getGame(gameId: string): Promise<Game | null>;

  /**
   * Récupère le classement d'une ligue
   */
  getStandings(leagueId: string, season: number): Promise<Standing[]>;

  /**
   * Récupère les cotes d'un match
   */
  getOdds(gameId: string): Promise<Odds[]>;

  /**
   * Récupère l'historique H2H entre 2 équipes
   */
  getH2H(team1Id: string, team2Id: string, limit?: number): Promise<H2HResult[]>;

  /**
   * Identifiant du provider (pour logs)
   */
  getProviderName(): string;
}
```

### Implémentation API-Sports

```typescript
// api-sports/APISportsProvider.ts

import { DataProvider, Game, Standing, Odds, H2HResult } from '../DataProvider.interface';
import { APISportsClient } from './api-sports-client';
import { mapGame, mapStanding, mapOdds } from './mappers';
import { CacheManager } from './cache';

export class APISportsProvider implements DataProvider {
  private client: APISportsClient;
  private cache: CacheManager;

  constructor(apiKey: string) {
    this.client = new APISportsClient(apiKey);
    this.cache = new CacheManager();
  }

  getProviderName(): string {
    return 'API-Sports Baseball';
  }

  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    const cacheKey = `games:${leagueId}:${date.toISOString().split('T')[0]}`;
    const cached = this.cache.get<Game[]>(cacheKey);
    if (cached) return cached;

    const apiLeagueId = this.mapLeagueId(leagueId);
    const dateStr = date.toISOString().split('T')[0];

    const response = await this.client.get('/games', {
      league: apiLeagueId,
      season: date.getFullYear(),
      date: dateStr
    });

    const games = response.response.map((g: any) => mapGame(g, leagueId));

    this.cache.set(cacheKey, games, 300); // 5min cache
    return games;
  }

  async getGame(gameId: string): Promise<Game | null> {
    const apiGameId = this.extractApiGameId(gameId);

    const response = await this.client.get('/games', {
      id: apiGameId
    });

    if (!response.response || response.response.length === 0) {
      return null;
    }

    return mapGame(response.response[0], this.extractLeagueFromGameId(gameId));
  }

  async getStandings(leagueId: string, season: number): Promise<Standing[]> {
    const cacheKey = `standings:${leagueId}:${season}`;
    const cached = this.cache.get<Standing[]>(cacheKey);
    if (cached) return cached;

    const apiLeagueId = this.mapLeagueId(leagueId);

    const response = await this.client.get('/standings', {
      league: apiLeagueId,
      season
    });

    const standings = response.response.map((s: any) => mapStanding(s, leagueId));

    this.cache.set(cacheKey, standings, 3600); // 1h cache
    return standings;
  }

  async getOdds(gameId: string): Promise<Odds[]> {
    const apiGameId = this.extractApiGameId(gameId);

    const response = await this.client.get('/odds', {
      game: apiGameId
    });

    if (!response.response || response.response.length === 0) {
      return [];
    }

    return mapOdds(response.response[0], gameId);
  }

  async getH2H(team1Id: string, team2Id: string, limit: number = 10): Promise<H2HResult[]> {
    const apiTeam1Id = this.extractApiTeamId(team1Id);
    const apiTeam2Id = this.extractApiTeamId(team2Id);

    const response = await this.client.get('/games/h2h', {
      h2h: `${apiTeam1Id}-${apiTeam2Id}`,
      last: limit
    });

    return response.response.map((g: any) => ({
      gameId: `${this.extractLeagueFromTeamId(team1Id)}-${g.id}`,
      gameDate: new Date(g.date),
      homeTeamId: this.mapTeamId(g.teams.home.id),
      awayTeamId: this.mapTeamId(g.teams.away.id),
      homeScore: g.scores.home.total,
      awayScore: g.scores.away.total
    }));
  }

  // Helpers privés
  private mapLeagueId(ourLeagueId: string): string {
    const mapping: Record<string, string> = {
      'mlb': '1',
      'kbo': 'X', // À déterminer après test API
      'npb': 'Y'  // À déterminer après test API
    };
    return mapping[ourLeagueId] || '1';
  }

  private extractApiGameId(ourGameId: string): string {
    // 'mlb-2024-04-15-12345' → '12345'
    return ourGameId.split('-').pop() || '';
  }

  private extractLeagueFromGameId(gameId: string): string {
    // 'mlb-2024-04-15-12345' → 'mlb'
    return gameId.split('-')[0];
  }

  private extractApiTeamId(ourTeamId: string): string {
    // 'mlb-nya' → requête BDD pour récupérer api_team_id
    // Pour l'instant, retourner l'ID hardcodé
    return '147'; // Exemple
  }

  private extractLeagueFromTeamId(teamId: string): string {
    return teamId.split('-')[0];
  }

  private mapTeamId(apiTeamId: number): string {
    // Inverse mapping (nécessite cache ou BDD)
    return `mlb-${apiTeamId}`;
  }
}
```

### Factory Pattern

```typescript
// index.ts

import { DataProvider } from './DataProvider.interface';
import { APISportsProvider } from './api-sports/APISportsProvider';
import { MLBStatsProvider } from './mlb-stats/MLBStatsProvider';
import { HybridProvider } from './hybrid/HybridProvider';

export function createDataProvider(type: 'api-sports' | 'mlb-stats' | 'hybrid'): DataProvider {
  const apiSportsKey = process.env.API_SPORTS_KEY;

  switch (type) {
    case 'api-sports':
      if (!apiSportsKey) throw new Error('API_SPORTS_KEY not configured');
      return new APISportsProvider(apiSportsKey);

    case 'mlb-stats':
      return new MLBStatsProvider();

    case 'hybrid':
      if (!apiSportsKey) throw new Error('API_SPORTS_KEY not configured');
      return new HybridProvider(
        new APISportsProvider(apiSportsKey),
        new MLBStatsProvider()
      );

    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

// Usage dans l'app
const provider = createDataProvider('hybrid');
const games = await provider.getGames('mlb', new Date());
```

---

## HybridProvider (Recommandé)

Combine API-Sports (primaire) + MLB Stats API (complément stats avancées).

```typescript
// hybrid/HybridProvider.ts

export class HybridProvider implements DataProvider {
  constructor(
    private apiSports: APISportsProvider,
    private mlbStats: MLBStatsProvider
  ) {}

  getProviderName(): string {
    return 'Hybrid (API-Sports + MLB Stats)';
  }

  // Délégation à API-Sports pour scores/cotes
  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    return this.apiSports.getGames(leagueId, date);
  }

  async getOdds(gameId: string): Promise<Odds[]> {
    return this.apiSports.getOdds(gameId);
  }

  async getH2H(team1Id: string, team2Id: string, limit?: number): Promise<H2HResult[]> {
    return this.apiSports.getH2H(team1Id, team2Id, limit);
  }

  // Stats avancées MLB → MLB Stats API
  async getPlayerStats(playerId: string, season: number): Promise<any> {
    if (playerId.startsWith('mlb-')) {
      return this.mlbStats.getPlayerStats(playerId, season);
    }
    // KBO/NPB : pas de stats avancées (API-Sports insuffisant)
    return null;
  }
}
```

---

## Actions immédiates

### 1. Inscription API-Sports

**URL** : https://dashboard.api-sports.io/register

**Plan à choisir** : (à vérifier pricing)
- Gratuit ? (limite requêtes/jour)
- Basic ~20-50$/mois ?
- Pro ~100$/mois ?

### 2. Tests KBO/NPB

**Une fois clé API valide**, tester :
```bash
# KBO games
curl -H "x-apisports-key: YOUR_KEY" \
  "https://v1.baseball.api-sports.io/games?league=X&season=2024&date=2024-04-15"

# NPB standings
curl -H "x-apisports-key: YOUR_KEY" \
  "https://v1.baseball.api-sports.io/standings?league=Y&season=2024"

# Odds
curl -H "x-apisports-key: YOUR_KEY" \
  "https://v1.baseball.api-sports.io/odds?game=12345"
```

**Documenter** :
- Qualité des données (complétude, fraîcheur)
- Rate limits réels
- Latence API
- IDs des ligues KBO/NPB

### 3. Mise à jour architecture

**Fichiers à modifier** :
- `CLAUDE.md` : remplacer TheSportsDB par API-Sports
- `API-SOURCES.md` : ajouter section API-Sports complète
- Créer `backend/src/services/data-provider/` avec l'abstraction

---

## Tu as une clé API-Sports valide ou il faut s'inscrire maintenant ?

Si inscription nécessaire, je prépare le code en attendant la clé.
