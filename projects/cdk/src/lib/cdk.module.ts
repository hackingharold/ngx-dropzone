import { NgModule } from '@angular/core';
import { FileInputDirective } from './file-input';

@NgModule({
  declarations: [
    FileInputDirective,
  ],
  exports: [
    FileInputDirective,
  ]
})
export class CdkModule { }
