import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `<div class="app-container">
    <mat-form-field appearance="outline">
      <ngx-mat-dropzone>
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <input type="file" fileInput [formControl]="profileImg" accept="image/jpeg" />
      </ngx-mat-dropzone>
      <mat-error>Only image files allowed!</mat-error>
    </mat-form-field>

    <div style="width: 40px"></div>

    <mat-form-field appearance="fill">
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
        margin-top: 25vh;
      }

      mat-icon {
        display: block;
        margin: 0 auto;
      }
    `,
  ],
})
export class AppComponent {
  profileImg = new FormControl();
}
