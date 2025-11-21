# Authentication Scenarios

## Overview

This document describes all authentication scenarios in the Reorderly application, covering how users authenticate, the flows they follow, and how the system handles various edge cases.

## Core Authentication Flows

### 1. Login with Square (OAuth) - `flow=login`

**When:** User clicks "Login with Square" on the login page

**Requirements:**

- User must have previously connected their Square account (`flow=install`)
- Merchant record exists in Firestore

**Flow:**

```
User clicks "Login with Square"
    ↓
GET /squareAuthorize?flow=login
    ↓
Redirect to Square OAuth
    ↓
User authorizes with Square
    ↓
GET /squareCallback?code=...&state=...
    ↓
1. Exchange code for tokens
2. Find merchant by Square merchant ID
   - If not found → Error: "No merchant found, please install first"
3. Update merchant tokens
4. Find existing App User by merchantId + providerUserId
   - If not found → Error: "App User not found" (corrupted state)
5. Generate custom token
    ↓
Redirect to web: /settings?token=<custom_token>
    ↓
Web client: auth.signInWithCustomToken(token)
    ↓
User is authenticated ✓
```

**Result:**

- User is logged into Firebase Auth
- Merchant tokens are refreshed
- User can access the application

---

### 2. Connect Square Account (OAuth) - `flow=install`

**When:** New user or existing user connecting Square

**Requirements:** None

**Flow:**

```
User clicks "Connect your Square Account"
    ↓
GET /squareAuthorize?flow=install
    ↓
Redirect to Square OAuth
    ↓
User authorizes with Square
    ↓
GET /squareCallback?code=...&state=...
    ↓
1. Exchange code for tokens
2. Fetch merchant info from Square
3. Create/Update merchant in Firestore (upsert)
4. Check if App User already exists (merchantId + providerUserId)
   - If found → Use existing App User (reconnection case)
   - If not found:
     a. Create Auth User with unique UID (Firebase auto-generates)
     b. Create App User:
        {
          id: firebaseUid,              // Unique UID per person
          merchantId: merchant.id,      // Links to merchant
          accountSetupComplete: false,
          providerUserId: squareMerchantId,
          role: 'owner'                 // First OAuth user is owner
        }
5. Generate custom token for the App User
    ↓
Redirect to web: /welcome?token=<custom_token>
    ↓
Web client: auth.signInWithCustomToken(token)
    ↓
User is authenticated ✓
```

**Result:**

- Merchant created or updated (upsert operation)
- If new user: Firebase Auth user created + App User created
- If reconnecting: Uses existing Auth User and App User
- User is authenticated but account setup incomplete (unless already completed)

---

### 3. Email/Password Signup

**When:** User creates account with email and password

**Requirements:** None

**Flow:**

```
User fills signup form (email, password)
    ↓
Web client: auth.createUserWithEmailAndPassword(email, password)
    ↓
Firebase Auth creates user with email
    ↓
Cloud Function trigger (onCreate)
    ↓
Create Firestore user:
   {
     id: firebaseUid,              // Unique UID per person
     merchantId: null,             // Not yet connected
     accountSetupComplete: true,
     providerUserId: null,
     role: 'owner'                 // Default role for self-signup
   }
    ↓
User is authenticated ✓
```

**Result:**

- Firebase Auth user with email/password
- Firestore user created
- Account setup complete but no merchant connected
- User needs to connect Square next

---

### 4. Email/Password Login

**When:** User logs in with email and password

**Requirements:**

- User previously signed up with email/password
- OR user connected Square and then added email/password

**Flow:**

```
User enters email and password
    ↓
Web client: auth.signInWithEmailAndPassword(email, password)
    ↓
Firebase Auth validates credentials
    ↓
User is authenticated ✓
```

**Result:**

- User is logged into Firebase Auth
- No backend calls needed
- Firestore user lookup on client to get merchant

---

## Edge Case Scenarios

### Scenario A: Square OAuth → Later Add Email

**Initial State:** User connected Square but hasn't set up email

```
1. User connects Square (flow=install)
   → accountSetupComplete: false

2. User navigates to account settings

3. User adds email/password
   → Update Firestore: accountSetupComplete: true
   → Link email to Firebase Auth user

4. Next time: User can login with either Square OR email
```

---

### Scenario B: Email Signup → Later Connect Square

**Initial State:** User created account with email but no merchant

```
1. User signs up with email/password
   → merchantId: null
   → accountSetupComplete: true

2. User clicks "Connect your Square Account"
   → flow=install (but user already authenticated)

3. After Square OAuth callback:
   → Update Firestore user: merchantId = merchant.id
   → Update Firestore user: providerUserId = squareMerchantId

4. User now has both email login and merchant access
```

---

### Scenario C: Multiple Users, Same Merchant

**Use Case:** Team members accessing same merchant

