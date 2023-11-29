import { Injectable } from '@angular/core';
import { nonNullable } from '../coercion';

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
      .filter(nonNullable)
      .map((entry) => this._getFilesFromEntry(entry));

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

  private _getFilesFromEntry(entry: FileSystemEntry | File): Promise<File[]> {
    return new Promise<File[]>((resolve) => {
      if (entry instanceof File) {
        return resolve([entry]);
      }

      if (this._isFile(entry)) {
        return entry.file((f) => resolve([f]));
      }

      if (this._isDirectory(entry)) {
        const reader = entry.createReader();

        reader.readEntries(async (entries) => {
          const children = entries.map((e) => this._getFilesFromEntry(e));
          const files = await Promise.all(children);

          return resolve(this._flattenFiles(files));
        });
      }
    });
  }

  private _isFile = (item: FileSystemEntry): item is FileSystemFileEntry => item.isFile;
  private _isDirectory = (item: FileSystemEntry): item is FileSystemDirectoryEntry => item.isDirectory;
  private _flattenFiles = (files: File[][]) => ([] as File[]).concat(...files);
}
