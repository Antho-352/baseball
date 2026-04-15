# CLAUDE.md - Baseball FR

## Ton de communication

**INTERDIT** : "Excellent", "Bonne idée", "Super", ou tout langage émotionnel si ce n'est pas justifié.

**OBLIGATOIRE** :
- Challenger les décisions
- Être franc et direct
- Pragmatisme avant élégance
- Efficacité, concision, pertinence
- Pas d'émotions, que des faits

Si une idée est mauvaise → dis-le clairement et propose une alternative.
Si une décision est risquée → explique pourquoi et donne les conséquences.

---

## Projet

Site de référence français sur le baseball professionnel (MLB, KBO, NPB).
Monétisation : affiliation paris sportifs (opérateurs ANJ uniquement).

**Objectif V1** : site autonome nécessitant le minimum d'interventions manuelles.

---

## Stack technique

### Frontend
- **Astro 5** (TypeScript, Content Collections)
- Build statique déployé sur cPanel
- Islands React pour composants interactifs (scores live)
- Tailwind CSS 4 + CSS custom properties (design tokens)

### Backend / API
- **Node.js + Express** (API standalone)
- Sous-domaine `cms.baseball.fr` (séparé du frontend)
- PM2 pour la gestion des processus
- Nginx reverse proxy

### Base de données
- **MySQL/MariaDB** (natif cPanel/WHM)
- Tables : leagues, teams, players, games, predictions, articles, bookmakers, clicks_tracking

### Infra
- **Serveur** : Kimsufi dédié - Intel Xeon E5-1650v4 (6c/12t, 3.6 GHz), 64 Go RAM, 2×450 Go SSD NVMe
- **OS** : AlmaLinux 9
- **Panel** : WHM + cPanel (déjà provisionné)
- **CDN** : Cloudflare (DNS, WAF, cache, HTTPS)
- **Backups** : automatiques + Hetzner

### Pas de Redis V1
Avec 64 Go RAM, cache applicatif en mémoire (node-cache) suffit.

---

## Architecture URL - Décisions finales

### Structure validée

```
/                                           → Homepage (hub multi-ligues)

# Hubs ligues
/mlb/, /kbo/, /npb/                         → Hub ligue (scores du jour + nav)

# Équipes
/mlb/equipes/                               → Liste équipes
/mlb/equipes/new-york-yankees/              → Page équipe (slugs EN)

# Joueurs (200 stars seulement en V1)
/mlb/joueurs/                               → Liste joueurs stars
/mlb/joueurs/shohei-ohtani/                 → Page joueur

# Scores & Calendrier
/mlb/scores/                                → Scores du jour (live)
/mlb/calendrier/                            → Calendrier complet saison
/mlb/resultats/2026-04-15/                  → Résultats par date

# Classements
/mlb/classement/                            → Classement saison en cours
/mlb/classement/2025/                       → Historique par saison

# Stats
/mlb/stats/batteurs/                        → Top batteurs saison
/mlb/stats/lanceurs/                        → Top lanceurs saison
/mlb/stats/equipes/                         → Stats équipes

# Pronostics (monétisation)
/pronostics/                                → Hub pronostics toutes ligues
/pronostics/mlb/                            → Hub pronostics MLB
/pronostics/mlb/2026-04-15-yankees-vs-red-sox/  → Pronostic par match

# News & Édito
/news/                                      → Toutes les news
/news/mlb/, /news/kbo/, /news/npb/          → News par ligue
/news/transfers/                            → Transferts
/news/blessures/                            → Blessures (SEO gold)

# Histoire & Encyclopédie
/histoire/mlb/world-series/
/histoire/npb/japan-series/
/histoire/kbo/korean-series/

# Paris sportifs (affiliation)
/paris-sportifs/                            → Hub affiliation
/paris-sportifs/bonus/                      → Comparatif bonus
/paris-sportifs/betclic/                    → Landing page Betclic
/paris-sportifs/unibet/                     → Landing page Unibet
```

### Différenciation /mlb/ vs /news/mlb/

**Problème identifié** : cannibalisation SEO potentielle

