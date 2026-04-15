# Design System - home-run.fr

Documentation complète du système de design pour le site baseball (MLB, KBO, NPB).

**Version:** 1.0
**Dernière mise à jour:** 2026-04-15
**Stack:** Astro 5 + CSS Custom Properties

---

## 📐 Typographie

### Familles de polices

```css
--font-display: "Barlow Condensed", Arial Narrow, sans-serif;
--font-body: "Inter", system-ui, sans-serif;
```

**Import Google Fonts:**
```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
```

### Échelle fluide (responsive avec clamp)

```css
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);   /* 12-14px */
--text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);      /* 14-16px */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);   /* 16-18px */
--text-lg: clamp(1.125rem, 1rem + 0.75vw, 1.5rem);      /* 18-24px */
--text-xl: clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem);     /* 24-36px */
--text-2xl: clamp(2rem, 1.2rem + 2.5vw, 3.5rem);        /* 32-56px */
--text-3xl: clamp(2.5rem, 1rem + 4vw, 5rem);            /* 40-80px */
```

### Règles d'usage

| Élément | Taille | Police | Poids | Transform |
|---------|--------|--------|-------|-----------|
| `.hero-title` | `--text-3xl` | `--font-display` | 800 | uppercase |
| `.section-title` | `--text-xl` | `--font-display` | 800 | uppercase |
| Titres de cards | `--text-lg` ou `--text-base` | `--font-display` | 700 | uppercase |
| Corps de texte | `--text-base` | `--font-body` | 400 | — |
| Métadonnées | `--text-xs` | `--font-body` | 400 | uppercase + letter-spacing: 0.06em |

---

## 🎨 Couleurs

### Dark Mode (par défaut)

```css
[data-theme="dark"] {
  /* Backgrounds */
  --color-bg: #080d14;              /* Fond page principal */
  --color-surface: #0e1623;         /* Fond cards/sections */
  --color-surface-2: #141f30;       /* Fond cards headers */
  --color-surface-3: #1a2540;       /* États hover */

  /* Bordures */
  --color-border: rgba(255,255,255,0.07);
  --color-border-strong: rgba(255,255,255,0.14);

  /* Texte */
  --color-text: #e8edf5;            /* Texte principal */
  --color-text-muted: #7d8fa8;      /* Texte secondaire */
  --color-text-faint: #3d4e65;      /* Texte désactivé/labels */

  /* Couleurs de marque */
  --color-navy: #0a1628;
  --color-red: #e8102e;             /* Rouge vif (boutons CTA, badges LIVE) */
  --color-red-dim: #a50d20;         /* Rouge hover */
  --color-red-glow: rgba(232,16,46,0.15);
  --color-green: #22c55e;
  --color-gold: #f59e0b;

  /* Couleurs ligues */
  --color-mlb: #e8102e;
  --color-kbo: #0052a5;
  --color-npb: #e67e00;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.6);
}
```

### Light Mode

```css
[data-theme="light"] {
  --color-bg: #f5f7fb;
  --color-surface: #ffffff;
  --color-surface-2: #f0f3f9;
  --color-surface-3: #e8ecf5;
  --color-border: rgba(0,0,0,0.07);
  --color-border-strong: rgba(0,0,0,0.14);
  --color-text: #111827;
  --color-text-muted: #5a6a82;
  --color-text-faint: #a0b0c8;
  --color-red: #c8102e;             /* Rouge moins vif en light mode */
  --color-red-dim: #e8102e;
  /* ... autres couleurs adaptées */
}
```

---

## 📏 Espacements

```css
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
--space-20: 5rem;     /* 80px */
```

---

## 🔲 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1.25rem;   /* 20px */
--radius-full: 9999px;  /* Cercle/pill */
```

---

## ⚡ Transitions

```css
--transition: 180ms cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 📦 Conteneurs

```css
--content-default: 1200px;  /* Max-width standard */
```

