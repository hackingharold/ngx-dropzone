import { coerceBoolean } from './boolean-coercion';

describe('coerceBoolean', () => {
  it('should coerce undefined to false', () => {
    expect(coerceBoolean(undefined)).toBe(false);
  });

  it('should coerce null to false', () => {
    expect(coerceBoolean(null)).toBe(false);
  });

  it('should coerce the empty string to true', () => {
    expect(coerceBoolean('')).toBe(true);
  });

  it('should coerce zero to false', () => {
    expect(coerceBoolean(0)).toBe(false);
  });

  it('should coerce one to true', () => {
    expect(coerceBoolean(1)).toBe(true);
  });

  it('should coerce the string "false" to false', () => {
    expect(coerceBoolean('false')).toBe(false);
  });

  it('should coerce the boolean false to false', () => {
    expect(coerceBoolean(false)).toBe(false);
  });

  it('should coerce the boolean true to true', () => {
    expect(coerceBoolean(true)).toBe(true);
  });

  it('should coerce the string "true" to true', () => {
    expect(coerceBoolean('true')).toBe(true);
  });

  it('should coerce an arbitrary string to false', () => {
    expect(coerceBoolean('random')).toBe(false);
  });
});
