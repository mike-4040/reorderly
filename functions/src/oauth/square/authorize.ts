/**
 * Square OAuth authorization endpoint
 * Initiates the OAuth flow by redirecting to Square
 */

import { onRequest } from 'firebase-functions/https';

import { handleError } from '../../utils/error-handler';
import { createState } from '../shared/state';
import { isOAuthFlow, OAUTH_FLOWS } from '../types';

import { generateAuthorizationUrl } from './client';

/**
 * Initiate Square OAuth authorization flow
 * GET /squareAuthorize
 */
export const squareAuthorize = onRequest(async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.set('Allow', 'GET');
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { flow } = req.query;
    const flowSanitized = isOAuthFlow(flow) ? flow : OAUTH_FLOWS.install;

    // Generate and store state for CSRF protection
    const state = await createState(flowSanitized);

    // Generate authorization URL
    const authUrl = generateAuthorizationUrl(state);

    // Prevent caching of the redirect response
    res.set('Cache-Control', 'no-store');
    console.log('Redirecting to Square OAuth URL:', authUrl);

    res.redirect(authUrl);
  } catch (error) {
    const errorResponse = handleError(error);
    res.status(500).json(errorResponse);
  }
});