**Utilisation:**
```css
.container {
  max-width: var(--content-default);
  margin-inline: auto;
  padding-inline: var(--space-6);
}
```

---

## 🧩 Composants

### 1. Ticker EN DIRECT

**Usage:** Bande rouge en haut de page avec défilement automatique des scores live.

```html
<div class="ticker">
  <div class="ticker-label">
    <div class="ticker-dot"></div>
    EN DIRECT
  </div>
  <div class="ticker-track">
    <div class="ticker-inner">
      <span class="ticker-item"><strong>MLB</strong> Yankees 4 Red Sox 2 <span>7e manche</span></span>
      <span class="ticker-sep">•</span>
      <!-- répéter les items (x2 pour loop seamless) -->
    </div>
  </div>
</div>
```

**Styles clés:**
- Fond: `--color-red`
- Hauteur: `36px`
- Animation: `scroll 28s linear infinite`
- Dot animé: `pulse 1.5s ease-in-out infinite`

---

### 2. Navbar

**Usage:** Navigation principale sticky avec logo, liens ligues, recherche, dark mode toggle.

```html
<nav class="navbar">
  <div class="navbar-inner">
    <a class="logo" href="/">
      <svg class="logo-icon"><!-- SVG baseball --></svg>
      <span class="logo-text">Base<span>Pro</span>.fr</span>
    </a>

    <ul class="nav-links">
      <li>
        <span class="nav-link active">
          <div class="nav-league-dot" style="background:var(--color-mlb)"></div>
          MLB
        </span>
        <div class="nav-dropdown">
          <div class="nav-dropdown-section">Infos</div>
          <a href="/mlb/equipes/">Équipes</a>
          <!-- ... -->
        </div>
      </li>
      <!-- KBO, NPB, Pronostics, News, Histoire -->
    </ul>

    <div class="nav-right">
      <button class="btn-icon" aria-label="Rechercher">🔍</button>
      <button class="btn-icon" data-theme-toggle>🌙</button>
      <a class="btn-prono" href="/pronostics/">Pronostics du jour</a>
    </div>
  </div>
</nav>
```

**Styles clés:**
- Position: `sticky`, `top: 0`, `z-index: 100`
- Fond: `--color-surface` + `backdrop-filter: blur(12px)`
- Hauteur: `64px`
- Dropdown: apparaît au hover, centré sous le lien
- `.nav-league-dot`: cercle 7px avec couleur de la ligue

---

### 3. Hero

**Usage:** Section d'introduction avec titre principal, sous-titre, CTA et featured game card.

```html
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-left">
        <div class="hero-eyebrow">
          <div class="hero-eyebrow-dot"></div>
          Saison 2026 en cours
        </div>
        <h1 class="hero-title">LA RÉFÉRENCE<br>FRANÇAISE DU<br><span>BASEBALL</span> PRO</h1>
        <p class="hero-subtitle">MLB, KBO, NPB • Scores en direct, classements, stats complètes...</p>
        <div class="hero-actions">
          <a class="btn-primary" href="/mlb/scores/">Scores du jour</a>
          <a class="btn-secondary" href="/pronostics/">Nos pronostics</a>
        </div>
      </div>

      <div class="hero-right">
        <!-- Hero Featured Game Card (voir composant dédié) -->
      </div>
    </div>

    <div class="hero-stats">
      <div class="hero-stat">
        <div class="hero-stat-num">30</div>
        <div class="hero-stat-lbl">Équipes MLB</div>
      </div>
      <!-- ... -->
    </div>
  </div>
</section>
```

**Styles clés:**
- Fond: `linear-gradient(135deg, #060b14 0%, #0a1628 40%, #0d1f3c 100%)`
- Overlay gradient subtil avec radial-gradient (rouge + bleu)
- Titre: `--text-3xl`, `font-weight: 800`, `text-transform: uppercase`, `<span>` en rouge
- Grid: `1fr 420px` (hero-left / hero-right)

---

### 4. Hero Featured Game Card

**Usage:** Card de match live dans le hero (optionnel selon template).

