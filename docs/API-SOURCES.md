# Sources de Données - APIs Externes

## Vue d'ensemble

**3 sources de données** :
1. **MLB Stats API** (officiel, gratuit) → MLB
2. **TheSportsDB** (freemium) → KBO + NPB
3. **Bookmakers APIs** (via programmes affiliation) → Cotes

---

## 1. MLB Stats API (Officiel)

### Informations générales

- **Base URL** : `https://statsapi.mlb.com/api/v1/`
- **Documentation** : https://github.com/toddrob99/MLB-StatsAPI/wiki/Endpoints
- **Auth** : Aucune (API publique)
- **Rate Limit** : Aucun connu (usage fair-use)
- **Format** : JSON
- **Fiabilité** : ★★★★★ (source officielle MLB)

### Endpoints critiques

#### Teams (Équipes)
```
GET /teams?sportId=1&season=2024
```

**Réponse** (structure simplifiée) :
```json
{
  "teams": [
    {
      "id": 147,
      "name": "New York Yankees",
      "teamCode": "nya",
      "fileCode": "nyy",
      "abbreviation": "NYY",
      "teamName": "Yankees",
      "locationName": "Bronx",
      "firstYearOfPlay": "1903",
      "league": {
        "id": 103,
        "name": "American League"
      },
      "division": {
        "id": 201,
        "name": "American League East"
      },
      "venue": {
        "id": 3313,
        "name": "Yankee Stadium"
      },
      "shortName": "NY Yankees",
      "franchiseName": "New York",
      "clubName": "Yankees",
      "active": true
    }
  ]
}
```

**Mapping vers notre BDD** :
```typescript
{
  id: `mlb-${team.teamCode}`, // 'mlb-nya'
  league_id: 'mlb',
  name: team.name,
  slug: slugify(team.name), // 'new-york-yankees'
  short_name: team.teamName,
  api_team_id: team.id.toString(),
  division: team.division.name,
  city: team.locationName,
  stadium: team.venue.name,
  founded_year: parseInt(team.firstYearOfPlay)
}
```

#### Players (Joueurs)
```
GET /teams/{teamId}/roster?rosterType=active&season=2024
```

**Réponse** :
```json
{
  "roster": [
    {
      "person": {
        "id": 660271,
        "fullName": "Shohei Ohtani",
        "link": "/api/v1/people/660271"
      },
      "jerseyNumber": "17",
      "position": {
        "code": "Y",
        "name": "Two-Way Player",
        "type": "Two-Way Player",
        "abbreviation": "TWP"
      },
      "status": {
        "code": "A",
        "description": "Active"
      }
    }
  ]
}
```

**Détails joueur** :
```
GET /people/{personId}
```

```json
{
  "people": [{
    "id": 660271,
    "fullName": "Shohei Ohtani",
    "firstName": "Shohei",
    "lastName": "Ohtani",
    "primaryNumber": "17",
    "birthDate": "1994-07-05",
    "birthCity": "Oshu",
    "birthCountry": "Japan",
    "height": "6' 4\"",
    "weight": 210,
    "primaryPosition": {
      "code": "Y",
      "name": "Two-Way Player",
      "type": "Two-Way Player",
      "abbreviation": "TWP"
    },
    "batSide": {
      "code": "L",
      "description": "Left"
    },
    "pitchHand": {
      "code": "R",
      "description": "Right"
    },
    "draftYear": 2012
  }]
}
```

#### Games (Matchs)
```
GET /schedule?sportId=1&startDate=2024-04-15&endDate=2024-04-15
```

**Réponse** :
```json
{
  "dates": [{
    "date": "2024-04-15",
    "games": [{
      "gamePk": 746936,
      "gameDate": "2024-04-15T23:05:00Z",
      "status": {
        "abstractGameState": "Final",
        "detailedState": "Final"
      },
      "teams": {
        "away": {
          "team": {
            "id": 147,
            "name": "New York Yankees"
          },
          "score": 5
        },
        "home": {
          "team": {
            "id": 111,
            "name": "Boston Red Sox"
          },
          "score": 3
        }
      },
      "venue": {
        "id": 3,
        "name": "Fenway Park"
      },
      "weather": {
        "condition": "Sunny",
        "temp": "72"
      }
    }]
  }]
}
```

