# User Management

## Overview

The Reorderly application maintains two separate user systems that work together to provide authentication and data management.

## User Types

### 1. App User (`User`)

**Location:** `functions/src/users/types.ts`

**Purpose:** Application-level user data stored in Firestore

**Collection:** `users/{firebaseUid}`

**Schema:**

```typescript
{
  id: string;                    // Firebase Auth UID (same as document ID)
  merchantId: string;             // Reference to merchant document
  accountSetupComplete: boolean;  // Has user set up email/password?
  providerUserId?: string;        // Optional: Square merchant ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Key Characteristics:**

- Stored in Firestore `users` collection
- Links Firebase Auth users to merchants
- Tracks account setup status
- Supports multiple users per merchant (team members, roles)
- Queryable for application logic

**Use Cases:**

- Determine which merchant a user belongs to
- Track whether user completed account setup
- List all users with access to a merchant
- Store provider-specific user IDs (e.g., Square merchant ID)

### 2. Auth User (`UserRecord`)

**Location:** Firebase Authentication service

**Purpose:** Authentication and identity management

**Schema:**

```typescript
{
  uid: string;              // Unique Firebase Auth ID
  displayName?: string;     // User's display name
  email?: string;           // Optional email (for email/password auth)
  disabled?: boolean;       // Account status
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  }
  // ... other Firebase Auth fields
}
```

**Key Characteristics:**

- Managed by Firebase Authentication
- Provides authentication tokens (custom tokens, ID tokens)
- Can exist without email (for OAuth-only users)
- Cannot be directly queried like Firestore
- Used for authentication, not business logic

**Use Cases:**

- Authenticate users (sign in/sign out)
- Generate custom tokens for web client login
- Verify ID tokens from clients
- Manage authentication state

## Relationship Between User Types

```
┌─────────────────────────┐
│  Auth User              │
│  (UserRecord)           │
│  uid: "abc123"          │
│  displayName: "John"    │
└───────────┬─────────────┘
            │
            │ uid = id
            ▼
┌─────────────────────────┐
│  App User               │
│  (User)                 │
│  id: "abc123"           │
│  merchantId: "merch_1"  │
│  accountSetupComplete   │
└───────────┬─────────────┘
            │
            │ merchantId
            ▼
┌─────────────────────────┐
│  Merchant               │
│  id: "merch_1"          │
│  name: "Coffee Shop"    │
└─────────────────────────┘
```

**The `uid` from Auth User equals the `id` in App User document**

## One-to-Many Relationship

**One Merchant → Many Users**

```
Merchant: "Coffee Shop" (merch_1)
    ↓
User 1: alice@example.com (uid: abc123)
    └─ Firebase Auth: abc123
    └─ Firestore: users/abc123 → { merchantId: "merch_1" }

User 2: bob@example.com (uid: def456)
    └─ Firebase Auth: def456
    └─ Firestore: users/def456 → { merchantId: "merch_1" }
```

This allows:

- Multiple team members per merchant
- Future: Role-based access control
- Future: Different permission levels

## When to Use Each

### Use App User (`User`) when:

- Checking which merchant a user belongs to
- Listing all users for a merchant
- Tracking account setup status
- Storing business logic data

### Use Auth User (`UserRecord`) when:

- Authenticating users
- Generating tokens
- Managing sign-in/sign-out
- Creating new auth users

## Repository Functions

### App Users (`functions/src/users/repository.ts`)

- `createUser(data)` - Create user in Firestore
- `getUserById(uid)` - Get Firestore user
- `updateUser(uid, data)` - Update Firestore user
- `getUsersByMerchantId(merchantId)` - List users for merchant
- `getOrCreateUser(data)` - Get or create App user

### Auth Users (`functions/src/auth/firebase/user-manager.ts`)

- `getOrCreateUser(uid, displayName)` - Get or create auth user
- `generateCustomToken(uid)` - Generate token for web login

## Account Setup States

The `accountSetupComplete` field tracks whether a user has set up email/password credentials:

- `false` - User authenticated via OAuth (Square) but hasn't added email/password
- `true` - User has email/password credentials and can log in directly

This enables:

- OAuth-first onboarding (connect Square before email setup)
- Later email/password account creation
- Future: Social login integration
