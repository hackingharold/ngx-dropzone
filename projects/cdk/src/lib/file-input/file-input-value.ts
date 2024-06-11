/**
 * To achieve a consistent behavior when dropping directories,
 * we add an additional property to the `File` object.
 * This will only work with the `webkitdirectories` attribute.
 */
export type File = globalThis.File & { relativePath?: string };

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
