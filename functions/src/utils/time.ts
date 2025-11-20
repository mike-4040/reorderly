/** *
 * We use ISO strings everywhere:
 * - InstantISO: full ISO timestamp in UTC with 'Z'
 * - LocalDateISO: date-only string YYYY-MM-DD
 */

/** Instant in time, full ISO string in UTC */
export type InstantISO = string; // "2025-11-12T21:10:22.123Z"

/** Date-only ISO string (no time, no timezone) */
export type LocalDateISO = string; // "2025-11-12"

/** Returns the current time as an InstantISO (UTC). */
export const nowInstant = (): InstantISO => new Date().toISOString();

/**
 * Returns today's date as a LocalDateISO in UTC.
 * NOTE: Based on system clock but normalized to UTC.
 */
export const todayDate = (): LocalDateISO => {
  const d = new Date();
  return toLocalDateISO(d);
};

/**
 * Converts a JS Date to an InstantISO.
 */
export const toInstantISO = (d: Date): InstantISO => d.toISOString();

/**
 * Converts a JS Date to a LocalDateISO ("YYYY-MM-DD").
 * Uses UTC year/month/day to avoid timezone drift issues.
 */
export const toLocalDateISO = (d: Date): LocalDateISO => {
  const year = String(d.getUTCFullYear());
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Very lightweight validator: checks if a string looks like an InstantISO.
 * This is intentionally minimal — enough to catch common mistakes.
 */
export const isInstantISO = (s: string): s is InstantISO => {
  // Must end with Z and contain a T separator.
  // Must be parsable by Date without mutation.
  return typeof s === 'string' && s.includes('T') && s.endsWith('Z') && !isNaN(Date.parse(s));
};

/**
 * Lightweight validator: checks if a string looks like YYYY-MM-DD.
 */
export const isLocalDateISO = (s: string): s is LocalDateISO => {
  if (typeof s !== 'string') return false;
  // Simple regex: yyyy-mm-dd
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;

  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d.getTime()) && s === toLocalDateISO(d);
};

/**
 * Parse InstantISO → Date.
 */
export const parseInstant = (iso: InstantISO): Date => new Date(iso);

/**
 * Parse LocalDateISO → Date at midnight UTC.
 */
export const parseLocalDate = (iso: LocalDateISO): Date => new Date(iso + 'T00:00:00Z');
