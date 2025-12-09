/**
 * Items sync service
 * Syncs catalog items from Square to database
 */

import { CatalogObject } from 'square';

import { markItemsNotSeenAsDeleted, upsertItem } from '../datastore/items.js';
import { getMerchant } from '../datastore/merchants.js';
import { ItemInput } from '../items/types.js';
import { fetchCatalogItems } from '../providers/square/client.js';
import { serializeBigIntValues } from '../utils/object.js';
import { captureException } from '../utils/sentry.js';

/**
 * Batch size for parallel item processing
 */
const BATCH_SIZE = 20;

/**
 * Sync items for a specific merchant
 * Fetches all items from Square and upserts them into database
 * Marks items not seen in this sync as deleted
 */
export async function syncMerchantItems(merchantId: string): Promise<void> {
  try {
    console.log(`Starting item sync for merchant ${merchantId}`);

    // Get merchant to access token
    const merchant = await getMerchant(merchantId);

    if (!merchant) {
      throw new Error('syncMerchantItems_merchantNotFound', {
        cause: { merchantId },
      });
    }

    if (merchant.revoked) {
      console.log(`Skipping sync for revoked merchant ${merchantId}`);
      return;
    }

    // Record sync start time
    const syncStartTime = new Date().toISOString();

    // Fetch items from Square
    const catalogItems = await fetchCatalogItems(merchant.accessToken);

    console.log(`Fetched ${catalogItems.length} items from Square for merchant ${merchantId}`);

    // Process items in parallel batches
    let processedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < catalogItems.length; i += BATCH_SIZE) {
      const batch = catalogItems.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (catalogItem) => {
          const itemInput = mapSquareItemToInput(merchantId, catalogItem);
          await upsertItem(itemInput);
          return catalogItem.id;
        }),
      );

      results.forEach((result, idx) => {
        const catalogItem = batch[idx];
        if (result.status === 'fulfilled') {
          processedCount++;
        } else {
          errorCount++;
          captureException(
            new Error('syncMerchantItems_itemProcessingFailed', {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              cause: { error: result.reason, catalogItemId: catalogItem.id },
            }),
          );
        }
      });
    }

    // Mark items not seen in this sync as deleted
    const deletedCount = await markItemsNotSeenAsDeleted(merchantId, syncStartTime);

    console.log(
      `Item sync completed for merchant ${merchantId}: ${processedCount} processed, ${errorCount} errors, ${deletedCount} marked as deleted`,
    );
  } catch (error) {
    captureException(
      new Error('syncMerchantItems_failed', {
        cause: { error, merchantId },
      }),
    );
    throw error;
  }
}

/**
 * Map Square catalog item to ItemInput
 */
function mapSquareItemToInput(merchantId: string, catalogItem: CatalogObject): ItemInput {
  if (catalogItem.type !== 'ITEM' || !catalogItem.itemData) {
    throw new Error('mapSquareItemToInput_missingItemData', {
      cause: { catalogItemId: catalogItem.id, type: catalogItem.type },
    });
  }

  const { itemData } = catalogItem;

  // Find category name if category_id exists
  // For now, we'll store just the ID. In a full implementation,
  // we could fetch category details or store them separately
  const categoryName: string | undefined = undefined;

  return {
    merchantId,
    provider: 'square',
    providerItemId: catalogItem.id,
    name: itemData.name ?? '',
    description: itemData.description ?? undefined,
    categoryId: itemData.categoryId ?? undefined,
    categoryName,
    isDeleted: Boolean(catalogItem.isDeleted),
    isAvailable: itemData.isArchived !== true,
    providerVersion: catalogItem.version ? Number(catalogItem.version) : undefined,
    providerUpdatedAt: catalogItem.updatedAt,
    lastSeenAt: new Date().toISOString(),
    raw: serializeBigIntValues(catalogItem),
  };
}
