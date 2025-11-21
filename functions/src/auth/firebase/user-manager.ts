/**
 * Firebase Auth user management utilities
 */

import { UserRecord } from 'firebase-admin/auth';

import { auth } from '../../inits/firebase';
import { digProperty } from '../../utils/object';

/**
 * Get or create a Firebase Auth user with a specific UID
 * Tries to get existing user, creates one with the given UID if not found
 *
 * @param uid - The Firebase Auth UID to use
 * @param displayName - Display name for the user
 * @returns The Firebase Auth UserRecord
 */
export async function getOrCreateAuthUser(uid: string, displayName: string): Promise<UserRecord> {
  try {
    return await auth.getUser(uid);
  } catch (error) {
    const errorCode = digProperty(error, 'errorInfo', 'code');
    if (errorCode === 'auth/user-not-found') {
      return await auth.createUser({ uid, displayName });
    }
    throw error;
  }
}

/**
 * Create a new Firebase Auth user with auto-generated UID
 *
 * @param displayName - Display name for the user
 * @returns The Firebase Auth UserRecord
 */
export async function createAuthUser(displayName: string): Promise<UserRecord> {
  return await auth.createUser({ displayName });
}

/**
 * Generate a custom token for Firebase Auth sign-in
 *
 * @param uid - The Firebase Auth UID
 * @returns Custom token string
 */
export async function generateCustomToken(uid: string): Promise<string> {
  return await auth.createCustomToken(uid);
}