**Solution** :
- `/mlb/` = **hub données** (scores du jour, classement, calendrier, top joueurs)
- `/news/mlb/` = **hub éditorial** (articles, analyses, histoires)

**Title tags** :
- `/mlb/` → "MLB : Scores, Classement et Calendrier en Direct"
- `/news/mlb/` → "Actualités MLB : News, Analyses et Transferts"

**Contenu distinct** :
- `/mlb/` → widgets interactifs (scores live, classement temps réel)
- `/news/mlb/` → liste d'articles éditoriaux (grille de cartes)

---

## Stratégie de rendu

| Type de page | Rendu | Revalidation | Raison |
|--------------|-------|--------------|--------|
| Homepage | SSG | ISR 5min | Scores changent |
| Hub ligue (/mlb/) | SSG | ISR 5min | Scores + classement |
| Liste équipes | SSG | Build | Stable (30 équipes) |
| Page équipe | SSG | ISR 1h | Stats post-match |
| Liste joueurs | SSG | Build | 200 joueurs fixes |
| Page joueur | SSG | ISR 1h | Stats post-match |
| **Scores live** | **Client fetch** | **Polling 1min** | Temps réel |
| Classements | SSG | ISR 24h | 1 update/jour |
| Stats | SSG | ISR 24h | idem |
| **Pronostic** | **SSG** | **Aucune** | Généré 24h avant, statique après |
| Article news | SSG | Build | CMS publish |
| Page CMS | SSG | Build | Statique |

**Principe** : maximum de SSG pour performance SEO, ISR uniquement si données changent fréquemment.

---

## Système d'automatisation (autonomie maximale)

### Cron jobs (serveur)

```bash
# Synchronisation données MLB (gratuit)
*/30 * * * * curl http://localhost:3000/api/cron/sync-mlb-scores
0 */6 * * * curl http://localhost:3000/api/cron/sync-mlb-standings
0 2 * * * curl http://localhost:3000/api/cron/sync-mlb-stats

# Synchronisation KBO/NPB (TheSportsDB)
*/30 * * * * curl http://localhost:3000/api/cron/sync-kbo-scores
*/30 * * * * curl http://localhost:3000/api/cron/sync-npb-scores
0 3 * * * curl http://localhost:3000/api/cron/sync-kbo-npb-standings

# Génération pronostics automatique (24h avant matchs)
0 10 * * * curl http://localhost:3000/api/cron/generate-predictions

# Récupération cotes bookmakers
*/15 * * * * curl http://localhost:3000/api/cron/fetch-odds

# Rebuild Astro si nécessaire (après génération pronostics validés)
0 12 * * * cd /home/baseball/frontend && npm run build && pm2 restart baseball-frontend
```

### Workflow pronostics (semi-automatique)

```
[Cron 10h00] Génère pronostics J+1
    ↓
Pour chaque match :
    ├─ Collecte données (forme, H2H, blessures, météo)
    ├─ Appel API IA (Claude/GPT)
    ├─ Récupère cotes bookmakers
    ├─ Génère page (status: draft)
    └─ Envoie email admin : "X pronostics à valider"
        ↓
[Validation manuelle dans CMS cms.baseball.fr/admin/predictions]
    ↓
Publication (status: published)
    ↓
[Cron 12h00] Build Astro → pages pronostics deviennent statiques
    ↓
Sitemap mis à jour → indexation Google
```

**Interventions manuelles** :
- Validation pronostics (1×/jour, 5-10min)
- Rédaction articles (3+/semaine)
- Modération si nécessaire

**Tout le reste est automatique** :
- Collecte scores/stats
- Génération pages joueurs/équipes
- Mise à jour classements
- Fetch cotes bookmakers

---

## Sources de données

### MLB (officiel, gratuit)
- **API** : `https://statsapi.mlb.com/api/v1/`
- **Couverture** : scores live, stats, classements, calendrier, blessures
- **Limite** : aucune connue, usage fair-use