```html
<div class="hero-featured">
  <div class="hero-featured-header">
    <div class="live-badge">
      <div class="ticker-dot"></div>
      En direct
    </div>
    <span class="featured-league">MLB • Division Est</span>
  </div>

  <div class="hero-featured-body">
    <div class="match-teams">
      <div class="match-team">
        <div class="team-logo-circle" style="background:#132448">NYY</div>
        <div class="team-name">Yankees</div>
        <div class="team-city">New York</div>
      </div>

      <div class="match-score-center">
        <div class="match-score">4 - 2</div>
        <div class="match-inning">7e manche</div>
        <div class="match-detail">2 retraits • Bases vides</div>
      </div>

      <div class="match-team">
        <div class="team-logo-circle" style="background:#bd3039">BRS</div>
        <div class="team-name">Red Sox</div>
        <div class="team-city">Boston</div>
      </div>
    </div>

    <div class="match-meta">
      <div class="meta-stat">
        <span class="meta-stat-val">Cole</span>
        <span class="meta-stat-lbl">Lanceur</span>
      </div>
      <!-- ERA, Retraits -->
    </div>
  </div>
</div>
```

**Styles clés:**
- Fond: `--color-surface`, bordure `--color-border-strong`
- Border-radius: `--radius-xl`
- `.team-logo-circle`: 64px, cercle, abbrev équipe en font-display
- Score: `font-size: clamp(2.5rem, 4vw, 3.5rem)`, font-display

---

### 5. Score Card

**Usage:** Card de match (live, à venir, terminé) dans les grids de scores.

```html
<div class="score-card">
  <div class="score-card-header">
    <span class="score-card-league">MLB • Division Est</span>
    <span class="badge-live">
      <div class="ticker-dot"></div>
      7e manche
    </span>
  </div>

  <div class="score-card-body">
    <div class="score-row">
      <div class="score-team-logo" style="background:#132448">NYY</div>
      <div class="score-team-info">
        <div class="score-team-name">New York Yankees</div>
        <div class="score-team-record">35-22 • 1er Est</div>
      </div>
      <div class="score-num leading">4</div>
    </div>

    <div class="score-row">
      <div class="score-team-logo" style="background:#bd3039">BRS</div>
      <div class="score-team-info">
        <div class="score-team-name">Boston Red Sox</div>
        <div class="score-team-record">28-29 • 3e Est</div>
      </div>
      <div class="score-num">2</div>
    </div>
  </div>

  <div class="score-card-footer">
    <div class="score-pitcher">Lanceur : <strong>G. Cole</strong> • ERA 3.24</div>
    <a class="score-link" href="/mlb/match/...">Détail →</a>
  </div>
</div>
```

**Variants badges:**
- `.badge-live`: fond `rgba(232,16,46,0.12)`, texte `--color-red`, dot animé
- `.badge-final`: fond `rgba(255,255,255,0.05)`, texte `--color-text-muted`
- `.badge-scheduled`: fond `rgba(245,158,11,0.12)`, texte `--color-gold`

**Styles clés:**
- `.score-team-logo`: 32px cercle, abbrev équipe, font-display 0.7rem
- `.score-num`: `font-size: 1.5rem`, `font-weight: 800`, font-display
- `.score-num.leading`: texte blanc (équipe qui mène)
- Hover: `border-color: var(--color-border-strong)`, `box-shadow: var(--shadow-md)`

---

### 6. Standings Table

**Usage:** Tableau de classement par division/ligue.

```html
<div class="standings-block">
  <div class="standings-block-header">
    <span class="league-badge" style="background:var(--color-mlb)">MLB</span>
    <span class="standings-division">Division Est AL</span>
  </div>

  <table class="standings-table">
    <thead>
      <tr>
        <th>Équipe</th>
        <th>V</th>
        <th>D</th>
        <th>%</th>
        <th>GB</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <span class="st-rank">1</span>
          <span class="st-team-logo" style="background:#132448">NYY</span>
          <span class="st-team">Yankees</span>
        </td>
        <td class="st-w">35</td>
        <td>22</td>
        <td class="st-pct">.614</td>
        <td class="st-gb">—</td>
      </tr>
      <!-- ... -->
    </tbody>
  </table>

  <div class="standings-footer">
    <a href="/mlb/classement/">Classement complet →</a>
  </div>
</div>
```

