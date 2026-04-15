# Status Projet - home-run.fr

**Dernière mise à jour** : 2026-04-15
**Phase** : Step 4 complet - Design system + 3 composants UI de base créés

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

### 4. Test Intégration UnifiedProvider

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

1. **Step 4** : ✅ Design System + Astro + 3 composants UI complet
2. **Step 5** : Créer 7 composants UI restants (ScoreBoard, GameCard, PlayerCard, StandingsTable, StatWidget, NavBar, Footer)
3. **Step 6** : Template Homepage MVP
4. **Step 7** : Pages Match + Player + Standings
5. **Step 8** : Backend API (Node + Express)
6. **Step 9** : CMS admin (TipTap éditeur)
7. **Step 10** : Cron jobs sync données
8. **V1.5** : Activer ScraperService (sélecteurs validés)

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
