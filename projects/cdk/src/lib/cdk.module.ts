import { NgModule } from '@angular/core';
import { DropzoneComponent } from './dropzone';
import { FileInputDirective } from './file-input';
import { FilePreviewComponent } from './file-preview';

@NgModule({
  declarations: [FileInputDirective, DropzoneComponent, FilePreviewComponent],
  exports: [FileInputDirective, DropzoneComponent, FilePreviewComponent],
})
export class DropzoneCdkModule {}
