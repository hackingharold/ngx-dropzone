import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CdkModule } from 'cdk';
import { MatDropzone } from './mat-dropzone.component';

@NgModule({
  declarations: [MatDropzone],
  imports: [CdkModule, CommonModule],
  exports: [MatDropzone],
})
export class MaterialModule {}
