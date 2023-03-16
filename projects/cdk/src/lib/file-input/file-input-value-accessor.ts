import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { BooleanInput, coerceBoolean } from '../coercion';
import { getArrayValueError, getNonArrayValueError } from './file-input-errors';
import { FileInputValue } from './file-input-value';

@Directive()
export abstract class FileInputValueAccessor implements ControlValueAccessor {
  private _value: FileInputValue = null;
  private _focused: boolean = false;

  private _onChange = (_: FileInputValue) => {};
  private _onTouched = () => {};

  /** Event emitted when the selected files have been changed by the user. */
  @Output() readonly selectionChange = new EventEmitter<FileInputValue>();

  /** Implemented as part of `FileInputControl`. */
  readonly stateChanges = new Subject<void>();

  /** Returns the selected value of the file input control (syntactic sugar). */
  get value(): FileInputValue {
    return this._value;
  }

  /** Returns true if the file input has no selected item. */
  get empty(): boolean {
    return this.value === null || (Array.isArray(this.value) && !this.value.length);
  }

  /** Returns true if the file input element is focused. */
  get focused(): boolean {
    return this._focused;
  }

  /** Returns true if the `multiple` attribute is present on the input element. */
  get multiple(): boolean {
    return this._elementRef.nativeElement.multiple;
  }

  /** The value of the file input control. */
  @Input('value')
  get _fileValue() {
    return this.value;
  }
  set _fileValue(newValue: FileInputValue) {
    /**
     * We may not use the property name `value` for the setter
     * because it already exists on the native input element
     * and would break our tests.
     */
    if (newValue !== this._value || Array.isArray(newValue)) {
      this._checkMultipleValue(newValue);
      this._value = newValue;
      this._onTouched();
      this.stateChanges.next();
    }
  }

  /** The disabled state of the file input control. */
  @Input()
  get disabled(): boolean {
    return this.ngControl?.disabled || this._elementRef.nativeElement.disabled;
  }
  set disabled(value: BooleanInput) {
    this._elementRef.nativeElement.disabled = coerceBoolean(value);

    if (this.focused) {
      this._focused = false;
    }

    this.stateChanges.next();
  }

  constructor(public ngControl: NgControl | null, protected _elementRef: ElementRef<HTMLInputElement>) {}

  /** Handles the native (change) event. */
  _handleChange(fileList: FileList) {
    this._fileValue = this.multiple ? Array.from(fileList) : fileList.item(0);

    this.selectionChange.emit(this._fileValue);
    this._onChange(this._fileValue);

    // Reset element for another selection.
    this._elementRef.nativeElement.value = '';
  }

  /** Handles the drop of a file array. */
  handleFileDrop(files: File[]) {
    this._fileValue = this.multiple ? files : files[0];

    this.selectionChange.emit(this._fileValue);
    this._onChange(this._fileValue);
  }

  /** Sets the selected files value as required by the `ControlValueAccessor` interface. */
  writeValue(value: FileInputValue) {
    this._fileValue = value;
    this.selectionChange.emit(this._fileValue);
  }

  /** Registers the change handler as required by `ControlValueAccessor`. */
  registerOnChange(fn: any) {
    this._onChange = fn;
  }

  /** Registers the touched handler as required by `ControlValueAccessor`. */
  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  /** Implements the disabled state setter from `ControlValueAccessor`. */
  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Called when the input element is focused or blurred. */
  _focusChanged(focused: boolean) {
    if (this._focused !== focused) {
      this._focused = focused;
      this.stateChanges.next();
    }
  }

  /** Checks if the provided value type matches the input element's multiple attribute. */
  private _checkMultipleValue(value: FileInputValue) {
    if (this.multiple && !Array.isArray(value ?? [])) {
      throw getNonArrayValueError();
    }

    if (!this.multiple && Array.isArray(value)) {
      throw getArrayValueError();
    }
  }
}