### KBO + NPB (gratuit/payant)
- **API** : TheSportsDB (gratuit basic, ~9$/mois pour livescores)
- **Couverture** : scores, classements, calendrier
- **Limite** : qualité variable, à tester en réel

**Important** : abstraction dans le code pour changer de source facilement si besoin.

```typescript
// src/lib/data-sources/index.ts
interface DataSource {
  getScores(league: string, date: string): Promise<Game[]>
  getStandings(league: string, season: number): Promise<Standing[]>
}

class MLBDataSource implements DataSource { /* statsapi.mlb.com */ }
class KBODataSource implements DataSource { /* TheSportsDB */ }
class NPBDataSource implements DataSource { /* TheSportsDB */ }
```

### Cotes bookmakers (affiliation)
- **Sources** : flux XML/JSON des programmes d'affiliation
- **Opérateurs ANJ** : Betclic, Unibet, Winamax, PMU
- **Fréquence** : fetch toutes les 15min
- **Stockage** : table `odds` avec timestamp

**TODO** : créer note pour demander accès aux flux (nécessite inscription programme affiliation).

---

## CMS custom (cms.baseball.fr)

### Stack CMS
- **Backend** : Node.js + Express
- **BDD** : MySQL (partagée avec frontend)
- **Auth** : JWT simple (admin solo, pas besoin de NextAuth)
- **Éditeur riche** : TipTap (React)
- **Upload images** : Sharp pour resize/optimize
- **Interface** : React + Tailwind (design tokens partagés)

### Fonctionnalités CMS

**Articles** :
- Création/édition/suppression
- Catégories (news, analyse, histoire, transferts, blessures)
- Ligue associée (MLB/KBO/NPB ou null)
- Featured image + galerie
- Statut draft/published
- Prévisualisation avant publication

**Pronostics** :
- Liste pronostics générés (status: draft)
- Validation manuelle (bouton "Publier")
- Édition du texte IA si besoin
- Gestion des cotes bookmakers (rafraîchissement manuel possible)
- Historique performances (win rate, ROI fictif)

**Pages CMS** :
- Création pages statiques (À propos, Glossaire, Histoire, Affiliation)
- Éditeur TipTap
- Templates prédéfinis (page simple, landing affiliation)

**Médias** :
- Upload images (5 Mo max)
- Resize automatique (Sharp) : thumbnail, medium, large
- Stockage : `/public/uploads/` (cPanel)
- Liste médias réutilisables

---

## Design System (tokens-based)

### Principe

**Un seul endroit pour modifier le design entier du site.**

Utilisation de **CSS Custom Properties** (variables CSS) pour tous les tokens.

### Fichier de tokens

```css
/* src/styles/tokens.css */

:root {
  /* Colors - Brand */
  --color-primary: #1E3A8A;        /* Navy (baseball tradition) */
  --color-secondary: #DC2626;      /* Rouge vif (MLB vibes) */
  --color-accent: #FBBF24;         /* Or (highlights) */

  /* Colors - Neutral */
  --color-bg-base: #FFFFFF;
  --color-bg-subtle: #F9FAFB;
  --color-bg-muted: #F3F4F6;
  --color-text-base: #111827;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;

  /* Colors - Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Typography */
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */

  /* Spacing */
  --space-1: 0.25rem;      /* 4px */
  --space-2: 0.5rem;       /* 8px */
  --space-3: 0.75rem;      /* 12px */
  --space-4: 1rem;         /* 16px */
  --space-6: 1.5rem;       /* 24px */
  --space-8: 2rem;         /* 32px */
  --space-12: 3rem;        /* 48px */
  --space-16: 4rem;        /* 64px */

  /* Border Radius */
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg-base: #0F172A;
  --color-bg-subtle: #1E293B;
  --color-bg-muted: #334155;
  --color-text-base: #F1F5F9;
  --color-text-muted: #94A3B8;
  --color-border: #334155;
}
```

