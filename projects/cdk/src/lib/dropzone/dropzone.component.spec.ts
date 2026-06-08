import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FileInputDirective, FileInputValidators, FileInputValue } from '../file-input';
import { DropzoneComponent } from './dropzone.component';

interface Selectors<T> {
  fixture: ComponentFixture<T>;
  element: DebugElement;
  inputElement: DebugElement;
  component: DropzoneComponent;
  fileInput: FileInputDirective;
}

describe('DropzoneComponent', () => {
  function configureDropzoneTestingModule<T>(testComponent: Type<T>): Selectors<T> {
    const fixture = TestBed.configureTestingModule({
      imports: [testComponent],
    }).createComponent(testComponent);

    const element = fixture.debugElement.query(By.directive(DropzoneComponent));
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

    it('should create component with file input child', () => {
      expect(selectors.component).toBeTruthy();
      expect(selectors.fileInput).toBeTruthy();
    });

    it('should forward the focused property', () => {
      expect(selectors.fileInput.focused).toBeFalse();
      expect(selectors.component.focused).toBeFalse();

      selectors.inputElement.nativeElement.dispatchEvent(new Event('focus'));
      selectors.fixture.detectChanges();

      expect(selectors.component.focused).toBeTrue();
      expect(selectors.element.nativeElement.classList).toContain('focused');
    });

    it('should add and remove "dragover" class', () => {
      const dragEnter = new DragEvent('dragenter');
      const dragLeave = new DragEvent('dragleave');

      expect(selectors.element.nativeElement.classList).not.toContain('dragover');

      selectors.element.nativeElement.dispatchEvent(dragEnter);
      selectors.fixture.detectChanges();
      expect(selectors.element.nativeElement.classList).toContain('dragover');

      selectors.element.nativeElement.dispatchEvent(dragLeave);
      selectors.fixture.detectChanges();
      expect(selectors.element.nativeElement.classList).not.toContain('dragover');
    });

    it('should open native file picker on keyboard press', () => {
      spyOn(selectors.component, 'openFilePicker').and.callThrough();

      selectors.element.nativeElement.dispatchEvent(new Event('focus'));
      selectors.element.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));

      selectors.fixture.detectChanges();
      expect(selectors.component.openFilePicker).toHaveBeenCalled();
    });
  });

  describe('form control', () => {
    let selectors: Selectors<DropzoneWithFormControl>;

    beforeEach(waitForAsync(() => {
      selectors = configureDropzoneTestingModule(DropzoneWithFormControl);
    }));

    it('should forward the disabled property', () => {
      expect(selectors.fileInput.disabled).toBeFalse();
      expect(selectors.component.disabled).toBeFalse();

      selectors.fileInput.ngControl?.control?.disable();
      selectors.fixture.detectChanges();

      expect(selectors.component.disabled).toBeTrue();
      expect(selectors.element.nativeElement.classList).toContain('disabled');
    });

    it('should update form control value after file drop', async () => {
      const dataTransfer = new DataTransfer();
      const getFile = () => new File(['...'], `${Date.now()}.txt`);
      [getFile(), getFile(), getFile()].forEach((f) => dataTransfer.items.add(f));

      const drop = new DragEvent('drop', { dataTransfer });

      // We directly call the internal method `_onDrop` instead of
      // dispatching the event because we have to await it to complete.
      await selectors.component._onDrop(drop);
      selectors.fixture.detectChanges();

      expect(selectors.element.nativeElement.classList).not.toContain('dragover');
      expect((selectors.fileInput.value as File[]).length).toEqual(3);
    });

    it('should apply form control state classes', () => {
      const nativeElement = selectors.element.nativeElement;

      expect(nativeElement.classList).toContain('ng-pristine');
      expect(nativeElement.classList).toContain('ng-untouched');
      expect(nativeElement.classList).toContain('ng-valid');
      expect(nativeElement.classList).not.toContain('ng-dirty');
      expect(nativeElement.classList).not.toContain('ng-touched');
      expect(nativeElement.classList).not.toContain('ng-invalid');

      const invalidFile = new File(['...'], `${Date.now()}.txt`);
      selectors.fileInput.ngControl?.control?.setValue([invalidFile]);
      selectors.fileInput.ngControl?.control?.markAsDirty(); // simulate user UI action
      selectors.fixture.detectChanges();

      expect(nativeElement.classList).not.toContain('ng-pristine');
      expect(nativeElement.classList).not.toContain('ng-untouched');
      expect(nativeElement.classList).not.toContain('ng-valid');
      expect(nativeElement.classList).toContain('ng-dirty');
      expect(nativeElement.classList).toContain('ng-touched');
      expect(nativeElement.classList).toContain('ng-invalid');
    });
  });
});

@Component({
  selector: 'basic-dropzone',
  imports: [DropzoneComponent, FileInputDirective],
  template: `
    <ngx-dropzone>
      <input type="file" fileInput />
    </ngx-dropzone>
  `,
})
class DropzoneBasic {}

@Component({
  selector: 'form-control-dropzone',
  imports: [ReactiveFormsModule, DropzoneComponent, FileInputDirective],
  template: `
    <ngx-dropzone>
      <input type="file" fileInput [formControl]="fileCtrl" multiple />
    </ngx-dropzone>
  `,
})
class DropzoneWithFormControl {
  fileCtrl = new FormControl<FileInputValue>(null, [FileInputValidators.minSize(200)]);
}
