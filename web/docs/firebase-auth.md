# Firebase Authentication

## Overview

Authentication uses Firebase Auth with email/password, but accounts are created exclusively through Square OAuth. Users cannot sign up with email/password directly - they must connect their Square account first. The backend creates the Firebase account during the OAuth callback.

## Quick Start

### Environment Variables

**Required Doppler secrets** (in `web` project):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

Get these from: Firebase Console → Project Settings → General → Your apps → Web app

Download secrets from Doppler:

```bash
# Development
npm run secrets-dev

# Staging
npm run secrets-stg

# Production
npm run secrets-prd
```

## Authentication Flow

1. User clicks "Sign Up" → redirects to Square OAuth (install flow)
2. User authorizes Square → backend creates Firebase custom token
3. Frontend signs in with custom token → user authenticated
4. Protected routes accessible

## Auth Context

Access auth state anywhere in the app:

```typescript
import { useAuth } from '../contexts/useAuth';

const { user, isLoadingAuthState, signInWithCustomToken, signOut } = useAuth();
```

- `user` - Current Firebase user or null
- `isLoadingAuthState` - Auth initialization status
- `signInWithCustomToken(token)` - Sign in with backend-issued token
- `signOut()` - Sign out current user

## Protected Routes

Routes are protected using TanStack Router's `beforeLoad` hook:

```typescript
// src/utils/route-guards.ts
import { requireAuth } from '../utils/route-guards';

export const Route = createFileRoute('/protected')({
  beforeLoad: requireAuth(),
  component: ProtectedPage,
});
```

Currently protected routes:
- `/welcome` - Post-OAuth onboarding
- `/settings` - User settings
- `/suppliers` - Supplier management

Unauthenticated users are redirected to `/login`.

## UI Behavior

- **Unauthenticated**: See Home tab, "Sign In" and "Sign Up" buttons
- **Authenticated**: See Home/Suppliers/Settings tabs, user menu with sign out
- **Loading**: Spinner shown while checking auth state

## Next Steps

1. **Email Verification** - Add email verification for production
2. **Password Reset** - Implement password recovery (if email/password login added)