#### Standings (Classements)
```
GET /standings?leagueId=103,104&season=2024
```

#### Player Stats (Statistiques)
```
GET /people/{personId}/stats?stats=season&season=2024&group=hitting
GET /people/{personId}/stats?stats=season&season=2024&group=pitching
```

#### Injuries (Blessures)
```
GET /team/{teamId}/injuries
```

### Couleurs équipes
**Pas dans l'API officielle** → récupération manuelle ou via source tierce.

**Solution** : hardcoder les couleurs des 30 équipes MLB (ne changent jamais).

```typescript
const MLB_TEAM_COLORS = {
  'nya': { primary: '#003087', secondary: '#E4002B' }, // Yankees
  'bos': { primary: '#BD3039', secondary: '#0C2340' }, // Red Sox
  // ... 28 autres équipes
};
```

---

## 2. TheSportsDB (KBO + NPB)

### Informations générales

- **Base URL** : `https://www.thesportsdb.com/api/v1/json/{API_KEY}/`
- **Documentation** : https://www.thesportsdb.com/api.php
- **Auth** : API Key (gratuit = 1 key, payant ~9$/mois = live scores)
- **Rate Limit** :
  - Gratuit : 60 req/min
  - Payant : 100 req/min
- **Format** : JSON
- **Fiabilité** : ★★★☆☆ (données communautaires, qualité variable)

### Endpoints

#### Leagues
```
GET /search_all_leagues.php?c=South%20Korea
GET /search_all_leagues.php?c=Japan
```

#### Teams
```
GET /search_all_teams.php?l=Korean%20Baseball%20Organization
GET /search_all_teams.php?l=Nippon%20Professional%20Baseball
```

**Réponse** :
```json
{
  "teams": [{
    "idTeam": "135281",
    "strTeam": "Lotte Giants",
    "strAlternate": "롯데 자이언츠",
    "strLeague": "Korean Baseball Organization",
    "strStadium": "Sajik Baseball Stadium",
    "strTeamBadge": "https://www.thesportsdb.com/images/media/team/badge/...",
    "strDescriptionEN": "...",
    "strCountry": "South Korea"
  }]
}
```

#### Games / Events
```
GET /eventsday.php?d=2024-04-15&l=Korean%20Baseball%20Organization
```

**Réponse** :
```json
{
  "events": [{
    "idEvent": "1234567",
    "strEvent": "Lotte Giants vs Doosan Bears",
    "strHomeTeam": "Lotte Giants",
    "strAwayTeam": "Doosan Bears",
    "intHomeScore": "5",
    "intAwayScore": "3",
    "strStatus": "FT",
    "dateEvent": "2024-04-15",
    "strTime": "18:30:00"
  }]
}
```

#### Standings
```
GET /lookuptable.php?l=4424&s=2024
```

**PROBLÈME identifié** : TheSportsDB ne fournit PAS de stats joueurs détaillées (batting avg, ERA, etc.).

**Impact** : Pages joueurs KBO/NPB seront moins riches que MLB en V1.

**Solution V2** : trouver une API spécialisée KBO/NPB ou scraping officiel.

---

## 3. Bookmakers APIs (Cotes)

### Structure attendue

**Flux XML ou JSON** fourni par les programmes d'affiliation.

**Exemple hypothétique (Betclic)** :
```json
{
  "sport": "baseball",
  "league": "MLB",
  "events": [{
    "id": "mlb-2024-04-15-yankees-redsox",
    "start_time": "2024-04-15T23:05:00Z",
    "home_team": "Boston Red Sox",
    "away_team": "New York Yankees",
    "markets": {
      "moneyline": {
        "home": 2.10,
        "away": 1.85
      },
      "total": {
        "line": 8.5,
        "over": 1.90,
        "under": 1.90
      }
    }
  }]
}
```

