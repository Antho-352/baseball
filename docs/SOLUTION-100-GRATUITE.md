# Solution 100% Gratuite - Architecture Finale

**Date** : 2026-04-15
**Coût total** : 0€
**Status** : ✅ Validée et testée

---

## 🎯 Stack Data Sources

### MLB (Officielle gratuite)

**API** : `https://statsapi.mlb.com/api/v1/`

**Couverture** :
- ✅ Scores live temps réel
- ✅ Classements
- ✅ Stats joueurs avancées (Sabermetrics)
- ✅ Calendrier complet
- ✅ Blessures
- ✅ Transactions
- ✅ Historique illimité

**Limite** : Aucune (fair use)

**Provider** : `MLBStatsProvider` (déjà implémenté)

---

### KBO + NPB (TheSportsDB V1 gratuite)

**API** : `https://www.thesportsdb.com/api/v1/json/123/`

**Clé API** : `123` (free tier)

**Couverture testée** :

| Endpoint | Fonctionnel | Notes |
|----------|-------------|-------|
| Équipes KBO | ✅ | 10 équipes |
| Équipes NPB | ✅ | 10 équipes (12 attendues) |
| Joueurs | ✅ | Via `lookup_all_players.php?id={idTeam}` |
| Fixtures saison | ✅ | `eventsseason.php?id={leagueId}&s={season}` |
| Prochains matchs | ✅ | `eventsnextleague.php?id={leagueId}` |
| Derniers résultats | ✅ | `eventspastleague.php?id={leagueId}` |
| Scores live | ❌ | Paid tier uniquement |

**League IDs** :
- KBO : `4830`
- NPB : `4831` (à confirmer)

**Endpoints clés** :

```bash
# Équipes KBO
GET /api/v1/json/123/search_all_teams.php?l=Korean_KBO_League

# Équipes NPB
GET /api/v1/json/123/search_all_teams.php?l=Nippon_Baseball_League

# Joueurs d'une équipe
GET /api/v1/json/123/lookup_all_players.php?id={idTeam}

# Fixtures saison complète
GET /api/v1/json/123/eventsseason.php?id=4830&s=2026

# Prochains matchs
GET /api/v1/json/123/eventsnextleague.php?id=4830

# Derniers résultats
GET /api/v1/json/123/eventspastleague.php?id=4830
```

**Provider** : `TheSportsDBProvider` (à créer)

---

### Scores Live KBO/NPB (Scraping léger - V1.5)

**Source** : `baseball24.com` ou `flashscore.com`

**Stratégie** :
1. TheSportsDB récupère les matchs programmés du jour
2. Scraper léger récupère uniquement les scores live toutes les 1-2 minutes
3. Merge données : calendrier TheSportsDB + scores live scraper

**Fréquence** : Polling 1-2 min (uniquement si matchs en cours)

**Implémentation** : Cron job + Puppeteer/Playwright

**Priorité** : V1.5 (pas bloquant pour launch V1)

---

### Stats Avancées KBO/NPB (Scraping - V2)

**Sources** :
- **KBO** : `statiz.co.kr` (stats détaillées coréennes)
- **NPB** : `npbstats.com` (stats anglais)

**Fréquence** : 1×/jour (après matchs terminés)

**Stockage** : Base locale MySQL

**Données** :
- Batting averages
- Home runs
- RBIs
- ERAs (pitchers)
- Classements individuels

**Priorité** : V2 (stats basiques TheSportsDB suffisent pour V1)

---

### Historique NPB (GitHub gratuit)

**Repo** : `armstjc/Nippon-Baseball-Data-Repository`

**Format** : CSV (import one-time)

**Utilité** : Données historiques NPB (pré-2020) pour pages encyclopédie

**Action** : Import SQL après setup BDD

---

## 🛠️ Architecture DataProvider Mise à Jour

