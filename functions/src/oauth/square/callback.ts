/**
 * Square OAuth callback endpoint
 * Handles the OAuth callback from Square
 */

import { onRequest } from 'firebase-functions/https';

import { generateCustomToken, getOrCreateUser } from '../../auth/firebase/user-manager';
import {
  getMerchantByProviderId,
  updateMerchant,
  upsertMerchant,
} from '../../merchants/repository';
import { fetchMerchantInfo } from '../../providers/square/client';
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
      handleError(
        new Error('squareCallback_oauthError', {
          cause: { error: oauthError },
        }),
      );

      const errorUrl = `${config.errorPageUrl}?error=oauth_failed`;
      res.redirect(errorUrl);
      return;
    }

    // Validate state
    if (!state || typeof state !== 'string') {
      throw new ExternalError('Missing or invalid state parameter');
    }

    const { flow } = await validateAndConsumeState(state);

    // Validate code
    if (!code || typeof code !== 'string') {
      throw new ExternalError('Missing authorization code');
    }

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

      // Create or get Firebase Auth user
      const firebaseUser = await getOrCreateUser(merchant.id, merchant.name);

      // Generate custom token for web client to sign in
      const customToken = await generateCustomToken(firebaseUser.uid);

      const destPage = merchant.metadata.onboardingCompleted ? 'settings' : 'welcome';

      const redirectUrl = `${config.onboardingUrl}/${destPage}?token=${customToken}`;
      res.redirect(redirectUrl);
      return;
    }

    // Fetch merchant information
    const merchantInfo = await fetchMerchantInfo(tokens.accessToken);

    // Save to Firestore
    const merchant = await upsertMerchant({
      email: merchantInfo.email,
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

    // Create or get Firebase Auth user
    const firebaseUser = await getOrCreateUser(merchant.id, merchant.name);

    // Generate custom token for web client to sign in
    const customToken = await generateCustomToken(firebaseUser.uid);

    const destPage = merchant.metadata.onboardingCompleted ? 'settings' : 'welcome';

    const redirectUrl = `${config.onboardingUrl}/${destPage}?token=${customToken}`;

    res.redirect(redirectUrl);
  } catch (error) {
    handleError(error);

    // Extract error type from error message if available
    const errorType = error instanceof Error ? error.message : 'oauth_error';

    const errorUrl = `${config.errorPageUrl}?error=${errorType}`;
    res.redirect(errorUrl);
  }
});
