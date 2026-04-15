# Architecture Pages + Design System - home-run.fr

**Date** : 2026-04-15
**Status** : Proposition challengée + décisions design system

---

## 🎯 Architecture Pages (Challengée et Optimisée)

### Pages Retenues (10 types)

| Type | Quantité | SEO Priority | ISR | Justification |
|------|----------|--------------|-----|---------------|
| **1. Homepage** | 1 | Haute | 5min | Hub principal, scores live |
| **2. Hub Ligue** | 3 | Haute | 5min | `/mlb/`, `/kbo/`, `/npb/` |
| **3. Page Équipe** | 52 | Moyenne | 1h | Une par équipe |
| **4. Page Joueur** | 200 V1 | Moyenne | 1h | Stars uniquement V1 |
| **5. Page Match** | N/A | Basse | Build | Générée à la demande |
| **6. Page Pronostic** | N/A | HAUTE | Build | Monétisation principale |
| **7. Hub Pronostics** | 3 | Haute | 5min | Par ligue + global |
| **8. Pages Stats** | 6 | Moyenne | 24h | Batteurs/Lanceurs × 3 ligues |
| **9. Article/News** | ~100/an | Moyenne | Build | Contenu éditorial |
| **10. Pages Affiliation** | 5 | Haute | Build | Bookmakers ANJ |

**Total pages V1** : ~470 pages (sans matchs/pronostics dynamiques)

---

### Changements vs. Proposition Initiale

#### ❌ Fusionné : Hub Pronostics

**Avant** : Hub Pronostics Ligue (×3) + Hub Pronostics Global
**Après** : 1 seul Hub Pronostics avec filtres ligue

**Raison** :
- Évite duplication de code
- Meilleur pour SEO (1 page forte > 3 pages faibles)
- UX : filtres plus flexibles qu'une page séparée
- Maintenabilité : 1 seul template à gérer

**URL** : `/pronostics/?league=mlb` (filtre optionnel)

#### ✅ Conservé : Pages Match Séparées

**Raison** : Schema.org SportsEvent distinct, URL pérenne, maillage interne optimal.

#### ⚠️ Ajusté : Quantité Joueurs

**V1** : 200 stars (pas 1000+)
**Raison** : Éviter inflation pages low-quality. Focus sur stars = meilleur SEO (E-E-A-T).

#### ❌ Supprimé : Pages Calendrier Dédiées

**Avant** : `/mlb/calendrier/`
**Après** : Section dans Hub Ligue

**Raison** : Cannibalisation SEO avec Hub Ligue. Le contenu du calendrier est déjà dans le hub.

---

## 🎨 Système de Design

### Décisions Architecturales

#### 1. **Où vivent les design tokens ?**

**✅ Décision** : **CSS Custom Properties** (variables CSS) dans `/frontend/src/styles/tokens.css`

**Pourquoi** :
- Natif browser (pas de JS requis)
- Facile à override (theme dark/light)
- Type-safe avec TypeScript via export
- Compatible Tailwind (référencées dans config)

**Structure** :
```css
/* tokens.css */
:root {
  /* Colors */
  --color-primary: #1E3A8A;
  --color-bg-base: #FFFFFF;

  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --text-base: 1rem;

  /* Spacing */
  --space-4: 1rem;

  /* Shadows, Radius, etc. */
}

[data-theme="dark"] {
  --color-bg-base: #0F172A;
  /* Override uniquement les tokens qui changent */
}
```

**Export TypeScript** (optionnel, pour type-safety) :
```typescript
// tokens.ts
export const tokens = {
  colors: {
    primary: 'var(--color-primary)',
    // ...
  }
} as const;
```

---

#### 2. **Bibliothèque de composants : structure**

**✅ Décision** : Dossier `/frontend/src/components/ui/` avec composants réutilisables Astro + React Islands

**Structure** :
```
/frontend/src/components/
├── ui/                      # Composants purs (design system)
│   ├── Button.astro
│   ├── Card.astro
│   ├── Badge.astro
│   ├── ScoreBoard.tsx       # React (interactif)
│   ├── StatTable.astro
│   ├── MatchCard.astro
│   ├── PlayerAvatar.astro
│   ├── AffiliateBlock.astro
│   └── DisclaimerANJ.astro
│
├── features/                # Composants métier
│   ├── LiveScores.tsx       # React Island
│   ├── StandingsTable.astro
│   ├── PredictionCard.astro
│   └── NewsGrid.astro
│
└── layouts/                 # Layouts Astro
    ├── BaseLayout.astro
    ├── LeagueLayout.astro
    └── ArticleLayout.astro
```

**Règle** : `/ui/` = réutilisable partout, `/features/` = spécifique au domaine.

---

#### 3. **Tailwind suffit-il ?**