**À valider** : structure réelle dépend de chaque opérateur (Betclic, Unibet, Winamax).

---

## Architecture d'abstraction

### Principe

**Une interface commune** pour chaque type de données, implémentée différemment par source.

### Structure de fichiers

```
backend/src/services/data-sources/
├── index.ts                    # Exports + factory
├── types.ts                    # Interfaces TypeScript
├── mlb/
│   ├── MLBDataSource.ts       # Implémentation MLB
│   └── mlb-api.ts             # Helpers appels API
├── kbo/
│   ├── KBODataSource.ts
│   └── thesportsdb-api.ts
├── npb/
│   ├── NPBDataSource.ts
│   └── thesportsdb-api.ts
└── bookmakers/
    ├── BetclicAPI.ts
    ├── UnibetAPI.ts
    └── WinamaxAPI.ts
```

### Interfaces TypeScript

```typescript
// types.ts

export interface Team {
  id: string;
  leagueId: string;
  name: string;
  slug: string;
  shortName?: string;
  logoUrl?: string;
  division?: string;
  city?: string;
  stadium?: string;
  foundedYear?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Player {
  id: string;
  teamId?: string;
  name: string;
  slug: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  jerseyNumber?: number;
  birthDate?: Date;
  height?: number;  // cm
  weight?: number;  // kg
  bats?: 'R' | 'L' | 'S';
  throws?: 'R' | 'L';
  photoUrl?: string;
  isStar?: boolean;
}

export interface Game {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  gameDate: Date;
  gameTime?: string;
  venue?: string;
  status: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  innings?: number;
}

export interface Standing {
  leagueId: string;
  teamId: string;
  season: number;
  division?: string;
  wins: number;
  losses: number;
  winPct: number;
  gamesBehind?: number;
  rank?: number;
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

// Interface commune pour toutes les data sources
export interface DataSource {
  getLeagueName(): string;

  // Teams
  getAllTeams(season: number): Promise<Team[]>;
  getTeam(teamId: string): Promise<Team | null>;

  // Players
  getTeamRoster(teamId: string, season: number): Promise<Player[]>;
  getPlayer(playerId: string): Promise<Player | null>;

  // Games
  getGamesForDate(date: Date): Promise<Game[]>;
  getGame(gameId: string): Promise<Game | null>;

  // Standings
  getStandings(season: number): Promise<Standing[]>;

  // Stats (optionnel selon source)
  getPlayerStats?(playerId: string, season: number): Promise<any>;
}
```

### Implémentation MLB

