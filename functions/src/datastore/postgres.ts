/**
 * PostgreSQL datastore
 * Centralized database queries for all domains
 */

import { getPgPool } from '../clients/postgres.js';

import { Database } from './types/generated.js';

/**
 * Merchant entity from database
 */
type MerchantRow = Database['public']['Tables']['merchants']['Row'];

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
