-- ============================================
-- Baseball FR - SQLite Schema
-- ============================================
-- SQLite compatible version
-- Version: 1.0
-- Date: 2026-04-17

PRAGMA foreign_keys = ON;

-- ============================================
-- LEAGUES
-- ============================================

CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo_url TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leagues_code ON leagues(code);
CREATE INDEX idx_leagues_active ON leagues(active);

-- ============================================
-- TEAMS
-- ============================================

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id INTEGER NOT NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  abbreviation TEXT,
  city TEXT,
  stadium TEXT,
  division TEXT,
  founded INTEGER,
  logo_url TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_teams_league_slug ON teams(league_id, slug);
CREATE UNIQUE INDEX uk_teams_league_external ON teams(league_id, external_id);
CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_teams_slug ON teams(slug);

-- ============================================
-- PLAYERS
-- ============================================

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER,
  league_id INTEGER NOT NULL,
  external_id TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  jersey_number TEXT,
  position TEXT,
  bat_side TEXT CHECK(bat_side IN ('L', 'R', 'S')),
  throw_side TEXT CHECK(throw_side IN ('L', 'R')),
  birth_date DATE,
  birth_country TEXT,
  height_cm INTEGER,
  weight_kg INTEGER,
  photo_url TEXT,
  is_star INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_players_league_slug ON players(league_id, slug);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_league ON players(league_id);
CREATE INDEX idx_players_is_star ON players(is_star);

-- ============================================
-- GAMES
-- ============================================

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id INTEGER NOT NULL,
  external_id TEXT,
  game_date DATE NOT NULL,
  game_time TIME,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'live', 'final', 'postponed', 'cancelled')),
  inning TEXT,
  venue TEXT,
  attendance INTEGER,
  game_data_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_games_league_external ON games(league_id, external_id);
CREATE INDEX idx_games_league ON games(league_id);
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_status ON games(status);

-- ============================================
-- STANDINGS
-- ============================================

CREATE TABLE IF NOT EXISTS standings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  division TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_pct REAL,
  games_behind REAL,
  runs_scored INTEGER,
  runs_allowed INTEGER,
  streak TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_standings_team_season ON standings(team_id, season);
CREATE INDEX idx_standings_league_season ON standings(league_id, season);

-- ============================================
-- PLAYER STATS
-- ============================================

CREATE TABLE IF NOT EXISTS player_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  stat_type TEXT NOT NULL CHECK(stat_type IN ('batting', 'pitching')),
  games_played INTEGER,
  at_bats INTEGER,
  runs INTEGER,
  hits INTEGER,
  doubles INTEGER,
  triples INTEGER,
  home_runs INTEGER,
  rbi INTEGER,
  stolen_bases INTEGER,
  caught_stealing INTEGER,
  walks INTEGER,
  strikeouts INTEGER,
  batting_avg REAL,
  on_base_pct REAL,
  slugging_pct REAL,
  ops REAL,
  wins INTEGER,
  losses INTEGER,
  saves INTEGER,
  games_started INTEGER,
  innings_pitched REAL,
  hits_allowed INTEGER,
  runs_allowed INTEGER,
  earned_runs INTEGER,
  era REAL,
  strikeouts_pitched INTEGER,
  walks_allowed INTEGER,
  whip REAL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_playerstats_player_season_type ON player_stats(player_id, season, stat_type);

-- ============================================
-- PREDICTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  prediction_type TEXT DEFAULT 'winner' CHECK(prediction_type IN ('winner', 'over_under', 'spread')),
  prediction_value TEXT,
  confidence TEXT DEFAULT 'medium' CHECK(confidence IN ('low', 'medium', 'high')),
  analysis_html TEXT,
  key_factors TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  author TEXT DEFAULT 'Baseball FR',
  published_at DATETIME,
  result TEXT DEFAULT 'pending' CHECK(result IN ('pending', 'win', 'loss', 'void')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX idx_predictions_game ON predictions(game_id);
CREATE INDEX idx_predictions_status ON predictions(status);

-- ============================================
-- ODDS
-- ============================================

CREATE TABLE IF NOT EXISTS odds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  bookmaker TEXT NOT NULL,
  market_type TEXT NOT NULL CHECK(market_type IN ('moneyline', 'spread', 'total')),
  home_odds REAL,
  away_odds REAL,
  over_odds REAL,
  under_odds REAL,
  spread_value REAL,
  total_value REAL,
  affiliate_url TEXT,
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX idx_odds_game_bookmaker ON odds(game_id, bookmaker);

-- ============================================
-- ARTICLES
-- ============================================

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('news', 'analysis', 'history', 'transfers', 'injuries')),
  league_id INTEGER,
  author TEXT DEFAULT 'Baseball FR',
  featured_image TEXT,
  tags TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  published_at DATETIME,
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_status ON articles(status);

-- ============================================
-- BOOKMAKERS
-- ============================================

CREATE TABLE IF NOT EXISTS bookmakers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  bonus_text TEXT,
  affiliate_url TEXT,
  anj_license TEXT,
  rating REAL,
  features TEXT,
  active INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookmakers_slug ON bookmakers(slug);
CREATE INDEX idx_bookmakers_priority ON bookmakers(priority DESC);

-- ============================================
-- CLICKS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS clicks_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bookmaker_id INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  user_agent_hash TEXT,
  referer TEXT,
  page_url TEXT,
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id) ON DELETE CASCADE
);

CREATE INDEX idx_clicks_bookmaker ON clicks_tracking(bookmaker_id);
CREATE INDEX idx_clicks_clicked ON clicks_tracking(clicked_at DESC);

-- ============================================
-- ADMIN USERS
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'editor' CHECK(role IN ('admin', 'editor')),
  active INTEGER DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_adminusers_email ON admin_users(email);

-- ============================================
-- CMS PAGES
-- ============================================

CREATE TABLE IF NOT EXISTS cms_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  template TEXT DEFAULT 'default' CHECK(template IN ('default', 'landing', 'full-width')),
  meta_description TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SYSTEM LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_type TEXT NOT NULL CHECK(log_type IN ('cron', 'error', 'api', 'security')),
  severity TEXT DEFAULT 'info' CHECK(severity IN ('info', 'warning', 'error', 'critical')),
  source TEXT,
  message TEXT NOT NULL,
  context TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_type ON system_logs(log_type);
CREATE INDEX idx_logs_severity ON system_logs(severity);

-- ============================================
-- Initial data: Leagues
-- ============================================

INSERT OR IGNORE INTO leagues (code, name, country, active) VALUES
('mlb', 'Major League Baseball', 'USA', 1),
('kbo', 'Korea Baseball Organization', 'South Korea', 1),
('npb', 'Nippon Professional Baseball', 'Japan', 1);

-- ============================================
-- Initial data: Bookmakers
-- ============================================

INSERT OR IGNORE INTO bookmakers (slug, name, bonus_text, anj_license, rating, priority, active) VALUES
('betclic', 'Betclic', '100€ offerts pour parier', '[À VÉRIFIER]', 4.5, 100, 1),
('unibet', 'Unibet', '100€ remboursés sur votre 1er pari', '[À VÉRIFIER]', 4.3, 90, 1),
('winamax', 'Winamax', '100€ offerts', '[À VÉRIFIER]', 4.4, 80, 1),
('pmu', 'PMU Sport', '100€ offerts', '[À VÉRIFIER]', 4.0, 70, 1);
