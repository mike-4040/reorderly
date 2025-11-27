# Firebase Authentication

## Overview

Authentication uses Firebase Auth with email/password, but accounts are created exclusively through Square OAuth. Users cannot sign up with email/password directly - they must connect their Square account first. The backend creates the Firebase account during the OAuth callback.

## Quick Start

See [configuration.md](./configuration.md) for required environment variables and setup.

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

Routes are protected using TanStack Router's `beforeLoad` hook with router context:

```typescript
// src/routes/protected.tsx
import { requireAuth } from '../utils/route-guards';

export const Route = createFileRoute('/protected')({
  beforeLoad: requireAuth,
  component: ProtectedPage,
});
```

The `requireAuth` guard receives auth state through TanStack Router's context (passed from `App.tsx`), making the dependency explicit and preventing timing issues.

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
