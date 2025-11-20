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
3. Update merchant tokens
4. Get/Create Firebase Auth user (uid = merchant.id)
5. Create/Update Firestore user (accountSetupComplete: false)
6. Generate custom token
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
3. Create/Update merchant in Firestore
4. Get/Create Firebase Auth user (uid = merchant.id)
5. Create Firestore user:
   {
     id: firebaseUid,
     merchantId: merchant.id,
     accountSetupComplete: false,
     providerUserId: squareMerchantId
   }
6. Generate custom token
    ↓
Redirect to web: /welcome?token=<custom_token>
    ↓
Web client: auth.signInWithCustomToken(token)
    ↓
User is authenticated ✓
```

**Result:**

- New merchant created (if first time)
- Firebase Auth user created
- Firestore user created with merchant link
- User is authenticated but account setup incomplete

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
     id: firebaseUid,
     merchantId: null,  // Not yet connected
     accountSetupComplete: true,
     providerUserId: null
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
Owner:
  - email: owner@coffee.com
  - merchantId: "merch_1"

Employee 1:
  - email: alice@coffee.com
  - merchantId: "merch_1"

Employee 2:
  - email: bob@coffee.com
  - merchantId: "merch_1"
```

All three users can:

- Log in with their own credentials
- Access the same merchant data
- Future: Different permission levels

---

### Scenario D: Lost Square Connection

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
After OAuth: Tokens refreshed
    ↓
Access restored ✓
```

---

## Authentication Matrix

| User State           | Firebase Auth | Firestore User | Square Connected | Actions Available         |
| -------------------- | ------------- | -------------- | ---------------- | ------------------------- |
| **New visitor**      | ❌ No         | ❌ No          | ❌ No            | Signup, Login with Square |
| **Square connected** | ✅ Yes        | ✅ Yes         | ✅ Yes           | Access app, Add email     |
| **Email only**       | ✅ Yes        | ✅ Yes         | ❌ No            | Connect Square            |
| **Fully setup**      | ✅ Yes        | ✅ Yes         | ✅ Yes           | Full access               |
| **Tokens expired**   | ✅ Yes        | ✅ Yes         | ❌ Disconnected  | Reconnect Square          |

---

## Token Flow

### Custom Token Generation (OAuth flows)

```typescript
// Backend (OAuth callback)
const firebaseUser = await getOrCreateUser(merchant.id, merchant.name);
const customToken = await generateCustomToken(firebaseUser.uid);

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
