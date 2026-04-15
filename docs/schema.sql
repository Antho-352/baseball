-- Baseball FR - Schéma Base de Données MySQL
-- Version: 1.0
-- Date: 2026-04-14
--
-- IMPORTANT: Utilise soft delete (deleted_at) au lieu de CASCADE DELETE
-- pour préserver les données historiques

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. LIGUES
-- ============================================================

CREATE TABLE IF NOT EXISTS leagues (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  country VARCHAR(50) NOT NULL,
  api_source VARCHAR(50) NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. ÉQUIPES
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(50) PRIMARY KEY,
  league_id VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  short_name VARCHAR(50),
  logo_url VARCHAR(500),
  api_team_id VARCHAR(50),
  division VARCHAR(100),
  city VARCHAR(100),
  stadium VARCHAR(255),
  founded_year YEAR,
  website_url VARCHAR(255),

  -- Réseaux sociaux
  twitter_handle VARCHAR(50),
  instagram_handle VARCHAR(50),

  -- Couleurs officielles (hex)
  primary_color CHAR(7),                   -- #003087
  secondary_color CHAR(7),                 -- #E4002B

  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_slug_per_league (league_id, slug),
  INDEX idx_league_slug (league_id, slug),
  INDEX idx_api_team_id (api_team_id),
  INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. JOUEURS
-- ============================================================

CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(50) PRIMARY KEY,
  team_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  position VARCHAR(50),
  jersey_number TINYINT UNSIGNED,
  birth_date DATE,
  birth_city VARCHAR(100),
  birth_country VARCHAR(100),
  height_cm SMALLINT UNSIGNED,
  weight_kg SMALLINT UNSIGNED,
  bats ENUM('R', 'L', 'S'),
  throws ENUM('R', 'L'),
  photo_url VARCHAR(500),
  api_player_id VARCHAR(50),

  -- Réseaux sociaux
  twitter_handle VARCHAR(50),
  instagram_handle VARCHAR(50),

  -- Historique draft
  draft_year YEAR,
  draft_round TINYINT UNSIGNED,

  -- Flags
  is_star BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  UNIQUE KEY unique_slug (slug),
  INDEX idx_team_id (team_id),
  INDEX idx_is_star (is_star),
  INDEX idx_api_player_id (api_player_id),
  INDEX idx_position (position),
  INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. MATCHS
-- ============================================================

CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(100) PRIMARY KEY,
  league_id VARCHAR(10) NOT NULL,
  home_team_id VARCHAR(50) NOT NULL,
  away_team_id VARCHAR(50) NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME,
  venue VARCHAR(255),
  status ENUM('scheduled', 'live', 'final', 'postponed', 'cancelled') DEFAULT 'scheduled',
  home_score TINYINT UNSIGNED,
  away_score TINYINT UNSIGNED,
  innings TINYINT UNSIGNED DEFAULT 9,
  weather_temp_celsius TINYINT,
  weather_condition VARCHAR(100),
  api_game_id VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE RESTRICT,
  FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
  FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
  INDEX idx_game_date (game_date),
  INDEX idx_league_date (league_id, game_date),
  INDEX idx_status (status),
  INDEX idx_teams (home_team_id, away_team_id),
  INDEX idx_api_game_id (api_game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. STATISTIQUES MATCHS
-- ============================================================

CREATE TABLE IF NOT EXISTS game_stats (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(100) NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  is_home BOOLEAN NOT NULL,
  runs TINYINT UNSIGNED DEFAULT 0,
  hits TINYINT UNSIGNED DEFAULT 0,
  errors TINYINT UNSIGNED DEFAULT 0,
  left_on_base TINYINT UNSIGNED DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_game_team (game_id, team_id),
  INDEX idx_game_id (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. STATISTIQUES JOUEURS
-- ============================================================

CREATE TABLE IF NOT EXISTS player_stats (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  season YEAR NOT NULL,
  stat_type ENUM('batting', 'pitching') NOT NULL,

  -- Batting
  games_played SMALLINT UNSIGNED,
  at_bats SMALLINT UNSIGNED,
  runs SMALLINT UNSIGNED,
  hits SMALLINT UNSIGNED,
  doubles SMALLINT UNSIGNED,
  triples SMALLINT UNSIGNED,
  home_runs SMALLINT UNSIGNED,
  rbis SMALLINT UNSIGNED,
  stolen_bases SMALLINT UNSIGNED,
  batting_avg DECIMAL(4,3),
  on_base_pct DECIMAL(4,3),
  slugging_pct DECIMAL(4,3),
  ops DECIMAL(4,3),

  -- Pitching
  wins TINYINT UNSIGNED,
  losses TINYINT UNSIGNED,
  saves TINYINT UNSIGNED,
  innings_pitched DECIMAL(5,1),
  strikeouts SMALLINT UNSIGNED,
  walks SMALLINT UNSIGNED,
  earned_runs SMALLINT UNSIGNED,
  era DECIMAL(4,2),
  whip DECIMAL(4,2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_player_season_type (player_id, season, stat_type),
  INDEX idx_player_season (player_id, season),
  INDEX idx_season_type (season, stat_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. BLESSURES
-- ============================================================

CREATE TABLE IF NOT EXISTS injuries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  injury_type VARCHAR(255) NOT NULL,
  severity ENUM('day-to-day', 'out-7-days', 'out-15-days', 'out-60-days', 'season-ending'),
  status ENUM('active', 'recovering', 'cleared') DEFAULT 'active',
  reported_date DATE NOT NULL,
  expected_return_date DATE,
  actual_return_date DATE,
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE RESTRICT,
  INDEX idx_player_status (player_id, status),
  INDEX idx_reported_date (reported_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. CLASSEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS standings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league_id VARCHAR(10) NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  season YEAR NOT NULL,
  division VARCHAR(100),
  wins SMALLINT UNSIGNED DEFAULT 0,
  losses SMALLINT UNSIGNED DEFAULT 0,
  win_pct DECIMAL(4,3),
  games_behind DECIMAL(4,1),
  home_record VARCHAR(20),
  away_record VARCHAR(20),
  last_10_games VARCHAR(20),
  streak VARCHAR(20),
  runs_scored SMALLINT UNSIGNED,
  runs_allowed SMALLINT UNSIGNED,
  run_differential SMALLINT,
  rank TINYINT UNSIGNED,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE RESTRICT,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_team_season (team_id, season),
  INDEX idx_league_season (league_id, season),
  INDEX idx_season_rank (season, rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. PRONOSTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS predictions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(100) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  recommended_bet VARCHAR(255),
  confidence_score TINYINT UNSIGNED,
  ai_analysis JSON,
  summary TEXT,
  key_factors JSON,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_game_id (game_id),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. BOOKMAKERS
-- ============================================================

CREATE TABLE IF NOT EXISTS bookmakers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  affiliate_link TEXT,
  is_anj_approved BOOLEAN DEFAULT TRUE,
  api_endpoint VARCHAR(500),
  api_key_encrypted TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_slug (slug),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. COTES BOOKMAKERS
-- ============================================================

CREATE TABLE IF NOT EXISTS odds (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(100) NOT NULL,
  bookmaker_id INT UNSIGNED NOT NULL,
  home_win DECIMAL(5,2),
  draw DECIMAL(5,2),
  away_win DECIMAL(5,2),
  over_under_line DECIMAL(4,1),
  over_odds DECIMAL(5,2),
  under_odds DECIMAL(5,2),

  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT,
  FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id) ON DELETE RESTRICT,
  INDEX idx_game_bookmaker (game_id, bookmaker_id),
  INDEX idx_fetched_at (fetched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. TRACKING CLICS AFFILIATION
-- ============================================================

CREATE TABLE IF NOT EXISTS clicks_tracking (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bookmaker_id INT UNSIGNED NOT NULL,
  page_url VARCHAR(500),
  referer VARCHAR(500),
  ip_hash CHAR(64) NOT NULL,
  user_agent_hash CHAR(64),

  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id) ON DELETE RESTRICT,
  INDEX idx_bookmaker_date (bookmaker_id, clicked_at),
  INDEX idx_clicked_at (clicked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. ARTICLES
-- ============================================================

CREATE TABLE IF NOT EXISTS articles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  featured_image_url VARCHAR(500),
  category ENUM('news', 'analysis', 'transfer', 'injury', 'history', 'interview') NOT NULL,
  league_id VARCHAR(10),
  author VARCHAR(100) DEFAULT 'Baseball FR',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  views INT UNSIGNED DEFAULT 0,

  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_status_published (status, published_at),
  INDEX idx_category (category),
  INDEX idx_league_category (league_id, category),
  INDEX idx_deleted (deleted_at),
  FULLTEXT idx_search (title, excerpt, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. PAGES CMS
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  template ENUM('simple', 'affiliation', 'encyclopedia') DEFAULT 'simple',
  meta_description VARCHAR(500),
  status ENUM('draft', 'published') DEFAULT 'draft',
  published_at TIMESTAMP NULL,

  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Ligues
INSERT INTO leagues (id, name, slug, country, api_source) VALUES
('mlb', 'Major League Baseball', 'mlb', 'USA', 'statsapi'),
('kbo', 'Korean Baseball Organization', 'kbo', 'South Korea', 'thesportsdb'),
('npb', 'Nippon Professional Baseball', 'npb', 'Japan', 'thesportsdb')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Bookmakers ANJ
INSERT INTO bookmakers (name, slug, is_anj_approved, is_active) VALUES
('Betclic', 'betclic', TRUE, TRUE),
('Unibet', 'unibet', TRUE, TRUE),
('Winamax', 'winamax', TRUE, TRUE),
('PMU', 'pmu', TRUE, TRUE)
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);
