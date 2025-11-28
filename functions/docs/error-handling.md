# Error Handling

## Overview

Errors are automatically captured and reported to Sentry through the centralized `handleError()` utility.

## Error Classes

```typescript
// External errors - safe to show to users
throw new ExternalError('Invalid merchant ID');

// Silent external errors - expected errors, no logging needed
throw new ExternalSilentError('Session expired');

// Internal errors - generic "Internal Server Error" shown to users
throw new Error('database_connection_failed');
```

## Error Handler

All Cloud Functions should use `handleError()` in their catch blocks:

```typescript
import { handleError } from './utils/error-handler';

export const myFunction = onCall(async (request) => {
  try {
    // Your logic here
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
});
```

The `handleError()` utility:

- Logs errors to console (except silent errors)
- Reports errors to Sentry automatically (except silent errors)
- Returns appropriate error responses: `{ success: false, message: string }`

## Error Naming Pattern

Use `functionName_problem` format:

```typescript
throw new Error('getRequiredEnv_missingEnvVariable', {
  cause: { key: 'API_KEY' },
});
```

## When to Use Each

- **ExternalError** - User input errors, validation failures (log + Sentry + show message)
- **ExternalSilentError** - Expected flow errors like expired tokens (show message only)
- **Error** - Internal bugs, database errors (log + Sentry + generic message)
- **Context in cause** - Add details via `{ cause: { ... } }`

## Manual Sentry Capture

For cases where you need to capture errors without using `handleError()`:

```typescript
import { captureException, captureMessage } from './utils/sentry';

captureException(new Error('Custom error'));
captureMessage('Something noteworthy happened', 'warning');
```

## Configuration

See [configuration.md](./configuration.md) for Sentry setup (`SENTRY_DSN`).
