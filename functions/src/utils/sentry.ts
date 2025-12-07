/**
 * Sentry error tracking
 */

import { env } from 'node:process';

import * as Sentry from '@sentry/node';

let initialized = false;

/**
 * Initialize Sentry for error capturing
 * Call this once at application startup
 */
export function initSentry(): void {
  const dsn = env.SENTRY_DSN;
  const environment = env.SENTRY_ENVIRONMENT ?? 'development';

  // Skip initialization if DSN is not provided (e.g., in development)
  if (!dsn) {
    console.error('Sentry DSN not provided, skipping initialization.');
    return;
  }

  // Prevent double initialization
  if (initialized) {
    return;
  }

  Sentry.init({
    dsn,
    environment,
    // Disable tracing
    tracesSampleRate: 0,
    // Log all errors/messages to console before sending to Sentry
    beforeSend(event, hint) {
      console.error('[Sentry]', {
        message: event.message,
        exception: hint.originalException,
      });

      return event;
    },
  });

  initialized = true;
}

/**
 * Capture an exception to Sentry
 */
export function captureException(error: unknown): void {
  if (initialized) {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (initialized) {
    Sentry.captureMessage(message, level);
  }
}
