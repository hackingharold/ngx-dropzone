/**
 * Returns an exception to be thrown when no `[file]` input property is provided.
 */
export function getMissingInputError() {
  return Error('FilePreview requires a file blob or url string as [file] input.');
}

/**
 * Returns an exception to be thrown when the provided `[file]` input value
 * is not of type string or instance of `File` blob.
 */
export function getInvalidFileTypeError() {
  return Error('Invalid type of [file] input. Provide a string url or File blob.');
}
