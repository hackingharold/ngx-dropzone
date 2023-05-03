import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  NgZone,
  Optional,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';
import { DropzoneComponent, FileInputValue } from 'cdk';
import { merge, Observable, of, Subject } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-mat-dropzone',
  exportAs: 'mat-dropzone',
  template: `
    <div [class]="matDropzoneClasses">
      <ng-content></ng-content>
    </div>
    {{ log | json }}
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
      useExisting: MatDropzoneComponent,
    },
  ],
})
export class MatDropzoneComponent
  extends DropzoneComponent
  implements MatFormFieldControl<FileInputValue>, AfterContentInit
{
  static nextId = 0;

  @HostBinding()
  id = `mat-dropzone-component-${MatDropzoneComponent.nextId++}`;

  controlType = 'ngx-mat-dropzone';

  // TODO: Render error state, test in "real" app.
  // TODO: Implement other props
  // TODO: text/image/video preview/chips (file + url)

  @Input()
  get value() {
    return this.control?.value ?? null;
  }
  set value(newValue: FileInputValue) {
    if (this.control) {
      this.control.value = newValue;
    }
  }

  get log() {
    return [
      this.control?.value,
      this.control?.disabled,
      this.control?.empty,
      this.control?.errorState,
      this.control?.focused,
      this.value,
      this.disabled,
      this.empty,
      this.errorState,
      this.focused,
    ];
  }

  override get focused() {
    return this._dragover$.value;
  }

  get empty() {
    return this.control ? this.control.empty : true;
  }

  ngControl = this.control?.ngControl ?? null;
  errorState = this.control?.errorState ?? false;

  // Will be overwritten after content init.
  stateChanges: Observable<void> = new Subject<void>();

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

  get matDropzoneClasses() {
    return [this.controlType, this._formField.appearance].join(' ');
  }

  constructor(
    ngZone: NgZone,
    renderer: Renderer2,
    elementRef: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_FORM_FIELD) private _formField: MatFormField
  ) {
    super(ngZone, renderer, elementRef, changeDetectorRef);
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();

    const controlChanges = this.control?.stateChanges ?? of();
    this.stateChanges = merge(this._dragover$, controlChanges).pipe(
      tap((f) => console.log(this.log)),
      mapTo(undefined)
    );
  }
}
