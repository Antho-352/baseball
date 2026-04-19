-- ============================================
-- Baseball FR - Database Schema
-- ============================================
-- MySQL/MariaDB compatible
-- Version: 1.0
-- Date: 2026-04-17

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- LEAGUES
-- ============================================

CREATE TABLE IF NOT EXISTS `leagues` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(10) NOT NULL UNIQUE COMMENT 'mlb, kbo, npb',
  `name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(50) NOT NULL,
  `logo_url` VARCHAR(255),
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_code` (`code`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TEAMS
-- ============================================

CREATE TABLE IF NOT EXISTS `teams` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `league_id` INT UNSIGNED NOT NULL,
  `external_id` VARCHAR(50) COMMENT 'ID from external API (MLB API, TheSportsDB)',
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `abbreviation` VARCHAR(10),
  `city` VARCHAR(100),
  `stadium` VARCHAR(100),
  `division` VARCHAR(50),
  `founded` INT,
  `logo_url` VARCHAR(255),
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_league_slug` (`league_id`, `slug`),
  UNIQUE KEY `uk_league_external` (`league_id`, `external_id`),
  INDEX `idx_league` (`league_id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_active` (`active`),
  FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PLAYERS
-- ============================================

CREATE TABLE IF NOT EXISTS `players` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `team_id` INT UNSIGNED,
  `league_id` INT UNSIGNED NOT NULL,
  `external_id` VARCHAR(50),
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `full_name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL,
  `jersey_number` VARCHAR(10),
  `position` VARCHAR(20),
  `bat_side` ENUM('L', 'R', 'S') COMMENT 'Left, Right, Switch',
  `throw_side` ENUM('L', 'R'),
  `birth_date` DATE,
  `birth_country` VARCHAR(50),
  `height_cm` INT,
  `weight_kg` INT,
  `photo_url` VARCHAR(255),
  `is_star` TINYINT(1) DEFAULT 0 COMMENT 'Top 200 players for page generation',
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_league_slug` (`league_id`, `slug`),
  UNIQUE KEY `uk_league_external` (`league_id`, `external_id`),
  INDEX `idx_team` (`team_id`),
  INDEX `idx_league` (`league_id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_is_star` (`is_star`),
  INDEX `idx_position` (`position`),
  INDEX `idx_active` (`active`),
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- GAMES
-- ============================================

CREATE TABLE IF NOT EXISTS `games` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `league_id` INT UNSIGNED NOT NULL,
  `external_id` VARCHAR(50),
  `game_date` DATE NOT NULL,
  `game_time` TIME,
  `home_team_id` INT UNSIGNED NOT NULL,
  `away_team_id` INT UNSIGNED NOT NULL,
  `home_score` INT,
  `away_score` INT,
  `status` ENUM('scheduled', 'live', 'final', 'postponed', 'cancelled') DEFAULT 'scheduled',
  `inning` VARCHAR(10) COMMENT 'Current inning if live (e.g., "T7", "B9")',
  `venue` VARCHAR(100),
  `attendance` INT,
  `game_data_json` JSON COMMENT 'Full game data from API',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_league_external` (`league_id`, `external_id`),
  INDEX `idx_league` (`league_id`),
  INDEX `idx_game_date` (`game_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_home_team` (`home_team_id`),
  INDEX `idx_away_team` (`away_team_id`),
  INDEX `idx_date_status` (`game_date`, `status`),
  FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`home_team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`away_team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STANDINGS
-- ============================================

CREATE TABLE IF NOT EXISTS `standings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `league_id` INT UNSIGNED NOT NULL,
  `team_id` INT UNSIGNED NOT NULL,
  `season` INT NOT NULL,
  `division` VARCHAR(50),
  `wins` INT DEFAULT 0,
  `losses` INT DEFAULT 0,
  `win_pct` DECIMAL(5,3),
  `games_behind` DECIMAL(4,1),
  `runs_scored` INT,
  `runs_allowed` INT,
  `streak` VARCHAR(10) COMMENT 'e.g., "W3", "L2"',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_team_season` (`team_id`, `season`),
  INDEX `idx_league_season` (`league_id`, `season`),
  INDEX `idx_division` (`division`),
  INDEX `idx_win_pct` (`win_pct` DESC),
  FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PLAYER STATS (Season aggregates)
-- ============================================

CREATE TABLE IF NOT EXISTS `player_stats` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `player_id` INT UNSIGNED NOT NULL,
  `season` INT NOT NULL,
  `stat_type` ENUM('batting', 'pitching') NOT NULL,

  -- Batting stats
  `games_played` INT,
  `at_bats` INT,
  `runs` INT,
  `hits` INT,
  `doubles` INT,
  `triples` INT,
  `home_runs` INT,
  `rbi` INT,
  `stolen_bases` INT,
  `caught_stealing` INT,
  `walks` INT,
  `strikeouts` INT,
  `batting_avg` DECIMAL(4,3),
  `on_base_pct` DECIMAL(4,3),
  `slugging_pct` DECIMAL(4,3),
  `ops` DECIMAL(4,3),

  -- Pitching stats
  `wins` INT,
  `losses` INT,
  `saves` INT,
  `games_started` INT,
  `innings_pitched` DECIMAL(5,1),
  `hits_allowed` INT,
  `runs_allowed` INT,
  `earned_runs` INT,
  `era` DECIMAL(4,2),
  `strikeouts_pitched` INT,
  `walks_allowed` INT,
  `whip` DECIMAL(4,2),

  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_player_season_type` (`player_id`, `season`, `stat_type`),
  INDEX `idx_season` (`season`),
  INDEX `idx_stat_type` (`stat_type`),
  INDEX `idx_home_runs` (`home_runs` DESC),
  INDEX `idx_rbi` (`rbi` DESC),
  INDEX `idx_batting_avg` (`batting_avg` DESC),
  INDEX `idx_era` (`era` ASC),
  INDEX `idx_wins` (`wins` DESC),
  FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PREDICTIONS (Pronostics)
-- ============================================

CREATE TABLE IF NOT EXISTS `predictions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `game_id` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `prediction_type` ENUM('winner', 'over_under', 'spread') DEFAULT 'winner',
  `prediction_value` VARCHAR(100) COMMENT 'e.g., "Yankees", "Over 8.5", "+1.5"',
  `confidence` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `analysis_html` TEXT COMMENT 'AI-generated analysis in HTML',
  `key_factors` JSON COMMENT 'Array of key factors',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `author` VARCHAR(100) DEFAULT 'Baseball FR',
  `published_at` TIMESTAMP NULL,
  `result` ENUM('pending', 'win', 'loss', 'void') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_game` (`game_id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_status` (`status`),
  INDEX `idx_published` (`published_at` DESC),
  INDEX `idx_result` (`result`),
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ODDS (Cotes bookmakers)
-- ============================================

CREATE TABLE IF NOT EXISTS `odds` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `game_id` INT UNSIGNED NOT NULL,
  `bookmaker` VARCHAR(50) NOT NULL COMMENT 'betclic, unibet, winamax, pmu',
  `market_type` ENUM('moneyline', 'spread', 'total') NOT NULL,
  `home_odds` DECIMAL(5,2),
  `away_odds` DECIMAL(5,2),
  `over_odds` DECIMAL(5,2),
  `under_odds` DECIMAL(5,2),
  `spread_value` DECIMAL(4,1),
  `total_value` DECIMAL(4,1),
  `affiliate_url` VARCHAR(500) COMMENT 'Tracked affiliate link',
  `fetched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_game_bookmaker` (`game_id`, `bookmaker`),
  INDEX `idx_bookmaker` (`bookmaker`),
  INDEX `idx_fetched` (`fetched_at` DESC),
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ARTICLES (CMS)
-- ============================================

CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT,
  `content` LONGTEXT NOT NULL,
  `category` ENUM('news', 'analysis', 'history', 'transfers', 'injuries') NOT NULL,
  `league_id` INT UNSIGNED COMMENT 'NULL = all leagues',
  `author` VARCHAR(100) DEFAULT 'Baseball FR',
  `featured_image` VARCHAR(255),
  `tags` JSON COMMENT 'Array of tags',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `published_at` TIMESTAMP NULL,
  `view_count` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_category` (`category`),
  INDEX `idx_league` (`league_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_published` (`published_at` DESC),
  INDEX `idx_views` (`view_count` DESC),
  FULLTEXT INDEX `ft_search` (`title`, `excerpt`, `content`),
  FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOKMAKERS
-- ============================================

CREATE TABLE IF NOT EXISTS `bookmakers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `logo_url` VARCHAR(255),
  `bonus_text` VARCHAR(255),
  `affiliate_url` VARCHAR(500),
  `anj_license` VARCHAR(50) COMMENT 'Numéro licence ANJ',
  `rating` DECIMAL(2,1) COMMENT '1.0 to 5.0',
  `features` JSON COMMENT 'Array of features',
  `active` TINYINT(1) DEFAULT 1,
  `priority` INT DEFAULT 0 COMMENT 'Display order (higher = first)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_active` (`active`),
  INDEX `idx_priority` (`priority` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CLICKS TRACKING (RGPD-compliant)
-- ============================================

CREATE TABLE IF NOT EXISTS `clicks_tracking` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `bookmaker_id` INT UNSIGNED NOT NULL,
  `ip_hash` CHAR(64) NOT NULL COMMENT 'SHA256 hash of IP (not raw IP)',
  `user_agent_hash` CHAR(64) COMMENT 'SHA256 hash of user agent',
  `referer` VARCHAR(255),
  `page_url` VARCHAR(500),
  `clicked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bookmaker` (`bookmaker_id`),
  INDEX `idx_clicked` (`clicked_at` DESC),
  INDEX `idx_ip_hash` (`ip_hash`),
  FOREIGN KEY (`bookmaker_id`) REFERENCES `bookmakers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADMIN USERS (CMS)
-- ============================================

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  `name` VARCHAR(100),
  `role` ENUM('admin', 'editor') DEFAULT 'editor',
  `active` TINYINT(1) DEFAULT 1,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CMS PAGES (Static pages)
-- ============================================

CREATE TABLE IF NOT EXISTS `cms_pages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `template` ENUM('default', 'landing', 'full-width') DEFAULT 'default',
  `meta_description` VARCHAR(255),
  `status` ENUM('draft', 'published') DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SYSTEM LOGS (Cron jobs, errors)
-- ============================================

CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `log_type` ENUM('cron', 'error', 'api', 'security') NOT NULL,
  `severity` ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
  `source` VARCHAR(100) COMMENT 'cron job name, API endpoint, etc.',
  `message` TEXT NOT NULL,
  `context` JSON COMMENT 'Additional context data',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_type` (`log_type`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_source` (`source`),
  INDEX `idx_created` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Initial data: Leagues
-- ============================================

INSERT INTO `leagues` (`code`, `name`, `country`, `active`) VALUES
('mlb', 'Major League Baseball', 'USA', 1),
('kbo', 'Korea Baseball Organization', 'South Korea', 1),
('npb', 'Nippon Professional Baseball', 'Japan', 1);

-- ============================================
-- Initial data: Bookmakers (ANJ only)
-- ============================================

INSERT INTO `bookmakers` (`slug`, `name`, `bonus_text`, `anj_license`, `rating`, `priority`, `active`) VALUES
('betclic', 'Betclic', '100€ offerts pour parier', '[À VÉRIFIER]', 4.5, 100, 1),
('unibet', 'Unibet', '100€ remboursés sur votre 1er pari', '[À VÉRIFIER]', 4.3, 90, 1),
('winamax', 'Winamax', '100€ offerts', '[À VÉRIFIER]', 4.4, 80, 1),
('pmu', 'PMU Sport', '100€ offerts', '[À VÉRIFIER]', 4.0, 70, 1);

-- ============================================
-- END OF SCHEMA
-- ============================================
