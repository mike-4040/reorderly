/**
 * Merchant repository - Firestore CRUD operations
 */

import { Timestamp } from 'firebase-admin/firestore';

import { collections } from '../utils/firestore';

import { Merchant, MerchantInput } from './types';

/**
 * Create or update a merchant record
 * If merchant already exists (by providerMerchantId), updates it; otherwise creates new
 */
export async function upsertMerchant(input: MerchantInput): Promise<Merchant> {
  // Check if merchant already exists
  const existingQuery = await collections.merchants
    .where('provider', '==', input.provider)
    .where('providerMerchantId', '==', input.providerMerchantId)
    .limit(1)
    .get();

  const now = Timestamp.now();

  if (!existingQuery.empty) {
    // Update existing merchant
    const doc = existingQuery.docs[0];
    const existing = doc.data() as Merchant;

    const updated: Merchant = {
      ...existing,
      tokens: input.tokens,
      locations: input.locations,
      metadata: {
        ...existing.metadata,
        lastRefreshedAt: now,
        appVersion: input.appVersion,
        revoked: false,
        scopesMismatch: false,
      },
    };

    await doc.ref.set(updated);

    // Add audit log
    await collections.auditLogs.add({
      merchantId: doc.id,
      event: 'merchant_updated',
      timestamp: now,
      appVersion: input.appVersion,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return { ...updated, id: doc.id };
  } else {
    // Create new merchant
    const newMerchant: Omit<Merchant, 'id'> = {
      name: input.name,
      provider: input.provider,
      providerMerchantId: input.providerMerchantId,
      tokens: input.tokens,
      locations: input.locations,
      metadata: {
        connectedAt: now,
        lastRefreshedAt: now,
        appVersion: input.appVersion,
        revoked: false,
        onboardingCompleted: false,
      },
    };

    const docRef = await collections.merchants.add(newMerchant);

    // Add audit log
    await collections.auditLogs.add({
      merchantId: docRef.id,
      event: 'merchant_created',
      timestamp: now,
      appVersion: input.appVersion,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return { ...newMerchant, id: docRef.id };
  }
}

/**
 * Update merchant fields
 */
export async function updateMerchant(
  id: string,
  updates: Partial<Omit<Merchant, 'id'>>,
): Promise<void> {
  await collections.merchants.doc(id).update(
    {
      ...updates,
      'metadata.lastRefreshedAt': Timestamp.now(),
    },
    { exists: true },
  );

  // Add audit log
  await collections.auditLogs.add({
    merchantId: id,
    event: 'merchant_updated',
    timestamp: Timestamp.now(),
  });
}

/**
 * Get merchant by ID
 */
export async function getMerchant(id: string): Promise<Merchant | null> {
  const doc = await collections.merchants.doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() } as Merchant;
}

/**
 * Get merchant by provider and provider merchant ID
 */
export async function getMerchantByProviderId(
  provider: string,
  providerMerchantId: string,
): Promise<Merchant | null> {
  const query = await collections.merchants
    .where('provider', '==', provider)
    .where('providerMerchantId', '==', providerMerchantId)
    .limit(1)
    .get();

  if (query.empty) {
    return null;
  }

  const doc = query.docs[0];
  return { id: doc.id, ...doc.data() } as Merchant;
}

/**
 * Mark merchant as revoked
 */
export async function revokeMerchant(id: string): Promise<void> {
  const doc = await collections.merchants.doc(id).get();

  if (!doc.exists) {
    throw new Error('revokeMerchant_notFound', { cause: { id } });
  }

  await doc.ref.update({
    'metadata.revoked': true,
    'metadata.lastRefreshedAt': Timestamp.now(),
  });

  // Add audit log
  await collections.auditLogs.add({
    merchantId: id,
    event: 'merchant_revoked',
    timestamp: Timestamp.now(),
  });
}