### Utilisation dans Tailwind

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        // etc.
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        // etc.
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        // etc.
      }
    }
  }
}
```

### Avantages

✅ **Modifier une couleur = tout le site change**
```css
/* Changer le bleu navy en bleu royal */
:root {
  --color-primary: #2563EB; /* au lieu de #1E3A8A */
}
/* → Tous les boutons, liens, bordures changent automatiquement */
```

✅ **Dark mode natif** via attribut `data-theme`
✅ **Réutilisable CMS** (même tokens pour l'interface admin)
✅ **Type-safe** avec TypeScript (export des tokens)

---

## SEO technique

### Métadonnées dynamiques

Chaque template génère :
- `<title>` optimisé (max 60 caractères)
- `<meta name="description">` (max 160 caractères)
- `<meta property="og:*">` (Open Graph)
- `<meta name="twitter:*">` (Twitter Cards)
- `<link rel="canonical">` (URL canonique)

Exemple page joueur :
```html
<title>Shohei Ohtani : Stats, Biographie et Actualités | Baseball FR</title>
<meta name="description" content="Statistiques complètes, biographie et actualités de Shohei Ohtani (Los Angeles Dodgers). Suivez les performances du joueur japonais en MLB.">
<meta property="og:image" content="https://baseball.fr/images/players/shohei-ohtani.jpg">
```

### Schema.org (JSON-LD)

**Page équipe** :
```json
{
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  "name": "New York Yankees",
  "sport": "Baseball",
  "memberOf": {
    "@type": "SportsOrganization",
    "name": "Major League Baseball"
  }
}
```

**Page pronostic** :
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Pronostic Yankees vs Red Sox - 15 avril 2026",
  "author": {
    "@type": "Organization",
    "name": "Baseball FR"
  },
  "publisher": { ... },
  "datePublished": "2026-04-14T10:00:00Z"
}
```

### Sitemap XML

Généré automatiquement à chaque build Astro.

Sections :
- Pages statiques (homepage, hubs, À propos)
- Équipes (priority: 0.8)
- Joueurs stars (priority: 0.7)
- Pronostics récents (priority: 0.9, changefreq: daily)
- Articles news (priority: 0.6)

### Robots.txt

```
User-agent: *
Allow: /

Sitemap: https://baseball.fr/sitemap.xml

# Bloquer le CMS
User-agent: *
Disallow: /cms/
```

---

## Affiliation ANJ - Conformité légale

### Opérateurs autorisés uniquement

**Liste ANJ** (vérifier régulièrement sur anj.fr) :
- Betclic
- Unibet
- Winamax
- PMU
- ParionsSport

**Interdiction stricte** : afficher des opérateurs non agréés ANJ.

### Mentions obligatoires

**Footer (toutes les pages)** :
```
18+ | Les jeux d'argent sont interdits aux mineurs.
Jouer comporte des risques : endettement, dépendance...
Appelez le 09.74.75.13.13 (appel non surtaxé)
```

**Pages pronostics (avant les cotes)** :
```
⚠️ Jeu responsable : Jouer comporte des risques.
Pour obtenir de l'aide : joueurs-info-service.fr | 09 74 75 13 13
```

**Mentions légales (section dédiée)** :
```
7. JEU RESPONSABLE

L'accès au contenu lié au jeu et paris en ligne est strictement
réservé aux personnes majeures (18 ans ou plus).

Le jeu doit rester un loisir : si vous ressentez une perte de contrôle
ou si le jeu n'est plus un plaisir, nous vous encourageons à faire
appel à ces ressources ou à en parler à un professionnel.

Ressources :
- Joueurs Info Service : 09 74 75 13 13
- Site web : https://www.joueurs-info-service.fr/
```

### Tracking affiliation (RGPD-compliant)

Table `clicks_tracking` :
- `ip_hash` : hash SHA256 de l'IP (pas l'IP brute)
- Pas de cookies tiers
- Consent banner Cloudflare (basique)

---

## Conventions de code

### Nommage

**Fichiers** :
- Composants : `PascalCase.astro` ou `.tsx`
- Utilitaires : `camelCase.ts`
- Constantes : `SCREAMING_SNAKE_CASE.ts`

**Variables** :
- `camelCase` pour fonctions et variables
- `PascalCase` pour composants React/Astro
- `SCREAMING_SNAKE_CASE` pour constantes

