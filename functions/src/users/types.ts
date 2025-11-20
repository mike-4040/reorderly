/**
 * User types and interfaces
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * User document in Firestore
 * Represents a Firebase Auth user and their relationship to merchants
 */
export interface User {
  /** Firestore document ID (same as Firebase Auth UID) */
  id: string;
  /** Reference to the merchant this user belongs to */
  merchantId: string;
  /** Whether user has completed account setup with email/password */
  accountSetupComplete: boolean;
  /** Optional: The provider user ID (e.g., Square merchant ID) */
  providerUserId?: string;
  /** When the user was created */
  createdAt: Timestamp;
  /** When the user was last updated */
  updatedAt: Timestamp;
}

/**
 * Data required to create a new user
 */
export interface CreateUserData {
  /** Firebase Auth UID */
  id: string;
  /** Merchant ID this user belongs to */
  merchantId: string;
  /** Whether account setup is complete */
  accountSetupComplete: boolean;
  /** Optional provider user ID */
  providerUserId?: string;
}

/**
 * Data for updating an existing user
 */
export interface UpdateUserData {
  /** Merchant ID */
  merchantId?: string;
  /** Account setup status */
  accountSetupComplete?: boolean;
  /** Provider user ID */
  providerUserId?: string;
}
