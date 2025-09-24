/**
 * Deep immutability utilities for TypeScript
 */

// Type definitions
export type DeepImmutable<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepImmutable<U>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
  : T extends Set<infer U>
  ? ReadonlySet<DeepImmutable<U>>
  : T extends object
  ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
  : T;

export interface ImmutabilityError {
  path: string;
  value: unknown;
  reason: string;
}

/**
 * Checks if a value is deeply immutable
 */
export function isDeepImmutable(value: unknown): value is DeepImmutable<unknown> {
  return checkImmutability(value, []).isImmutable;
}

/**
 * Asserts that a value is deeply immutable, throws with detailed error if not
 */
export function assertImmutable(value: unknown): asserts value is DeepImmutable<unknown> {
  const result = checkImmutability(value, []);
  if (!result.isImmutable) {
    const error = result.errors[0];
    throw new Error(`Value is not immutable at path "${error.path}": ${error.reason}`);
  }
}

/**
 * Inte
rnal function to check immutability recursively
 */
function checkImmutability(
  value: unknown,
  path: string[],
  visited = new WeakSet()
): { isImmutable: boolean; errors: ImmutabilityError[] } {
  const errors: ImmutabilityError[] = [];
  const currentPath = path.join('.');

  // Handle primitives
  if (value === null || typeof value !== 'object') {
    return { isImmutable: true, errors: [] };
  }

  // Avoid infinite recursion with circular references
  if (visited.has(value as object)) {
    return { isImmutable: true, errors: [] };
  }
  visited.add(value as object);

  // Check if object is frozen
  if (!Object.isFrozen(value)) {
    errors.push({
      path: currentPath || 'root',
      value,
      reason: 'Object is not frozen'
    });
    return { isImmutable: false, errors };
  }

  // Handle arrays
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const result = checkImmutability(value[i], [...path, `[${i}]`], visited);
      if (!result.isImmutable) {
        errors.push(...result.errors);
      }
    }
  }
  // Handle Maps
  else if (value instanceof Map) {
    let index = 0;
    for (const [key, val] of value) {
      const keyResult = checkImmutability(key, [...path, `<key:${index}>`], visited);
      const valResult = checkImmutability(val, [...path, `<value:${index}>`], visited);

      if (!keyResult.isImmutable) errors.push(...keyResult.errors);
      if (!valResult.isImmutable) errors.push(...valResult.errors);
      index++;
    }
  }
  // Handle Sets
  else if (value instanceof Set) {
    let index = 0;
    for (const item of value) {
      const result = checkImmutability(item, [...path, `<item:${index}>`], visited);
      if (!result.isImmutable) {
        errors.push(...result.errors);
      }
      index++;
    }
  }
  // Handle Date objects (considered immutable)
  else if (value instanceof Date) {
    // Dates are immutable by nature, just need to be frozen
    return { isImmutable: true, errors: [] };
  }
  // Handle plain objects
  else {
    for (const [key, val] of Object.entries(value)) {
      const result = checkImmutability(val, [...path, key], visited);
      if (!result.isImmutable) {
        errors.push(...result.errors);
      }
    }
  }

  return { isImmutable: errors.length === 0, errors };
}

