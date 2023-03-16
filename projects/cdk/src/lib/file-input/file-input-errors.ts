/**
 * Returns an exception to be thrown when attempting to add the `FileInputDirective`
 * to an HTML `<input>` element with a type other than "file".
 */
export function getInputTypeError() {
  return Error('The [fileInput] directive may only be applied to `<input type="file" />` elements.');
}

/**
 * Returns an exception to be thrown when attempting to assign an array value
 * to a file input element without the `multiple` attribute.
 */
export function getArrayValueError() {
  return Error('Value must not be an array when the multiple attribute is not present.');
}

/**
 * Returns an exception to be thrown when attempting to assign a non-array value
 * to a file input element in `multiple` mode. Note that `undefined` and `null` are
 * valid values to allow for resetting the value.
 */
export function getNonArrayValueError() {
  return Error('Value must be an array when the multiple attribute is present.');
}
