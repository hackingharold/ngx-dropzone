import { NgModule } from '@angular/core';
import { DropzoneComponent } from './dropzone';
import { FileInputDirective } from './file-input';

@NgModule({
  declarations: [FileInputDirective, DropzoneComponent],
  exports: [FileInputDirective, DropzoneComponent],
})
export class DropzoneCdkModule {}