```typescript
// mlb/MLBDataSource.ts

import { DataSource, Team, Player, Game, Standing } from '../types';
import { fetchMLBAPI } from './mlb-api';

export class MLBDataSource implements DataSource {
  getLeagueName(): string {
    return 'mlb';
  }

  async getAllTeams(season: number): Promise<Team[]> {
    const data = await fetchMLBAPI(`/teams?sportId=1&season=${season}`);

    return data.teams.map((t: any) => ({
      id: `mlb-${t.teamCode}`,
      leagueId: 'mlb',
      name: t.name,
      slug: this.slugify(t.name),
      shortName: t.teamName,
      logoUrl: this.getTeamLogoUrl(t.id),
      division: t.division.name,
      city: t.locationName,
      stadium: t.venue.name,
      foundedYear: parseInt(t.firstYearOfPlay),
      apiTeamId: t.id.toString(),
      // Couleurs hardcodées
      ...this.getTeamColors(t.teamCode)
    }));
  }

  async getTeamRoster(teamId: string, season: number): Promise<Player[]> {
    const apiTeamId = this.extractApiTeamId(teamId);
    const data = await fetchMLBAPI(`/teams/${apiTeamId}/roster?rosterType=active&season=${season}`);

    const players: Player[] = [];

    for (const r of data.roster) {
      const personId = r.person.id;
      const details = await fetchMLBAPI(`/people/${personId}`);
      const person = details.people[0];

      players.push({
        id: `mlb-${personId}`,
        teamId,
        name: person.fullName,
        slug: this.slugify(person.fullName),
        firstName: person.firstName,
        lastName: person.lastName,
        position: r.position.abbreviation,
        jerseyNumber: parseInt(r.jerseyNumber || '0'),
        birthDate: new Date(person.birthDate),
        height: this.convertHeight(person.height),
        weight: this.convertWeight(person.weight),
        bats: person.batSide.code as 'R' | 'L' | 'S',
        throws: person.pitchHand.code as 'R' | 'L',
        photoUrl: this.getPlayerPhotoUrl(personId),
        apiPlayerId: personId.toString(),
        isStar: false // À déterminer avec logique métier
      });
    }

    return players;
  }

  async getGamesForDate(date: Date): Promise<Game[]> {
    const dateStr = date.toISOString().split('T')[0];
    const data = await fetchMLBAPI(`/schedule?sportId=1&startDate=${dateStr}&endDate=${dateStr}`);

    if (!data.dates || data.dates.length === 0) return [];

    return data.dates[0].games.map((g: any) => ({
      id: `mlb-${dateStr}-${g.gamePk}`,
      leagueId: 'mlb',
      homeTeamId: this.getTeamIdFromApi(g.teams.home.team.id),
      awayTeamId: this.getTeamIdFromApi(g.teams.away.team.id),
      gameDate: new Date(g.gameDate),
      venue: g.venue.name,
      status: this.mapGameStatus(g.status.detailedState),
      homeScore: g.teams.home.score,
      awayScore: g.teams.away.score,
      innings: g.innings || 9,
      apiGameId: g.gamePk.toString()
    }));
  }

  async getStandings(season: number): Promise<Standing[]> {
    const data = await fetchMLBAPI(`/standings?leagueId=103,104&season=${season}`);
    // Implémentation...
  }

  // Helpers privés
  private slugify(str: string): string {
    return str.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getTeamColors(teamCode: string): { primaryColor: string; secondaryColor: string } {
    const colors: Record<string, { primaryColor: string; secondaryColor: string }> = {
      'nya': { primaryColor: '#003087', secondaryColor: '#E4002B' },
      'bos': { primaryColor: '#BD3039', secondaryColor: '#0C2340' },
      // ... 28 autres équipes MLB
    };
    return colors[teamCode] || { primaryColor: '#000000', secondaryColor: '#FFFFFF' };
  }

  private convertHeight(heightStr: string): number {
    // "6' 4\"" → 193 cm
    const parts = heightStr.match(/(\d+)'\s*(\d+)"/);
    if (!parts) return 0;
    const feet = parseInt(parts[1]);
    const inches = parseInt(parts[2]);
    return Math.round((feet * 30.48) + (inches * 2.54));
  }

  private convertWeight(pounds: number): number {
    return Math.round(pounds * 0.453592); // lbs → kg
  }

  private getTeamLogoUrl(apiTeamId: number): string {
    return `https://www.mlbstatic.com/team-logos/${apiTeamId}.svg`;
  }

  private getPlayerPhotoUrl(personId: number): string {
    return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/${personId}/headshot/67/current`;
  }

  private extractApiTeamId(ourTeamId: string): string {
    // 'mlb-nya' → requête BDD pour récupérer api_team_id
    // Ou cache en mémoire
    return '147'; // Exemple Yankees
  }

  private getTeamIdFromApi(apiTeamId: number): string {
    // Mapping inverse
    return `mlb-${apiTeamId}`;
  }

  private mapGameStatus(mlbStatus: string): 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled' {
    const mapping: Record<string, any> = {
      'Final': 'final',
      'In Progress': 'live',
      'Scheduled': 'scheduled',
      'Postponed': 'postponed',
      'Cancelled': 'cancelled'
    };
    return mapping[mlbStatus] || 'scheduled';
  }
}
```

### Factory Pattern

```typescript
// index.ts

import { DataSource } from './types';
import { MLBDataSource } from './mlb/MLBDataSource';
import { KBODataSource } from './kbo/KBODataSource';
import { NPBDataSource } from './npb/NPBDataSource';

export function getDataSource(leagueId: string): DataSource {
  switch (leagueId) {
    case 'mlb':
      return new MLBDataSource();
    case 'kbo':
      return new KBODataSource();
    case 'npb':
      return new NPBDataSource();
    default:
      throw new Error(`Unknown league: ${leagueId}`);
  }
}

// Usage
const mlbSource = getDataSource('mlb');
const teams = await mlbSource.getAllTeams(2024);
```

---

## Stratégie de synchronisation

### Fréquence par type de données

| Données | Fréquence | Cron | Justification |
|---------|-----------|------|---------------|
| **Teams** | 1×/saison | Manuelle | Stable (30 équipes MLB) |
| **Players roster** | 1×/jour | 3h00 | Changements rares (trades, blessures) |
| **Games (upcoming)** | 2×/jour | 6h00, 18h00 | Calendrier change peu |
| **Scores (live)** | Toutes les 5min | */5 * * * * | Pendant matchs uniquement |
| **Standings** | 1×/jour | 4h00 | Classement mis à jour post-matchs |
| **Player stats** | 1×/jour | 5h00 | Stats agrégées après matchs |
| **Injuries** | 2×/jour | 10h00, 16h00 | Annonces imprévisibles |
| **Odds** | Toutes les 15min | */15 * * * * | Cotes fluctuent |

### Workflow de synchronisation

```typescript
// backend/src/cron/sync-mlb-scores.ts

import { getDataSource } from '../services/data-sources';
import { db } from '../db';

export async function syncMLBScores() {
  const mlbSource = getDataSource('mlb');
  const today = new Date();

  // 1. Récupérer les matchs du jour
  const games = await mlbSource.getGamesForDate(today);

  // 2. Upsert en BDD (insert ou update)
  for (const game of games) {
    await db.query(`
      INSERT INTO games (id, league_id, home_team_id, away_team_id, game_date, status, home_score, away_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        home_score = VALUES(home_score),
        away_score = VALUES(away_score),
        updated_at = NOW()
    `, [
      game.id,
      game.leagueId,
      game.homeTeamId,
      game.awayTeamId,
      game.gameDate,
      game.status,
      game.homeScore,
      game.awayScore
    ]);
  }

  console.log(`[SYNC] ${games.length} games synced`);
}
```

### Gestion erreurs

```typescript
export async function syncWithRetry(syncFn: () => Promise<void>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await syncFn();
      return;
    } catch (error) {
      console.error(`[SYNC ERROR] Attempt ${i + 1}/${maxRetries}:`, error);
      if (i === maxRetries - 1) {
        // Dernier essai échoué → notification admin (email/Telegram)
        await notifyAdminError(`Sync failed after ${maxRetries} attempts`, error);
      }
      await sleep(5000 * (i + 1)); // Backoff exponentiel
    }
  }
}
```

---

## Questions pour toi

**Q1** : TheSportsDB pour KBO/NPB - tu veux que je teste maintenant la qualité des données (faire un curl réel) ?

**Q2** : Joueurs stars MLB - comment les identifier automatiquement ?
- A. All-Stars 2024 (liste officielle)
- B. Top 200 batting avg + ERA
- C. Liste manuelle (tu fournis les noms)

**Q3** : Couleurs équipes KBO/NPB - hardcodées aussi ou tu veux que je les récupère depuis TheSportsDB ?

**Q4** : Fréquence sync scores live (5min) - suffisant ou tu veux 1min ?

**Réponds Q1-Q4 pour que je passe à l'implémentation.**
