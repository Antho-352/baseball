# Schéma Base de Données - Baseball FR

## Vue d'ensemble

**SGBD** : MySQL/MariaDB 8.0+
**Encodage** : utf8mb4 (support emojis + caractères spéciaux)
**Collation** : utf8mb4_unicode_ci

**13 tables** réparties en 4 domaines :

1. **Données sportives** (8 tables) : leagues, teams, players, games, game_stats, player_stats, injuries, standings
2. **Pronostics** (2 tables) : predictions, odds
3. **CMS** (2 tables) : articles, cms_pages
4. **Affiliation** (2 tables) : bookmakers, clicks_tracking

---

## Diagramme ER - Relations principales

```
┌──────────────┐
│   leagues    │──────┐
└──────────────┘      │
                      │
                      ├──> ┌──────────────┐          ┌──────────────┐
                      │    │    teams     │─────────<│   players    │
                      │    └──────────────┘          └──────────────┘
                      │            │                         │
                      │            │                         │
                      │            ├──> ┌──────────────┐     │
                      │            │    │   standings  │     │
                      │            │    └──────────────┘     │
                      │            │                         │
                      │            ├──> ┌──────────────┐     │
                      │            │    │    games     │     │
                      │            │    └──────────────┘     │
                      │            │            │            │
                      │            │            ├────> ┌──────────────┐
                      │            │            │      │  game_stats  │
                      │            │            │      └──────────────┘
                      │            │            │
                      │            │            ├────> ┌──────────────┐
                      │            │            │      │  predictions │
                      │            │            │      └──────────────┘
                      │            │            │              │
                      │            │            │              │
                      │            │            └────> ┌──────────────┐
                      │            │                   │     odds     │
                      │            │                   └──────────────┘
                      │            │                           │
                      │            │                           │
                      │            └──────────────────> ┌──────────────┐
                      │                                 │  bookmakers  │
                      │                                 └──────────────┘
                      │                                         │
                      │                                         │
                      └──────────────────────────────> ┌──────────────┐
                                                        │   articles   │
                                                        └──────────────┘

┌──────────────┐
│ player_stats │<────── players
└──────────────┘

┌──────────────┐
│   injuries   │<────── players
└──────────────┘

┌──────────────┐
│  cms_pages   │ (standalone)
└──────────────┘

┌──────────────┐
│clicks_tracking│<────── bookmakers
└──────────────┘
```

---

## Tables détaillées

### 1. leagues (Ligues)