**✅ Décision** : **Tailwind + tokens CSS** (hybrid)

**Stratégie** :
- Tailwind pour **layout, spacing, responsive** (utilities)
- Tokens CSS pour **couleurs, typo, shadows** (design system)
- **PAS** de classes Tailwind hardcodées pour colors (`text-blue-500` ❌)
- **OUI** à Tailwind pour spacing (`p-4`, `mt-8` ✅)

**Configuration Tailwind** :
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',    // ← référence token CSS
        secondary: 'var(--color-secondary)',
        // ...
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
      spacing: {
        // Utiliser scale Tailwind par défaut (4px = 1 unit)
        // OU override avec tokens si besoin :
        // 4: 'var(--space-4)',
      }
    }
  },
  plugins: [],
}
```

**Exemple usage** :
```astro
<!-- ✅ BON -->
<button class="bg-primary text-white p-4 rounded-lg">
  Click me
</button>

<!-- ❌ MAUVAIS -->
<button class="bg-blue-600 text-white p-4 rounded-lg">
  Click me
</button>
```

**Pourquoi** : Si on change `--color-primary` de bleu → vert, tous les boutons changent automatiquement.

---

#### 4. **Dark Mode : gestion sans duplication**

**✅ Décision** : **Attribut `data-theme`** sur `<html>` + override tokens CSS

**Implémentation** :
```typescript
// darkMode.ts
export function toggleDarkMode() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// Au chargement (dans <head> pour éviter flash)
const theme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);
```

**Tokens CSS** :
```css
:root {
  --color-bg-base: #FFFFFF;
  --color-text-base: #111827;
}

[data-theme="dark"] {
  --color-bg-base: #0F172A;   /* Override */
  --color-text-base: #F1F5F9; /* Override */
}
```

**Composants** : Zéro changement requis (utilisent tokens).

---

#### 5. **Documentation : où et comment ?**

**✅ Décision** : **`/docs/DESIGN-SYSTEM.md`** (markdown simple, token-efficient)

**Pourquoi PAS Storybook** :
- Overhead énorme (dev server, build, maintenance)
- Overkill pour solo dev
- Consomme tokens de contexte inutilement

**Contenu `/docs/DESIGN-SYSTEM.md`** :
```markdown
# Design System

## Tokens
- Colors: voir tokens.css
- Typography: voir tokens.css

## Composants UI

### Button
Usage: <Button variant="primary">Click</Button>
Props: variant (primary|secondary), size (sm|md|lg)

### Card
Usage: <Card>...</Card>
Props: padding (boolean), shadow (boolean)

