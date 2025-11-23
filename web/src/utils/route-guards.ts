/**
 * Route guard helpers for protected routes
 */

import { redirect } from '@tanstack/react-router';
import { User } from 'firebase/auth';

/**
 * Require authentication to access a route
 * Redirects to /login if user is not authenticated
 * Allows access if there's a token in the URL (OAuth callback)
 */
export function requireAuth({ context }: { context: { user: User | null } }) {
  // Allow access if there's a token in the URL (OAuth callback)
  const hasToken = new URLSearchParams(window.location.search).has('token');

  // Check if user is authenticated from router context
  if (!context.user && !hasToken) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: '/login' });
  }
}
