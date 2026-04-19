/**
 * Database Configuration
 * SQLite using better-sqlite3 (dev) - will migrate to MySQL in production
 */

import Database from 'better-sqlite3';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SQLite database path
const DB_PATH = process.env.DB_PATH || join(__dirname, '../../database/baseball.db');
const SCHEMA_PATH = join(__dirname, '../../database/schema.sqlite.sql');

// Create database instance
let dbInstance: Database.Database | null = null;

function getDB(): Database.Database {
  if (!dbInstance) {
    const isNew = !existsSync(DB_PATH);
    dbInstance = new Database(DB_PATH);

    // Enable foreign keys
    dbInstance.pragma('foreign_keys = ON');

    // Initialize schema if new database
    if (isNew) {
      console.log('Initializing new database...');
      const schema = readFileSync(SCHEMA_PATH, 'utf-8');
      dbInstance.exec(schema);
      console.log('✓ Database schema initialized');
    }
  }
  return dbInstance;
}

/**
 * Database utilities
 */
export const db = {
  /**
   * Execute a SELECT query
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    const database = getDB();
    const stmt = database.prepare(sql);
    const rows = params ? stmt.all(...params) : stmt.all();
    return rows as T;
  },

  /**
   * Execute an INSERT/UPDATE/DELETE query
   */
  async execute<T = any>(sql: string, params?: any[]): Promise<T> {
    const database = getDB();
    const stmt = database.prepare(sql);
    const result = params ? stmt.run(...params) : stmt.run();
    return result as T;
  },

  /**
   * Get a single row
   */
  async get<T = any>(sql: string, params?: any[]): Promise<T | undefined> {
    const database = getDB();
    const stmt = database.prepare(sql);
    const row = params ? stmt.get(...params) : stmt.get();
    return row as T | undefined;
  },

  /**
   * Test database connection
   */
  async testConnection(): Promise<void> {
    try {
      const database = getDB();
      database.prepare('SELECT 1').get();
      console.log('Database connection test successful');
    } catch (error) {
      console.error('Database connection test failed:', error);
      throw error;
    }
  },

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
      console.log('Database connection closed');
    }
  },

  /**
   * Get database stats
   */
  getPoolStats() {
    return {
      type: 'SQLite',
      path: DB_PATH,
      connected: dbInstance !== null,
    };
  },

  /**
   * Run raw SQL (for migrations)
   */
  exec(sql: string): void {
    const database = getDB();
    database.exec(sql);
  },
};

// Export types
export type DBQueryResult = Database.RunResult;
