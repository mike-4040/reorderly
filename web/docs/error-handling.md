# Error Handling

## Overview

Errors are automatically captured and reported to Sentry. In development, errors are also logged to the console.

## Automatic Error Capture

The app uses an `ErrorBoundary` component that catches all React rendering errors:

- Displays a user-friendly error screen
- Reports errors to Sentry with component stack trace
- Provides a reload button for recovery

The ErrorBoundary wraps the entire app, so you don't need to do anything special - it just works.

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