[etc.]
```

**Maintien** : Mise à jour manuelle lors d'ajout de composants (acceptable pour solo).

---

## 🧩 Composants UI Essentiels (V1)

### Liste Minimale

| Composant | Type | Utilisation | Props Clés |
|-----------|------|-------------|----------|
| `Button` | Astro | CTA, actions | `variant`, `size`, `href` |
| `Card` | Astro | Container générique | `padding`, `shadow` |
| `Badge` | Astro | Statuts, tags | `color`, `size` |
| `ScoreBoard` | React | Scores live | `homeTeam`, `awayTeam`, `scores` |
| `MatchCard` | Astro | Liste matchs | `match` |
| `PlayerAvatar` | Astro | Photo joueur + nom | `player`, `size` |
| `StatTable` | Astro | Classements, stats | `data`, `columns` |
| `AffiliateBlock` | Astro | Encart affiliation | `bookmaker`, `cta` |
| `DisclaimerANJ` | Astro | Mention légale ANJ | Aucun (statique) |
| `TeamLogo` | Astro | Logo équipe | `teamId`, `size` |

**Total** : 10 composants couvrent 80% des besoins V1.

---

## 📄 Pages Détaillées (Retenues)

### 1. Homepage

**URL** : `/`
**Template** : `pages/index.astro`
**ISR** : 5 minutes

**Sections** :
1. **Hero** : "Baseball en Direct : MLB, KBO, NPB" + scores live du jour
2. **Prochains Matchs** (J+1) : 3-6 matchs mis en avant
3. **Dernières News** : 6 articles récents (2 par ligue)
4. **Classements Résumés** : Top 3 de chaque division (accordéon)
5. **Pronostic du Jour** : 1 prono IA mis en avant (CTA affiliation)
6. **Encart Affiliation** : Comparatif 3 bookmakers ANJ

**Composants** :
- `ScoreBoard` (React, polling 60s)
- `MatchCard` ×6
- `NewsGrid`
- `StandingsTable` (résumé)
- `PredictionCard`
- `AffiliateBlock`

---

### 2. Hub Ligue (×3)

**URLs** : `/mlb/`, `/kbo/`, `/npb/`
**Template** : `pages/[league]/index.astro`
**ISR** : 5 minutes

**Sections** :
1. **Header Ligue** : Logo, nom, description, saison en cours
2. **Scores du Jour** : Tous les matchs
3. **Classement Complet** : Tableau interactif
4. **Calendrier Prochains Matchs** (7 jours)
5. **Stats Leaders** : Top 5 batteurs + top 5 lanceurs
6. **Dernières News de la Ligue**
7. **Encart Affiliation**

**Composants** :
- `ScoreBoard` (React)
- `StandingsTable`
- `MatchCard`
- `StatTable`
- `NewsGrid`
- `AffiliateBlock`

---

### 3. Page Équipe (×52)

**URLs** : `/mlb/equipes/new-york-yankees/`, etc.
**Template** : `pages/[league]/equipes/[slug].astro`
**ISR** : 1 heure

**Sections** :
1. **Header Équipe** : Logo, nom, ville, stade, fondation, couleurs (fond dégradé)
2. **Fiche Identité** : Division, palmarès, effectif size
3. **Prochain Match** : Card avec lien vers pronostic
4. **Forme Récente** : 5 derniers matchs (W/L badges)
5. **Effectif** : Liste joueurs avec position (liens vers pages joueurs)
6. **Stats Saison** : Tableau (Runs, Avg, ERA, etc.)
7. **News Récentes** : Articles tagués équipe
8. **Encart Affiliation** : Cote prochain match

**Schema.org** : `SportsTeam`

**Composants** :
- `TeamLogo` (grand format)
- `MatchCard`
- `Badge` (W/L)
- `PlayerAvatar` ×25
- `StatTable`
- `NewsGrid`
- `AffiliateBlock`

---

### 4. Page Joueur (×200 V1)

**URLs** : `/mlb/joueurs/shohei-ohtani/`, etc.
**Template** : `pages/[league]/joueurs/[slug].astro`
**ISR** : 1 heure

**Sections** :
1. **Header Joueur** : Photo, nom, équipe, poste, numéro, nationalité
2. **Fiche** : Âge, taille, poids, bats/throws, draft
3. **Stats Saison** : Tableau (selon position : batting ou pitching)
4. **Historique Saisons** : Graphique évolution + tableau
5. **Statut Blessure** : Badge (🟢 OK / 🟡 Day-to-day / 🔴 Blessé)
6. **Derniers Matchs** : 5 derniers avec perfs individuelles
7. **News Récentes**
8. **Anecdote** : Section éditoriale unique (différenciation SEO)

**Schema.org** : `Person` + `Athlete`

**Composants** :
- `PlayerAvatar` (XL)
- `Badge` (statut blessure)
- `StatTable`
- `MatchCard`
- `NewsGrid`

---

### 5. Page Match

**URLs** : `/match/mlb/2026-04-15/yankees-red-sox/`
**Template** : `pages/match/[league]/[date]/[slug].astro`
**ISR** : Build (statique après match terminé)

**Sections** :
1. **Header Match** : Logos, équipes, score, statut (LIVE badge si en cours)
2. **Score Inning par Inning** : Tableau
3. **Box Score** : Stats équipes (hits, errors, LOB)
4. **Résumé Éditorial** : Preview (avant) ou post-match (après)
5. **H2H** : 5 dernières confrontations
6. **Météo** (MLB outdoor seulement)
7. **Lien vers Pronostic** (si existe)
8. **Encart Affiliation** : Cotes bookmakers

**Schema.org** : `SportsEvent`

**Composants** :
- `ScoreBoard` (React si live)
- `StatTable` (innings, box score)
- `MatchCard` (H2H)
- `AffiliateBlock`

---

### 6. Page Pronostic Match (🎯 Monétisation)

**URLs** : `/pronostics/mlb/2026-04-15-yankees-red-sox/`
**Template** : `pages/pronostics/[league]/[slug].astro`
**ISR** : Build (généré 24h avant match, puis statique)

**Sections** :
1. **Header Match** : Logos, équipes, date, heure
2. **Analyse IA** : Texte généré (forme, H2H, blessures, météo, lanceur)
3. **Score de Confiance** : Visuel (jauge 0-100%)
4. **Pronostic Recommandé** : Badge visible (ex: "Yankees ML")
5. **Cotes Comparées** : Tableau (Betclic / Unibet / Winamax) en temps réel
6. **CTA Affiliés** : Boutons "Parier sur Betclic" etc.
7. **Disclaimer ANJ** : Obligatoire, sobre
8. **Stats Clés** : Data cards (forme 5 derniers, avg, ERA lanceurs)
9. **Résultat Final** : Section ajoutée après match (taux de réussite)

**Schema.org** : `Article` + `Review`

**Composants** :
- `MatchCard` (header)
- `Badge` (confiance)
- `StatTable` (cotes)
- `Button` (CTA affiliés)
- `DisclaimerANJ`
- `Card` (stats clés)

---

### 7. Hub Pronostics

**URL** : `/pronostics/?league=mlb` (filtre optionnel)
**Template** : `pages/pronostics/index.astro`
**ISR** : 5 minutes

**Sections** :
1. **Filtres** : Ligue (MLB/KBO/NPB), Date
2. **Liste Pronostics** : Cards avec prono résumé
3. **Bilan** : Taux de réussite derniers 30 jours (crédibilité)
4. **Meilleure Cote du Moment** : Card mise en avant
5. **Encart Affiliation**

**Composants** :
- `PredictionCard` ×10
- `StatTable` (bilan)
- `Badge` (taux réussite)
- `AffiliateBlock`

---

### 8. Pages Stats

**URLs** : `/mlb/stats/batteurs/`, `/mlb/stats/lanceurs/`
**Template** : `pages/[league]/stats/[type].astro`
**ISR** : 24 heures

**Sections** :
1. **Header** : Titre, description, filtres (saison)
2. **Tableau Stats** : Trier par colonne, paginé (20 par page)
3. **Graphiques** : Sparklines évolution top 10

**Composants** :
- `StatTable` (sortable, paginé)
- Graphiques (Chart.js ou Recharts)

---

### 9. Article/News

**URLs** : `/news/mlb/shohei-ohtani-signe-dodgers/`
**Template** : `pages/news/[league]/[slug].astro`
**ISR** : Build

**Sections** :
1. **Header** : Titre, date, auteur, image
2. **Corps** : Contenu éditorial (min 600 mots)
3. **Tags** : Ligue, équipes, joueurs (liens internes)
4. **Articles Connexes** : 3 articles similaires
5. **Encart Affiliation** (si pertinent)

**Schema.org** : `Article` + `NewsArticle`

**Composants** :
- `Badge` (tags)
- `Card` (articles connexes)
- `AffiliateBlock`

---

### 10. Pages Affiliation

**URLs** : `/paris-sportifs/`, `/paris-sportifs/betclic/`, etc.
**Template** : `pages/paris-sportifs/[bookmaker].astro`
**ISR** : Build

**Sections** :
1. **Header Bookmaker** : Logo, note (⭐⭐⭐⭐⭐)
2. **Offre de Bienvenue** : Bonus détaillé
3. **Avantages / Inconvénients** : Liste
4. **CTA** : Bouton affilié principal
5. **Comparatif** : Tableau vs. autres bookmakers
6. **Disclaimer ANJ**

**Schema.org** : `Product` + `Review`

**Composants** :
- `Button` (CTA)
- `Badge` (ANJ approuvé)
- `StatTable` (comparatif)
- `DisclaimerANJ`

---

## 🔗 Maillage Interne (Règles)

### Automatique

- **Chaque mention d'équipe** → lien vers page équipe
- **Chaque mention de joueur** → lien vers page joueur (si page existe)
- **Chaque mention de match** → lien vers page match
- **Breadcrumb** sur toutes les pages

**Implémentation** :
```typescript
// utils/linkify.ts
export function linkifyTeams(text: string): string {
  // Remplace "Yankees" par <a href="/mlb/equipes/yankees/">Yankees</a>
}
```

### Stratégique

- Articles → Liens vers pronostics (si match associé)
- Pronostics → Liens vers pages équipes
- Hub Ligue → Liens vers top joueurs

**Objectif** : Chaque page à max 3 clics de la homepage.

---

## 📊 Priorités SEO par Page

| Type Page | Priority Sitemap | Update Frequency | Index |
|-----------|------------------|------------------|-------|
| Homepage | 1.0 | daily | ✅ |
| Hub Ligue | 0.9 | daily | ✅ |
| Page Pronostic | 0.9 | weekly | ✅ |
| Page Équipe | 0.8 | weekly | ✅ |
| Page Joueur | 0.7 | monthly | ✅ |
| Article News | 0.7 | never | ✅ |
| Page Match | 0.6 | never (après match) | ✅ |
| Pages Stats | 0.6 | monthly | ✅ |
| Pages Affiliation | 0.8 | monthly | ✅ |

---

## 🚀 Prochaines Étapes

1. **Créer `/docs/DESIGN-SYSTEM.md`** avec liste composants + usage
2. **Setup `/frontend/src/styles/tokens.css`**
3. **Configurer Tailwind** avec tokens CSS
4. **Créer 3 composants UI de base** (Button, Card, Badge)
5. **Template Homepage** (MVP)

**Estimation** : 1 semaine pour design system + templates V1.
