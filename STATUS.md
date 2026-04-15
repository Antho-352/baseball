# Status Projet - home-run.fr

**Dernière mise à jour** : 2026-04-15
**Phase** : Step 8 complet - Backend API + Frontend client créés, prêt pour données réelles

---

## ✅ Complété

### Architecture Data (100% gratuit, 0€)

```
UnifiedProvider {
  MLBStatsProvider    → statsapi.mlb.com (gratuit)
  TheSportsDBProvider → API clé "123" (KBO/NPB gratuit)
  ScraperService      → baseball24.com (scores live V1.5)
}
```

**Fichiers** :
- `/backend/src/services/data-provider/` → 5 providers complets
- `/backend/src/services/scraper/` → Service scraping avec contraintes politesse
- `/config/teams-colors.ts` → 52 équipes (couleurs officielles)
- `/docs/schema.sql` → BDD 14 tables

### Tests Validés

- ✅ MLB Stats API fonctionnel
- ✅ TheSportsDB : KBO 10 équipes, NPB 10 équipes, fixtures 2026
- ✅ API-Sports rejeté (payant, free plan inutilisable)
- ✅ baseball24.com : HTML client-side (Playwright requis)

### League IDs

| Ligue | TheSportsDB | API-Sports (si upgrade) |
|-------|-------------|-------------------------|
| MLB | N/A | 1 |
| KBO | 4830 | 5 |
| NPB | 4831 | 2 |

---

## ⚠️ TODO Critique

### 1. ✅ Sélecteurs CSS Scraper Validés (2026-04-15)

**Tests effectués** :
- ✅ 60 matchs KBO trouvés
- ✅ 73 matchs MLB trouvés
- ✅ Structure DOM identifiée (Flashscore skin)

**Sélecteurs validés** :
```typescript
matchRow: '[id^="g_6_"]'  // ✅ Format: g_6_XXXXXXXX
homeTeam: '.event__homeParticipant .wcl-name_jjfMf'
awayTeam: '.event__awayParticipant .wcl-name_jjfMf'
homeScore: '.event__score--home'
awayScore: '.event__score--away'
startTime: '.event__time'  // Format: "14.04. 18:30"
```

**Fichiers mis à jour** :
- `/backend/src/services/scraper/config.ts` (sélecteurs corrigés)
- `/backend/src/services/scraper/ScraperService.ts` (extraction améliorée)

### 2. ✅ Design System + Astro Setup (2026-04-15)

**Fichiers créés** :
- `/docs/DESIGN-SYSTEM.md` → Doc complète (10 composants, tokens, conventions, a11y)
- `/frontend/src/styles/tokens.css` → 150+ CSS Custom Properties
  - Couleurs (light + dark mode)
  - Typographie (Inter font, 10 tailles)
  - Spacing (16 paliers)
  - Shadows, radius, transitions, z-index
  - Animations (pulse, fadeIn, slideUp, live-pulse)
- `/frontend/src/styles/global.css` → Import tokens + Tailwind + base styles
- `/frontend/src/layouts/BaseLayout.astro` → Layout de base avec SEO
- `/frontend/src/pages/index.astro` → Page test design system
- `/frontend/astro.config.mjs` → Config Astro 5 + React + Tailwind
- `/frontend/tailwind.config.mjs` → Tailwind avec références tokens CSS
- `/frontend/tsconfig.json` → TypeScript strict + path aliases

**Stack validée** :
- Astro 5.0 (stable)
- React 18.3 (Islands)
- Tailwind CSS 3.4 (hybrid avec tokens)
- TypeScript 5.7 (strict mode)

**Architecture validée** :
- Tokens en CSS Custom Properties (pas de JS)
- Dark mode : `data-theme="dark"` attribute + localStorage
- Hybrid Tailwind : utilities layout + tokens design
- 10 composants essentiels spécifiés

### 3. ✅ Composants UI de Base (2026-04-15)

