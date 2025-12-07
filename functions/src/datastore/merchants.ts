/**
 * PostgreSQL datastore
 * Centralized database queries for all domains
 */

import { getPgPool } from '../clients/postgres.js';
import { Merchant, MerchantInput } from '../merchants/types.js';

import { rowToMerchant } from './mappers.js';
import { Database } from './types/generated.js';

type MerchantRow = Database['public']['Tables']['merchants']['Row'];

/**
 * Get merchant by ID
 */
export async function getMerchant(id: string): Promise<Merchant | null> {
  const { rows } = await getPgPool().query<MerchantRow>('SELECT * FROM merchants WHERE id = $1', [
    id,
  ]);

  return rowToMerchant(rows[0]);
}

/**
 * Get merchant by provider and provider merchant ID
 */
export async function getMerchantByProviderId(
  provider: string,
  providerMerchantId: string,
): Promise<Merchant | null> {
  const { rows } = await getPgPool().query<MerchantRow>(
    'SELECT * FROM merchants WHERE provider = $1 AND provider_merchant_id = $2',
    [provider, providerMerchantId],
  );

  return rowToMerchant(rows[0]);
}

/**
 * Create a new merchant
 */
export async function createMerchant(input: MerchantInput): Promise<Merchant> {
  const { rows } = await getPgPool().query<MerchantRow>(
    `INSERT INTO merchants (
      name,
      provider,
      provider_merchant_id,
      access_token,
      refresh_token,
      token_expires_at,
      token_scopes,
      locations,
      last_refreshed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *`,
    [
      input.name,
      input.provider,
      input.providerMerchantId,
      input.accessToken,
      input.refreshToken,
      input.tokenExpiresAt,
      input.tokenScopes,
      JSON.stringify(input.locations),
    ],
  );

  const merchant = rowToMerchant(rows[0]);
  if (!merchant) {
    throw new Error('createMerchant_insertFailed');
  }
  return merchant;
}

/**
 * Update merchant fields
 */
export async function updateMerchant(
  id: string,
  updates: Partial<Omit<Merchant, 'id'>>,
): Promise<void> {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  // Build dynamic SET clause based on provided updates
  if (updates.name !== undefined) {
    setClauses.push(`name = $${values.push(updates.name)}`);
  }
  if (updates.accessToken !== undefined) {
    setClauses.push(`access_token = $${values.push(updates.accessToken)}`);
  }
  if (updates.refreshToken !== undefined) {
    setClauses.push(`refresh_token = $${values.push(updates.refreshToken)}`);
  }
  if (updates.tokenExpiresAt !== undefined) {
    setClauses.push(`token_expires_at = $${values.push(updates.tokenExpiresAt)}`);
  }
  if (updates.tokenScopes !== undefined) {
    setClauses.push(`token_scopes = $${values.push(updates.tokenScopes)}`);
  }
  if (updates.locations !== undefined) {
    setClauses.push(`locations = $${values.push(JSON.stringify(updates.locations))}`);
  }
  if (updates.lastRefreshedAt !== undefined) {
    setClauses.push(`last_refreshed_at = $${values.push(updates.lastRefreshedAt)}`);
  }
  if (updates.revoked !== undefined) {
    setClauses.push(`revoked = $${values.push(updates.revoked)}`);
  }
  if (updates.scopesMismatch !== undefined) {
    setClauses.push(`scopes_mismatch = $${values.push(updates.scopesMismatch)}`);
  }
  if (updates.onboardingCompleted !== undefined) {
    setClauses.push(`onboarding_completed = $${values.push(updates.onboardingCompleted)}`);
  }
  if (updates.refreshFailureCount !== undefined) {
    setClauses.push(`refresh_failure_count = $${values.push(updates.refreshFailureCount)}`);
  }

  if (setClauses.length === 0) {
    // Nothing to update
    return;
  }

  await getPgPool().query(
    `UPDATE merchants
    SET ${setClauses.join(', ')} 
    WHERE id = $${values.push(id)}`,
    values,
  );
}

/**
 * Mark merchant as revoked
 */
export async function revokeMerchant(id: string): Promise<void> {
  const { rowCount } = await getPgPool().query(
    `UPDATE merchants 
     SET revoked = true,
         last_refreshed_at = NOW()
     WHERE id = $1`,
    [id],
  );

  if (rowCount === 0) {
    throw new Error('revokeMerchant_notFound', { cause: { id } });
  }
}

/**
 * Get merchants that need token refresh
 * Criteria: not revoked AND last_refreshed_at is older than 24 hours (or NULL)
 */
export async function getMerchantsNeedingRefresh(): Promise<Merchant[]> {
  const { rows } = await getPgPool().query<MerchantRow>(
    `SELECT * FROM merchants 
     WHERE revoked = false 
       AND (last_refreshed_at IS NULL OR last_refreshed_at < NOW() - INTERVAL '24 hours')
     ORDER BY last_refreshed_at NULLS FIRST`,
  );

  return rows.map((row) => rowToMerchant(row)).filter((m): m is Merchant => m !== null);
}
