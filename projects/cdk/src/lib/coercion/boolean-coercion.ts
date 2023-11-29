export type BooleanInput = boolean | string | number | null | undefined;

/** Inspired by the Angular Material library, we check our input properties. */
export function coerceBoolean(value?: BooleanInput): boolean {
  return ['', '1', 'true'].includes(`${value}`);
}

/** Allows filtering `null` and `undefined` elements from arrays. */
export function nonNullable<T>(value: T | null): value is T {
  return value !== null && value !== undefined;
}
