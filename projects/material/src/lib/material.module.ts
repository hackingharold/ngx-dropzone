import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { DropzoneCdkModule } from '@ngx-dropzone/cdk';
import { MatDropzone } from './mat-dropzone/mat-dropzone.component';

@NgModule({
  declarations: [MatDropzone],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatChipsModule, MatIconModule, DropzoneCdkModule],
  exports: [MatDropzone],
})
export class DropzoneMaterialModule {}
