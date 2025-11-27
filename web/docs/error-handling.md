# Error Handling

## Overview

Errors are automatically captured and reported to Sentry. In development, errors are also logged to the console.

## Automatic Error Capture

TanStack Router automatically catches React rendering errors and displays a custom error screen:

- Shows a user-friendly error message
- Reports errors to Sentry automatically
- Provides a reload button for recovery

This works for all errors that occur within route components - no manual setup needed.

## Manual Error Capture

For errors outside of React rendering (e.g., async operations, API calls):

```typescript
import { captureException } from './utils/sentry';

try {
  await someAsyncOperation();
} catch (error) {
  captureException(error);
  // Handle the error for the user
}
```

## Development Mode

In development (`npm start`), captured errors are automatically logged to the console, making debugging easier while still testing the Sentry integration.

## Configuration

See [configuration.md](./configuration.md) for required environment variables (`VITE_SENTRY_DSN`).
