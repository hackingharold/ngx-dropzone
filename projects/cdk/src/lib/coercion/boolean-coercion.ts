export type BooleanInput = boolean | string | number | null | undefined;

/** Inspired by the Angular Material library, we check our input properties. */
export function coerceBoolean(value?: BooleanInput): boolean {
  return ['', '1', 'true'].includes(`${value}`);
}
