/**
 * User repository for Firestore operations
 */

import { Timestamp } from 'firebase-admin/firestore';

import { collections } from '../utils/firestore';

import { CreateUserData, UpdateUserData, User } from './types';

/**
 * Create a new user in Firestore
 *
 * @param data - User creation data
 * @returns The created user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const now = Timestamp.now();

  const user: User = {
    id: data.id,
    merchantId: data.merchantId,
    accountSetupComplete: data.accountSetupComplete,
    providerUserId: data.providerUserId,
    role: data.role,
    createdAt: now,
    updatedAt: now,
  };

  await collections.users.doc(data.id).set(user);

  return user;
}

/**
 * Get a user by their Firebase Auth UID
 *
 * @param uid - Firebase Auth UID
 * @returns The user or null if not found
 */
export async function getUserById(uid: string): Promise<User | null> {
  const doc = await collections.users.doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as User;
}

/**
 * Update an existing user
 *
 * @param uid - Firebase Auth UID
 * @param data - Update data
 * @returns The updated user
 */
export async function updateUser(uid: string, data: UpdateUserData): Promise<User> {
  const updateData = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  await collections.users.doc(uid).update(updateData);

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
  const snapshot = await collections.users.where('merchantId', '==', merchantId).get();

  return snapshot.docs.map((doc) => doc.data() as User);
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
  const snapshot = await collections.users
    .where('merchantId', '==', merchantId)
    .where('providerUserId', '==', providerUserId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as User;
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
  await collections.users.doc(uid).delete();
}
