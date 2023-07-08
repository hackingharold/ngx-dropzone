import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { FileInputDirective, FileInputValue } from './../file-input';
import { getMissingControlError } from './dropzone-errors';

@Component({
  selector: 'ngx-dropzone',
  exportAs: 'dropzone',
  template: `<ng-content></ng-content>`,
  host: {
    tabindex: '0',
    '[attr.aria-invalid]': 'errorState',
    '[class.disabled]': 'disabled',
    '[class.focused]': 'focused',
    '[class.ng-untouched]': '_forwardProp("untouched")',
    '[class.ng-touched]': '_forwardProp("touched")',
    '[class.ng-pristine]': '_forwardProp("pristine")',
    '[class.ng-dirty]': '_forwardProp("dirty")',
    '[class.ng-valid]': '_forwardProp("valid")',
    '[class.ng-invalid]': '_forwardProp("invalid")',
    ondragover: 'event.preventDefault()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropzoneComponent implements AfterContentInit, OnDestroy {
  protected _destroy$ = new Subject();

  @ContentChild(FileInputDirective, { static: true })
  readonly fileInputDirective: FileInputDirective | null = null;

  readonly dragover$ = new BehaviorSubject<boolean>(false);

  @HostBinding('class.dragover')
  get isDragover() {
    return this.dragover$.value;
  }

  get disabled(): boolean {
    return this.fileInputDirective?.disabled ?? false;
  }

  get focused(): boolean {
    return this.fileInputDirective?.focused || this.isDragover;
  }

  get errorState() {
    return this.fileInputDirective?.errorState ?? false;
  }

  @Input()
  get value() {
    return this.fileInputDirective?.value ?? null;
  }
  set value(newValue: FileInputValue) {
    if (this.fileInputDirective) {
      this.fileInputDirective._fileValue = newValue;
    }
  }

  constructor(protected _changeDetectorRef: ChangeDetectorRef) {}

  ngAfterContentInit() {
    if (!this.fileInputDirective) {
      throw getMissingControlError();
    }

    // Forward state changes from the child input element.
    this.fileInputDirective.stateChanges
      .pipe(
        tap(() => this._changeDetectorRef.markForCheck()),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** Opens the native OS file picker. */
  @HostListener('keydown.code.enter')
  openFilePicker() {
    if (!this.disabled && this.fileInputDirective) {
      this.fileInputDirective.openFilePicker();
    }
  }

  /** Forwards styling property from control to host element. */
  _forwardProp(prop: keyof NgControl): boolean {
    return !!this.fileInputDirective?.ngControl?.[prop];
  }

  @HostListener('dragenter', ['$event'])
  _onDragEnter = (event: DragEvent) => {
    event?.preventDefault();
    this.dragover$.next(true);

    // Indicate to the Browser that files will be copied.
    if (event?.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  @HostListener('dragleave', ['$event'])
  _onDragLeave = (event: DragEvent) => {
    event?.preventDefault();
    this.dragover$.next(false);
  };

  @HostListener('drop', ['$event'])
  _onDrop = (event: DragEvent) => {
    this._onDragLeave(event);

    const files = this._getDroppedFiles(event);
    this.fileInputDirective?.handleFileDrop(files);
  };

  private _getDroppedFiles(event: DragEvent): File[] {
    if (event.dataTransfer?.items) {
      const files = Array.from(event.dataTransfer.items)
        .filter((item) => item.kind === 'file')
        .map((file) => file.getAsFile()!);

      return files;
    }

    // Fallback for older specifications
    return Array.from(event.dataTransfer?.files ?? []);
  }
}
