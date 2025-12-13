/**
 * Database row to domain model mappers
 */

import { Item } from '../items/types.js';
import { Location, Merchant, Provider } from '../merchants/types.js';
import { User, UserRole } from '../users/types.js';

import { Database } from './types/generated.js';

type MerchantRow = Database['public']['Tables']['merchants']['Row'];
type ItemRow = Database['public']['Tables']['items']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];

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

/**
 * Convert database row to domain Item type
 */
export function rowToItem(row: ItemRow | null | undefined): Item | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id.toString(),
    merchantId: row.merchant_id.toString(),
    provider: row.provider,
    providerItemId: row.provider_item_id,
    name: row.name,
    description: row.description ?? undefined,
    categoryId: row.category_id ?? undefined,
    categoryName: row.category_name ?? undefined,
    isDeleted: row.is_deleted,
    isAvailable: row.is_available,
    providerVersion: row.provider_version ?? undefined,
    providerUpdatedAt: row.provider_updated_at ?? undefined,
    lastSeenAt: row.last_seen_at ?? undefined,
    raw: row.raw ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert database row to domain User type
 */
export function rowToUser(row: UserRow | null | undefined): User | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    merchantId: row.merchant_id.toString(),
    accountSetupComplete: row.account_setup_complete,
    providerUserId: row.provider_user_id ?? undefined,
    role: row.role as UserRole,
    emailVerifiedAt: row.email_verified_at ?? undefined,
    emailVerificationSentAt: row.email_verification_sent_at ?? undefined,
    passwordSetAt: row.password_set_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
