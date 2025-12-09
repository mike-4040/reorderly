/**
 * Item data types and interfaces
 */

import { Database } from '../datastore/types/generated.js';

/**
 * Database row type for items
 */
export type ItemRow = Database['public']['Tables']['items']['Row'];

/**
 * Item record with mapped field names
 */
export interface Item {
  id: string; // Database ID as string
  merchantId: string;
  provider: string;
  providerItemId: string; // Square catalog object ID
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  isDeleted: boolean;
  isAvailable: boolean;
  providerVersion?: number;
  providerUpdatedAt?: string; // ISO date string
  lastSeenAt?: string; // ISO date string
  raw?: unknown; // Raw Square payload
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Input for creating or updating items
 */
export interface ItemInput {
  merchantId: string;
  provider: string;
  providerItemId: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  isDeleted?: boolean;
  isAvailable?: boolean;
  providerVersion?: number;
  providerUpdatedAt?: string;
  lastSeenAt?: string;
  raw?: unknown;
}

/**
 * Partial update for items
 */
export interface ItemUpdate {
  name?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  isDeleted?: boolean;
  isAvailable?: boolean;
  providerVersion?: number;
  providerUpdatedAt?: string;
  lastSeenAt?: string;
  raw?: unknown;
}
