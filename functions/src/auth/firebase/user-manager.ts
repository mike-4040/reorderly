/**
 * Firebase Auth user management utilities
 */

import { UserRecord } from 'firebase-admin/auth';

import { auth } from '../../inits/firebase';
import { digProperty } from '../../utils/object';

/**
 * Get or create a Firebase Auth user
 * Creates a new user if one doesn't exist with the given UID
 *
 * @param uid - The Firebase Auth UID to use
 * @param displayName - Display name for the user
 * @returns The Firebase Auth UserRecord
 */
export async function getOrCreateUser(uid: string, displayName: string): Promise<UserRecord> {
  try {
    // Try to get existing user
    return await auth.getUser(uid);
  } catch (error) {
    const errorCode = digProperty(error, 'errorInfo', 'code');
    // Only create user if they don't exist, re-throw other errors
    if (errorCode === 'auth/user-not-found') {
      return await auth.createUser({
        uid,
        displayName,
      });
    }
    throw error;
  }
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
