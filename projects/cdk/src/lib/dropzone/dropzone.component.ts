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

@Component({
  selector: 'ngx-dropzone',
  exportAs: 'dropzone',
  template: `<ng-content></ng-content>`,
  host: {
    tabindex: '0',
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
  protected _destroy$ = new Subject<void>();
  protected _changeDetectorRef = inject(ChangeDetectorRef);

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

  @Input() includeDirectories = false;

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
  _onDrop = async (event: DragEvent) => {
    this._onDragLeave(event);

    const files = await this._getDroppedFiles(event);
    this.fileInputDirective?.handleFileDrop(files);
  };

  private _readDirectoryEntries(reader: FileSystemDirectoryReader) {
    return new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(
        (entries) => resolve(entries),
        (error) => reject(error)
      );
    });
  }

  private async _breakDirectoryReaderFilesLimit(directoryEntry: FileSystemDirectoryEntry) {
    const reader = directoryEntry.createReader();
    let resultEntries: FileSystemEntry[] = [];

    const recurse = async () => {
      const entries = await this._readDirectoryEntries(reader);
      if ((entries).length > 0) {
        resultEntries = resultEntries.concat(entries);
        await recurse();
      }
    };

    await recurse();
    return resultEntries;
  }

  private async _getFileSystemFileEntries(fileSystemEntries: (FileSystemEntry | null)[]) {
    const recurse = async (entries: (FileSystemEntry | null)[]) => {
      const promises = entries.map(async (entry) => {
        if (entry?.isFile) {
          systemEntries.push(entry as FileSystemFileEntry);
        } else if (entry?.isDirectory) {
          return recurse(await this._breakDirectoryReaderFilesLimit(entry as FileSystemDirectoryEntry));
        }
        return;
      });

      await Promise.all(promises);
    };

    const systemEntries: FileSystemFileEntry[] = [];
    await recurse(fileSystemEntries);
    return systemEntries;
  }

  private async _getFileFromFileSystemFileEntry(fileSystemFileEntry: FileSystemFileEntry) {
    return new Promise<File>((resolve, reject) => {
      fileSystemFileEntry.file(
        (file) => resolve(file),
        (error) => reject(error)
      );
    });
  }

  private async _getFilesWebkitDataTransfer(items: DataTransferItemList) {
    const systemEntries = await this._getFileSystemFileEntries(Array.from(items).map((item) => item.webkitGetAsEntry()));
    const files = systemEntries.map(async (entry) => (await this._getFileFromFileSystemFileEntry(entry)));
    return Promise.all(files);
  }

  private _getFilesDataTransfer(items: DataTransferItemList) {
    return Array.from(items)
      .map((file) => file.getAsFile() as File)
      .filter((file) => file !== null);
  }

  private async _getDroppedFiles(event: DragEvent) {
    const items = event.dataTransfer?.items;

    if (items) {
      if (this.includeDirectories) {
        return (await this._getFilesWebkitDataTransfer(items));
      } else {
        return this._getFilesDataTransfer(items);
      }
    }

    // Fallback for older specifications
    return Array.from(event.dataTransfer?.files ?? []);
  }
}
