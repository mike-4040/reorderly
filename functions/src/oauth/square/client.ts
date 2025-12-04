/**
 * Square OAuth client implementation
 */

import { SquareClient, SquareEnvironment } from 'square';

import { config } from '../../utils/config';
import { TokenResponse } from '../types';

/**
 * Square OAuth scopes we request
 */
const REQUIRED_SCOPES = [
  'MERCHANT_PROFILE_READ',
  'ORDERS_READ',
  'ORDERS_WRITE',
  'ITEMS_READ',
] as const;

/**
 * Cached Square SDK client for OAuth operations (no authentication)
 */
let cachedSquareClient: SquareClient | null = null;

/**
 * Get Square SDK client for OAuth operations
 */
function getSquareClient(): SquareClient {
  cachedSquareClient ??= new SquareClient({
    environment:
      config.square.environment === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
  return cachedSquareClient;
}

/**
 * Generate Square OAuth authorization URL
 */
export function generateAuthorizationUrl(stateId: string): string {
  const params = new URLSearchParams({
    client_id: config.square.clientId,
    scope: REQUIRED_SCOPES.join(' '),
    session: 'false', // Don't keep user logged in after redirect
    state: stateId,
  });

  const baseUrl =
    config.square.environment === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

  return `${baseUrl}/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const client = getSquareClient();

  try {
    const response = await client.oAuth.obtainToken({
      clientId: config.square.clientId,
      clientSecret: config.square.clientSecret,
      code,
      grantType: 'authorization_code',
    });

    if (!response.accessToken || !response.refreshToken) {
      throw new Error('exchangeCodeForTokens_missingTokens');
    }

    // Calculate expiration timestamp
    const expiresInMs = response.expiresAt
      ? new Date(response.expiresAt).getTime() - Date.now()
      : 30 * 24 * 60 * 60 * 1000; // Default to 30 days

    const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      merchantId: response.merchantId ?? '',
      expiresAt,
      scopes: [], // Square doesn't return scopes in response, we know them from request
    };
  } catch (error) {
    throw new Error('exchangeCodeForTokens_failed', { cause: error });
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  try {
    const client = getSquareClient();

    const response = await client.oAuth.obtainToken({
      clientId: config.square.clientId,
      clientSecret: config.square.clientSecret,
      refreshToken,
      grantType: 'refresh_token',
    });

    if (!response.accessToken || !response.refreshToken) {
      throw new Error('refreshAccessToken_missingTokens');
    }

    const expiresInMs = response.expiresAt
      ? new Date(response.expiresAt).getTime() - Date.now()
      : 30 * 24 * 60 * 60 * 1000;

    const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

    return {
      merchantId: response.merchantId ?? '',
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt,
      scopes: [],
    };
  } catch (error) {
    throw new Error('refreshAccessToken_failed', { cause: error });
  }
}
