# Configuration

## Environment Variables

We maintain all environment variables and secrets centrally in **Doppler**.

Documentation: [docs.doppler.com](https://docs.doppler.com/docs/accessing-secrets).

For local development or emulator use, we download them into a `.env` file.

### Required Variables

- `SQUARE_CLIENT_ID` - Square OAuth client ID
- `SQUARE_CLIENT_SECRET` - Square OAuth client secret
- `WEB_URL` - Base URL of the web application (errors redirect to home page with query param)
- `POSTGRES_URL` - PostgreSQL connection string (format: `postgres://user:password@host:port/database`)

### Optional Variables

- `SQUARE_ENVIRONMENT` - Square environment (`production` or `sandbox`, defaults to `sandbox`)
- `SENTRY_DSN` - Sentry DSN for error tracking (omit to disable Sentry)
- `SENTRY_ENVIRONMENT` - Sentry environment name (defaults to `development`)

## Usage

```typescript
import { config } from './utils/config';

// Access configuration
const { clientId } = config.square;
const { webUrl } = config;
```

## How It Works

- We use the Doppler CLI to download secrets and store them in a `.env` file:

```bash
doppler secrets download --project backend --config dev --format env --no-file > .env
```

- For local development or emulators, we use the resulting `.env` so our app can load environment variables normally.
- For CI/CD or deployment, we follow the same pattern — download the correct environment’s secrets from Doppler into `.env`, then deploy.
- `.env` files are **not** committed to version control; secrets are managed in Doppler.
- The config utility uses **lazy loading** and throws if a required environment variable is missing. Optional values can use `??` for defaults.

## Adding New Config

1. Add the key in Doppler for all relevant environments (`dev`, `stg`, `prd`).
2. Update the `config` utility code accordingly.

```typescript
export const config = {
  // existing providers ...
  get newProvider(): NewProviderConfig {
    return {
      apiKey: getRequiredEnv('NEW_PROVIDER_API_KEY'),
      // more keys
    };
  },
};
```
