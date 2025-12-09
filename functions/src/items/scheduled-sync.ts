/**
 * Scheduled Cloud Function to sync catalog items
 * Runs periodically to keep catalog items in sync with Square
 */

import { onSchedule } from 'firebase-functions/scheduler';

import { getMerchantsNeedingRefresh } from '../datastore/merchants.js';
import { captureException } from '../utils/sentry.js';

import { syncMerchantItems } from './sync.js';

/**
 * Scheduled function that runs daily to sync catalog items
 * Syncs items for all active (non-revoked) merchants
 */
export const scheduledItemsSync = onSchedule(
  {
    schedule: '0 2 * * *', // Run at 2 AM daily
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    console.log('Starting scheduled items sync');

    try {
      // Reuse the same query as token refresh - gets all non-revoked merchants
      const merchants = await getMerchantsNeedingRefresh();

      console.log(`Found ${merchants.length} active merchants for items sync`);

      // Process merchants in batches of 10 with error isolation
      // Smaller batch size than token refresh since catalog sync is heavier
      const BATCH_SIZE = 10;
      for (let i = 0; i < merchants.length; i += BATCH_SIZE) {
        const batch = merchants.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map((merchant) => syncMerchantItems(merchant.id)),
        );

        const succeeded = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.length - succeeded;

        console.log(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${succeeded} succeeded, ${failed} failed`,
        );
      }

      console.log('Scheduled items sync completed successfully');
    } catch (error) {
      captureException(error);
      throw error;
    }
  },
);
