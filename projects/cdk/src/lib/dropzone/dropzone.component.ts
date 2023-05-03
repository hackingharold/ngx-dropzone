import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { startWith, takeUntil, tap } from 'rxjs/operators';
import { FileInputControl } from '../file-input/file-input-control';
import { getMissingControlError } from './dropzone-errors';

const dragOverClass = 'dragover';

@Component({
  selector: 'ngx-dropzone',
  exportAs: 'dropzone',
  template: `<ng-content></ng-content>`,
  host: {
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
  private _dropzone!: HTMLElement;
  private _destroy$ = new Subject();

  /** Emits when the dragover state changes. */
  protected _dragover$ = new BehaviorSubject<boolean>(false);

  @ContentChild(FileInputControl, { static: true })
  control: FileInputControl | null = null;

  /** Returns true when the contained input control is disabled. */
  get disabled(): boolean {
    return this.control?.disabled ?? false;
  }

  /** Returns true when the contained input control is focused. */
  get focused(): boolean {
    return this.control?.focused ?? false;
  }

  constructor(
    protected _ngZone: NgZone,
    protected _renderer: Renderer2,
    protected _elementRef: ElementRef<HTMLElement>,
    protected _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._dropzone = this._elementRef.nativeElement;

    // I found this to be the most performant way to register event listeners.
    this._ngZone.runOutsideAngular(() => {
      this._dropzone.addEventListener('dragenter', this.onDragEnter);
      this._dropzone.addEventListener('dragleave', this.onDragLeave);
      this._dropzone.addEventListener('drop', this.onDrop);
    });
  }

  ngAfterContentInit() {
    if (!this.control) {
      throw getMissingControlError();
    }

    // Update dropzone when control state changed.
    this.control.stateChanges
      .pipe(
        startWith(null),
        tap(() => this._changeDetectorRef.markForCheck()),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._dropzone.removeEventListener('dragenter', this.onDragEnter);
    this._dropzone.removeEventListener('dragleave', this.onDragLeave);
    this._dropzone.removeEventListener('drop', this.onDrop);

    this._destroy$.next();
    this._destroy$.complete();
  }

  /** Opens the native OS file picker. */
  openFilePicker() {
    if (!this.disabled && this.control) {
      this.control.openFilePicker();
    }
  }

  /** Forwards styling property from control to host element. */
  _forwardProp(prop: keyof NgControl): boolean {
    return !!this.control?.ngControl?.[prop];
  }

  private onDragEnter = (event: DragEvent) => {
    event?.preventDefault();

    this._dragover$.next(true);
    this._renderer.addClass(this._dropzone, dragOverClass);

    if (event?.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  private onDragLeave = (event: DragEvent) => {
    event?.preventDefault();

    this._dragover$.next(false);
    this._renderer.removeClass(this._dropzone, dragOverClass);
  };

  private onDrop = (event: DragEvent) => {
    this.onDragLeave(event);

    const files = this.getDroppedFiles(event);
    this.control?.handleFileDrop(files);
  };

  private getDroppedFiles(event: DragEvent): File[] {
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