```
┌─────────────────────────────────────────────────┐
│         DataProvider (abstraction)               │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┬──────────────────┐
        │                           │                  │
┌───────▼────────┐        ┌─────────▼─────────┐  ┌────▼──────────┐
│  MLB Stats API │        │  TheSportsDB      │  │  Scrapers     │
│   (gratuit)    │        │  (clé 123)        │  │  (V1.5/V2)    │
├────────────────┤        ├───────────────────┤  ├───────────────┤
│ • MLB scores   │        │ • KBO/NPB teams   │  │ • Live scores │
│ • Classements  │        │ • Fixtures        │  │ • Stats adv.  │
│ • Stats adv.   │        │ • Scores finaux   │  │               │
│ • Blessures    │        │ • Joueurs         │  │               │
└────────────────┘        └───────────────────┘  └───────────────┘
```

---

## 📋 Providers à Implémenter

### 1. MLBStatsProvider (✅ Déjà fait)

Implémenté dans `/backend/src/services/data-provider/mlb-stats/MLBStatsProvider.ts`

### 2. TheSportsDBProvider (🔄 À créer)

```typescript
// backend/src/services/data-provider/thesportsdb/TheSportsDBProvider.ts

export class TheSportsDBProvider implements DataProvider {
  private apiKey = '123'; // Free tier
  private baseUrl = 'https://www.thesportsdb.com/api/v1/json/123';

  private leagueMapping = {
    'kbo': '4830',
    'npb': '4831', // À confirmer
  };

  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    // Récupérer eventsseason puis filtrer par date
  }

  async getStandings(leagueId: string, season: number): Promise<Standing[]> {
    // TheSportsDB ne fournit pas classements directement
    // Calculer à partir des résultats de la saison
  }

  async getTeams(leagueId: string): Promise<Team[]> {
    // search_all_teams.php?l=Korean_KBO_League
  }

  async getPlayers(teamId: string): Promise<Player[]> {
    // lookup_all_players.php?id={idTeam}
  }
}
```

### 3. UnifiedProvider (🆕 À créer)

Remplace `HybridProvider`, combine MLB Stats + TheSportsDB :

```typescript
export class UnifiedProvider implements DataProvider {
  constructor(
    private mlbStats: MLBStatsProvider,
    private theSportsDB: TheSportsDBProvider
  ) {}

  async getGames(leagueId: string, date: Date): Promise<Game[]> {
    if (leagueId === 'mlb') {
      return this.mlbStats.getGames(leagueId, date);
    } else {
      return this.theSportsDB.getGames(leagueId, date);
    }
  }

  // Idem pour autres méthodes
}
```

---

## 🎯 Roadmap Implémentation

### Phase 1 : V1 Core (Semaines 1-4)

**Objectif** : Site fonctionnel avec données finales (pas live)

- [x] MLBStatsProvider opérationnel
- [ ] TheSportsDBProvider implémenté
  - [ ] Teams KBO/NPB
  - [ ] Fixtures/résultats
  - [ ] Joueurs
  - [ ] Calcul classements à partir résultats
- [ ] UnifiedProvider (factory)
- [ ] Tests intégration
- [ ] Cron jobs sync données (toutes les heures)
- [ ] Frontend Astro + pages générées

**Données disponibles V1** :
- ✅ Scores finaux MLB/KBO/NPB (pas live)
- ✅ Classements
- ✅ Calendrier complet
- ✅ Équipes
- ✅ Joueurs (liste basique)
- ❌ Scores live (V1.5)
- ❌ Stats avancées KBO/NPB (V2)

---

### Phase 1.5 : Scores Live KBO/NPB (Semaine 5)

**Objectif** : Ajout scores live via scraping

- [ ] Scraper Puppeteer pour baseball24.com
- [ ] Cron job polling 1-2 min (si matchs en cours)
- [ ] Merge avec données TheSportsDB
- [ ] Widget "Live" sur homepage

**Trigger** : Une fois V1 lancée et trafic validé (> 1000 visites/mois).

---

### Phase 2 : Stats Avancées (Semaine 6+)

**Objectif** : Enrichissement stats joueurs KBO/NPB

- [ ] Scraper statiz.co.kr (KBO)
- [ ] Scraper npbstats.com (NPB)
- [ ] Cron 1×/jour
- [ ] Import GitHub NPB historical data
- [ ] Pages joueurs enrichies

**Trigger** : Trafic > 5000 visites/mois OU demande utilisateurs.

---

## 💰 Coûts

