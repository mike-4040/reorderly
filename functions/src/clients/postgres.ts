/**
 * PostgreSQL client initialization
 * Provides centralized access to the database connection pool
 */

import process from 'node:process';

import { Pool } from 'pg';

import { config } from '../utils/config.js';
import { captureException } from '../utils/sentry.js';

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
     * Error handler
     * Prevents unhandled promise rejections from pool errors
     */
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      captureException(err);
    });

    /**
     * Graceful shutdown handler
     * Closes all database connections when the process terminates
     */
    process.on('SIGTERM', () => {
      if (!pool) {
        return;
      }

      pool
        .end()
        .then(() => {
          console.log('PostgreSQL pool has ended');
        })
        .catch((err: unknown) => {
          console.error('Error during PostgreSQL pool shutdown', err);
          captureException(err);
        })
        .finally(() => {
          pool = null;
        });
    });
  }

  return pool;
}
