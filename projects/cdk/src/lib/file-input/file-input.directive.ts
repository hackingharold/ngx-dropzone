import {
  computed,
  Directive,
  DoCheck,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { FORM_FIELD, FormValueControl } from '@angular/forms/signals';
import { Subject } from 'rxjs';
import { coerceBoolean, nonNullable } from '../coercion';
import { AcceptService } from './accept.service';
import { getArrayValueError, getInputTypeError, getNonArrayValueError } from './file-input-errors';
import { FileInputMode, FileInputValue } from './file-input-value';

@Directive({
  selector: 'input[fileInput]',
  exportAs: 'fileInput',
  host: {
    style: 'display: none',
    '[accept]': 'accept()',
    '[disabled]': 'disabledState()',
    '(change)': '_handleChange($event)',
    '(focus)': '_focusChanged(true)',
    '(blur)': '_focusChanged(false)',
  },
})
export class FileInputDirective
  implements FormValueControl<FileInputValue>, ControlValueAccessor, OnInit, DoCheck, OnDestroy
{
  /**
   * The value of the file input control.
   *
   * Being a model signal, it fulfills the `FormValueControl` contract,
   * so the signal forms `[formField]` directive binds the field value
   * to this directive instead of the native (readonly) file input.
   */
  readonly value = model<FileInputValue>(null);

  /** The touched state of the control. Kept in sync with the field when bound via `[formField]`. */
  readonly touched = model(false);

  /** The invalid state of the bound signal forms field. Bound automatically via `[formField]`. */
  readonly invalid = input(false);

  /** The required state. Set by the `required` attribute or bound automatically via `[formField]`. */
  readonly required = input(false, { transform: coerceBoolean });

  /** Controls the accepted file types. */
  readonly accept = input('*');

  /** Controls the value setting strategy. */
  readonly mode = input<FileInputMode>('replace');

  /** The disabled state. Set by the `disabled` attribute or bound automatically via `[formField]`. */
  readonly disabled = input(false, { transform: coerceBoolean });

  /** Event emitted when the selected files have been changed by the user. */
  readonly selectionChange = output<FileInputValue>();

  /** Emits when the control is touched by the user. Marks the bound signal forms field as touched. */
  readonly touch = output<void>();

  /** Emits whenever the parent dropzone should re-render. */
  readonly stateChanges = new Subject<void>();

  private readonly _focused = signal(false);
  private readonly _disabledByForms = signal(false);
  private readonly _reactiveError = signal(false);

  private _onChange: ((value: FileInputValue) => void) | null = null;
  private _onTouched: (() => void) | null = null;

  private _acceptService = inject(AcceptService);
  private _parent: FormGroupDirective | NgForm | null =
    inject(NgForm, { optional: true }) ?? inject(FormGroupDirective, { optional: true });

  /** The signal forms field binding, if the input element is bound via `[formField]`. */
  private _formField = inject(FORM_FIELD, { optional: true, self: true });

  public elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  /**
   * The legacy `NgControl` of the reactive or template-driven forms integration.
   * Remains `null` when the input element is bound to a signal forms field.
   */
  public ngControl = this._formField ? null : inject(NgControl, { optional: true, self: true });

  /** The combined disabled state of the input element and the bound form. */
  readonly disabledState = computed(() => this.disabled() || this._disabledByForms());

  /** Returns true if the file input has no selected item. */
  readonly empty = computed(() => {
    const value = this.value();
    return value === null || (Array.isArray(value) && !value.length);
  });

  /** Returns true if the file input element is focused. */
  readonly focused = computed(() => this._focused() && !this.disabledState());

  /** Returns the error state. */
  readonly errorState = computed(() => {
    // Check for any errors of the signal forms field bound via [formField].
    const signalError = this.invalid() && this.touched();

    // Check for any errors directly on the native input element.
    const nativeError = this.touched() && !this._acceptService.accepts(this.value(), this.accept());

    return this._reactiveError() || signalError || nativeError;
  });

  /** Returns true if the `multiple` attribute is present on the input element. */
  get multiple(): boolean {
    return this.elementRef.nativeElement.multiple;
  }

  constructor() {
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to allow access to error state.
      this.ngControl.valueAccessor = this;
    }

    // Notify the parent dropzone whenever any rendering-relevant state changes.
    effect(() => {
      this.value();
      this.accept();
      this.mode();
      this.required();
      this.disabledState();
      this.errorState();

      untracked(() => this.stateChanges.next());
    });
  }

  ngOnInit() {
    if (this.elementRef.nativeElement.type !== 'file') {
      throw getInputTypeError();
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      // Check for any errors of the FormControl or NgModel.
      const { invalid, touched } = this.ngControl.control ?? {};
      this._reactiveError.set(!!(invalid && (touched || this._parent?.submitted)));
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  /** Opens the native OS file picker. */
  openFilePicker() {
    this.elementRef.nativeElement.click();
  }

  /** Handles the native (change) event. */
  _handleChange(event: Event) {
    if (this.disabledState()) return;

    const fileList = (event.target as HTMLInputElement)?.files;
    if (!fileList || fileList.length === 0) return;

    const files = this.multiple ? Array.from(fileList) : fileList.item(0);
    const filesWithPaths = this._copyRelativePaths(files);
    const newValue = this._appendOrReplace(filesWithPaths);
    this._setValue(newValue);

    this.selectionChange.emit(newValue);
    this._onChange?.(newValue);

    // Reset the native element for another selection.
    this.elementRef.nativeElement.value = '';
  }

  /** Handles the drop of a file array. */
  handleFileDrop(files: File[]) {
    if (this.disabledState()) return;

    const newValue = this._appendOrReplace(this.multiple ? files : files[0]);
    this._setValue(newValue);

    this.selectionChange.emit(newValue);
    this._onChange?.(newValue);
  }

  /** Sets the selected files value as required by the `ControlValueAccessor` interface. */
  writeValue(value: FileInputValue) {
    this._setValue(value);
    this.selectionChange.emit(value);
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
    this._disabledByForms.set(disabled);
    this.stateChanges.next();
  }

  /** Sets the value of the file input control and marks it as touched. */
  _setValue(newValue: FileInputValue) {
    this._assertMultipleValue(newValue);
    this.value.set(newValue);

    this.touched.set(true);
    this._onTouched?.();
    this.touch.emit();

    this.stateChanges.next();
  }

  /** Called when the input element is focused or blurred. */
  _focusChanged(focused: boolean) {
    if (this._focused() !== focused) {
      this._focused.set(focused);
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
    const currentValue = this.value();

    if (this._canAppend(currentValue)) {
      const valueArray = Array.isArray(value) ? value : [value];
      return [...currentValue, ...valueArray.filter(nonNullable)];
    }

    return value;
  }

  private _canAppend(value: FileInputValue): value is File[] {
    return this.mode() === 'append' && this.multiple && Array.isArray(value);
  }
}
