import {
  Directive,
  DoCheck,
  ElementRef,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { AcceptService } from './accept.service';
import { FileInputControl } from './file-input-control';
import { getInputTypeError } from './file-input-errors';
import { FileInputValueAccessor } from './file-input-value-accessor';

@Directive({
  selector: 'input[fileInput]',
  exportAs: 'fileInput',
  host: {
    style: 'display: none',
    '[disabled]': 'disabled',
    '(change)': '_handleChange($event.target.files)',
    '(focus)': '_focusChanged(true)',
    '(blur)': '_focusChanged(false)',
  },
  providers: [
    {
      provide: FileInputControl,
      useExisting: forwardRef(() => FileInputDirective),
    },
  ],
})
export class FileInputDirective
  extends FileInputValueAccessor
  implements FileInputControl, OnInit, OnChanges, DoCheck, OnDestroy
{
  /** Stores a reference to a possible parent form element for error checking. */
  private _parent: FormGroupDirective | NgForm | null;

  @Input('accepts')
  get accepts(): string {
    return this._accepts;
  }
  set accepts(value: string) {
    this._accepts = value;
    this.updateErrorState();
  }
  private _accepts = '*';

  /** Returns true if the control is in error state. */
  errorState: boolean = false;

  constructor(
    private _acceptService: AcceptService,
    _elementRef: ElementRef<HTMLInputElement>,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() @Self() ngControl: NgControl
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
    console.log(this.ngControl);

    if (this.ngControl) {
      const control = this.ngControl.control;
      console.log(control, this._acceptService.accepts(this.value, this._accepts));
      const errorState = !!(control?.invalid && (control?.touched || this._parent?.submitted));

      if (this.errorState !== errorState) {
        this.errorState = errorState;
        this.stateChanges.next();
      }
    }
  }
}
