import { NgModule } from '@angular/core';
import { DropzoneComponent } from './dropzone';
import { FileInputDirective } from './file-input';
import { FileImagePreviewComponent, FilePreviewComponent } from './file-preview';

@NgModule({
  declarations: [FileInputDirective, DropzoneComponent, FilePreviewComponent, FileImagePreviewComponent],
  exports: [FileInputDirective, DropzoneComponent, FilePreviewComponent, FileImagePreviewComponent],
})
export class DropzoneCdkModule {}
