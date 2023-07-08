import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { coerceBoolean, DropzoneComponent, FileInputValue } from 'cdk';
import { EMPTY, merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-mat-dropzone',
  exportAs: 'mat-dropzone',
  template: `
    <div [class]="controlType">
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
        margin: -16px;
      }

      .ngx-mat-dropzone * {
        pointer-events: none;
      }

      .dragover > .ngx-mat-dropzone.fill {
        background-color: #00000016;
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
    this.stateChanges.next();
  }
  private _required = false;

  get empty() {
    return this.fileInputDirective?.empty ?? true;
  }

  constructor(changeDetectorRef: ChangeDetectorRef, private _elementRef: ElementRef<HTMLElement>) {
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
