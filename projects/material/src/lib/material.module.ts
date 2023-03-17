import { NgModule } from '@angular/core';
import { CdkModule } from 'cdk';
import { MatDropzoneComponent } from './mat-dropzone.component';

@NgModule({
  declarations: [MatDropzoneComponent],
  imports: [CdkModule],
  exports: [MatDropzoneComponent],
})
export class MaterialModule {}
