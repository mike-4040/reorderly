/**
 * PostgreSQL datastore
 * Centralized database queries for all domains
 */

import { getPgPool } from '../clients/postgres.js';

/**
 * Merchant entity from database
 */
export interface MerchantRow {
  id: string;
  name: string | null;
  email: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get merchant by ID
 */
export async function getMerchantById(id: string): Promise<MerchantRow | null> {
  const result = await getPgPool().query<MerchantRow>(
    'SELECT id, name, email, created_at, updated_at FROM merchants WHERE id = $1',
    [id],
  );

  return result.rows[0] ?? null;
}
