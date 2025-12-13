/**
 * User repository for PostgreSQL operations
 */

import {
  createUser as dbCreateUser,
  deleteUser as dbDeleteUser,
  getUser,
  getUserByMerchantAndProvider as dbGetUserByMerchantAndProvider,
  getUsersByMerchantId as dbGetUsersByMerchantId,
  updateUser as dbUpdateUser,
} from '../datastore/users.js';

import { CreateUserData, UpdateUserData, User } from './types';

/**
 * Create a new user in PostgreSQL
 *
 * @param data - User creation data
 * @returns The created user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  return dbCreateUser(data);
}

/**
 * Get a user by their Firebase Auth UID
 *
 * @param uid - Firebase Auth UID
 * @returns The user or null if not found
 */
export async function getUserById(uid: string): Promise<User | null> {
  return getUser(uid);
}

/**
 * Update an existing user
 *
 * @param uid - Firebase Auth UID
 * @param data - Update data
 * @returns The updated user
 */
export async function updateUser(uid: string, data: UpdateUserData): Promise<User> {
  await dbUpdateUser(uid, data);

  const updated = await getUserById(uid);

  if (!updated) {
    throw new Error('updateUser_userNotFound', { cause: { uid } });
  }

  return updated;
}

/**
 * Get all users for a specific merchant
 *
 * @param merchantId - The merchant ID
 * @returns Array of users
 */
export async function getUsersByMerchantId(merchantId: string): Promise<User[]> {
  return dbGetUsersByMerchantId(merchantId);
}

/**
 * Get user by merchantId and providerUserId
 * Used for OAuth login to find the user who previously connected this provider
 *
 * @param merchantId - The merchant ID
 * @param providerUserId - The provider user ID (e.g., Square merchant ID)
 * @returns The user or null if not found
 */
export async function getUserByMerchantAndProvider(
  merchantId: string,
  providerUserId: string,
): Promise<User | null> {
  return dbGetUserByMerchantAndProvider(merchantId, providerUserId);
}

/**
 * Get or create a user
 * Creates a new user if one doesn't exist
 *
 * @param data - User creation data
 * @returns The existing or newly created user
 */
export async function getOrCreateUser(data: CreateUserData): Promise<User> {
  const existing = await getUserById(data.id);

  if (existing) {
    return existing;
  }

  return await createUser(data);
}

/**
 * Delete a user
 *
 * @param uid - Firebase Auth UID
 */
export async function deleteUser(uid: string): Promise<void> {
  await dbDeleteUser(uid);
}
