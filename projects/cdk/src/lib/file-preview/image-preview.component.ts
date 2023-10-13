import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { getInvalidFileTypeError } from './file-preview-errors';
import { FilePreviewComponent } from './file-preview.component';

@Component({
  selector: 'ngx-dropzone-file-image-preview',
  exportAs: 'fileImagePreview',
  template: `<img [src]="imageSrc" />`,
  host: {
    tabindex: '0',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagePreviewComponent extends FilePreviewComponent implements OnInit {
  imageSrc = '';

  ngOnInit() {
    super.ngOnInit();

    if (this.file instanceof File) {
      this.imageSrc = URL.createObjectURL(this.file);
    } else if (typeof this.file === 'string') {
      this.imageSrc = this.file;
    } else {
      throw getInvalidFileTypeError();
    }
  }
}
