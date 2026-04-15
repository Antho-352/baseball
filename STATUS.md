# Status Projet - home-run.fr

**Dernière mise à jour** : 2026-04-15
**Phase** : Architecture complète, prêt pour Step 4 (Frontend)

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

### 1. Valider Sélecteurs CSS Scraper

**Fichier** : `/backend/src/services/scraper/config.ts`

```typescript
export const CSS_SELECTORS = {
  matchRow: '.event__match',      // ⚠️ À VALIDER
  homeTeam: '.event__participant--home',
  awayTeam: '.event__participant--away',
  // ... etc
};
```

**Action** : Tester avec Playwright en mode visible, prendre screenshot, identifier vrais sélecteurs.

### 2. Test Intégration UnifiedProvider

```typescript
const provider = createDataProvider('unified');
const games = await provider.getGames('mlb', new Date());
// Vérifier données complètes
```

### 3. Setup MySQL

```bash
mysql -u root -p baseball_fr < docs/schema.sql
```

---

## 📋 Prochaines Étapes (Ordre)

1. **Step 4** : Design System (tokens CSS) → `/frontend/src/styles/tokens.css`
2. **Step 5** : Frontend Astro setup + pages templates
3. **Step 6** : CMS admin (Node + Express + TipTap)
4. **Step 7** : Cron jobs sync données
5. **V1.5** : Activer ScraperService (après validation sélecteurs)

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
