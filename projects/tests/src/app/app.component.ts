import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: `
    <mat-form-field appearance="outline">
      <ngx-mat-dropzone>
        <mat-label>Drop it!</mat-label>
        <input type="file" fileInput formControlName="profileImg" accepts="image/jpeg" />
      </ngx-mat-dropzone>
      <mat-error>Invalid file!</mat-error>
    </mat-form-field>

    <div style="width: 40px"></div>

    <mat-form-field appearance="fill">
      <ngx-mat-dropzone>
        <mat-label>Drop it!</mat-label>
        <input type="file" fileInput />
      </ngx-mat-dropzone>
    </mat-form-field>`,
  template: `app works!.`,
})
export class AppComponent {
  profileImg = new FormControl();
}
