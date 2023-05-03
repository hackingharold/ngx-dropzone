import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CdkModule } from 'cdk';
import { MatDropzoneComponent } from './mat-dropzone.component';

@NgModule({
  declarations: [MatDropzoneComponent],
  imports: [CdkModule, CommonModule],
  exports: [MatDropzoneComponent],
})
export class MaterialModule {}
