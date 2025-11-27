import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error capturing
 * Call this once at application startup
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT as
    | string
    | undefined;

  // Skip initialization if DSN is not provided (e.g., in development)
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: environment || 'development',
    // Disable tracing
    tracesSampleRate: 0,
    // Disable session replay
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

/**
 * Capture an exception to Sentry
 * In development, also logs to console
 */
export function captureException(error: unknown): void {
  if (import.meta.env.DEV) {
    console.error('Captured error:', error);
  }
  Sentry.captureException(error);
}

/**
 * Capture a message to Sentry
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
): void {
  Sentry.captureMessage(message, level);
}
