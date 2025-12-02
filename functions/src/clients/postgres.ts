/**
 * PostgreSQL client initialization
 * Provides centralized access to the database connection pool
 */

import process from 'node:process';

import { Pool } from 'pg';

import { config } from '../utils/config.js';

let pool: Pool | null = null;

/**
 * PostgreSQL connection pool
 * Reuses connections for better performance
 * Lazily initialized to avoid loading during deployment/analysis
 */
export function getPgPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.postgresUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    /**
     * Graceful shutdown handler
     * Closes all database connections when the process terminates
     */
    process.on('SIGTERM', () => {
      void pool?.end();
    });
  }

  return pool;
}
