/**
 * Merchant business logic
 */

import { createMerchant, getMerchantByProviderId, updateMerchant } from '../datastore/postgres.js';

import { Merchant, MerchantInput } from './types.js';

/**
 * Create or update a merchant record
 * If merchant already exists (by provider + providerMerchantId), updates it; otherwise creates new
 */
export async function upsertMerchant(input: MerchantInput): Promise<Merchant> {
  const existing = await getMerchantByProviderId(input.provider, input.providerMerchantId);

  if (existing) {
    // Update existing merchant with fresh tokens
    await updateMerchant(existing.id, {
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      tokenExpiresAt: input.tokenExpiresAt,
      tokenScopes: input.tokenScopes,
      locations: input.locations,
      lastRefreshedAt: new Date().toISOString(),
      revoked: false,
      scopesMismatch: false,
    });

    // Fetch and return updated merchant
    return {
      ...existing,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      tokenExpiresAt: input.tokenExpiresAt,
      tokenScopes: input.tokenScopes,
      locations: input.locations,
      lastRefreshedAt: new Date().toISOString(),
      revoked: false,
      scopesMismatch: false,
      updatedAt: new Date().toISOString(),
    };
  }

  // Create new merchant
  return createMerchant(input);
}
