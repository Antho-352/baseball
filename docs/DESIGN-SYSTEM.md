# Design System - home-run.fr

**Version** : 1.0
**Date** : 2026-04-15

---

## Architecture Globale

```
Design System Architecture
├── Tokens (CSS Custom Properties)
│   └── /frontend/src/styles/tokens.css
├── Components (Astro + React Islands)
│   └── /frontend/src/components/ui/
├── Utilities (Tailwind + Custom)
│   └── tailwind.config.cjs
└── Documentation
    └── /docs/DESIGN-SYSTEM.md (ce fichier)
```

**Principes** :
- **Tokens-first** : Toutes les valeurs de design dans tokens.css (colors, typography, spacing, shadows, radius)
- **Hybrid Tailwind** : Utilities pour layout/structure, tokens pour design system
- **Dark mode** : `data-theme="dark"` avec override des tokens CSS
- **Progressive enhancement** : Astro statique + React Islands pour interactivité
- **Solo-maintainable** : Pas de Storybook, markdown suffit

---

## 1. Tokens CSS

**Fichier** : `/frontend/src/styles/tokens.css`

### 1.1 Couleurs

```css
:root {
  /* Brand */
  --color-primary: #1e40af;     /* Blue-800 */
  --color-secondary: #dc2626;   /* Red-600 */

  /* Neutrals */
  --color-bg: #ffffff;
  --color-surface: #f9fafb;     /* Gray-50 */
  --color-border: #e5e7eb;      /* Gray-200 */
  --color-text: #111827;        /* Gray-900 */
  --color-text-muted: #6b7280;  /* Gray-500 */

  /* Status */
  --color-success: #16a34a;     /* Green-600 */
  --color-warning: #eab308;     /* Yellow-500 */
  --color-error: #dc2626;       /* Red-600 */
  --color-info: #3b82f6;        /* Blue-500 */

  /* Live/Scores */
  --color-live: #ef4444;        /* Red-500 (pulsing) */
  --color-win: #10b981;         /* Green-500 */
  --color-loss: #6b7280;        /* Gray-500 */
}

[data-theme="dark"] {
  --color-bg: #0f172a;          /* Slate-900 */
  --color-surface: #1e293b;     /* Slate-800 */
  --color-border: #334155;      /* Slate-700 */
  --color-text: #f1f5f9;        /* Slate-100 */
  --color-text-muted: #94a3b8;  /* Slate-400 */
}
```

### 1.2 Typographie

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### 1.3 Spacing

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### 1.4 Shadows & Effects

```css
:root {
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Border Radius */
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;  /* 12px */
  --radius-xl: 1rem;     /* 16px */
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 2. Composants UI (10 essentiels)

### 2.1 Button

**Fichier** : `/frontend/src/components/ui/Button.astro`

**Variantes** :
- `variant`: `primary` | `secondary` | `ghost` | `link`
- `size`: `sm` | `md` | `lg`

**Usage** :
```astro
<Button variant="primary" size="md">
  Voir le match
</Button>
```

**Règles** :
- Utilise `--color-primary`, `--transition-base`, `--radius-md`
- Focus ring visible (accessibilité)
- Disabled state avec opacity 0.5

### 2.2 Card

**Fichier** : `/frontend/src/components/ui/Card.astro`

**Props** :
- `variant`: `default` | `bordered` | `elevated`
- `padding`: `sm` | `md` | `lg`

**Usage** :
```astro
<Card variant="elevated" padding="md">
  <h3>Match du jour</h3>
  <p>Dodgers vs Yankees</p>
</Card>
```

**Règles** :
- Background: `--color-surface`
- Border: `--color-border`
- Shadow: `--shadow-md` (si elevated)

### 2.3 Badge

**Fichier** : `/frontend/src/components/ui/Badge.astro`

**Variantes** :
- `status`: `live` | `finished` | `postponed` | `scheduled`
- `size`: `sm` | `md`

**Usage** :
```astro
<Badge status="live">EN DIRECT</Badge>
```

**Règles** :
- Live: `--color-live` avec animation pulse
- Finished: `--color-text-muted`
- Border radius: `--radius-full`

### 2.4 ScoreBoard

**Fichier** : `/frontend/src/components/ui/ScoreBoard.astro`

**Props** :
```typescript
interface Props {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'final' | 'scheduled';
  inning?: string;
}
```

**Usage** :
```astro
<ScoreBoard
  homeTeam="Dodgers"
  awayTeam="Yankees"
  homeScore={5}
  awayScore={3}
  status="live"
  inning="8e manche"
