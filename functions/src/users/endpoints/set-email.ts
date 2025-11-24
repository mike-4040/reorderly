/**
 * Set user email endpoint
 * Allows user to set their email address and sends verification email
 */

import { Timestamp } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/https';

import { auth as firebaseAuth } from '../../inits/firebase';
import { CFResponse, ExternalError, handleError } from '../../utils/error-handler';
import { digProperty } from '../../utils/object';
import { updateUser } from '../repository';

interface Payload {
  email: string;
}

type Result = Record<string, never>;

/**
 * Set email for authenticated user
 * POST /setEmail
 */
export const setEmail = onCall<Payload, CFResponse<Result>>(async ({ data, auth }) => {
  try {
    // Check authentication
    if (!auth) {
      throw new ExternalError('User must be authenticated');
    }

    const { email } = data;
    const userId = auth.uid;

    // Validate email format
    if (!email || typeof email !== 'string') {
      throw new ExternalError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ExternalError('Invalid email format');
    }

    // Update Firebase Auth user with email
    await firebaseAuth.updateUser(userId, {
      email,
      emailVerified: false,
    });

    // Send verification email
    const actionLink = await firebaseAuth.generateEmailVerificationLink(email);

    // TODO: Send email via SendGrid/similar service
    // For now, just log the link
    console.log('Email verification link:', actionLink);

    // Update Firestore user with timestamp
    await updateUser(userId, {
      emailVerificationSentAt: Timestamp.now(),
    });

    return {
      success: true,
      data: {},
    };
  } catch (error) {
    const errorCode = digProperty(error, 'code');
    if (errorCode === 'auth/email-already-exists') {
      return handleError(new ExternalError('This email is already in use'));
    }

    return handleError(error);
  }
});
