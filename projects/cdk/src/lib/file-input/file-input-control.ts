import { Directive } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { FileInputValue } from './file-input-value';

/** An interface which allows a control to work inside of a dropzone. */
@Directive()
export abstract class FileInputControl {
  /** The value of the control. */
  abstract value: FileInputValue;

  /** Gets the NgControl for this control. */
  abstract readonly ngControl: NgControl | null;

  /** Whether the control is disabled. */
  abstract readonly disabled: boolean;

  /** Whether the control is in an error state. */
  abstract readonly errorState: boolean;

  /** Whether the control is focused. */
  abstract readonly focused: boolean;

  /** Whether the control is empty. */
  abstract readonly empty: boolean;

  /**
   * Stream that emits whenever the state of the control changes
   * such that the parent dropzone needs to run change detection.
   */
  abstract readonly stateChanges: Observable<void>;

  /** Handles the drop of a file array. */
  abstract handleFileDrop: (files: File[]) => void;

  /** Opens the native OS file picker. */
  abstract openFilePicker: () => void;
}
