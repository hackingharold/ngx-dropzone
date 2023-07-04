import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CdkModule } from 'cdk';
import { MaterialModule } from 'material';

const fixture = `
    <mat-form-field appearance="outline">
      <ngx-mat-dropzone required>
        <input type="file" fileInput accepts="image/jpeg" />
      </ngx-mat-dropzone>
      <mat-error>Invalid file!</mat-error>
    </mat-form-field>

    <div style="width: 40px"></div>

    <mat-form-field appearance="fill">
      <ngx-mat-dropzone>
        <input type="file" fileInput />
      </ngx-mat-dropzone>
    </mat-form-field>
`;

const fixtureDisabled = `
  <mat-form-field>
  <ngx-mat-dropzone>
      <mat-label>Drop it!</mat-label>
      <input type="file" fileInput disabled />
    </ngx-mat-dropzone>
  </mat-form-field>
`;

const modules = [
  BrowserModule,
  BrowserAnimationsModule,
  ReactiveFormsModule,
  MatFormFieldModule,
  MatInputModule,
  CdkModule,
  MaterialModule,
];

describe('Material Library', () => {
  it('disables', () => {
    cy.mount(fixtureDisabled, {
      imports: modules,
    });
    cy.contains('Drop it!');
  });

  it('mounts', () => {
    cy.mount(fixture, {
      imports: modules,
    });
    cy.contains('Drop it!');
  });
});