/>
```

**Règles** :
- Grid 3 colonnes: team | score | team
- Winner en `--font-bold`
- Live badge si status="live"

### 2.5 StandingsTable

**Fichier** : `/frontend/src/components/ui/StandingsTable.astro`

**Props** :
```typescript
interface Props {
  standings: Array<{
    rank: number;
    teamName: string;
    wins: number;
    losses: number;
    pct: number;
    gb: number;
  }>;
}
```

**Usage** :
```astro
<StandingsTable standings={mlbStandings} />
```

**Règles** :
- Responsive: scroll horizontal sur mobile
- Zebra striping: `nth-child(even)` avec `--color-surface`
- Top 3 avec accent visuel

### 2.6 PlayerCard

**Fichier** : `/frontend/src/components/ui/PlayerCard.astro`

**Props** :
```typescript
interface Props {
  name: string;
  position: string;
  teamLogo: string;
  stats: { label: string; value: string }[];
}
```

**Usage** :
```astro
<PlayerCard
  name="Shohei Ohtani"
  position="DH/SP"
  teamLogo="/teams/dodgers.svg"
  stats={[
    { label: 'AVG', value: '.304' },
    { label: 'HR', value: '44' },
  ]}
/>
```

**Règles** :
- Card elevated
- Team colors border (si disponibles dans config)
- Grid stats 2 colonnes

### 2.7 GameCard

**Fichier** : `/frontend/src/components/ui/GameCard.astro`

**Props** :
```typescript
interface Props {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  startTime: Date;
}
```

**Usage** :
```astro
<GameCard
  homeTeam="Dodgers"
  awayTeam="Yankees"
  homeScore={5}
  awayScore={3}
  status="live"
  startTime={new Date()}
/>
```

**Règles** :
- Utilise ScoreBoard en interne
- Badge status
- CTA "Voir le match" (lien vers /match/[id])

### 2.8 StatWidget

**Fichier** : `/frontend/src/components/ui/StatWidget.astro`

**Props** :
```typescript
interface Props {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}
```

**Usage** :
```astro
<StatWidget
  label="AVG"
  value=".304"
  trend="up"
  icon="arrow-up"
/>
```

**Règles** :
- Trend up: `--color-success`
- Trend down: `--color-error`
- Value en `--text-2xl`, `--font-bold`

### 2.9 NavBar

**Fichier** : `/frontend/src/components/ui/NavBar.astro`

**Props** :
```typescript
interface Props {
  currentPath: string;
}
```

**Usage** :
```astro
<NavBar currentPath={Astro.url.pathname} />
```

**Règles** :
- Fixed top sur desktop
- Sticky sur mobile
- Active link: `--color-primary`
- Dark mode toggle button

### 2.10 Footer

**Fichier** : `/frontend/src/components/ui/Footer.astro`

**Props** : Aucune (contenu statique)

**Usage** :
```astro
<Footer />
```

**Règles** :
- Background: `--color-surface`
- 3 colonnes desktop: Liens rapides | Ressources | Social
- Stack vertical mobile
- Legal: CGU, Mentions légales, Confidentialité

---

## 3. Conventions de Nommage

### 3.1 Fichiers

```
✅ Button.astro          (PascalCase pour composants)
✅ ScoreBoard.astro      (PascalCase composé)
✅ tokens.css            (kebab-case pour styles)
✅ utils.ts              (kebab-case pour utils)
```

### 3.2 CSS

```css
/* Tokens */
--color-primary          /* kebab-case */
--space-4                /* kebab-case + nombre */

/* Classes utilitaires */
.card-elevated           /* kebab-case */
.text-muted              /* kebab-case */
```

### 3.3 Props TypeScript

```typescript
interface Props {
  teamName: string;      // camelCase
  homeScore: number;     // camelCase
  isLive: boolean;       // camelCase avec is/has
}
```

---

## 4. Dark Mode

### 4.1 Implémentation

**Toggle** :
```typescript
// /frontend/src/components/ui/DarkModeToggle.tsx (React Island)
const toggleDarkMode = () => {
  const html = document.documentElement;
  const current = html.dataset.theme;
  html.dataset.theme = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', html.dataset.theme);
};
```

**Initialisation** :
```astro
<!-- /frontend/src/layouts/BaseLayout.astro -->
<script is:inline>
  const theme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
