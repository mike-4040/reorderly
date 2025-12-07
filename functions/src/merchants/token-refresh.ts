/**
 * Token refresh service for merchants
 */

import { setTimeout } from 'node:timers/promises';

import { getMerchant, updateMerchant } from '../datastore/merchants.js';
import { refreshAccessToken } from '../oauth/square/client.js';
import { captureException } from '../utils/sentry.js';

/**
 * Maximum number of retry attempts
 */
const MAX_RETRIES = 3;

/**
 * Maximum consecutive failures before revoking merchant
 */
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Delay between retries in milliseconds
 */
const RETRY_DELAY_MS = 5000;

/**
 * Refresh merchant token and update database
 * Handles token rotation with automatic retries
 * @returns true if refresh succeeded, false if failed
 */
export async function refreshMerchantToken(
  merchantId: string,
  refreshToken: string,
): Promise<boolean> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `Refreshing token for merchant ${merchantId} (attempt ${attempt}/${MAX_RETRIES})`,
      );

      // Call Square API to refresh token
      const tokenResponse = await refreshAccessToken(refreshToken);

      // Update merchant with new tokens and reset failure count
      await updateMerchant(merchantId, {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        tokenExpiresAt: tokenResponse.expiresAt,
        lastRefreshedAt: new Date().toISOString(),
        refreshFailureCount: 0,
      });

      console.log(`Successfully refreshed token for merchant ${merchantId}`);
      return true;
    } catch (error) {
      lastError = error;
      console.error(
        `Failed to refresh token for merchant ${merchantId} (attempt ${attempt}/${MAX_RETRIES})`,
        error,
      );

      // If this was the last attempt, don't wait
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
        await setTimeout(RETRY_DELAY_MS);
      }
    }
  }

  // All retries exhausted - increment failure count
  captureException(
    new Error(`refreshMerchantToken_allRetriesExhausted`, {
      cause: lastError,
    }),
  );

  // Get current merchant state to check failure count
  const merchant = await getMerchant(merchantId);

  if (!merchant) {
    captureException(
      new Error('refreshMerchantToken_merchantNotFound', {
        cause: { merchantId },
      }),
    );
    return false;
  }

  const newFailureCount = merchant.refreshFailureCount + 1;
  const shouldRevoke = newFailureCount >= MAX_CONSECUTIVE_FAILURES;

  // Update failure count and potentially revoke
  await updateMerchant(merchantId, {
    refreshFailureCount: newFailureCount,
    lastRefreshedAt: new Date().toISOString(),
    ...(shouldRevoke && { revoked: true }),
  });

  if (shouldRevoke) {
    captureException(
      new Error(`refreshMerchantToken_revoked`, {
        cause: { merchantId },
      }),
    );
    // TODO: Queue email notification to merchant owner
  }

  return false;
}
