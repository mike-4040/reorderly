/**
 * Database row to domain model mappers
 */

import { Location, Merchant, Provider } from '../merchants/types.js';

import { Database } from './types/generated.js';

type MerchantRow = Database['public']['Tables']['merchants']['Row'];

/**
 * Convert database row to domain Merchant type
 */
export function rowToMerchant(row: MerchantRow | null | undefined): Merchant | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id.toString(),
    name: row.name,
    provider: row.provider as Provider,
    providerMerchantId: row.provider_merchant_id,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    tokenExpiresAt: row.token_expires_at,
    tokenScopes: row.token_scopes,
    locations: row.locations as unknown as Location[],
    connectedAt: row.connected_at,
    lastRefreshedAt: row.last_refreshed_at ?? undefined,
    refreshFailureCount: row.refresh_failure_count,
    revoked: row.revoked,
    scopesMismatch: row.scopes_mismatch,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