</script>
```

### 4.2 Tester Dark Mode

```css
/* Exemple dans un composant */
.my-element {
  background: var(--color-surface);  /* Auto-adapte selon theme */
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

**JAMAIS** :
```css
❌ background: #ffffff;  /* Hard-coded, pas de dark mode */
✅ background: var(--color-bg);
```

---

## 5. Responsive Design

### 5.1 Breakpoints

```css
/* Mobile first */
:root {
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
}
```

### 5.2 Usage Tailwind

```astro
<!-- Mobile first: défaut mobile, puis override -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 1 col mobile, 2 col tablet, 3 col desktop -->
</div>
```

### 5.3 Container

```css
.container {
  width: 100%;
  max-width: var(--breakpoint-xl);
  margin: 0 auto;
  padding: 0 var(--space-4);
}
```

---

## 6. Accessibilité (A11Y)

### 6.1 Règles Obligatoires

- **Contraste** : WCAG AA minimum (4.5:1 pour texte)
- **Focus visible** : Tous les éléments interactifs
- **Alt text** : Toutes les images
- **ARIA labels** : Boutons icônes uniquement
- **Keyboard navigation** : Tab order logique

### 6.2 Checklist Composant

```
☑ Focus ring visible
☑ Color contrast >= 4.5:1
☑ Semantic HTML (<button>, <nav>, <article>)
☑ ARIA labels si nécessaire
☑ Keyboard accessible
```

---

## 7. Performance

### 7.1 Images

- **Format** : WebP avec fallback PNG
- **Lazy loading** : `loading="lazy"` pour images below fold
- **Team logos** : SVG quand possible (scalable)

### 7.2 Fonts

```astro
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
```

### 7.3 CSS

- Tokens chargés en `<head>` (blocking, mais minuscule)
- Tailwind purge activé (prod uniquement)
- Critical CSS inline pour homepage

---

## 8. Testing Visuel

### 8.1 Manual Testing Checklist

```
☑ Light mode
☑ Dark mode
☑ Mobile (375px iPhone SE)
☑ Tablet (768px iPad)
☑ Desktop (1440px)
☑ Focus states
☑ Hover states
☑ Loading states
```

### 8.2 Browser Support

- **Modern** : Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **NO IE11** : Site moderne, pas de legacy

---

## 9. Maintenance

### 9.1 Ajouter une Couleur

1. Ajouter dans `tokens.css`
```css
:root {
  --color-new: #hexcode;
}
```

2. Documenter dans cette section
3. Tester light + dark mode

### 9.2 Ajouter un Composant

1. Créer `/frontend/src/components/ui/NewComponent.astro`
2. Définir Props TypeScript
3. Utiliser tokens CSS uniquement
4. Tester responsive + dark mode
5. Ajouter exemple dans ce doc (section 2)

### 9.3 Modifier un Token

⚠️ **ATTENTION** : Modifier un token affecte TOUS les composants

1. Tester impact visuel sur 3 pages minimum
2. Vérifier contraste dark mode
3. Commit avec message explicite

---

## 10. Exemples d'Usage

### 10.1 Page Basique

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import Card from '@components/ui/Card.astro';
import Button from '@components/ui/Button.astro';
---

<BaseLayout title="Exemple">
  <div class="container mx-auto py-8">
    <Card variant="elevated" padding="lg">
      <h1 class="text-3xl font-bold mb-4">Titre</h1>
      <p class="text-base text-muted mb-6">Contenu</p>
      <Button variant="primary">Action</Button>
    </Card>
  </div>
</BaseLayout>
```

### 10.2 Liste de Matchs

```astro
---
import GameCard from '@components/ui/GameCard.astro';
const games = await fetch('/api/games').then(r => r.json());
---

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {games.map(game => (
    <GameCard {...game} />
  ))}
</div>
```

---

## 11. Ressources

- **Couleurs** : [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)
- **Typographie** : [Inter Font](https://rsms.me/inter/)
- **Accessibilité** : [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)
- **Icons** : [Lucide Icons](https://lucide.dev/) (React compatible)

---

## Changelog

- **2026-04-15** : Version initiale
  - 10 composants essentiels définis
  - Tokens CSS complets
  - Dark mode architecture
  - Responsive breakpoints
