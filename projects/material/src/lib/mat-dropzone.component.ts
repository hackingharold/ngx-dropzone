import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { coerceBoolean, DropzoneComponent, FileInputValue } from 'cdk';
import { merge, Observable, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'ngx-mat-dropzone',
  exportAs: 'mat-dropzone',
  template: `
    <div [class]="controlType">
      <mat-label>{{ placeholder }}</mat-label>
      <ng-content select="[fileInput]"></ng-content>
    </div>
  `,
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

  private _elementRef = inject(ElementRef);

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
  @HostBinding('attr.aria-required')
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

  @HostBinding('attr.aria-invalid')
  get ariaInvalid() {
    return this.empty && this.required ? null : this.errorState;
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();

    // Forward the stateChanges from the fileInputDirective to the MatFormFieldControl
    const stateEvents: Observable<unknown>[] = [this.dragover$];
    if (this.fileInputDirective) stateEvents.push(this.fileInputDirective.stateChanges);

    merge(...stateEvents)
      .pipe(
        tap(() => this.stateChanges.next()),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  onContainerClick(): void {
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
