# Analyse Architecture URL & Templates - Baseball FR

## 1. Structure URL proposée - Analyse SEO

### ✅ Points forts
- Siloing clair par ligue (`/mlb/`, `/kbo/`, `/npb/`)
- URLs descriptives et prévisibles
- Hiérarchie logique pour Google

### ⚠️ Risques identifiés

#### Cannibalisation potentielle
```
/news/mlb/ vs /mlb/ (hub)
→ Risque : les deux ciblent "actualités MLB"
→ Solution : /mlb/ = scores/calendrier, /news/mlb/ = articles éditoriaux
```

#### Crawl budget sur pages joueurs
- MLB : ~1200 joueurs (30 équipes × 40 joueurs)
- KBO/NPB : ~500 chacun
- **Total V1 : ~2200 pages joueurs**

**Question** : Faut-il paginer ou créer des sous-catégories ?
```
Option A : /mlb/joueurs/ (liste paginée de 2200 joueurs)
Option B : /mlb/joueurs/batteurs/ + /mlb/joueurs/lanceurs/
Option C : Seulement les "stars" en V1 (~200 joueurs top)
```

**Ma recommandation : Option C pour V1** (évite le thin content, focus qualité)

#### URLs bilingues - Incohérence
```
/mlb/equipes/new-york-yankees/
     ↑ FR      ↑ EN
```

**Alternatives** :
```
A. /mlb/equipes/yankees/ (court, mais perd "New York")
B. /mlb/equipes/yankees-new-york/ (+ français)
C. /mlb/equipes/new-york-yankees/ (+ SEO international)
```

**Ma recommandation : Option C**
- Slugs d'équipes sont des noms propres (pas besoin de traduire)
- SEO : les gens cherchent "New York Yankees" pas "Yankees de New York"
- Cohérence avec sources de données (MLB API utilise noms EN)

#### Structure URLs pronostics

**Proposition actuelle** :
```
/pronostics/mlb/yankees-red-sox-2026-04-15/
```

**Problème** : Yankees vs Red Sox jouent 19 fois/saison
→ Besoin de différencier chaque rencontre

**Alternatives** :
```
A. /pronostics/mlb/2026-04-15-yankees-vs-red-sox/
   ✅ Date en premier = groupement SEO par date
   ✅ Compatible avec sitemap par mois

B. /pronostics/mlb/yankees-vs-red-sox/2026-04-15/
   ❌ Moins bon pour SEO (date enfouie)

C. /pronostics/mlb/2026/04/15/yankees-vs-red-sox/
   ✅ Meilleur siloing par année/mois
   ❌ URL plus longue
```

**Ma recommandation : Option A** (compromis SEO/simplicité)

---

## 2. Templates - Découpage proposé

### Templates identifiés (11 au lieu de 8)

| # | Template | Exemples d'URLs | Type Astro |
|---|----------|----------------|------------|
| 1 | **Homepage** | `/` | Static |
| 2 | **Hub ligue** | `/mlb/`, `/kbo/`, `/npb/` | Dynamic |
| 3 | **Liste équipes** | `/mlb/equipes/` | Static |
| 4 | **Page équipe** | `/mlb/equipes/yankees/` | Dynamic |
| 5 | **Liste joueurs** | `/mlb/joueurs/` | Static |
| 6 | **Page joueur** | `/mlb/joueurs/ohtani/` | Dynamic |
| 7 | **Scores live** | `/mlb/scores/`, `/mlb/resultats/2026-04-15/` | Hybrid |
| 8 | **Classements** | `/mlb/classement/`, `/mlb/classement/2025/` | Static |
| 9 | **Stats** | `/mlb/stats/batteurs/` | Static |
| 10 | **Page pronostic** | `/pronostics/mlb/2026-04-15-yankees-vs-red-sox/` | Dynamic |
| 11 | **Article news** | `/news/slug/` | Static (CMS) |
| 12 | **Page CMS** | `/paris-sportifs/betclic/`, `/histoire/mlb/` | Static (CMS) |

### Question de fusion

**Templates 7, 8, 9 : peuvent-ils être fusionnés ?**

Non, car :
- Template 7 (scores) → données temps réel, fetch client-side
- Template 8 (classements) → données statiques, SSG
- Template 9 (stats) → listes triables, interactivité

**Proposition** : garder séparés mais partager les composants de présentation

---

## 3. Stratégie de rendu par template

| Template | Rendu | Revalidation | Raison |
|----------|-------|--------------|--------|
| Homepage | SSG | ISR 5min | Scores changent souvent |
| Hub ligue | SSG | ISR 5min | idem |
| Liste équipes | SSG | Build | Stable (30 équipes MLB) |
| Page équipe | SSG | ISR 1h | Stats mises à jour post-match |
| Liste joueurs | SSG | Build | Stable (liste pré-filtrée stars) |
| Page joueur | SSG | ISR 1h | Stats mises à jour post-match |
| Scores live | Client fetch | Polling 1min | Temps réel côté client |
| Classements | SSG | ISR 24h | Change 1×/jour max |
| Stats | SSG | ISR 24h | idem |
| **Pronostic** | **SSG** | **Aucune** | Généré 24h avant match, statique après |
| Article news | SSG | Build | Statique après publication CMS |
| Page CMS | SSG | Build | Statique |

