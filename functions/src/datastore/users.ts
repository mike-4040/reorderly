/**
 * PostgreSQL user datastore
 * Centralized database queries for users
 */

import { getPgPool } from '../clients/postgres.js';
import { CreateUserData, UpdateUserData, User } from '../users/types.js';

import { rowToUser } from './mappers.js';
import { Database } from './types/generated.js';

type UserRow = Database['public']['Tables']['users']['Row'];

/**
 * Get user by Firebase Auth UID
 */
export async function getUser(id: string): Promise<User | null> {
  const { rows } = await getPgPool().query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);

  return rowToUser(rows[0]);
}

/**
 * Get all users for a specific merchant
 */
export async function getUsersByMerchantId(merchantId: string): Promise<User[]> {
  const { rows } = await getPgPool().query<UserRow>('SELECT * FROM users WHERE merchant_id = $1', [
    merchantId,
  ]);

  return rows.map(rowToUser).filter((user): user is User => user !== null);
}

/**
 * Get user by merchantId and providerUserId
 */
export async function getUserByMerchantAndProvider(
  merchantId: string,
  providerUserId: string,
): Promise<User | null> {
  const { rows } = await getPgPool().query<UserRow>(
    'SELECT * FROM users WHERE merchant_id = $1 AND provider_user_id = $2',
    [merchantId, providerUserId],
  );

  return rowToUser(rows[0]);
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const { rows } = await getPgPool().query<UserRow>(
    `INSERT INTO users (
      id,
      merchant_id,
      account_setup_complete,
      provider_user_id,
      role
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [data.id, data.merchantId, data.accountSetupComplete, data.providerUserId ?? null, data.role],
  );

  const user = rowToUser(rows[0]);
  if (!user) {
    throw new Error('createUser_insertFailed');
  }
  return user;
}

/**
 * Update user fields
 */
export async function updateUser(id: string, updates: UpdateUserData): Promise<void> {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  // Build dynamic SET clause based on provided updates
  if (updates.merchantId !== undefined) {
    setClauses.push(`merchant_id = $${values.push(updates.merchantId)}`);
  }
  if (updates.accountSetupComplete !== undefined) {
    setClauses.push(`account_setup_complete = $${values.push(updates.accountSetupComplete)}`);
  }
  if (updates.providerUserId !== undefined) {
    setClauses.push(`provider_user_id = $${values.push(updates.providerUserId)}`);
  }
  if (updates.role !== undefined) {
    setClauses.push(`role = $${values.push(updates.role)}`);
  }
  if (updates.emailVerifiedAt !== undefined) {
    setClauses.push(`email_verified_at = $${values.push(updates.emailVerifiedAt)}`);
  }
  if (updates.emailVerificationSentAt !== undefined) {
    setClauses.push(
      `email_verification_sent_at = $${values.push(updates.emailVerificationSentAt)}`,
    );
  }
  if (updates.passwordSetAt !== undefined) {
    setClauses.push(`password_set_at = $${values.push(updates.passwordSetAt)}`);
  }

  if (setClauses.length === 0) {
    return; // No updates to perform
  }

  values.push(id);
  const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${values.length}`;

  await getPgPool().query(query, values);
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  await getPgPool().query('DELETE FROM users WHERE id = $1', [id]);
}
