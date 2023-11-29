/**
 * A file input element can either be empty,
 * hold a single file or hold multiple files.
 */
export type FileInputValue = File | File[] | null;

/**
 * The file input mode controls the value setting strategy.
 * - `replace`: Replace the current value with the new value.
 * - `append`: Append the new value to the current value if `multiple` is `true`.
 */
export type FileInputMode = 'replace' | 'append';
