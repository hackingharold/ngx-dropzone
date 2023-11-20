import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `<div class="app-container">
    <mat-form-field appearance="outline">
      <mat-label>Simple input</mat-label>
      <input matInput />
      <mat-icon matSuffix>cloud_upload</mat-icon>
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Drop only .jpeg files!</mat-label>
      <ngx-mat-dropzone>
        <input type="file" fileInput [formControl]="profileImg" accept="image/jpeg" />
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
        margin-top: 25vh;
      }
    `,
  ],
})
export class AppComponent {
  profileImg = new FormControl();
}
