import { db } from '../inits/firebase';

/**
 * Firestore collection references
 */
export const collections = {
  oauthStates: db.collection('oauth_states'),
} as const;
