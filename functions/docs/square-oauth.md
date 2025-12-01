## Square OAuth Implementation Guide

### Overview

This implementation provides a complete OAuth 2.0 authorization flow for Square merchants to connect their accounts to your app.

### Architecture

```
User → /squareAuthorize → Square Login → /squareCallback → Firestore
```

**Key Components:**

1. **State Management** (`oauth/shared/state.ts`) - CSRF protection using cryptographically secure tokens
2. **Square Client** (`oauth/square/client.ts`) - Square SDK integration for OAuth and API calls
3. **Merchant Repository** (`merchants/repository.ts`) - Firestore CRUD operations
4. **HTTP Endpoints** (`oauth/square/endpoints.ts`) - Authorization and callback handlers

### Endpoints

#### Start Authorization Flow

```
GET /squareAuthorize
```

Redirects the user to Square's OAuth authorization page.

#### Handle OAuth Callback

```
GET /squareCallback?code=...&state=...
```

Exchanges the authorization code for tokens, fetches merchant data, and saves to Firestore.

### Environment Variables

Required in Doppler:

```bash
SQUARE_CLIENT_ID=sq0idp-xxx
SQUARE_CLIENT_SECRET=sq0csp-xxx
SQUARE_REDIRECT_URI=https://abdul-purehearted-undecidedly.ngrok-free.dev/reorderly-staging/us-central1/squareCallback
SQUARE_ENVIRONMENT=sandbox  # or 'production'
ONBOARDING_URL=https://your-app.com/onboarding
ERROR_PAGE_URL=https://your-app.com/error
```

### Testing Locally

Square OAuth requires a publicly accessible callback URL. For local development, you need to use **ngrok** to tunnel requests from the internet to your local emulator.

**See detailed setup instructions:** [ngrok-setup.md](./ngrok-setup.md)

**Quick steps:**

1. Start emulator: `npm start`
2. Start ngrok: `npm run tunnel`
3. Update `SQUARE_REDIRECT_URI` in Doppler with ngrok URL
4. Update Square Dashboard with ngrok callback URL
5. Restart emulator to reload config

#### Testing the OAuth Flow

Once ngrok is set up:

1. **Open Square Test Account Dashboard:**
   - Go to https://developer.squareup.com/apps
   - Select your sandbox application
   - Click on "Test Accounts" in the left sidebar
   - Click "Open Dashboard" to open the test merchant dashboard

2. **Initiate OAuth:**
   - In the test merchant dashboard tab, navigate to:
     ```
     https://abdul-purehearted-undecidedly.ngrok-free.dev/reorderly-staging/us-central1/squareAuthorize
     ```
   - You should be redirected to Square's authorization page (already logged in as test merchant)
   - Click "Allow" to authorize the application
   - You'll be redirected back to your callback, which saves merchant data

3. **Check Logs:**
   - Check both the ngrok web UI (`http://localhost:4040`) and your emulator logs to see the requests
   - Verify merchant data was saved to Firestore

### OAuth Flow Details

1. **User initiates connection** → Clicks "Connect Square"
2. **App redirects to /squareAuthorize** → Generates state token, redirects to Square
3. **User authorizes on Square** → Logs in and grants permissions
4. **Square redirects back** → `/squareCallback?code=...&state=...`
5. **App exchanges code** → Gets access + refresh tokens
6. **App fetches merchant data** → Gets merchant info and locations
7. **App saves to Firestore** → Creates or updates merchant record
8. **Redirect to success page** → User sees confirmation

### Firestore Collections

**merchants:**

```typescript
{
  provider: 'square',
  providerId: 'MERCHANT_ID',
  tokens: {
    access: '...',
    refresh: '...',
    expiresAt: Timestamp,
    scopes: []
  },
  locations: [...],
  metadata: {
    connectedAt: Timestamp,
    lastRefreshedAt: Timestamp,
    revoked: false
  }
}
```

**oauth_states:**

```typescript
{
  state: 'random-token',
  createdAt: Timestamp,
  expiresAt: Timestamp,  // 10 minutes TTL
  metadata: {...}
}
```

**audit_logs:**

```typescript
{
  merchantId: 'doc-id',
  event: 'merchant_created' | 'merchant_updated' | 'merchant_revoked',
  timestamp: Timestamp,
  appVersion: '...',
  ip: '...',
  userAgent: '...'
}
```

### Error Handling

Errors are categorized and users are redirected appropriately:

- **OAuth errors** → `ERROR_PAGE_URL?error=oauth_error_code`
- **Success** → `ONBOARDING_URL/success?merchant_id=xxx`

Error codes:

- `invalid_state` - CSRF token validation failed
- `missing_code` - No authorization code received
- `token_exchange_failed` - Failed to exchange code for tokens
- `provider_api_error` - Square API error
- `invalid_response` - Unexpected response format

### Security Features

✅ CSRF protection with state tokens (10-minute TTL)  
✅ State tokens are single-use (consumed after validation)  
✅ Tokens stored securely in Firestore  
✅ OAuth errors logged but not exposed to users  
✅ Sensitive config values loaded from environment

### Next Steps

1. **Test the flow** with Square sandbox credentials
2. **Implement token refresh** logic (tokens expire in 30 days)
3. **Add webhook handling** for revocation events
4. **Deploy to staging** with `npm run deploy-stg`

### Deployment

```bash
# Deploy to staging
npm run deploy-stg

# The predeploy hook will:
# 1. Lint the code
# 2. Build TypeScript
# 3. Download secrets from Doppler (staging config)
```

### Troubleshooting

**"Invalid redirect URI" from Square:**

- Ensure `SQUARE_REDIRECT_URI` matches the URL configured in Square Dashboard
- For local dev, use ngrok or update Square Dashboard with emulator URL

**"State validation failed":**

- State tokens expire after 10 minutes
- User may have refreshed or gone back in the browser
- Check that Firestore emulator is running locally

**"Token exchange failed" (401 Not Authorized):**

- **Most common**: Verify `SQUARE_CLIENT_ID` and `SQUARE_CLIENT_SECRET` match your Square application
  - Go to https://developer.squareup.com/apps
  - Select your sandbox application
  - Go to "Credentials" tab
  - Copy the **Sandbox** Application ID (this is your Client ID)
  - Copy the **Sandbox** Application Secret (this is your Client Secret)
  - Update these values in Doppler dev config
  - Restart your emulator to reload the config
- Ensure `SQUARE_ENVIRONMENT=sandbox` in Doppler (not `production`)
- Make sure the authorization code hasn't expired (codes expire quickly, typically 1-2 minutes)
- Verify you're using credentials from the same Square application that has your redirect URI configured

**"Merchant info fetch failed":**

- Token might be invalid or expired
- Check Square API status
- Verify the access token has necessary scopes