**Styles clés:**
- `.st-rank`: `font-size: var(--text-xs)`, couleur `--color-text-faint`
- `.st-team-logo`: 20px cercle inline
- `.st-w`: victoires en vert `--color-green`, `font-weight: 600`
- `.st-pct`: pourcentage en gras
- Hover ligne: fond `--color-surface-2`

---

### 7. League Tabs

**Usage:** Onglets pour filtrer par ligue (MLB/KBO/NPB).

```html
<div class="league-tabs">
  <button class="league-tab active">
    <div class="league-tab-dot" style="background:var(--color-mlb)"></div>
    MLB
  </button>
  <button class="league-tab">
    <div class="league-tab-dot" style="background:var(--color-kbo)"></div>
    KBO
  </button>
  <button class="league-tab">
    <div class="league-tab-dot" style="background:var(--color-npb)"></div>
    NPB
  </button>
</div>
```

**Styles clés:**
- Bordure: `1px solid var(--color-border)`
- Border-radius: `var(--radius-full)` (pill)
- `.active`: fond `--color-surface`, bordure `--color-border-strong`
- `.league-tab-dot`: 7px cercle avec couleur de la ligue

---

### 8. News Card

**Usage:** Card d'article avec image, tag catégorie, titre, excerpt.

```html
<div class="news-card">
  <div class="news-img" style="aspect-ratio:16/9">
    <div class="news-img-overlay"></div>
    <div class="news-img-tag" style="background:var(--color-red)">MLB • À LA UNE</div>
    📷
  </div>

  <div class="news-body">
    <div class="news-meta">
      <span>15 avr. 2026</span>
      <span>•</span>
      <span>MLB</span>
    </div>
    <h3 class="news-title">Shohei Ohtani frappe son 20e home run de la saison</h3>
    <p class="news-excerpt">Dans une performance magistrale face aux Giants...</p>
    <a class="news-read-more" href="/news/...">Lire l'article →</a>
  </div>
</div>
```

**Variant featured:**
- `.news-card.featured`: `grid-row: span 2` (occupe 2 lignes)
- Titre plus grand: `--text-lg` au lieu de `--text-base`

**Styles clés:**
- `.news-img`: gradient de placeholder + overlay noir vers le bas
- `.news-img-tag`: position absolute, top-left, uppercase, font-weight 700
- `.news-title`: font-display, uppercase, line-height: 1.2
- Hover: `border-color: var(--color-border-strong)`, `box-shadow: var(--shadow-md)`

---

### 9. Prono Banner

**Usage:** Bannière pour mettre en avant les pronostics IA.

```html
<div class="prono-banner">
  <div class="prono-icon">🎯</div>
  <div class="prono-text">
    <div class="prono-eyebrow">NOUVEAU • SCOUT IA</div>
    <div class="prono-title">Pronostics générés par IA, analysés par des passionnés</div>
    <p class="prono-desc">Notre moteur analyse les 5 derniers matchs, les confrontations directes...</p>
  </div>
  <div class="prono-actions">
    <a class="btn-primary" href="/pronostics/">Voir les pronostics</a>
    <a class="btn-secondary" href="/pronostics/comment-ca-marche/">Comment ça marche ?</a>
  </div>
</div>
```

**Styles clés:**
- Fond: `linear-gradient(135deg, #0a0f1c 0%, #0d1628 50%, #0a0f1c 100%)`
- Border-radius: `--radius-xl`
- Overlay radial-gradient rouge à droite (opacity 0.08)
- Layout: flex row avec gap

---

### 10. Betting Strip