```
Merchant: "Coffee Shop" (merch_1)
    ↓
Owner:
  - Auth User: uid: abc123 (unique)
  - email: owner@coffee.com
  - App User: { id: abc123, merchantId: "merch_1", role: "owner" }

Manager:
  - Auth User: uid: def456 (unique)
  - email: alice@coffee.com
  - App User: { id: def456, merchantId: "merch_1", role: "manager" }

Staff:
  - Auth User: uid: ghi789 (unique)
  - email: bob@coffee.com
  - App User: { id: ghi789, merchantId: "merch_1", role: "staff" }
```

**Key Points:**

- Each person has a **unique Auth User UID** (generated by Firebase)
- All users link to the **same merchant** via `merchantId`
- Different roles enable different permission levels
- Each person logs in with their own credentials

All three users can:

- Log in with their own unique credentials
- Access the same merchant data (via shared `merchantId`)
- Have different permission levels based on `role` field
- Each user maintains separate authentication state

---

### Scenario D: User Reconnects via Install Flow

**Problem:** User with existing connected account clicks "Connect" button

```
User already has:
  - Auth User: uid: abc123
  - App User: { id: abc123, merchantId: "merch_1", providerUserId: "sq_123" }
  - Merchant: { id: "merch_1", providerMerchantId: "sq_123" }

User clicks "Connect your Square Account" (flow=install)
    ↓
Completes Square OAuth
    ↓
Callback checks for existing App User
    ↓
Finds existing App User (by merchantId + providerUserId)
    ↓
Generates token for existing Auth User (abc123)
    ↓
User logged in successfully ✓
```

**Key Points:**

- No duplicate Auth Users created
- No duplicate App Users created
- Merchant tokens updated
- Seamless reconnection experience

---

### Scenario E: Lost Square Connection

**Problem:** Square tokens expired or revoked

```
User logs in (email or Square)
    ↓
User tries to access Square data
    ↓
API call fails (tokens invalid)
    ↓
Show "Reconnect Square" button
    ↓
User clicks → flow=install
    ↓
After OAuth: Tokens refreshed (via reconnection logic)
    ↓
Access restored ✓
```

---

## Authentication Matrix

| User State           | Firebase Auth | App User (Firestore) | Square Connected | Actions Available         |
| -------------------- | ------------- | -------------------- | ---------------- | ------------------------- |
| **New visitor**      | ❌ No         | ❌ No                | ❌ No            | Signup, Login with Square |
| **Square connected** | ✅ Yes        | ✅ Yes (unique UID)  | ✅ Yes           | Access app, Add email     |
| **Email only**       | ✅ Yes        | ✅ Yes (unique UID)  | ❌ No            | Connect Square            |
| **Fully setup**      | ✅ Yes        | ✅ Yes (unique UID)  | ✅ Yes           | Full access               |
| **Tokens expired**   | ✅ Yes        | ✅ Yes (unique UID)  | ❌ Disconnected  | Reconnect Square          |

**Note:** Each user gets a unique Firebase Auth UID. Multiple users can share the same `merchantId` in their App User records.

---

## Token Flow

### Custom Token Generation (OAuth flows)

```typescript
// Backend (OAuth callback - install flow)
// Check for existing App User first
let appUser = await getUserByMerchantAndProvider(merchant.id, tokens.merchantId);

if (!appUser) {
  // New user: create Auth User with Firebase-generated unique UID
  const authUser = await createAuthUser(merchant.name);

  // Link this person to the merchant via App User
  appUser = await createAppUser({
    id: authUser.uid, // Unique UID per person
    merchantId: merchant.id, // Shared merchant reference
    role: 'owner',
  });
}

// Generate token for the App User (existing or new)
const customToken = await generateCustomToken(appUser.id);

// Redirect to web with token
res.redirect(`/welcome?token=${customToken}`);
```

### Web Client Sign-In

```typescript
// Web receives token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  // Sign in with custom token
  await auth.signInWithCustomToken(token);

  // Now user is authenticated
  const user = auth.currentUser;

  // Fetch Firestore user to get merchant
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const merchantId = userDoc.data().merchantId;
}
```

---

## Security Considerations

### OAuth State Validation

- State parameter prevents CSRF attacks
- State is stored in Firestore with expiration
- Consumed after single use

### Custom Token Expiration

- Custom tokens are short-lived (1 hour default)
- Should be used immediately after receiving
- Not stored anywhere, only passed via URL

### Token Storage

- Square tokens stored encrypted in Firestore
- Refresh tokens used to renew access tokens
- Never exposed to client

---

## Future Enhancements

1. **Role-Based Access Control (RBAC)**
   - Add `role` field to Firestore user
   - Roles: owner, admin, employee, viewer
   - Enforce permissions on API calls

2. **Multi-Factor Authentication (MFA)**
   - Phone number verification
   - TOTP authenticator apps
   - Firebase Auth supports MFA

3. **Social Login**
   - Google Sign-In
   - Apple Sign-In
   - Link multiple providers to same user

4. **Session Management**
   - Revoke refresh tokens
   - Force logout on all devices
   - Session duration limits
