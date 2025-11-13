import { db } from '../inits/firebase';

/**
 * Firestore collection references
 */
export const collections = {
  users: db.collection('users'),
  merchants: db.collection('merchants'),
  oauthStates: db.collection('oauth_states'),
  onboardingSessions: db.collection('onboarding_sessions'),
  auditLogs: db.collection('audit_logs'),
} as const;
