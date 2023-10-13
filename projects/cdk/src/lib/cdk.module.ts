import { NgModule } from '@angular/core';
import { DropzoneComponent } from './dropzone';
import { FileInputDirective } from './file-input';
import { FilePreviewComponent, ImagePreviewComponent } from './file-preview';

@NgModule({
  declarations: [FileInputDirective, DropzoneComponent, FilePreviewComponent, ImagePreviewComponent],
  exports: [FileInputDirective, DropzoneComponent, FilePreviewComponent, ImagePreviewComponent],
})
export class DropzoneCdkModule {}