**Usage:** Bande de bookmakers agréés ANJ avec bonus.

```html
<div class="betting-strip">
  <div class="betting-strip-header">
    <span class="betting-label">PARIS SPORTIFS • OPÉRATEURS AGRÉÉS ANJ</span>
    <span class="betting-legal">18+ • Jouer responsablement</span>
  </div>

  <div class="bookmakers-row">
    <div class="bookmaker-pill">
      <span>🎰</span>
      <span>Betclic</span>
      <span class="bonus">Jusqu'à 200€</span>
    </div>
    <div class="bookmaker-pill">
      <span>🎰</span>
      <span>Unibet</span>
      <span class="bonus">150€ offerts</span>
    </div>
    <!-- ... -->
  </div>

  <div class="betting-legal-footer">
    Les paris sportifs comportent des risques. Jouez de façon responsable. Interdit aux mineurs...
  </div>
</div>
```

**Styles clés:**
- Fond: `--color-surface`, bordure `--color-border`
- `.bonus`: texte vert `--color-green`, `font-weight: 700`
- `.bookmaker-pill`: `border-radius --radius-full`, hover → bordure strong

---

### 11. Section Standard

**Usage:** Container de section avec header (titre + lien "Voir tout").

```html
<section class="section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">SCORES <span>DU JOUR</span></h2>
      <a class="section-link" href="/mlb/scores/">Tous les scores →</a>
    </div>

    <!-- Contenu de la section -->
  </div>
</section>
```

**Styles clés:**
- `.section`: `padding: var(--space-12) 0`
- `.section-title`: font-display, `--text-xl`, `font-weight: 800`, uppercase
- `.section-title span`: couleur rouge
- `.section-link`: `--text-sm`, couleur `--color-text-muted`, hover → `--color-red`

---

### 12. Buttons

**Variants:**

```html
<!-- Primary (CTA rouge) -->
<button class="btn-primary">Scores du jour</button>

<!-- Secondary (bordure) -->
<button class="btn-secondary">Nos pronostics</button>

<!-- Icon (navbar) -->
<button class="btn-icon">🔍</button>

<!-- Prono (navbar rouge) -->
<a class="btn-prono" href="/pronostics/">Pronostics du jour</a>
```

**Styles clés:**
- `.btn-primary`: fond `--color-red`, hover → `--color-red-dim` + `box-shadow: 0 0 24px var(--color-red-glow)`
- `.btn-secondary`: fond transparent, bordure `--color-border-strong`, hover → fond `rgba(255,255,255,0.10)`
- `.btn-icon`: 36×36px, fond transparent, hover → fond `--color-surface-2`
- `.btn-prono`: fond `--color-red`, padding `var(--space-2) var(--space-4)`

---

### 13. Footer

**Usage:** Footer complet avec logo, liens, mentions légales ANJ.

```html
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo">
          <svg class="logo-icon">...</svg>
          <span class="logo-text">Base<span>Pro</span>.fr</span>
        </div>
        <p>La référence française du baseball professionnel. MLB, KBO et NPB couverts en temps réel.</p>
      </div>

      <div>
        <div class="footer-col-title">MLB</div>
        <ul class="footer-links">
          <li><a href="/mlb/equipes/">Équipes</a></li>
          <li><a href="/mlb/joueurs/">Joueurs</a></li>
          <!-- ... -->
        </ul>
      </div>

      <!-- Colonnes KBO, NPB, Infos -->
    </div>

    <div class="footer-bottom">
      <p class="footer-legal">
        BasePro.fr est un site d'information sur le baseball professionnel.
        Les pronostics publiés sont à titre indicatif...
        18+. Tous les opérateurs d'affiliation présentés sur ce site sont agréés par l'ANJ.
        <a href="https://www.jeu-responsable.fr" style="color:var(--color-red)">jeu-responsable.fr</a>
      </p>
      <div class="footer-meta">© 2026 BasePro.fr • Tous droits réservés</div>
    </div>
  </div>
</footer>
```