```sql
CREATE TABLE leagues (
  id VARCHAR(10) PRIMARY KEY,              -- 'mlb', 'kbo', 'npb'
  name VARCHAR(100) NOT NULL,              -- 'Major League Baseball', 'Korean Baseball Organization', etc.
  slug VARCHAR(50) NOT NULL UNIQUE,        -- 'mlb', 'kbo', 'npb'
  country VARCHAR(50) NOT NULL,            -- 'USA', 'South Korea', 'Japan'
  api_source VARCHAR(50) NOT NULL,         -- 'statsapi', 'thesportsdb'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Exemple de données** :
```sql
INSERT INTO leagues VALUES
('mlb', 'Major League Baseball', 'mlb', 'USA', 'statsapi'),
('kbo', 'Korean Baseball Organization', 'kbo', 'South Korea', 'thesportsdb'),
('npb', 'Nippon Professional Baseball', 'npb', 'Japan', 'thesportsdb');
```

---

### 2. teams (Équipes)

```sql
CREATE TABLE teams (
  id VARCHAR(50) PRIMARY KEY,              -- 'mlb-yankees', 'kbo-giants', etc.
  league_id VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,              -- 'New York Yankees'
  slug VARCHAR(255) NOT NULL,              -- 'new-york-yankees'
  short_name VARCHAR(50),                  -- 'Yankees'
  logo_url VARCHAR(500),
  api_team_id VARCHAR(50),                 -- ID dans l'API externe
  division VARCHAR(100),                   -- 'AL East', 'NL West', etc.
  city VARCHAR(100),                       -- 'New York'
  stadium VARCHAR(255),                    -- 'Yankee Stadium'
  founded_year YEAR,                       -- 1903
  website_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  UNIQUE KEY unique_slug_per_league (league_id, slug),
  INDEX idx_league_slug (league_id, slug),
  INDEX idx_api_team_id (api_team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Pourquoi `id` = 'mlb-yankees' et pas auto-increment ?**
- Permet de construire les URLs facilement sans requête BDD
- Évite les jointures inutiles

---

### 3. players (Joueurs)

```sql
CREATE TABLE players (
  id VARCHAR(50) PRIMARY KEY,              -- 'mlb-ohtani-shohei'
  team_id VARCHAR(50),                     -- NULL si free agent
  name VARCHAR(255) NOT NULL,              -- 'Shohei Ohtani'
  slug VARCHAR(255) NOT NULL,              -- 'shohei-ohtani'
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  position VARCHAR(50),                    -- 'SP' (Starting Pitcher), 'DH' (Designated Hitter), etc.
  jersey_number TINYINT UNSIGNED,          -- 17
  birth_date DATE,
  birth_city VARCHAR(100),
  birth_country VARCHAR(100),
  height_cm SMALLINT UNSIGNED,             -- 193
  weight_kg SMALLINT UNSIGNED,             -- 95
  bats ENUM('R', 'L', 'S'),                -- Right, Left, Switch
  throws ENUM('R', 'L'),                   -- Right, Left
  photo_url VARCHAR(500),
  api_player_id VARCHAR(50),
  is_star BOOLEAN DEFAULT FALSE,           -- TRUE pour les 200 joueurs stars (pages générées)
  is_active BOOLEAN DEFAULT TRUE,          -- FALSE si retraité/blessé long terme
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  UNIQUE KEY unique_slug_per_league (slug),
  INDEX idx_team_id (team_id),
  INDEX idx_is_star (is_star),
  INDEX idx_api_player_id (api_player_id),
  INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Note** : `is_star = TRUE` uniquement pour les 200 joueurs V1.

---

### 4. games (Matchs)

```sql
CREATE TABLE games (
  id VARCHAR(100) PRIMARY KEY,             -- 'mlb-2026-04-15-yankees-red-sox'
  league_id VARCHAR(10) NOT NULL,
  home_team_id VARCHAR(50) NOT NULL,
  away_team_id VARCHAR(50) NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME,                          -- Heure locale du match
  venue VARCHAR(255),                      -- 'Yankee Stadium'
  status ENUM('scheduled', 'live', 'final', 'postponed', 'cancelled') DEFAULT 'scheduled',
  home_score TINYINT UNSIGNED,             -- Runs marqués équipe domicile
  away_score TINYINT UNSIGNED,             -- Runs marqués équipe extérieure
  innings TINYINT UNSIGNED DEFAULT 9,      -- Nombre de manches (9 standard, peut aller en prolongation)
  weather_temp_celsius TINYINT,            -- Température (peut être NULL)
  weather_condition VARCHAR(100),          -- 'Sunny', 'Cloudy', 'Rain', etc.
  api_game_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE,
  INDEX idx_game_date (game_date),
  INDEX idx_league_date (league_id, game_date),
  INDEX idx_status (status),
  INDEX idx_teams (home_team_id, away_team_id),
  INDEX idx_api_game_id (api_game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. game_stats (Statistiques de match par équipe)

```sql
CREATE TABLE game_stats (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(100) NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  is_home BOOLEAN NOT NULL,                -- TRUE si équipe domicile
  runs TINYINT UNSIGNED DEFAULT 0,
  hits TINYINT UNSIGNED DEFAULT 0,
  errors TINYINT UNSIGNED DEFAULT 0,
  left_on_base TINYINT UNSIGNED DEFAULT 0, -- Coureurs laissés sur base
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE KEY unique_game_team (game_id, team_id),
  INDEX idx_game_id (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. player_stats (Statistiques joueur par saison)

```sql
CREATE TABLE player_stats (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  season YEAR NOT NULL,
  stat_type ENUM('batting', 'pitching') NOT NULL,

  -- Batting stats (NULL si stat_type = pitching)
  games_played SMALLINT UNSIGNED,
  at_bats SMALLINT UNSIGNED,
  runs SMALLINT UNSIGNED,
  hits SMALLINT UNSIGNED,
  doubles SMALLINT UNSIGNED,
  triples SMALLINT UNSIGNED,
  home_runs SMALLINT UNSIGNED,
  rbis SMALLINT UNSIGNED,                  -- Runs Batted In
  stolen_bases SMALLINT UNSIGNED,
  batting_avg DECIMAL(4,3),                -- .300 → 0.300
  on_base_pct DECIMAL(4,3),                -- OBP
  slugging_pct DECIMAL(4,3),               -- SLG
  ops DECIMAL(4,3),                        -- On-base Plus Slugging

  -- Pitching stats (NULL si stat_type = batting)
  wins TINYINT UNSIGNED,
  losses TINYINT UNSIGNED,
  saves TINYINT UNSIGNED,
  innings_pitched DECIMAL(5,1),            -- 180.1 innings
  strikeouts SMALLINT UNSIGNED,
  walks SMALLINT UNSIGNED,
  earned_runs SMALLINT UNSIGNED,
  era DECIMAL(4,2),                        -- Earned Run Average (3.45)
  whip DECIMAL(4,2),                       -- Walks + Hits per Inning Pitched

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE KEY unique_player_season_type (player_id, season, stat_type),
  INDEX idx_player_season (player_id, season),
  INDEX idx_season_type (season, stat_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. injuries (Blessures)

```sql
CREATE TABLE injuries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  injury_type VARCHAR(255) NOT NULL,       -- 'Elbow strain', 'Hamstring injury', etc.
  severity ENUM('day-to-day', 'out-7-days', 'out-15-days', 'out-60-days', 'season-ending'),
  status ENUM('active', 'recovering', 'cleared') DEFAULT 'active',
  reported_date DATE NOT NULL,
  expected_return_date DATE,
  actual_return_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  INDEX idx_player_status (player_id, status),
  INDEX idx_reported_date (reported_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Utilité SEO** : page `/news/blessures/` avec liste mise à jour = trafic garanti.

---

### 8. standings (Classements)

```sql
CREATE TABLE standings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league_id VARCHAR(10) NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  season YEAR NOT NULL,
  division VARCHAR(100),                   -- 'AL East', 'NL Central', etc.
  wins SMALLINT UNSIGNED DEFAULT 0,
  losses SMALLINT UNSIGNED DEFAULT 0,
  win_pct DECIMAL(4,3),                    -- .650 → 0.650
  games_behind DECIMAL(4,1),               -- 3.5 games behind leader
  home_record VARCHAR(20),                 -- '45-36' (wins-losses à domicile)
  away_record VARCHAR(20),                 -- '40-41' (wins-losses à l'extérieur)
  last_10_games VARCHAR(20),               -- '7-3' (résultats des 10 derniers matchs)
  streak VARCHAR(20),                      -- 'W5' (5 victoires d'affilée) ou 'L2'
  runs_scored SMALLINT UNSIGNED,
  runs_allowed SMALLINT UNSIGNED,
  run_differential SMALLINT,               -- Différence runs marqués - runs encaissés
  rank TINYINT UNSIGNED,                   -- 1, 2, 3... dans la division
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_season (team_id, season),
  INDEX idx_league_season (league_id, season),
  INDEX idx_season_rank (season, rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Pronostics & Affiliation

### 9. predictions (Pronostics)

```sql
CREATE TABLE predictions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(100) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,       -- 'mlb-2026-04-15-yankees-vs-red-sox'
  recommended_bet VARCHAR(255),            -- 'Victoire Yankees', 'Plus de 8.5 runs', etc.
  confidence_score TINYINT UNSIGNED,       -- 0-100 (75 = confiance 75%)
  ai_analysis JSON,                        -- Résultat brut de l'IA (stockage complet)
  summary TEXT,                            -- Texte généré par IA (affiché sur la page)
  key_factors JSON,                        -- ['Forme récente Yankees: 8-2', 'Red Sox sans lanceur titulaire', etc.]
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_game_id (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Exemple `ai_analysis` JSON** :
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "prompt_version": "v2",
  "context": {
    "home_form_last_10": "8-2",
    "away_form_last_10": "4-6",
    "h2h_last_5": "3-2 Yankees",
    "injuries_home": [],
    "injuries_away": ["Pitcher titulaire absent"],
    "weather": "Sunny, 22°C"
  },
  "generated_at": "2026-04-14T10:05:32Z"
}
```

---

### 10. odds (Cotes bookmakers)

```sql
CREATE TABLE odds (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(100) NOT NULL,
  bookmaker_id INT UNSIGNED NOT NULL,
  home_win DECIMAL(5,2),                   -- 1.85
  draw DECIMAL(5,2),                       -- NULL pour baseball (pas de nul)
  away_win DECIMAL(5,2),                   -- 2.10
  over_under_line DECIMAL(4,1),            -- 8.5 runs
  over_odds DECIMAL(5,2),                  -- 1.90
  under_odds DECIMAL(5,2),                 -- 1.90
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id) ON DELETE CASCADE,
  INDEX idx_game_bookmaker (game_id, bookmaker_id),
  INDEX idx_fetched_at (fetched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Note** : `fetched_at` permet de garder l'historique des cotes (utile pour analyses).

---

### 11. bookmakers (Opérateurs paris)

```sql
CREATE TABLE bookmakers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,              -- 'Betclic', 'Unibet', 'Winamax', 'PMU'
  slug VARCHAR(50) NOT NULL UNIQUE,        -- 'betclic', 'unibet', etc.
  logo_url VARCHAR(500),
  affiliate_link TEXT,                     -- Lien affilié avec tracking
  is_anj_approved BOOLEAN DEFAULT TRUE,    -- Vérification ANJ
  api_endpoint VARCHAR(500),               -- URL du flux de cotes
  api_key_encrypted TEXT,                  -- Clé API chiffrée (sécurité)
  is_active BOOLEAN DEFAULT TRUE,          -- Désactiver si programme terminé
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 12. clicks_tracking (Tracking affiliation RGPD-compliant)

```sql
CREATE TABLE clicks_tracking (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bookmaker_id INT UNSIGNED NOT NULL,
  page_url VARCHAR(500),                   -- URL de la page où le clic a eu lieu
  referer VARCHAR(500),                    -- D'où vient l'utilisateur
  ip_hash CHAR(64) NOT NULL,               -- SHA256 de l'IP (anonymisé)
  user_agent_hash CHAR(64),                -- SHA256 du User-Agent (anonymisé)
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id) ON DELETE CASCADE,
  INDEX idx_bookmaker_date (bookmaker_id, clicked_at),
  INDEX idx_clicked_at (clicked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Anonymisation RGPD** :
```javascript
// Backend Node.js
const crypto = require('crypto');
const ipHash = crypto.createHash('sha256').update(req.ip + SALT).digest('hex');
```

---

## CMS

### 13. articles (Articles éditoriaux)

```sql
CREATE TABLE articles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,                            -- Résumé court (meta description)
  content LONGTEXT NOT NULL,               -- Contenu HTML (TipTap)
  featured_image_url VARCHAR(500),
  category ENUM('news', 'analysis', 'transfer', 'injury', 'history', 'interview') NOT NULL,
  league_id VARCHAR(10),                   -- NULL si article multi-ligues
  author VARCHAR(100) DEFAULT 'Baseball FR',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  views INT UNSIGNED DEFAULT 0,            -- Compteur de vues (optionnel)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_status_published (status, published_at),
  INDEX idx_category (category),
  INDEX idx_league_category (league_id, category),
  FULLTEXT idx_search (title, excerpt, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 14. cms_pages (Pages CMS statiques)

```sql
CREATE TABLE cms_pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,               -- Contenu HTML (TipTap)
  template ENUM('simple', 'affiliation', 'encyclopedia') DEFAULT 'simple',
  meta_description VARCHAR(500),
  status ENUM('draft', 'published') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Exemples de pages CMS** :
- `/a-propos/` → template: simple
- `/paris-sportifs/betclic/` → template: affiliation
- `/histoire/mlb/world-series/` → template: encyclopedia

---

## Indexes & Performance

### Stratégie d'indexation

**Index créés** (au total ~35 index) :
- PRIMARY KEY sur chaque table
- FOREIGN KEY indexes automatiques
- INDEX sur colonnes fréquemment utilisées dans WHERE/JOIN
- UNIQUE indexes sur slugs
- FULLTEXT index sur articles (recherche)

**Pas d'over-indexing** :
- Pas d'index sur colonnes peu interrogées (notes TEXT, etc.)
- Monitoring à faire après lancement pour identifier les slow queries

---

## Décisions techniques finales

### Q1 : Types de données
**DECIMAL(5,2) pour cotes** ✅
- Précision exacte (pas d'erreurs d'arrondi comme FLOAT)
- Standard industrie paris sportifs
- 1.85, 2.10 stockés exactement

**VARCHAR(255) pour noms** ✅
- Largement suffisant (noms MLB max ~40 caractères)
- Standard industrie

### Q2 : Métadonnées supplémentaires ajoutées

**Sur `teams`** :
- `twitter_handle` VARCHAR(50) - récupérable via MLB API
- `instagram_handle` VARCHAR(50)
- `primary_color` CHAR(7) - hex color (#003087 pour Yankees)
- `secondary_color` CHAR(7)

**Sur `players`** :
- `twitter_handle` VARCHAR(50)
- `instagram_handle` VARCHAR(50)
- `draft_year` YEAR - année de draft
- `draft_round` TINYINT - tour de draft

**Utilité** :
- Embed tweets dans articles
- Design pages équipes avec couleurs officielles
- Contexte historique (draft)

### Q3 : JSON pour `ai_analysis`
**JSON choisi** ✅
- Flexible (structure peut évoluer)
- Pas besoin de requêter (juste affichage)
- MySQL 8+ supporte JSON queries si besoin futur

### Q4 : Soft Delete au lieu de CASCADE
**PROBLÈME identifié** : CASCADE DELETE détruit les données historiques.

**Solution : Soft Delete** :
- Champ `deleted_at TIMESTAMP NULL` sur tables principales
- Pas de CASCADE DELETE (remplacé par RESTRICT)
- Données jamais vraiment supprimées, juste marquées

**Exemple** :
```sql
-- Équipe "supprimée" (déménagement, changement nom)
UPDATE teams SET deleted_at = NOW() WHERE id = 'mlb-expos';

-- Requêtes ignorent les supprimées
SELECT * FROM teams WHERE deleted_at IS NULL;

-- Historique des matchs préservé
SELECT * FROM games WHERE home_team_id = 'mlb-expos'; -- Toujours accessible
```

---

## Schéma mis à jour avec décisions
