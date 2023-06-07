import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  Input,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';
import { DropzoneComponent, FileInputValue } from 'cdk';
import { EMPTY, merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-mat-dropzone',
  exportAs: 'mat-dropzone',
  template: `
    <div [class]="matDropzoneClasses">
      <ng-content select="[fileInput]"></ng-content>
    </div>
  `,
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
  stateChanges = new Subject<void>();
  ngControl = this.fileInputDirective?.ngControl ?? null;

  get matDropzoneClasses() {
    return [this.controlType, this._formField.appearance].join(' ');
  }

  get empty() {
    return this.fileInputDirective?.empty ?? true;
  }

  onContainerClick(_: MouseEvent): void {
    this.openFilePicker();
  }

  // vvv TODO vvv
  placeholder = 'Placeholder example';
  shouldLabelFloat = false;
  required = false;
  autofilled = false;

  @Input('aria-describedby')
  userAriaDescribedBy?: string | undefined;

  setDescribedByIds(ids: string[]): void {
    // console.log('setting ids', ids);
  }
  // ^^^ TODO Ende ^^^

  constructor(
    changeDetectorRef: ChangeDetectorRef,
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
}