**Styles clés:**
- Fond: `--color-surface`, bordure top `--color-border`
- `.footer-grid`: `grid-template-columns: 2fr 1fr 1fr 1fr`
- `.footer-legal`: `font-size: 10px`, `color: var(--color-text-faint)`, `max-width 80ch`

---

### 14. Search Overlay

**Usage:** Overlay plein écran pour la recherche (apparaît avec Cmd+K ou clic sur icône).

```html
<div class="search-bar" id="searchBar">
  <div class="search-box">
    <div class="search-input-wrap">
      <svg>🔍</svg>
      <input class="search-input" placeholder="Chercher un joueur, une équipe, un match...">
      <span class="search-hint"><kbd>échap</kbd> pour fermer</span>
    </div>
    <div class="search-shortcuts">
      <span class="search-hint">Recherches populaires :</span>
      <span class="search-hint" style="color:var(--color-red)">Shohei Ohtani • Yankees • Yomiuri Giants • Pronostics MLB</span>
    </div>
  </div>
</div>
```

**Styles clés:**
- Position: `fixed inset-0`, `z-index: 1000`
- Fond: `rgba(0,0,0,0.8)` + `backdrop-filter: blur(4px)`
- `.search-box`: 600px max, centré, fond `--color-surface`
- État `.open`: `opacity: 1`, `pointer-events: all`

---

## 📐 Grids & Layouts

### Scores Grid

```css
.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}
```

### Standings Grid (3 colonnes)

```css
.standings-wrap {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 1024px) {
  .standings-wrap {
    grid-template-columns: 1fr;
  }
}
```

### News Grid

```css
.news-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: var(--space-4);
}

/* Item featured occupe 2 lignes */
.news-card.featured {
  grid-row: span 2;
}
```

---

## 🎨 Règles Visuelles

### Hiérarchie des titres

- **Hero Title**: `--text-3xl`, uppercase, `--font-display`, `font-weight: 800`
- **Section Title**: `--text-xl`, uppercase, `--font-display`, `font-weight: 800`, mot clé en rouge
- **Card Title**: `--text-lg` ou `--text-base`, uppercase, `--font-display`, `font-weight: 700`
- **Body Text**: `--text-base`, `--font-body`, `font-weight: 400`

### États interactifs

- **Hover links/buttons**: color change + `transition: var(--transition)`
- **Hover cards**: `border-color: var(--color-border-strong)` + `box-shadow: var(--shadow-md)`
- **Active state**: fond `--color-surface` ou `--color-red` selon le composant

### Badges & Pills

Tous en `border-radius: var(--radius-full)`:
- `text-transform: uppercase`
- `font-size: 10px` ou `--text-xs`
- `font-weight: 700`
- `letter-spacing: 0.06em`
- Padding: `2px 8px` ou `3px 10px`
- Avec dot animé si badge LIVE

Exemple:

```css
.badge-live {
  background: rgba(232,16,46,0.12);
  color: var(--color-red);
  border-radius: var(--radius-full);
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 5px;
}
```

---

## 🎬 Animations

```css
/* Pulse (dot LIVE) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
/* Usage: animation: pulse 1.5s ease-in-out infinite; */

/* Scroll ticker */
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
/* Usage: animation: scroll 28s linear infinite; */
```

---

## 📱 Responsiveness

### Breakpoints principaux

- **Desktop**: > 1024px (layout par défaut)
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

### Règles clés

```css
/* Hero grid → 1 colonne sur mobile */
@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .standings-wrap {
    grid-template-columns: 1fr;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }
}

/* Navbar → hamburger menu sur mobile (à implémenter) */
@media (max-width: 768px) {
  .nav-links {
    display: none; /* Ou menu burger */
  }
}
```

---

## 🔧 Composants Utilitaires

### Container

```css
.container {
  max-width: var(--content-default); /* 1200px */
  margin-inline: auto;
  padding-inline: var(--space-6);
}
```

### Team Logo Circle (détails complets)

