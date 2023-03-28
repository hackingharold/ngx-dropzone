import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CdkModule } from 'cdk';
import { MaterialModule } from 'material';

const fixture = `
  <mat-form-field appearance="fill">
    <mat-label>Input</mat-label>
    <input matInput />
  </mat-form-field>
`;

const modules = [BrowserModule, BrowserAnimationsModule, MatFormFieldModule, MatInputModule, CdkModule, MaterialModule];

describe('Material Library', () => {
  it('mounts', () => {
    cy.mount(fixture, {
      imports: modules,
    });
    cy.contains('Input');
  });
});