### Structure dossiers

```
baseball/
├─ frontend/                   # Astro 5
│  ├─ src/
│  │  ├─ components/          # Composants réutilisables
│  │  ├─ layouts/             # Layouts Astro
│  │  ├─ pages/               # Routes (file-based routing)
│  │  ├─ content/             # Content Collections (articles, etc.)
│  │  ├─ lib/
│  │  │  ├─ data-sources/    # Abstraction APIs externes
│  │  │  ├─ utils/           # Fonctions utilitaires
│  │  │  └─ constants.ts     # Constantes globales
│  │  └─ styles/
│  │     ├─ tokens.css       # Design tokens (variables CSS)
│  │     └─ global.css       # Styles globaux
│  ├─ public/
│  │  └─ uploads/            # Images uploadées via CMS
│  └─ astro.config.mjs
│
├─ backend/                    # API Node + CMS
│  ├─ src/
│  │  ├─ routes/             # Express routes
│  │  ├─ controllers/        # Logique métier
│  │  ├─ models/             # Modèles BDD (si ORM utilisé)
│  │  ├─ cron/               # Jobs cron (sync data, pronostics)
│  │  ├─ services/
│  │  │  ├─ ai/              # Génération pronostics IA
│  │  │  ├─ bookmakers/      # Fetch cotes
│  │  │  └─ data-sync/       # Synchronisation MLB/KBO/NPB
│  │  └─ utils/
│  └─ server.js
│
├─ docs/
│  ├─ decisions/             # ADR (Architecture Decision Records)
│  ├─ ARCHITECTURE-ANALYSIS.md
│  └─ API-SOURCES.md         # Documentation APIs externes
│
├─ scripts/
│  └─ deploy.sh              # Script déploiement cPanel
│
├─ CLAUDE.md                 # Ce fichier
└─ README.md
```

### Git workflow

**Branches** :
- `main` : production (déployé automatiquement)
- `dev` : développement
- `feature/nom-feature` : features

**Commits** :
- Format : `type: message`
- Types : `feat`, `fix`, `refactor`, `docs`, `chore`, `perf`

Exemples :
```
feat: add MLB scores live page
fix: pronostic generation AI prompt
docs: update CLAUDE.md with design tokens
```

---

## Déploiement

### Frontend Astro

```bash
# Build
cd frontend && npm run build

# Déploiement cPanel
rsync -avz dist/ user@server:/home/baseball/public_html/
```

### Backend API

```bash
# Build (si TypeScript)
cd backend && npm run build

# Déploiement
rsync -avz dist/ user@server:/home/baseball/api/

# Redémarrage PM2
pm2 restart baseball-api
```

### Automatisation

GitHub Actions pour CI/CD :
- Push sur `main` → build + déploiement auto
- Tests avant déploiement

---

## Monitoring & Maintenance

### Logs

**Frontend Astro** : logs build dans `/var/log/baseball-frontend/`
**Backend API** : PM2 logs `pm2 logs baseball-api`
**Cron jobs** : logs cron dans `/var/log/baseball-cron/`

### Métriques à suivre

**Performance** :
- Core Web Vitals (LCP, INP, CLS) via Google Search Console
- Temps de build Astro (objectif : < 2min)

**SEO** :
- Positions Google sur mots-clés cibles (Ahrefs/Semrush)
- Indexation : nombre de pages indexées (Search Console)

**Affiliation** :
- Clics tracking (table `clicks_tracking`)
- Conversions (données fournies par opérateurs)

---

## Notes importantes

### Données joueurs

**200 joueurs stars V1** mais **toutes les données récupérées depuis APIs**.

Critères "star" :
- MLB : All-Stars récents, leaders stats, joueurs populaires
- KBO/NPB : stars internationales, meilleurs batteurs/lanceurs

**Stockage BDD** : tous les joueurs (table `players`), mais pages générées seulement pour les 200 stars (`is_star = true`).

### Autonomie maximale

**Objectif** : le site tourne seul après la mise en place initiale.

