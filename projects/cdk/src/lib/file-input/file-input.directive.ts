import {
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { BooleanInput, coerceBoolean, nonNullable } from '../coercion';
import { AcceptService } from './accept.service';
import { getArrayValueError, getInputTypeError, getNonArrayValueError } from './file-input-errors';
import { FileInputMode, FileInputValue } from './file-input-value';

@Directive({
  selector: 'input[fileInput]',
  exportAs: 'fileInput',
  host: {
    style: 'display: none',
    '(focus)': '_focusChanged(true)',
    '(blur)': '_focusChanged(false)',
  },
})
export class FileInputDirective implements ControlValueAccessor, OnInit, OnChanges, DoCheck, OnDestroy {
  private _value: FileInputValue = null;
  private _parent: FormGroupDirective | NgForm | null = null;

  private _focused = false;
  private _touched = false;
  private _errorState = false;

  private _onChange: ((value: FileInputValue) => void) | null = null;
  private _onTouched: (() => void) | null = null;

  /** Emits whenever the parent dropzone should re-render. */
  readonly stateChanges = new Subject<void>();

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
      this._assertMultipleValue(newValue);

      this._value = this._appendOrReplace(newValue);
      this._updateErrorState();

      this._onTouched?.();
      this._touched = true;

      this.stateChanges.next();
    }
  }

  /** Returns the selected value of the file input control (alias as syntactic sugar). */
  get value(): FileInputValue {
    return this._value;
  }

  /** Returns true if the file input has no selected item. */
  get empty(): boolean {
    return this.value === null || (Array.isArray(this.value) && !this.value.length);
  }

  /** Returns the error state. */
  get errorState(): boolean {
    return this._errorState;
  }

  /** Returns true if the file input element is focused. */
  get focused(): boolean {
    return this._focused;
  }

  /** Returns true if the `multiple` attribute is present on the input element. */
  get multiple(): boolean {
    return this.elementRef.nativeElement.multiple;
  }

  /** Controls the accepted file types. */
  @Input()
  get accept(): string {
    return this._accept;
  }
  set accept(value: string) {
    this._accept = value;
    this._updateErrorState();

    this.stateChanges.next();
  }
  private _accept = '*';

  /** Controls the value setting strategy. */
  @Input()
  get mode(): FileInputMode {
    return this._mode;
  }
  set mode(value: FileInputMode) {
    this._mode = value;
    this.stateChanges.next();
  }
  private _mode: FileInputMode = 'replace';

  /** The disabled state of the file input control. */
  @Input()
  @HostBinding('disabled')
  get disabled(): boolean {
    return this.ngControl?.disabled || this._parent?.disabled || this.elementRef.nativeElement.disabled;
  }
  set disabled(value: BooleanInput) {
    this.elementRef.nativeElement.disabled = coerceBoolean(value);

    if (this.focused) {
      this._focused = false;
    }

    this.stateChanges.next();
  }

  /** Event emitted when the selected files have been changed by the user. */
  @Output() readonly selectionChange = new EventEmitter<FileInputValue>();

  constructor(
    private _acceptService: AcceptService,
    public elementRef: ElementRef<HTMLInputElement>,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() @Self() public ngControl: NgControl
  ) {
    this._parent = _parentForm || _parentFormGroup;

    if (ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to allow access to error state.
      ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    if (this.elementRef.nativeElement.type !== 'file') {
      throw getInputTypeError();
    }
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngDoCheck() {
    this._updateErrorState();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  /** Opens the native OS file picker. */
  openFilePicker() {
    this.elementRef.nativeElement.click();
  }

  /** Handles the native (change) event. */
  @HostListener('change', ['$event.target.files'])
  _handleChange(fileList: FileList) {
    if (this.disabled) return;

    const files = this.multiple ? Array.from(fileList) : fileList.item(0);
    this._fileValue = this._copyRelativePaths(files);

    this.selectionChange.emit(this._fileValue);
    this._onChange?.(this._fileValue);

    // Reset the native element for another selection.
    this.elementRef.nativeElement.value = '';
  }

  /** Handles the drop of a file array. */
  handleFileDrop(files: File[]) {
    if (this.disabled) return;
    this._fileValue = this.multiple ? files : files[0];

    this.selectionChange.emit(this._fileValue);
    this._onChange?.(this._fileValue);
  }

  /** Resets the internal value. */
  clear() {
    this._value = this.multiple ? [] : null;

    this._updateErrorState();
    this.stateChanges.next();

    this.selectionChange.emit(this._value);
    this._onChange?.(this._value);
  }

  /** Sets the selected files value as required by the `ControlValueAccessor` interface. */
  writeValue(value: FileInputValue) {
    this._fileValue = value;
    this.selectionChange.emit(this._fileValue);
  }

  /** Registers the change handler as required by `ControlValueAccessor`. */
  registerOnChange(fn: (value: FileInputValue) => void) {
    this._onChange = fn;
  }

  /** Registers the touched handler as required by `ControlValueAccessor`. */
  registerOnTouched(fn: () => void) {
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

  /**
   * On directory drops, the readonly `webkitRelativePath` property is not available.
   * We manually set the `relativePath` property for dropped file trees instead.
   * To achieve a consistent behavior when using the file picker, we copy the value.
   */
  private _copyRelativePaths(value: FileInputValue) {
    if (!value) return value;

    if (Array.isArray(value)) {
      return value.map((file) => {
        file.relativePath = file.webkitRelativePath;
        return file;
      });
    }

    value.relativePath = value.webkitRelativePath;
    return value;
  }

  /** Asserts that the provided value type matches the input element's multiple attribute. */
  private _assertMultipleValue(value: FileInputValue) {
    if (this.multiple && !Array.isArray(value || [])) {
      throw getNonArrayValueError();
    }

    if (!this.multiple && Array.isArray(value)) {
      throw getArrayValueError();
    }
  }

  private _appendOrReplace(value: FileInputValue): FileInputValue {
    if (this._canAppend(this._value)) {
      const valueArray = Array.isArray(value) ? value : [value];
      return [...this._value, ...valueArray.filter(nonNullable)];
    }

    return value;
  }

  private _canAppend(value: FileInputValue): value is File[] {
    return this._mode === 'append' && this.multiple && Array.isArray(value);
  }

  private _updateErrorState() {
    // Check for any errors of the FormControl or NgModel.
    const { invalid, touched } = this.ngControl?.control ?? {};
    const reactiveError = !!(invalid && (touched || this._parent?.submitted));

    // Check for any errors directly on the native input element.
    const nativeError = this._touched && !this._acceptService.accepts(this.value, this._accept);

    const errorState = reactiveError || nativeError;

    if (this._errorState !== errorState) {
      this._errorState = errorState;
      this.stateChanges.next();
    }
  }
}
