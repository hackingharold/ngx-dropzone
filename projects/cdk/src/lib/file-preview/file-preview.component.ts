import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { getInvalidFileTypeError, getMissingInputError } from './file-preview-errors';

@Component({
  selector: 'ngx-dropzone-file-preview',
  exportAs: 'filePreview',
  template: `<div>{{ fileInfo.name }}</div>`,
  host: {
    tabindex: '0',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePreviewComponent implements OnInit {
  fileInfo = {
    name: '',
    extension: '',
  };

  @Input()
  file: File | string | null = null;

  /** Event emitted to signalize the file should be removed. */
  @Output() readonly remove = new EventEmitter<void>();

  ngOnInit() {
    if (!this.file) {
      throw getMissingInputError();
    }

    if (typeof this.file === 'string') {
      this.fileInfo = {
        name: this.file.split('/').pop() || '',
        extension: this.file.split('.').pop() || '',
      };

      return;
    }

    if (this.file instanceof File) {
      this.fileInfo = {
        name: this.file.name,
        extension: this.file.name.split('.').pop() || '',
      };

      return;
    }

    throw getInvalidFileTypeError();
  }

  @HostListener('keydown.code.backspace')
  @HostListener('keydown.code.delete')
  @HostListener('keydown.code.clear')
  triggerFilePreviewRemoveEvent() {
    this.remove.emit();
  }
}