### Focus : Génération automatique des pronostics

**Workflow proposé** :

```
[Cron quotidien 10h00]
   ↓
Récupère matchs J+1 via MLB API
   ↓
Pour chaque match :
   ├─ Collecte données contextuelles (forme, H2H, blessures, météo)
   ├─ Appel API IA (Claude/GPT) avec prompt structuré
   ├─ Récupère cotes bookmakers (API affiliation)
   ├─ Génère page pronostic (status: draft)
   └─ Notif admin : "3 pronostics à valider"
      ↓
[Validation manuelle dans CMS]
   ↓
Publication (status: published)
   ↓
Build Astro → page pronostic devient statique
   ↓
Indexation Google (sitemap mis à jour)
```

**Questions critiques** :

1. **Timing de génération** : 24h avant le match suffisant pour validation manuelle ?
2. **Matchs imprévus/reportés** : webhook pour regénérer ou tolérer le décalage ?
3. **Auto-publication** : possibilité d'activer en V2 après validation de la qualité IA sur 50+ pronostics ?

---

## 4. Schéma BDD - Proposition

```sql
-- Entités sportives
leagues (id, name, slug, country, api_source)
teams (id, league_id, name, slug, logo_url, api_team_id)
players (id, team_id, name, slug, position, api_player_id, is_star BOOLEAN)
games (id, league_id, home_team_id, away_team_id, game_date, status, api_game_id)
game_stats (game_id, team_id, runs, hits, errors, ...)
player_stats (player_id, season, batting_avg, home_runs, ...)
injuries (id, player_id, injury_type, status, updated_at)
standings (id, league_id, team_id, season, wins, losses, rank)

-- Pronostics
predictions (
  id,
  game_id FOREIGN KEY,
  slug VARCHAR(255) UNIQUE, -- pour URL
  ai_analysis JSON, -- résultat brut de l'IA
  recommended_bet TEXT, -- "Victoire Yankees"
  confidence_score DECIMAL, -- 0-100
  status ENUM('draft', 'published', 'archived'),
  published_at TIMESTAMP,
  created_at TIMESTAMP
)

odds (
  id,
  game_id FOREIGN KEY,
  bookmaker VARCHAR(50), -- 'betclic', 'unibet', 'winamax'
  home_win DECIMAL,
  draw DECIMAL,
  away_win DECIMAL,
  fetched_at TIMESTAMP
)

-- CMS
articles (
  id,
  title,
  slug,
  content TEXT,
  category VARCHAR(50), -- 'news', 'analysis', 'histoire'
  league_id FOREIGN KEY (nullable),
  featured_image_url,
  status ENUM('draft', 'published'),
  published_at TIMESTAMP
)

cms_pages (
  id,
  slug,
  title,
  content TEXT,
  template VARCHAR(50), -- 'affiliation', 'encyclopedie'
  published_at TIMESTAMP
)

-- Affiliation
bookmakers (
  id,
  name VARCHAR(50),
  slug VARCHAR(50),
  logo_url,
  affiliate_link TEXT,
  is_anj_approved BOOLEAN DEFAULT true
)

clicks_tracking (
  id,
  bookmaker_id,
  page_url TEXT,
  clicked_at TIMESTAMP,
  ip_hash VARCHAR(64) -- anonymisé RGPD
)
```

---

## 5. Questions pour finaliser

### URLs

**Q1** : URLs équipes - quelle option ?
- A. `/mlb/equipes/yankees/` (court)
- B. `/mlb/equipes/yankees-new-york/` (+ français)
- C. `/mlb/equipes/new-york-yankees/` (+ SEO, ma recommandation)

**Q2** : URLs pronostics - quelle option ?
- A. `/pronostics/mlb/2026-04-15-yankees-vs-red-sox/` (ma recommandation)
- B. `/pronostics/mlb/yankees-vs-red-sox/2026-04-15/`
- C. `/pronostics/mlb/2026/04/15/yankees-vs-red-sox/`

### Contenu

**Q3** : Pages joueurs V1
- A. Tous les joueurs (~2200 pages)
- B. Seulement les stars (~200 pages, ma recommandation)
- C. Joueurs actifs seulement avec filtre qualité (stats > seuil)

**Q4** : Pronostics - timing
- Génération 24h avant le match ?
- Auto-publication possible ou validation manuelle obligatoire toujours ?

### Affiliation

**Q5** : As-tu déjà contacté les programmes d'affiliation Betclic/Unibet/Winamax pour confirmer l'accès aux flux de cotes ?

**Réponds aux Q1-Q5 et je documente les décisions finales.**
