/**
 * User types and interfaces
 */

/**
 * User roles for role-based access control
 */
export type UserRole = 'owner' | 'admin' | 'manager' | 'staff';

/**
 * User in PostgreSQL
 * Represents a Firebase Auth user and their relationship to merchants
 */
export interface User {
  /** Firebase Auth UID */
  id: string;
  /** Reference to the merchant this user belongs to */
  merchantId: string;
  /** Whether user has completed account setup with email/password */
  accountSetupComplete: boolean;
  /** Optional: The provider user ID (e.g., Square merchant ID) */
  providerUserId?: string;
  /** User role for permissions */
  role: UserRole;
  /** When the email was verified (ISO date string) */
  emailVerifiedAt?: string;
  /** When the last verification email was sent (ISO date string) */
  emailVerificationSentAt?: string;
  /** When the user set their password (ISO date string) */
  passwordSetAt?: string;
  /** When the user was created (ISO date string) */
  createdAt: string;
  /** When the user was last updated (ISO date string) */
  updatedAt: string;
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
  /** User role for permissions */
  role: UserRole;
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
  /** User role */
  role?: UserRole;
  /** When the email was verified (ISO date string) */
  emailVerifiedAt?: string;
  /** When the last verification email was sent (ISO date string) */
  emailVerificationSentAt?: string;
  /** When the user set their password (ISO date string) */
  passwordSetAt?: string;
}
