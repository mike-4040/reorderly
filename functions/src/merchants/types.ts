/**
 * Merchant data types and interfaces
 */

import { Timestamp } from 'firebase-admin/firestore';

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
 * OAuth token data
 */
export interface TokenData {
  access: string;
  refresh: string;
  expiresAt: Timestamp;
  scopes: string[];
}

/**
 * Audit entry for tracking changes
 */
export interface AuditEntry {
  timestamp: Timestamp;
  event: string;
  appVersion?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Merchant metadata
 */
export interface MerchantMetadata {
  connectedAt: Timestamp;
  lastRefreshedAt?: Timestamp;
  appVersion?: string;
  revoked: boolean;
  scopesMismatch?: boolean;
  onboardingCompleted: boolean;
}

/**
 * Base merchant data shared between all merchant types
 */
export interface MerchantBase {
  name: string;
  provider: Provider;
  providerMerchantId: string; // merchant_id from provider
  tokens: TokenData;
  locations: Location[];
}

/**
 * Complete merchant record
 */
export interface Merchant extends MerchantBase {
  id: string; // Our internal ID (Firestore doc ID)
  metadata: MerchantMetadata;
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
export interface MerchantInput extends MerchantBase {
  appVersion?: string;
  ip?: string;
  userAgent?: string;
}
