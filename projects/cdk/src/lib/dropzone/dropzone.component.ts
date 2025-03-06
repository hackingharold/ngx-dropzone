import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  HostBinding,
  HostListener,
  inject,
  Input,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil, tap } from 'rxjs';
import { FileInputDirective, FileInputValue } from './../file-input';
import { getMissingControlError } from './dropzone-errors';
import { DropzoneService } from './dropzone.service';

@Component({
  selector: 'ngx-dropzone',
  exportAs: 'dropzone',
  imports: [FileInputDirective],
  providers: [DropzoneService],
  template: `<ng-content></ng-content>`,
  host: {
    tabindex: '0',
    '[class.ng-untouched]': '_forwardProp("untouched")',
    '[class.ng-touched]': '_forwardProp("touched")',
    '[class.ng-pristine]': '_forwardProp("pristine")',
    '[class.ng-dirty]': '_forwardProp("dirty")',
    '[class.ng-valid]': '_forwardProp("valid")',
    '[class.ng-invalid]': '_forwardProp("invalid")',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropzoneComponent implements AfterContentInit, OnDestroy {
  protected _destroy$ = new Subject<void>();
  protected _changeDetectorRef = inject(ChangeDetectorRef);
  protected _dropzoneService = inject(DropzoneService);

  @ContentChild(FileInputDirective, { static: true })
  readonly fileInputDirective: FileInputDirective | null = null;

  readonly dragover$ = new BehaviorSubject<boolean>(false);

  @HostBinding('class.dragover')
  get isDragover() {
    return this.dragover$.value;
  }

  @HostBinding('class.disabled')
  get disabled(): boolean {
    return this.fileInputDirective?.disabled || false;
  }

  @HostBinding('class.focused')
  get focused(): boolean {
    return this.fileInputDirective?.focused || this.isDragover;
  }

  @HostBinding('attr.aria-invalid')
  get errorState() {
    return this.fileInputDirective?.errorState || false;
  }

  @Input()
  get value() {
    return this.fileInputDirective?.value || null;
  }
  set value(newValue: FileInputValue) {
    if (this.fileInputDirective) {
      this.fileInputDirective._fileValue = newValue;
    }
  }

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

  @HostListener('dragover', ['$event'])
  _onDragOver = (event: DragEvent) => {
    event?.preventDefault();
  };

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
  _onDrop = async (event: DragEvent) => {
    this._onDragLeave(event);

    const files = await this._dropzoneService.getFiles(event);
    this.fileInputDirective?.handleFileDrop(files);
  };
}
