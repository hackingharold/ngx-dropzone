import { CommonModule } from '@angular/common';
import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatChipRemove, MatChipRow, MatChipsModule } from '@angular/material/chips';
import { MatError, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileInputDirective, FileInputValidators, FileInputValue } from '@ngx-dropzone/cdk';
import { MatDropzone } from './mat-dropzone.component';

interface Selectors<T> {
  fixture: ComponentFixture<T>;
  element: DebugElement;
  inputElement: DebugElement;
  component: MatDropzone;
  fileInput: FileInputDirective;
}

/**
 * Since the mat-dropzone extends the cdk dropzone,
 * we only need to test the new functionality.
 */
describe('MatDropzone', () => {
  function configureDropzoneTestingModule<T>(testComponent: Type<T>): Selectors<T> {
    const fixture = TestBed.configureTestingModule({
      imports: [CommonModule, BrowserAnimationsModule, testComponent],
    }).createComponent(testComponent);

    const element = fixture.debugElement.query(By.directive(MatDropzone));
    const component = element.componentInstance;

    const inputElement = fixture.debugElement.query(By.directive(FileInputDirective));
    const fileInput = inputElement.injector.get(FileInputDirective);

    fixture.detectChanges();

    return {
      fixture,
      element,
      component,
      inputElement,
      fileInput,
    };
  }

  describe('basic', () => {
    let selectors: Selectors<DropzoneBasic>;

    beforeEach(waitForAsync(() => {
      selectors = configureDropzoneTestingModule(DropzoneBasic);
    }));

    it('should render material dropzone component', () => {
      expect(selectors.component).toBeTruthy();
      expect(selectors.fileInput).toBeTruthy();
    });

    it('should render placeholder text', () => {
      const label = selectors.fixture.debugElement.query(By.directive(MatLabel)).nativeElement.textContent;
      expect(label).toBe('Drop it basic!');
    });

    it('should have required attribute', () => {
      expect(selectors.component.required).toBeTrue();
      expect(selectors.element.attributes['aria-required']).toBeDefined();
      expect(selectors.element.attributes['aria-invalid']).toBeUndefined();
    });

    it('should open file picker on click', () => {
      spyOn(selectors.component, 'openFilePicker').and.callThrough();

      const formField = selectors.fixture.debugElement.query(By.css('.mdc-text-field'));
      formField.nativeElement.click();

      expect(selectors.component.openFilePicker).toHaveBeenCalled();
    });
  });

  describe('form control', () => {
    let selectors: Selectors<DropzoneWithFormControl>;

    beforeEach(waitForAsync(() => {
      selectors = configureDropzoneTestingModule(DropzoneWithFormControl);
    }));

    it('should render chip', () => {
      const validFile = new File(['...'], `my-file.png`);
      selectors.fileInput.ngControl?.control?.setValue(validFile);
      selectors.fileInput.ngControl?.control?.markAsDirty(); // simulate user UI action
      selectors.fixture.detectChanges();

      const matChip = selectors.fixture.debugElement.query(By.directive(MatChipRow));
      expect(matChip).toBeTruthy();

      matChip.query(By.directive(MatChipRemove)).nativeElement.click();
      selectors.fixture.detectChanges();

      const noChip = selectors.fixture.debugElement.query(By.directive(MatChipRow));
      expect(noChip).toBeFalsy();
    });

    it('should render error state', () => {
      const invalidFile = new File(['...'], `${Date.now()}.pdf`);
      selectors.fileInput.ngControl?.control?.setValue(invalidFile);
      selectors.fileInput.ngControl?.control?.markAsDirty(); // simulate user UI action
      selectors.fixture.detectChanges();

      expect(selectors.element.attributes['aria-invalid']).toBe('true');

      const matError = selectors.fixture.debugElement.query(By.directive(MatError));
      const error = matError.nativeElement.textContent;
      expect(error).toBe('Invalid file type!');
    });
  });
});

@Component({
  selector: 'basic-dropzone',
  imports: [MatFormFieldModule, MatDropzone, FileInputDirective],
  template: `
    <mat-form-field>
      <mat-label>Drop it basic!</mat-label>
      <ngx-mat-dropzone required>
        <input type="file" fileInput />
      </ngx-mat-dropzone>
    </mat-form-field>
  `,
})
class DropzoneBasic {}

@Component({
  selector: 'form-control-dropzone',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatChipsModule, MatDropzone, FileInputDirective],
  template: `
    <mat-form-field>
      <ngx-mat-dropzone>
        <input type="file" fileInput [formControl]="control" />
        @if (control.value) {
        <mat-chip-row (removed)="clear()">
          {{ control.value.name }}
          <button matChipRemove>
            <mat-icon>cancel</mat-icon>
          </button>
        </mat-chip-row>
        }
      </ngx-mat-dropzone>
      <mat-error>Invalid file type!</mat-error>
    </mat-form-field>
  `,
})
class DropzoneWithFormControl {
  validators = [FileInputValidators.accept('image/*')];
  control = new FormControl<FileInputValue>(null, this.validators);

  clear() {
    this.control.setValue(null);
  }
}
