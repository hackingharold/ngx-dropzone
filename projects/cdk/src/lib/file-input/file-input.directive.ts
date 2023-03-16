import { Directive, DoCheck, ElementRef, forwardRef, OnChanges, OnDestroy, OnInit, Optional, Self } from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { FileInputValueAccessor } from './file-input-value-accessor';
import { FileInputControl } from './file-input-control';
import { getInputTypeError } from './file-input-errors';

@Directive({
  selector: 'input[fileInput]',
  exportAs: 'fileInput',
  host: {
    'style': 'display: none',
    '[disabled]': 'disabled',
    '(change)': '_handleChange($event.target.files)',
    '(focus)': '_focusChanged(true)',
    '(blur)': '_focusChanged(false)'
  },
  providers: [{
    provide: FileInputControl,
    useExisting: forwardRef(() => FileInputDirective)
  }]
})
export class FileInputDirective
  extends FileInputValueAccessor
  implements FileInputControl, OnInit, OnChanges, DoCheck, OnDestroy {

  /** Stores a reference to a possible parent form element for error checking. */
  private _parent: FormGroupDirective | NgForm | null;

  /** Returns true if the control in in error state. */
  errorState: boolean = false;

  constructor(
    _elementRef: ElementRef<HTMLInputElement>,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() @Self() ngControl: NgControl,
  ) {
    super(ngControl, _elementRef);

    this._parent = _parentForm || _parentFormGroup;

    if (ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to allow access to error state.
      ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    if (this._elementRef.nativeElement.type !== 'file') {
      throw getInputTypeError();
    }
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngDoCheck() {
    this.updateErrorState();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  /** Opens the native OS file picker. */
  openFilePicker() {
    this._elementRef.nativeElement.click();
  }

  private updateErrorState() {
    if (this.ngControl) {
      const control = this.ngControl.control;
      const errorState = !!(control?.invalid && (control?.touched || this._parent?.submitted));

      if (this.errorState !== errorState) {
        this.errorState = errorState;
        this.stateChanges.next();
      }
    }
  }
}
