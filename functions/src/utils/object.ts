/**
 * Object utility functions
 */

/**
 * Safely dig into nested object properties
 * Returns the value at the specified path, or undefined if any part of the path doesn't exist
 *
 * @example
 * digProperty({ user: { profile: { name: 'John' } } }, 'user', 'profile', 'name') // 'John'
 * digProperty({ user: { profile: { name: 'John' } } }, 'user', 'missing', 'name') // undefined
 * digProperty(null, 'user', 'profile') // undefined
 */
export function digProperty(obj: unknown, ...props: string[]): unknown {
  let current: unknown = obj;

  for (const prop of props) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[prop];
  }

  return current;
}

/**
 * Serialize object to JSON-safe format by converting BigInt to strings
 * Required when storing API responses with BigInt values in JSONB columns
 *
 * @example
 * serializeBigIntValues({ id: 123n, version: 456n }) // { id: "123", version: "456" }
 */
export function serializeBigIntValues(obj: unknown): unknown {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
}
