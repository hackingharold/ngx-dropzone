import { Injectable } from '@angular/core';
import { nonNullable } from '../coercion';
import { File } from './../file-input';

@Injectable({
  providedIn: 'root',
})
export class DropzoneService {
  /**
   * Returns a `File[]` from a `DragEvent`. Accepts a list of files or folders.
   */
  async getFiles(event: DragEvent): Promise<File[]> {
    if (!event.dataTransfer?.items) {
      // Fallback for older specifications
      return Array.from(event.dataTransfer?.files ?? []);
    }

    const fsEntries = Array.from(event.dataTransfer?.items ?? [])
      .map((item) => this._toFileSystemEntry(item))
      .map((entry) => this._getFilesFromEntry(entry))
      .filter(nonNullable);

    const files: File[][] = await Promise.all(fsEntries);
    return this._flattenFiles(files);
  }

  private _toFileSystemEntry(item: DataTransferItem): FileSystemEntry | File | null {
    // In the future, we can use the `getAsEntry` method when it becomes available.
    if ('getAsEntry' in item && typeof item.getAsEntry === 'function') {
      return item.getAsEntry();
    }

    // If supported, use the `webkitGetAsEntry` method to allow folder drops.
    // As a fallback, use the well-supported `getAsFile` method.
    return item.webkitGetAsEntry() || item.getAsFile();
  }

  private async _getFilesFromEntry(entry: FileSystemEntry | File | null): Promise<File[]> {
    if (!entry) return [];

    if (entry instanceof File) {
      return [entry];
    }

    if (this._isFile(entry)) {
      const file = await this._readFilePromise(entry);

      // Manually set the `relativePath` property for dropped files.
      file.relativePath = entry.fullPath?.slice(1) ?? '';

      return [file];
    }

    if (this._isDirectory(entry)) {
      const entries = await this._readDirectoryWithoutLimit(entry);
      const children = entries.map((e) => this._getFilesFromEntry(e));

      const files = await Promise.all(children);
      return this._flattenFiles(files);
    }

    return [];
  }

  /**
   * In Chrome >= 77, the `readEntries` method returns only 100 files.
   * To achieve a consistent behavior across browsers and not restrict user interaction,
   * we break the limit by recursively calling `readEntries`.
   */
  private async _readDirectoryWithoutLimit(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
    const reader = entry.createReader();
    let entries: FileSystemEntry[] = [];

    const readEntries = async () => {
      const children = await this._readDirectoryPromise(reader);

      if (children.length) {
        entries = entries.concat(children);
        await readEntries();
      }
    };

    await readEntries();
    return entries;
  }

  private _isFile = (item: FileSystemEntry): item is FileSystemFileEntry => item.isFile;
  private _isDirectory = (item: FileSystemEntry): item is FileSystemDirectoryEntry => item.isDirectory;
  private _flattenFiles = (files: File[][]) => ([] as File[]).concat(...files);

  private _readFilePromise(entry: FileSystemFileEntry) {
    return new Promise<File>((resolve) => {
      entry.file((file) => resolve(file));
    });
  }

  private _readDirectoryPromise(reader: FileSystemDirectoryReader) {
    return new Promise<FileSystemEntry[]>((resolve) => {
      reader.readEntries((entries) => resolve(entries));
    });
  }
}
