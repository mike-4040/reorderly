/**
 * Development utilities
 * Cloud functions for manual testing
 */

import { onCall } from 'firebase-functions/https';
import { z } from 'zod';

import { getMerchant } from '../datastore/merchants.js';

const requestSchema = z.object({
  merchantId: z.string(),
});

/**
 * Test function for manual testing
 * Example usage: Call with { merchantId: "123" }
 */
export const onCallTest = onCall(async (request) => {
  const payload = requestSchema.safeParse(request.data);

  if (!payload.success) {
    return { error: 'Invalid request data', details: payload.error.issues };
  }

  const { merchantId } = payload.data;
  const merchant = await getMerchant(merchantId);

  return {
    merchant,
  };
});
