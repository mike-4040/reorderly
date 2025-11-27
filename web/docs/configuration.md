# Configuration

## Environment Variables

We use Doppler to manage environment variables and secrets.

Documentation: [docs.doppler.com](https://docs.doppler.com/docs/accessing-secrets).

### Download Secrets

```bash
# Development environment
npm run secrets-dev

# Staging environment
npm run secrets-stg

# Production environment
npm run secrets-prd
```

### Required Variables

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FUNCTIONS_URL` - Base URL for Firebase Functions

### Optional Variables

- `VITE_SENTRY_DSN` - Sentry DSN for error tracking (omit to disable Sentry)
- `VITE_SENTRY_ENVIRONMENT` - Sentry environment name (defaults to `development`)

## Usage

```typescript
import { getRequiredEnv, getFunctionsUrl } from './utils/env';

// Get required environment variable
const apiKey = getRequiredEnv('VITE_FIREBASE_API_KEY');

// Get functions URL
const functionsUrl = getFunctionsUrl();
```
