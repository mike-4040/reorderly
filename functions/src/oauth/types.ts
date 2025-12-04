/**
 * Common OAuth types and interfaces
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * OAuth token response from provider
 */
export interface TokenResponse {
  merchantId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO date string
  scopes: string[];
}

export const OAUTH_FLOWS = {
  install: 'install',
  login: 'login',
} as const;

export type OAuthFlow = (typeof OAUTH_FLOWS)[keyof typeof OAUTH_FLOWS];

export function isOAuthFlow(value: unknown): value is OAuthFlow {
  if (typeof value !== 'string') {
    return false;
  }

  return Object.values(OAUTH_FLOWS).includes(value as OAuthFlow);
}

/**
 * OAuth state stored for CSRF protection (still in Firestore)
 */
export interface OAuthState {
  stateId: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  flow: OAuthFlow;
}
