import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `<div class="app-container">
    <mat-form-field appearance="outline">
      <mat-label>Drop only .png files!</mat-label>
      <ngx-mat-dropzone>
        <input type="file" fileInput mode="replace" multiple [formControl]="profileImg" accept="image/png" />

        @for (image of images; track image.name) {
        <mat-chip-row (removed)="remove(image)">
          {{ image.name }}
          <button matChipRemove>
            <mat-icon>cancel</mat-icon>
          </button>
        </mat-chip-row>
        }
      </ngx-mat-dropzone>
      <mat-icon matSuffix>cloud_upload</mat-icon>
      <mat-error>Only image files allowed!</mat-error>
    </mat-form-field>

    <div style="width: 40px"></div>

    <mat-form-field appearance="fill">
      <mat-label>Drop anything!</mat-label>
      <ngx-mat-dropzone>
        <input type="file" fileInput />
      </ngx-mat-dropzone>
    </mat-form-field>
  </div>`,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20vh;
      }

      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class AppComponent {
  profileImg = new FormControl();

  get images() {
    const images = this.profileImg.value;

    if (!images) return [];
    return Array.isArray(images) ? images : [images];
  }

  remove(image: File) {
    if (Array.isArray(this.profileImg.value)) {
      this.profileImg.setValue(this.profileImg.value.filter((i) => i !== image));
      return;
    }

    this.profileImg.setValue(null);
  }
}
