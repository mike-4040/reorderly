/**
 * Merchant data types and interfaces
 */

/**
 * Supported OAuth providers
 */
export type Provider = 'square';

/**
 * Location information from provider
 */
export interface Location {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
  capabilities?: string[];
}

/**
 * Complete merchant record (flattened structure)
 */
export interface Merchant {
  id: string; // Our internal ID (database ID as string)
  name: string;
  provider: Provider;
  providerMerchantId: string; // merchant_id from provider

  // Token fields (flattened)
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string; // ISO date string
  tokenScopes: string[];

  // Locations (complex structure, kept as array)
  locations: Location[];

  // Metadata fields (flattened)
  connectedAt: string; // ISO date string
  lastRefreshedAt?: string; // ISO date string
  refreshFailureCount: number;
  revoked: boolean;
  scopesMismatch?: boolean;
  onboardingCompleted: boolean;

  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Merchant information from provider (raw OAuth response)
 */
export interface MerchantInfo {
  id: string; // Provider's merchant ID
  name: string;
  locations: Location[];
}

/**
 * Data required to create/update a merchant
 */
export interface MerchantInput {
  name: string;
  provider: Provider;
  providerMerchantId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string; // ISO date string
  tokenScopes: string[];
  locations: Location[];
}
