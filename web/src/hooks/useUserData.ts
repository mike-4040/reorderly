/**
 * User data fetching hook using TanStack Query
 */

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../contexts/useAuth';
import { getFunctionsUrl } from '../utils/env';

/**
 * User data from Firestore
 */
export interface UserData {
  id: string;
  merchantId: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
}

/**
 * Response from getUser Cloud Function
 */
interface GetUserDataResponse {
  success: true;
  data: {
    user: UserData;
  };
}

interface GetUserDataErrorResponse {
  success: false;
  message: string;
}

interface GetUserDataResult {
  result: GetUserDataResponse | GetUserDataErrorResponse;
}

/**
 * Fetch user data from Cloud Function
 */
async function fetchUserData(idToken: string): Promise<UserData> {
  const functionsUrl = getFunctionsUrl();
  const response = await fetch(`${functionsUrl}/getUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data: {} }),
  });

  if (!response.ok) {
    throw new Error(`fetchUserData_failed`, {
      cause: { statusText: response.statusText },
    });
  }

  const { result } = (await response.json()) as GetUserDataResult;

  if (!result.success) {
    throw new Error('fetchUser_notSuccessful', {
      cause: { message: result.message },
    });
  }

  return result.data.user;
}

/**
 * Hook to fetch and cache user data
 *
 * @returns TanStack Query result with user data
 */
export function useUserData() {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['user', authUser?.uid],
    queryFn: async () => {
      if (!authUser) {
        throw new Error('useUserData_notAuthenticated');
      }

      const idToken = await authUser.getIdToken();
      return fetchUserData(idToken);
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1,
  });
}
