import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';
import { coerceBoolean, DropzoneComponent, FileInputValue } from 'cdk';
import { EMPTY, merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-mat-dropzone',
  exportAs: 'mat-dropzone',
  template: `
    <div [class]="matDropzoneClasses">
      <mat-label>{{ placeholder }}</mat-label>
      <ng-content select="[fileInput]"></ng-content>
    </div>
  `,
  host: {
    '[attr.aria-required]': 'required',
    '[attr.aria-invalid]': '(empty && required) ? null : errorState',
  },
  styles: [
    `
      .ngx-mat-dropzone {
        cursor: pointer;
        text-align: center;
        padding: 28px 20px;
      }

      .ngx-mat-dropzone * {
        pointer-events: none;
      }

      .ngx-mat-dropzone.fill {
        margin: -24px -16px -8px -16px;
      }

      .dragover > .ngx-mat-dropzone.fill {
        background-color: #00000016;
      }

      .ngx-mat-dropzone.outline {
        margin: -16px;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: MatDropzone,
    },
  ],
})
export class MatDropzone extends DropzoneComponent implements MatFormFieldControl<FileInputValue>, AfterContentInit {
  static nextId = 0;

  @HostBinding()
  id = `mat-dropzone-component-${MatDropzone.nextId++}`;

  controlType = 'ngx-mat-dropzone';

  // Always center the label
  shouldLabelFloat = false;

  // The file input is never autofilled
  autofilled = false;

  stateChanges = new Subject<void>();
  ngControl = this.fileInputDirective?.ngControl ?? null;

  @Input('aria-describedby')
  userAriaDescribedBy?: string | undefined;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder = 'Drop it!';

  @Input()
  get required(): boolean {
    const controlRequired = this.ngControl?.control?.hasValidator(Validators.required);
    return this._required ?? controlRequired ?? false;
  }
  set required(value: boolean) {
    this._required = coerceBoolean(value);

    if (this.fileInputDirective) {
      this.fileInputDirective.elementRef.nativeElement.required = this._required;
    }

    this.stateChanges.next();
  }
  private _required = false;

  get matDropzoneClasses() {
    return [this.controlType, this._formField.appearance].join(' ');
  }

  get empty() {
    return this.fileInputDirective?.empty ?? true;
  }

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) private _formField: MatFormField
  ) {
    super(changeDetectorRef);
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();

    // Forward the stateChanges from the fileInputDirective to the MatFormFieldControl
    merge(this.fileInputDirective?.stateChanges ?? EMPTY, this.dragover$)
      .pipe(
        tap(() => this.stateChanges.next()),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  onContainerClick(_: MouseEvent): void {
    this.openFilePicker();
  }

  setDescribedByIds(ids: string[]): void {
    if (ids.length) {
      this._elementRef.nativeElement.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this._elementRef.nativeElement.removeAttribute('aria-describedby');
    }
  }
}
