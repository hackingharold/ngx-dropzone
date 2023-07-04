import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CdkModule } from 'cdk';
import { MatDropzone } from './mat-dropzone.component';

@NgModule({
  declarations: [MatDropzone],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, CdkModule],
  exports: [MatDropzone],
})
export class MaterialModule {}