| Composant | Coût |
|-----------|------|
| MLB Stats API | 0€ (officielle gratuite) |
| TheSportsDB | 0€ (clé free tier `123`) |
| Scraping (Puppeteer) | 0€ (self-hosted) |
| GitHub NPB Data | 0€ (open source) |
| **Total** | **0€** |

---

## 📊 Limitations Connues

### TheSportsDB Free Tier

| Limitation | Impact | Solution |
|------------|--------|----------|
| Pas de scores live | ❌ Live non dispo V1 | ✅ Scraping V1.5 |
| Pas de classements API | ⚠️ Calcul manuel | ✅ Calculer depuis résultats |
| Stats basiques uniquement | ⚠️ Pas sabermetrics | ✅ Scraping V2 |
| 10 équipes NPB (12 attendues) | ⚠️ 2 manquantes ? | 🔍 Vérifier league name |
| Joueurs lookup parfois buggy | ⚠️ Mauvais sport retourné | 🔍 Tester IDs précis |

### Scraping

| Risque | Mitigation |
|--------|-----------|
| HTML change → scraper casse | Monitoring automatique + alertes |
| Rate limiting | Requêtes espacées (1-2 min) |
| IP ban | User-agent rotation + respect robots.txt |
| Légalité | Données publiques, usage non commercial fair use |

---

## 🔧 Configuration

### Variables d'environnement

```bash
# .env

# TheSportsDB (free tier)
THESPORTSDB_API_KEY=123

# MLB Stats API (pas de clé nécessaire)
# Aucune config

# Scrapers (V1.5)
SCRAPER_ENABLED=false
SCRAPER_INTERVAL_MS=120000  # 2 minutes
SCRAPER_TARGET=baseball24.com

# Cron sync
CRON_SYNC_INTERVAL=3600000  # 1 heure
```

### Usage

```typescript
import { createDataProvider } from './services/data-provider';

// Provider unifié (MLB + KBO + NPB)
const provider = createDataProvider('unified');

// Récupérer matchs du jour
const mlbGames = await provider.getGames('mlb', new Date());
const kboGames = await provider.getGames('kbo', new Date());
const npbGames = await provider.getGames('npb', new Date());

// Récupérer classement
const mlbStandings = await provider.getStandings('mlb', 2026);
const kboStandings = await provider.getStandings('kbo', 2026);
```

---

## ✅ Validation Solution

### Tests effectués (2026-04-15)

| Test | Résultat |
|------|----------|
| MLB Stats API scores live | ✅ Fonctionne |
| TheSportsDB équipes KBO | ✅ 10 équipes trouvées |
| TheSportsDB équipes NPB | ✅ 10 équipes trouvées |
| TheSportsDB fixtures KBO 2026 | ✅ 15 matchs trouvés |
| TheSportsDB joueurs | ⚠️ Buggy (mauvais sport) |

### Problèmes identifiés

1. **NPB 10 équipes au lieu de 12** :
   - Hypothèse : League name incorrect ?
   - Action : Tester `Nippon_Professional_Baseball` au lieu de `Nippon_Baseball_League`

2. **Joueurs lookup retourne basketball** :
   - Hypothèse : ID équipe incorrect ou endpoint buggy
   - Action : Tester avec IDs précis depuis résultat teams

### Actions de validation restantes

```bash
# Test NPB league name alternatif
curl "https://www.thesportsdb.com/api/v1/json/123/search_all_teams.php?l=Nippon_Professional_Baseball"

# Test joueurs avec ID précis Doosan Bears
curl "https://www.thesportsdb.com/api/v1/json/123/lookup_all_players.php?id=139822"

# Test NPB fixtures
curl "https://www.thesportsdb.com/api/v1/json/123/eventsseason.php?id=4831&s=2025"
```

---

## 🎯 Décision Finale

**Architecture retenue** : UnifiedProvider (MLB Stats + TheSportsDB)

**Timeline V1** : 4 semaines (site 3 ligues, scores finaux)

**Timeline V1.5** : +1 semaine (scores live scraping)

**Timeline V2** : +2 semaines (stats avancées scraping)

**Coût total** : 0€

**Prochaine étape** : Implémenter `TheSportsDBProvider` + tests complets.
