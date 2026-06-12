/** Inspired by the Angular Material library, we check our input properties. */
export function coerceBoolean(value?: unknown): boolean {
  return ['', '1', 'true'].includes(`${value}`);
}

/** Allows filtering `null` and `undefined` elements from arrays. */
export function nonNullable<T>(value: T | null): value is T {
  return value !== null && value !== undefined;
}