**Fichiers créés** :
- `/frontend/src/components/ui/Button.astro` → 4 variants, 3 sizes
  - Variants: primary, secondary, ghost, link
  - Sizes: sm, md, lg
  - Support href (liens) et disabled
  - Focus ring a11y
- `/frontend/src/components/ui/Card.astro` → 3 variants, 3 paddings
  - Variants: default, bordered, elevated
  - Paddings: sm, md, lg
  - Hover shadow sur elevated
- `/frontend/src/components/ui/Badge.astro` → 4 status baseball, 2 sizes
  - Status: live (pulse animation), finished, postponed, scheduled
  - Sizes: sm, md
  - Uppercase + tracking-wide

**Page test mise à jour** :
- `/frontend/src/pages/index.astro` → Démo tous composants
  - Button: 7 exemples (variants + sizes + disabled)
  - Card: 3 variants démontrés
  - Badge: 6 exemples (4 status + 2 sizes)

**Validation** :
- ✅ Tailwind + tokens hybrid fonctionne
- ✅ Dark mode responsive
- ✅ TypeScript strict sans erreurs
- ✅ Props typées avec interface
- ✅ Composants réutilisables

### 4. ✅ Composants UI Restants (2026-04-15)

**Fichiers créés** :
- `/frontend/src/components/ui/ScoreBoard.astro` → Affichage score match
  - Props: homeTeam, awayTeam, homeScore, awayScore, status, inning, startTime
  - Badge status intégré
  - Winner highlight (vert)
  - Grid 3 colonnes responsive

- `/frontend/src/components/ui/GameCard.astro` → Card match pour listes
  - Props: homeTeam, awayTeam, scores, status, startTime, gameId, league
  - Badge status avec heure si scheduled
  - Hover shadow effect
  - CTA "Voir le match"

- `/frontend/src/components/ui/PlayerCard.astro` → Card joueur avec stats
  - Props: name, position, teamName, teamLogo, playerImage, stats[], playerId
  - Photo ronde ou initiale
  - Grid stats 3 colonnes
  - CTA "Voir profil"

- `/frontend/src/components/ui/StandingsTable.astro` → Tableau classement
  - Props: standings[], showGB, highlightTop
  - Responsive scroll horizontal mobile
  - Zebra striping
  - Top 3 highlight vert
  - Colonnes: Rang, Équipe, V, D, %, GB, Série

- `/frontend/src/components/ui/StatWidget.astro` → Widget stat individuelle
  - Props: label, value, trend, subtitle, icon
  - Trend arrows (↑ vert, ↓ rouge, → neutre)
  - Tabular nums

- `/frontend/src/components/ui/NavBar.astro` → Navigation principale
  - Props: currentPath
  - Links: Accueil, MLB, KBO, NPB, Pronostics, News
  - Dark mode toggle intégré
  - Mobile menu hamburger
  - Sticky top

- `/frontend/src/components/ui/Footer.astro` → Footer site
  - 4 colonnes: Brand, Ligues, Contenu, Site
  - ANJ warning (jeu responsable)
  - Social links (Twitter, Facebook)
  - Copyright dynamique

**BaseLayout mis à jour** :
- Import NavBar + Footer
- Props showNav et showFooter (défaut: true)
- Structure: NavBar → <main><slot /></main> → Footer

**Total** : 10 composants UI complets (3 base + 7 spécifiques)

### 5. ✅ Homepage MVP (2026-04-15)

**Fichier** : `/frontend/src/pages/index.astro`

**Sections créées** :
1. Hero section (bleu primary, CTAs vers ligues)
2. Stats overview (4 StatWidgets: matchs, live, pronostics, win rate)
3. Scores du jour (3 GameCards avec mock data)
4. Pronostics du jour (2 Cards featured + CTA affiliation Betclic)
5. Top joueurs (3 PlayerCards)
6. News récentes (3 Cards articles)
7. CTA newsletter (input email + bouton)

**Composants utilisés** :
- BaseLayout (nav + footer automatiques)
- GameCard × 3
- PlayerCard × 3
- StatWidget × 4
- Card × 5
- Button × 10+

