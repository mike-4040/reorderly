/**
 * Route guard helpers for protected routes
 */

import { redirect } from '@tanstack/react-router';

import { auth } from '../firebase/config';

/**
 * Require authentication to access a route
 * Redirects to /login if user is not authenticated
 * Allows access if there's a token in the URL (OAuth callback)
 */
export function requireAuth() {
  return () => {
    // Allow access if there's a token in the URL (OAuth callback)
    const hasToken = new URLSearchParams(window.location.search).has('token');

    // Check if user is authenticated
    const user = auth.currentUser;

    if (!user && !hasToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' });
    }
  };
}
