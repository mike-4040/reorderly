/**
 * Scheduled Cloud Function to refresh merchant tokens
 * Runs daily to proactively refresh tokens before they expire
 */

import { onSchedule } from 'firebase-functions/scheduler';

import { getMerchantsNeedingRefresh } from '../datastore/merchants.js';
import { captureException } from '../utils/sentry.js';

import { refreshMerchantToken } from './token-refresh.js';

/**
 * Scheduled function that runs daily to refresh merchant tokens
 * Queries merchants that haven't been refreshed in 24+ hours
 */
export const scheduledTokenRefresh = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    console.log('Starting scheduled token refresh');

    try {
      const merchants = await getMerchantsNeedingRefresh();

      console.log(`Found ${merchants.length} merchants needing token refresh`);

      // Process merchants in batches of 50 with error isolation
      const BATCH_SIZE = 50;
      for (let i = 0; i < merchants.length; i += BATCH_SIZE) {
        const batch = merchants.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map((merchant) => refreshMerchantToken(merchant.id, merchant.refreshToken)),
        );

        const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value).length;
        const failed = results.length - succeeded;

        console.log(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${succeeded} succeeded, ${failed} failed`,
        );
      }

      console.log('Scheduled token refresh completed successfully');
    } catch (error) {
      captureException(error);
      throw error;
    }
  },
);
