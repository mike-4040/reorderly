/**
 * Firebase Admin initialization
 * Provides centralized access to Firebase Admin services
 */

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();

/**
 * Firebase Auth instance
 */
export const auth = getAuth();

/**
 * Firestore instance
 */
export const db = getFirestore();
