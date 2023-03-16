import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { FileInputValue } from "./file-input-value-accessor";
import { AcceptService } from ".";

export class FileInputValidators {

  /**
   * Checks if the file size is equal or greater than the minimum size.
   * Validates every file within array or single file. Returns no error when null.
   */
  static minSize(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = this.validate(control.value, file => file.size >= min);
      return valid ? null : { minSize: { value: control.value } };
    };
  }

  /**
   * Checks if the file size is equal or smaller than the allowed size.
   * Validates every file within array or single file. Returns no error when null.
   */
  static maxSize(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = this.validate(control.value, file => file.size <= max);
      return valid ? null : { maxSize: { value: control.value } };
    };
  }

  /** Checks if all provided files match the specified `accept` value. */
  static accept(accept: string): ValidatorFn {
    const { accepts } = new AcceptService();
    return (control: AbstractControl): ValidationErrors | null => {
      const allAccepted = accepts(control.value, accept);
      return allAccepted ? null : { accept: { value: control.value } };
    }
  }

  private static validate(value: FileInputValue, predicate: (file: File) => boolean): boolean {
    if (!value) { return true; }

    if (Array.isArray(value)) {
      return value.every(f => f && predicate(f));
    }

    return predicate(value);
  }
}