**Mock data** :
- todayGames[] : 3 matchs (1 live, 1 scheduled, 1 final)
- topPlayers[] : 3 joueurs (Ohtani, Judge, Betts)
- recentNews[] : 3 articles

**Démonstration** :
- ✅ Tous les composants UI fonctionnels
- ✅ Navigation sticky + footer
- ✅ Dark mode toggle opérationnel
- ✅ Responsive mobile/tablet/desktop
- ✅ Affiliation ANJ compliant (warning footer)

### 6. ✅ Hub Pages Ligues (2026-04-15)

**Fichiers créés** :
- `/frontend/src/pages/mlb/index.astro` (Hub MLB)
- `/frontend/src/pages/kbo/index.astro` (Hub KBO)
- `/frontend/src/pages/npb/index.astro` (Hub NPB)

**Structure identique** (adaptée par ligue) :
1. Hero section (gradient couleur ligue + flag)
2. Quick navigation (6 boutons: Scores, Calendrier, Classement, Équipes, Joueurs, Stats)
3. Stats overview (4 StatWidgets)
4. Scores du jour (3 GameCards mock data)
5. Classement(s) (AL/NL pour MLB, simple pour KBO, Central/Pacific pour NPB)
6. Stats leaders (2 Cards: batteurs + lanceurs/HR)
7. News récentes (3 Cards articles)
8. Info section (Card avec histoire de la ligue)

