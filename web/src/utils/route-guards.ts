/**
 * Route guard helpers for protected routes
 */

import { redirect } from '@tanstack/react-router';
import { User } from 'firebase/auth';

interface RequireAuthArgs {
  context: { user: User | null };
  search: Record<string, unknown>;
}

/**
 * Require authentication to access a route
 * Redirects to /login if user is not authenticated
 * Allows access if there's a token in the URL (OAuth callback)
 */
export function requireAuth({ context, search }: RequireAuthArgs) {
  // Allow access if there's a token in the URL (OAuth callback)
  const hasToken = typeof search.token === 'string' && search.token;

  // Check if user is authenticated from router context
  if (!context.user && !hasToken) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: '/login' });
  }
}