**Tailles disponibles:**

```css
/* Small - 20px (tables, inline) */
.st-team-logo {
  width: 20px;
  height: 20px;
  font-size: 0.55rem;
}

/* Medium - 32px (score cards) */
.score-team-logo {
  width: 32px;
  height: 32px;
  font-size: 0.7rem;
}

/* Large - 64px (hero featured) */
.team-logo-circle {
  width: 64px;
  height: 64px;
  font-size: 1.5rem;
}
```

**Style commun:**

```css
font-family: var(--font-display);
font-weight: 800;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
color: #fff;
flex-shrink: 0;
```

### Section Divider

```css
.section-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0;
}
```

---

## 📝 Conventions de Code

### Nommage CSS (BEM-like)

Format: `.block__element--modifier`

**Exemples:**
- Composants: `.score-card`, `.news-card`, `.standings-table`
- Éléments: `.score-card-header`, `.news-card-body`
- États: `.active`, `.leading`, `.featured`, `.open`
- Variants: `.badge-live`, `.badge-final`, `.btn-primary`, `.btn-secondary`

### Structure HTML Standard

```html
<section class="section">
  <div class="container">
    <!-- Section Header -->
    <div class="section-header">
      <h2 class="section-title">TITRE <span>HIGHLIGHT</span></h2>
      <a class="section-link" href="/voir-tout/">Voir tout →</a>
    </div>

    <!-- Section Content -->
    <div class="[grid-class]">
      <!-- Cards/Components -->
    </div>
  </div>
</section>
```

### Classes Utilitaires à Créer

```css
/* Text */
.text-uppercase { text-transform: uppercase; }
.text-muted { color: var(--color-text-muted); }
.text-faint { color: var(--color-text-faint); }
.text-red { color: var(--color-red); }
.font-display { font-family: var(--font-display); }
.font-body { font-family: var(--font-body); }

/* Spacing */
.mt-4 { margin-top: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.gap-4 { gap: var(--space-4); }

/* Layout */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
```

---

## 🎯 Checklist d'Implémentation

### Pour chaque composant :

- [ ] Utilise uniquement les tokens CSS définis (pas de valeurs en dur)
- [ ] Respecte la hiérarchie typographique (hero-title > section-title > card-title)
- [ ] Inclut tous les états (default, hover, active, disabled)
- [ ] Est responsive avec les breakpoints définis
- [ ] Utilise `--font-display` pour titres/chiffres/abbréviations
- [ ] Utilise `--font-body` pour le texte courant
- [ ] Bordures: `--color-border` (subtile) ou `--color-border-strong` (visible)
- [ ] Shadows: `--shadow-sm/md/lg` selon la profondeur
- [ ] Transitions: `--transition` (180ms cubic-bezier)
- [ ] Couleurs ligues: `--color-mlb/kbo/npb` pour les dots/badges

### Pour chaque page :

- [ ] Ticker EN DIRECT en haut (si scores live disponibles)
- [ ] Navbar sticky avec logo + nav + boutons droite
- [ ] Utilise `.container` pour centrer le contenu (max 1200px)
- [ ] Sections espacées avec `padding: var(--space-12) 0`
- [ ] Footer complet avec mentions ANJ obligatoires
- [ ] Meta tags SEO: title (60 char max), description (160 char max), og:image
- [ ] Schema.org JSON-LD si applicable (SportsTeam, Article, Event)
- [ ] Dark mode par défaut: `<html data-theme="dark">`
- [ ] Accessibilité: liens avec aria-label, images avec alt, contraste WCAG AA

---

## 📚 Références

- **Google Fonts**: Barlow Condensed + Inter
- **Stack**: Astro 5 + CSS Custom Properties
- **Conformité**: ANJ (paris sportifs), RGPD, WCAG AA
- **Inspiration design**: Mockup BasePro.fr (2026-04-15)

---

**Note**: Ce design system est un document vivant. Mettez à jour cette documentation à chaque ajout/modification de composant ou token.
