/**
 * Square OAuth callback endpoint
 * Handles the OAuth callback from Square
 */

import { onRequest } from 'firebase-functions/https';

import { createAuthUser, generateCustomToken } from '../../auth/firebase/user-manager';
import {
  getMerchantByProviderId,
  updateMerchant,
  upsertMerchant,
} from '../../merchants/repository';
import { fetchMerchantInfo } from '../../providers/square/client';
import {
  getOrCreateUser as getOrCreateAppUser,
  getUserByMerchantAndProvider,
} from '../../users/repository';
import { config } from '../../utils/config';
import { ExternalError, handleError } from '../../utils/error-handler';
import { validateAndConsumeState } from '../shared/state';
import { OAUTH_FLOWS } from '../types';

import { exchangeCodeForTokens } from './client';

/**
 * Handle Square OAuth callback
 * GET /squareCallback?code=...&state=...
 */
export const squareCallback = onRequest(async (req, res) => {
  try {
    // Extract parameters
    const { code, state, error: oauthError } = req.query;

    // Check for OAuth errors from Square
    if (oauthError) {
      throw new ExternalError('squareCallback_oauthError', {
        cause: { error: oauthError },
      });
    }

    // Validate state
    if (typeof state !== 'string') {
      throw new ExternalError('squareCallback_invalidState');
    }

    // Validate code
    if (typeof code !== 'string') {
      throw new ExternalError('squareCallback_missingCode');
    }
    const { flow } = await validateAndConsumeState(state);

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (flow === OAUTH_FLOWS.login) {
      const merchant = await getMerchantByProviderId('square', tokens.merchantId);

      if (!merchant) {
        throw new ExternalError(
          'No merchant found for the given Square account. Please install the app first.',
        );
      }

      console.log('Logging in existing merchant', { merchantId: merchant.id });

      await updateMerchant(merchant.id, {
        tokens: {
          access: tokens.accessToken,
          refresh: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          scopes: tokens.scopes,
        },
      });

      // Find existing App User who previously connected this Square account
      const appUser = await getUserByMerchantAndProvider(merchant.id, tokens.merchantId);

      // If no App User exists but merchant is connected, handle corrupted state
      if (!appUser) {
        throw new ExternalError('squareCallback_loginFlow_appUserNotFound', {
          cause: {
            merchantId: merchant.id,
            providerUserId: tokens.merchantId,
          },
        });
      }

      // Generate custom token for the user
      const customToken = await generateCustomToken(appUser.id);

      const destPage = merchant.metadata.onboardingCompleted ? 'settings' : 'welcome';

      const redirectUrl = `${config.webUrl}/${destPage}?token=${customToken}`;
      res.redirect(redirectUrl);
      return;
    }

    // Fetch merchant information
    const merchantInfo = await fetchMerchantInfo(tokens.accessToken);

    // Save to Firestore
    const merchant = await upsertMerchant({
      name: merchantInfo.name,
      provider: 'square',
      providerMerchantId: merchantInfo.id,
      tokens: {
        access: tokens.accessToken,
        refresh: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        scopes: tokens.scopes,
      },
      locations: merchantInfo.locations,
      appVersion: req.get('user-agent'),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    console.log({ merchant });

    // Check if App User already exists (user reconnecting via install button)
    let appUser = await getUserByMerchantAndProvider(merchant.id, tokens.merchantId);

    if (!appUser) {
      // Create Firebase Auth user with unique auto-generated UID
      // Note: Each person gets their own UID, even if accessing same merchant
      const authUser = await createAuthUser(merchant.name);

      // Create App User in Firestore
      appUser = await getOrCreateAppUser({
        id: authUser.uid,
        merchantId: merchant.id,
        accountSetupComplete: false,
        providerUserId: tokens.merchantId,
        role: 'owner', // First OAuth user is the business owner
      });
    }

    // Generate custom token for web client to sign in
    const customToken = await generateCustomToken(appUser.id);

    const destPage = merchant.metadata.onboardingCompleted ? 'settings' : 'welcome';

    const redirectUrl = `${config.webUrl}/${destPage}?token=${customToken}`;

    res.redirect(redirectUrl);
  } catch (error) {
    const errorResponse = handleError(error);
    const errorUrl = `${config.webUrl}?error=${encodeURIComponent(errorResponse.message)}`;
    res.redirect(errorUrl);
  }
});
