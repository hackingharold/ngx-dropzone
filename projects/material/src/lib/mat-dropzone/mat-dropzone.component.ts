import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  HostBinding,
  inject,
  Input,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { MatChipRow } from '@angular/material/chips';
import { MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { coerceBoolean, DropzoneComponent, FileInputValue } from '@ngx-dropzone/cdk';
import { merge, Observable, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'ngx-mat-dropzone',
  exportAs: 'matDropzone',
  template: `
    <ng-content select="[fileInput]"></ng-content>
    <div class="mat-chip-grid">
      <ng-content select="mat-chip-row"></ng-content>
    </div>
  `,
  styles: [
    `
      ngx-mat-dropzone {
        display: flex;
        position: relative;
        z-index: 10;
        min-height: 56px;
        margin: 0 -16px;
        color: currentcolor;
        outline: none;
        cursor: pointer;
        font: inherit;
      }

      .mat-chip-grid {
        display: flex;
        flex-flow: wrap;
        margin: 8px 16px;

        & > .mdc-evolution-chip {
          margin: 4px 0 4px 8px;
        }
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
export class MatDropzone
  extends DropzoneComponent
  implements MatFormFieldControl<FileInputValue>, AfterContentInit, AfterContentChecked
{
  static nextId = 0;

  private _elementRef = inject(ElementRef);
  private _formField = inject(MatFormField);

  @HostBinding()
  id = `mat-dropzone-component-${MatDropzone.nextId++}`;

  controlType = 'ngx-mat-dropzone';

  @ContentChildren(MatChipRow)
  readonly _matChips!: QueryList<MatChipRow>;

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
  private _placeholder = '';

  @Input()
  @HostBinding('attr.aria-required')
  get required(): boolean {
    const controlRequired = this.ngControl?.control?.hasValidator(Validators.required);
    return this._required || controlRequired || false;
  }
  set required(value: boolean) {
    this._required = coerceBoolean(value);
    this.stateChanges.next();
  }
  private _required = false;

  get empty() {
    return this.fileInputDirective?.empty || true;
  }

  get shouldLabelFloat() {
    return this._matChips.length > 0;
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

  ngAfterContentChecked() {
    // Set the dropzone to cover the whole form field
    const formField = this._formField?._elementRef?.nativeElement as HTMLElement;
    this._elementRef.nativeElement.style.width = `${formField?.offsetWidth ?? 0}px`;

    // Set the dropzone height depending on the form field appearance
    const filled = this._formField?.appearance === 'fill';
    this._elementRef.nativeElement.style.marginTop = `-${filled ? 24 : 16}px`;
    this._elementRef.nativeElement.style.marginBottom = `-${filled ? 8 : 16}px`;
  }

  onContainerClick() {
    this.openFilePicker();
  }

  setDescribedByIds(ids: string[]) {
    if (ids.length) {
      this._elementRef.nativeElement.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this._elementRef.nativeElement.removeAttribute('aria-describedby');
    }
  }
}
