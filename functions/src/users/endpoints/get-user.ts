/**
 * Get user endpoint
 * Returns user information for the authenticated user
 */

import { onCall } from 'firebase-functions/https';

import { CFResponse, ExternalError, handleError } from '../../utils/error-handler';
import { getUserById } from '../repository';
import { User } from '../types';

type Payload = Record<string, never>;

interface Result {
  user: Pick<User, 'id' | 'merchantId' | 'role'>;
}

/**
 * Get user information for authenticated user
 * GET /getUser
 */
export const getUser = onCall<Payload, CFResponse<Result>>(async ({ auth }) => {
  try {
    // Check authentication
    if (!auth) {
      throw new ExternalError('getUser_unauthenticated');
    }

    const userId = auth.uid;

    // Get user from Firestore
    const user = await getUserById(userId);

    if (!user) {
      throw new Error('getUser_userNotFound', { cause: { userId } });
    }

    // Return only the fields we need
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          merchantId: user.merchantId,
          role: user.role,
        },
      },
    };
  } catch (error) {
    return handleError(error);
  }
});
