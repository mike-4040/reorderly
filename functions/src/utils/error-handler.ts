/**
 * Error handling utilities
 */

import { captureException } from './sentry';

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  message: string;
}

export type CFResponse<T> = Promise<{ success: true; data: T } | ErrorResponse>;

/**
 * External error - safe to expose message to client
 */
export class ExternalError extends Error {}

/**
 * External silent error - safe to expose message, but no logging needed
 */
export class ExternalSilentError extends Error {}

/**
 * Handle errors and return a safe error response
 */
export function handleError(error: unknown): ErrorResponse {
  // External error - log and return message
  if (error instanceof ExternalError) {
    captureException(error);
    return {
      success: false,
      message: error.message,
    };
  }

  // External silent error - return message without logging
  if (error instanceof ExternalSilentError) {
    return {
      success: false,
      message: error.message,
    };
  }

  // Internal error (standard Error) - log and return generic message
  if (error instanceof Error) {
    console.error(error);
    captureException(error);
    return {
      success: false,
      message: 'Internal Server Error',
    };
  }

  // Unknown error type - log and return generic message
  console.error(error);
  captureException(error);
  return {
    success: false,
    message: 'Internal Server Error',
  };
}
