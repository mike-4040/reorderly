/**
 * PostgreSQL datastore for items
 * Centralized database queries for item operations
 */

import { getPgPool } from '../clients/postgres.js';
import { Item, ItemInput, ItemUpdate } from '../items/types.js';

import { ItemRow, rowToItem } from './mappers.js';

/**
 * Get item by ID
 */
export async function getItem(id: string): Promise<Item | null> {
  const { rows } = await getPgPool().query<ItemRow>('SELECT * FROM items WHERE id = $1', [id]);

  return rowToItem(rows[0]);
}

/**
 * Get item by merchant and provider item ID
 */
export async function getItemByProviderId(
  merchantId: string,
  provider: string,
  providerItemId: string,
): Promise<Item | null> {
  const { rows } = await getPgPool().query<ItemRow>(
    'SELECT * FROM items WHERE merchant_id = $1 AND provider = $2 AND provider_item_id = $3',
    [merchantId, provider, providerItemId],
  );

  return rowToItem(rows[0]);
}

/**
 * Get all items for a merchant
 */
export async function getItemsByMerchant(merchantId: string): Promise<Item[]> {
  const { rows } = await getPgPool().query<ItemRow>(
    'SELECT * FROM items WHERE merchant_id = $1 ORDER BY name',
    [merchantId],
  );

  return rows.map(rowToItem).filter((item): item is Item => item !== null);
}

/**
 * Create a new item
 */
export async function createItem(input: ItemInput): Promise<Item> {
  const { rows } = await getPgPool().query<ItemRow>(
    `INSERT INTO items (
      merchant_id,
      provider,
      provider_item_id,
      name,
      description,
      category_id,
      category_name,
      is_deleted,
      is_available,
      provider_version,
      provider_updated_at,
      last_seen_at,
      raw
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      input.merchantId,
      input.provider,
      input.providerItemId,
      input.name,
      input.description ?? null,
      input.categoryId ?? null,
      input.categoryName ?? null,
      input.isDeleted ?? false,
      input.isAvailable ?? true,
      input.providerVersion ?? null,
      input.providerUpdatedAt ?? null,
      input.lastSeenAt ?? null,
      input.raw ? JSON.stringify(input.raw) : null,
    ],
  );

  const item = rowToItem(rows[0]);

  if (!item) {
    throw new Error('createItem_failed');
  }

  return item;
}

/**
 * Update an existing item
 */
export async function updateItem(id: string, updates: ItemUpdate): Promise<Item> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }

  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }

  if (updates.categoryId !== undefined) {
    setClauses.push(`category_id = $${paramIndex++}`);
    values.push(updates.categoryId);
  }

  if (updates.categoryName !== undefined) {
    setClauses.push(`category_name = $${paramIndex++}`);
    values.push(updates.categoryName);
  }

  if (updates.isDeleted !== undefined) {
    setClauses.push(`is_deleted = $${paramIndex++}`);
    values.push(updates.isDeleted);
  }

  if (updates.isAvailable !== undefined) {
    setClauses.push(`is_available = $${paramIndex++}`);
    values.push(updates.isAvailable);
  }

  if (updates.providerVersion !== undefined) {
    setClauses.push(`provider_version = $${paramIndex++}`);
    values.push(updates.providerVersion);
  }

  if (updates.providerUpdatedAt !== undefined) {
    setClauses.push(`provider_updated_at = $${paramIndex++}`);
    values.push(updates.providerUpdatedAt);
  }

  if (updates.lastSeenAt !== undefined) {
    setClauses.push(`last_seen_at = $${paramIndex++}`);
    values.push(updates.lastSeenAt);
  }

  if (updates.raw !== undefined) {
    setClauses.push(`raw = $${paramIndex++}`);
    values.push(updates.raw ? JSON.stringify(updates.raw) : null);
  }

  values.push(id);

  const { rows } = await getPgPool().query<ItemRow>(
    `UPDATE items SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );

  const item = rowToItem(rows[0]);

  if (!item) {
    throw new Error('updateItem_failed');
  }

  return item;
}

/**
 * Upsert item (insert or update based on merchant + provider + provider_item_id)
 */
export async function upsertItem(input: ItemInput): Promise<Item> {
  const { rows } = await getPgPool().query<ItemRow>(
    `INSERT INTO items (
      merchant_id,
      provider,
      provider_item_id,
      name,
      description,
      category_id,
      category_name,
      is_deleted,
      is_available,
      provider_version,
      provider_updated_at,
      last_seen_at,
      raw
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (merchant_id, provider, provider_item_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      category_id = EXCLUDED.category_id,
      category_name = EXCLUDED.category_name,
      is_deleted = EXCLUDED.is_deleted,
      is_available = EXCLUDED.is_available,
      provider_version = EXCLUDED.provider_version,
      provider_updated_at = EXCLUDED.provider_updated_at,
      last_seen_at = EXCLUDED.last_seen_at,
      raw = EXCLUDED.raw
    RETURNING *`,
    [
      input.merchantId,
      input.provider,
      input.providerItemId,
      input.name,
      input.description ?? null,
      input.categoryId ?? null,
      input.categoryName ?? null,
      input.isDeleted ?? false,
      input.isAvailable ?? true,
      input.providerVersion ?? null,
      input.providerUpdatedAt ?? null,
      input.lastSeenAt ?? null,
      input.raw ? JSON.stringify(input.raw) : null,
    ],
  );

  const item = rowToItem(rows[0]);

  if (!item) {
    throw new Error('upsertItem_failed');
  }

  return item;
}

/**
 * Mark items as deleted if not seen in latest sync
 */
export async function markItemsNotSeenAsDeleted(
  merchantId: string,
  cutoffTime: string,
): Promise<number> {
  const { rowCount } = await getPgPool().query(
    `UPDATE items 
     SET is_deleted = true 
     WHERE merchant_id = $1 
       AND (last_seen_at IS NULL OR last_seen_at < $2)
       AND is_deleted = false`,
    [merchantId, cutoffTime],
  );

  return rowCount ?? 0;
}
