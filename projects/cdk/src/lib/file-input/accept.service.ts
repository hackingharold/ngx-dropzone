import { Injectable } from '@angular/core';
import { FileInputValue } from './file-input-value';

@Injectable({
  providedIn: 'root',
})
export class AcceptService {
  /**
   * Returns `true` if all files match the provided `accept` parameter.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept)
   * for more information.
   */
  accepts(fileValue: FileInputValue, accept: string): boolean {
    if (!fileValue) {
      return false;
    }

    if (accept === '*') {
      return true;
    }

    const acceptedMimeTypes = this.parseAttribute(accept, (t) => this.isValidMimeType(t));
    const acceptedExtensions = this.parseAttribute(accept, (t) => this.isValidExtension(t));

    const fileList = Array.isArray(fileValue) ? fileValue : [fileValue];

    return fileList.every(
      (file) =>
        this.isAcceptedByExtension(file, acceptedExtensions) || this.isAcceptedByMimeType(file, acceptedMimeTypes)
    );
  }

  private isAcceptedByExtension(file: File, acceptedExtensions: string[]): boolean {
    return acceptedExtensions.some((ext) => file.name.endsWith(ext));
  }

  private isAcceptedByMimeType(file: File, acceptedMimeTypes: string[]): boolean {
    return acceptedMimeTypes.some((type) => {
      if (type === file.type) {
        return true;
      }

      const [media, sub] = type.split('/', 2);
      const fileMedia = file.type.split('/')[0];

      return sub === '*' && media === fileMedia;
    });
  }

  private parseAttribute(accept: string, predicate: (type: string) => boolean): string[] {
    if (!accept?.length) {
      return [];
    }

    return accept.split(',').reduce((types, type) => {
      const trimmedType = type.trim();
      if (trimmedType.length && predicate(trimmedType)) {
        types.push(trimmedType.toLowerCase());
      }
      return types;
    }, [] as string[]);
  }

  private isValidMimeType(type: string): boolean {
    const safeType = type || '';
    const slashPos = safeType.indexOf('/');

    if (slashPos <= 0 || slashPos === safeType.length - 1) {
      return false;
    }

    return Array.from(safeType).every((char, i) => this.isValidToken(char) || i === slashPos);
  }

  private isValidExtension(type: string): boolean {
    const safeType = type || '';
    return safeType.length >= 2 && safeType[0] === '.';
  }

  private isValidToken(char: string): boolean {
    const invalidChars = Array.from('" (),/:@[]{}');
    return this.isAscii(char) && !invalidChars.includes(char);
  }

  private isAscii(char: string): boolean {
    return (char || '').charCodeAt(0) < 127;
  }
}
