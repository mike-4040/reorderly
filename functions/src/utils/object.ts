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