**Mock data MLB** :
- 3 matchs (Dodgers vs Yankees live, Red Sox vs Blue Jays final, Giants vs Cubs scheduled)
- Classement AL top 5 (Yankees #1) + NL top 5 (Dodgers #1)
- Top batteurs (Ohtani .304, Judge .311, Betts .307)
- Top lanceurs ERA (Strider 2.14, Cole 2.28, Snell 2.45)

**Mock data KBO** :
- 3 matchs (Bears vs Twins final, Lions vs Tigers live, Heroes vs Dinos scheduled)
- Classement 10 équipes (Bears #1, Twins #2)
- Top batteurs + Top HR

**Mock data NPB** :
- 3 matchs (Giants vs Tigers final, Hawks vs Buffaloes live, Carp vs Dragons scheduled)
- Classement Central top 6 (Giants #1) + Pacific top 6 (Hawks #1)
- Top batteurs + Top HR

**Cohérence design** :
- Même structure = facilite maintenance
- Couleurs hero différentes (MLB bleu, KBO rouge, NPB violet)
- Mock data réaliste (noms vrais joueurs/équipes)

### 7. ✅ Backend API Express (2026-04-15)

**Fichiers créés** :
- `/backend/package.json` → Dependencies Express + CORS + node-cache
- `/backend/src/server.js` → API REST sur port 3000

**Endpoints créés** :
- `GET /api/health` → Health check + provider name
- `GET /api/games/:league/:date?` → Matchs par ligue/date (cache 5min)
- `GET /api/standings/:league/:season?` → Classements (cache 1h)
- `GET /api/players/:league/top/:stat?` → Top joueurs par stat (cache 1h)
- `GET /api/cache/stats` → Stats cache (debug)
- `DELETE /api/cache/clear` → Clear cache (debug)

**Intégration UnifiedProvider** :
- Import `createDataProvider('unified')`
- Appels directs aux méthodes provider
- Types validés (league: mlb|kbo|npb)
- Date parsing + validation

**Caching NodeCache** :
- TTL 5min pour games (données live)
- TTL 1h pour standings/players (moins volatiles)
- Cache keys: `games:mlb:2026-04-15`, `standings:kbo:2026`
- Stats accessibles via `/api/cache/stats`

**CORS** :
- Autorisé pour localhost:4321 (Astro dev)
- Autorisé pour localhost:3000 (API)

**Logger** :
- Timestamp + méthode + path
- Cache hits loggés
- Erreurs loggées

**Démarrage** :
```bash
cd backend && npm run dev  # Port 3000
```

**Test** :
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/games/mlb/2026-04-15
curl http://localhost:3000/api/standings/kbo/2026
```

### 8. ✅ Frontend API Client (2026-04-15)

**Fichiers créés** :
- `/frontend/src/lib/api.ts` → Client API avec TypeScript (200+ lignes)
- `/frontend/.env` → Config API_URL (localhost:3210)

**Fonctions exportées** :
- `getGames(league, date?)` → Fetch matchs
- `getStandings(league, season?)` → Fetch classements
- `getTopPlayers(league, stat?, limit?)` → Fetch top joueurs
- `healthCheck()` → Test connexion API

**Types TypeScript** :
- `Game` → Match complet (id, teams, scores, status, date)
- `Standing` → Classement (rank, team, W-L, pct, GB, streak)
- `Player` → Joueur (id, name, team, position, stats)
- `*Response` → Wrappers API (league, data, cached)

**Transformers** :
- `transformGameToCardProps()` → API Game → GameCard props
- `transformStandingToTableProps()` → API Standing → StandingsTable props
- `transformPlayerToCardProps()` → API Player → PlayerCard props

**Error handling** :
- Try/catch dans apiFetch
- Console.error si échec
- Throw error pour pages

**Env variables** :
- `PUBLIC_API_URL` → Backend URL (default: localhost:3210)
- Production ready (commenté)

**Usage dans pages Astro** :
```typescript
import { getGames, transformGameToCardProps } from '@/lib/api';

const response = await getGames('mlb');
const games = response.games.map(transformGameToCardProps);
```

### 9. Test Intégration UnifiedProvider

```typescript
const provider = createDataProvider('unified');
const games = await provider.getGames('mlb', new Date());
// Vérifier données complètes
```

### 4. Setup MySQL

```bash
mysql -u root -p baseball_fr < docs/schema.sql
```

---

## 📋 Prochaines Étapes (Ordre)

1. **Step 4-7** : ✅ Design System + 10 composants UI + Homepage + 3 Hub ligues
2. **Step 8** : Backend API (Node + Express + UnifiedProvider integration)
3. **Step 9** : Pages détails (Match, Player, Standings full)
4. **Step 10** : CMS admin (TipTap éditeur)
5. **Step 11** : Cron jobs sync données
6. **V1.5** : Activer ScraperService (sélecteurs validés)

---

## 🔧 Config Rapide

**Lancer providers** :
```typescript
import { createDataProvider } from './services/data-provider';
const provider = createDataProvider('unified');
```

**Lancer scraper** :
```typescript
import { ScraperService } from './services/scraper';
const scraper = new ScraperService();
await scraper.start(); // Polling auto
```

**Variables env** : Aucune nécessaire (tout gratuit, clés hardcodées)

---

## 📚 Docs Essentielles

- `CLAUDE.md` → Spec complète projet
- `SOLUTION-100-GRATUITE.md` → Architecture data validée
- `IMPLEMENTATION-SUMMARY.md` → Récap session 2026-04-15
- `data-provider/README.md` → Usage providers
- `scraper/README.md` → Usage scraper + contraintes

---

## 🎯 Décisions Clés

| Question | Décision | Raison |
|----------|----------|--------|
| Nom site | home-run.fr | User 2026-04-15 |
| Data KBO/NPB | TheSportsDB free | 0€, suffisant V1 |
| Scores live | Scraper baseball24 | Gratuit, V1.5 |
| API payante | Rejetée | Free plan inutilisable |
| Stats avancées KBO/NPB | V2 (scraping) | Pas critique V1 |
| Cotes bookmakers | V2 (affiliation) | Après trafic validé |

---

## 💰 Coûts

**Total** : 0€/mois

- MLB Stats API : gratuit
- TheSportsDB : clé "123" gratuit
- Scraper : self-hosted
- Serveur : déjà provisionné (Kimsufi 64 Go)

---

## ⏱️ Timeline Estimée

- **V1** (MLB + KBO + NPB scores finaux) : 4 semaines
- **V1.5** (scores live scraper) : +1 semaine
- **V2** (stats avancées + affiliation) : +2 semaines

**Total MVP** : 7 semaines