**Interventions manuelles** (fréquence) :
- Validation pronostics : 1×/jour (5-10min)
- Rédaction articles : 3+/semaine (30-60min/article)
- Modération : occasionnel

**Tout le reste est automatique** :
- Scores, stats, classements → cron jobs
- Génération pages → build Astro automatique
- Mise à jour cotes → cron fetch bookmakers

### API Bookmakers - TODO

**Action requise** : inscription aux programmes d'affiliation pour obtenir accès aux flux de cotes.

**Opérateurs à contacter** :
1. Betclic Affiliation
2. Unibet Partners
3. Winamax Affiliation
4. PMU Affiliation

**Informations nécessaires** :
- Nom du site (à définir)
- Domaine (à acheter)
- Description du projet
- Trafic estimé (plusieurs milliers/mois à 1 an)

**Livrables attendus** :
- URL flux XML/JSON cotes
- Liens trackés (avec ID affilié)
- Conditions d'utilisation

---

## Évolutions futures (hors V1)

### V2 potentielle

- Stats avancées Sabermetrics (WAR, wRC+, FIP)
- Comptes utilisateurs (favoris, notifications)
- Comparateur de cotes temps réel (widget interactif)
- Couverture ligues mineures (MiLB)
- App mobile (React Native ou PWA)
- API publique exposée
- Vidéos / highlights (si partenariat trouvé)

### Scalabilité rédactionnelle

Si croissance audience → recrutement rédacteurs :
- CMS multi-utilisateurs (rôles : admin, éditeur, contributeur)
- Workflow de validation (brouillon → relecture → publication)
- Historique des versions

---

## Checklist lancement V1

### Infra
- [ ] Serveur Kimsufi provisionné ✅
- [ ] WHM/cPanel configuré ✅
- [ ] Cloudflare DNS configuré
- [ ] Nom de domaine acheté
- [ ] SSL Cloudflare activé

### Frontend
- [ ] Astro 5 setup
- [ ] Design system (tokens.css)
- [ ] Templates pages créés (12 templates)
- [ ] Composants UI (cards, grilles, navigation)
- [ ] Dark mode fonctionnel

### Backend
- [ ] API Node setup (Express)
- [ ] BDD MySQL créée + tables
- [ ] Cron jobs configurés
- [ ] TipTap intégré (éditeur CMS)
- [ ] Auth admin (JWT)

### Données
- [ ] Abstraction data sources (MLB/KBO/NPB)
- [ ] Synchronisation MLB testée
- [ ] Synchronisation KBO/NPB testée
- [ ] 200 joueurs stars identifiés
- [ ] Flux cotes bookmakers configurés

### SEO
- [ ] Métadonnées dynamiques (tous templates)
- [ ] Schema.org JSON-LD (tous templates)
- [ ] Sitemap XML généré
- [ ] Robots.txt configuré
- [ ] Google Search Console setup

### Légal
- [ ] Mentions ANJ footer
- [ ] Mentions légales page complète
- [ ] Politique de confidentialité (RGPD)
- [ ] Cookies banner Cloudflare

### Affiliation
- [ ] Programmes affiliation inscrits (Betclic, Unibet, Winamax)
- [ ] Flux cotes récupérés
- [ ] Tracking clics fonctionnel
- [ ] Pages affiliation créées (/paris-sportifs/*)

### Pronostics IA
- [ ] Moteur génération testé
- [ ] Workflow validation CMS
- [ ] Disclaimers légaux affichés
- [ ] Historique performances (dashboard)

### Tests
- [ ] Core Web Vitals (LCP < 2s, INP < 200ms, CLS < 0.1)
- [ ] SEO audit (Lighthouse 90+)
- [ ] Test mobile (responsive)
- [ ] Test dark mode (pas de flash)

---

## Contact & Support

**Développeur solo** : Anthony Russo
**GitHub** : https://github.com/Antho-352/baseball
**Serveur** : Kimsufi (AlmaLinux 9, 64 Go RAM)

Pour toute question technique, se référer à `/docs/` ou créer une issue GitHub.
