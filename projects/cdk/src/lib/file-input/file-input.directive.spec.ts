import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { getArrayValueError, getNonArrayValueError } from './file-input-errors';
import { FileInputValue } from './file-input-value';
import { FileInputDirective } from './file-input.directive';

interface Selectors<T> {
  fixture: ComponentFixture<T>;
  inputElement: DebugElement;
  fileInput: FileInputDirective;
}

/** Returns a simple fake file. */
const getFile = () => new File(['...'], `${Date.now()}.txt`);

const getFileList = (files: File[]): FileList => {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  return dt.files;
};

describe('FileInputDirective', () => {
  function configureFileInputTestingModule<T>(testComponent: Type<T>): Selectors<T> {
    const fixture = TestBed.configureTestingModule({
      imports: [testComponent],
    }).createComponent(testComponent);

    const inputElement = fixture.debugElement.query(By.directive(FileInputDirective));
    const fileInput = inputElement.injector.get(FileInputDirective);

    fixture.detectChanges();

    return { fixture, inputElement, fileInput };
  }

  describe('basic', () => {
    let selectors: Selectors<FileInputBasic>;

    beforeEach(waitForAsync(() => {
      selectors = configureFileInputTestingModule(FileInputBasic);
    }));

    it('should create file input element with directive', () => {
      expect(selectors.inputElement).toBeTruthy();
      expect(selectors.fileInput).toBeTruthy();
    });

    it('should return multiple=false by default', () => {
      expect(selectors.fileInput.multiple).toBeFalse();
    });

    it('should throw when not multiple array', () => {
      expect(() => {
        selectors.fileInput._fileValue = [getFile(), getFile()];
      }).toThrowError(getArrayValueError().message);
    });

    it('should handle selection using native change event', () => {
      const element = selectors.fileInput;
      const file = getFile();

      spyOn(element.selectionChange, 'emit');
      element._handleChange(getFileList([file]));

      expect(element.value).toEqual(file);
      expect(element.selectionChange.emit).toHaveBeenCalledWith(file);
    });

    it('should handle file drop', () => {
      const element = selectors.fileInput;
      const file = getFile();

      spyOn(element.selectionChange, 'emit');
      element.handleFileDrop([file]);

      expect(element.value).toEqual(file);
      expect(element.selectionChange.emit).toHaveBeenCalledWith(file);
    });

    it('should reset value on clear', () => {
      const element = selectors.fileInput;
      const file = getFile();

      element._fileValue = file;
      expect(element.value).toEqual(file);

      element.writeValue(null);
      expect(element.value).toBeNull();
    });

    it('should return the focused state correctly', () => {
      const element = selectors.fileInput;
      const input = selectors.inputElement.nativeElement as HTMLInputElement;
      expect(element.focused).toBeFalse();

      input.dispatchEvent(new Event('focus'));
      expect(element.focused).toBeTrue();

      input.dispatchEvent(new Event('blur'));
      expect(element.focused).toBeFalse();
    });

    it('should lose focus when disabled', () => {
      const element = selectors.fileInput;
      const input = selectors.inputElement.nativeElement as HTMLInputElement;
      expect(element.focused).toBeFalse();

      input.dispatchEvent(new Event('focus'));
      expect(element.focused).toBeTrue();

      element.disabled = true;
      expect(element.focused).toBeFalse();
    });
  });

  describe('multiple', () => {
    let selectors: Selectors<FileInputMultiple>;

    beforeEach(waitForAsync(() => {
      selectors = configureFileInputTestingModule(FileInputMultiple);
    }));

    it('should return multiple=true if set', () => {
      expect(selectors.fileInput.multiple).toBeTrue();
    });

    it('should update value and fire selectionChange', () => {
      const element = selectors.fileInput;
      const testFiles = [getFile(), getFile()];

      spyOn(element.selectionChange, 'emit');
      element.writeValue(testFiles);

      expect(element.value).toEqual(testFiles);
      expect(element.selectionChange.emit).toHaveBeenCalledWith(testFiles);
    });

    it('should throw when multiple non-array', () => {
      const element = selectors.fileInput;
      expect(() => {
        element._fileValue = getFile();
      }).toThrowError(getNonArrayValueError().message);
    });

    it('should return the empty state correctly', () => {
      const element = selectors.fileInput;
      expect(element.empty).toBeTrue();

      element._fileValue = [getFile(), getFile()];
      expect(element.empty).toBeFalse();
    });

    it('should handle multiple selection using native change event', () => {
      const element = selectors.fileInput;
      const files = [getFile(), getFile()];

      spyOn(element.selectionChange, 'emit');
      element._handleChange(getFileList(files));

      expect(element.value).toEqual(files);
      expect(element.selectionChange.emit).toHaveBeenCalledWith(files);
    });

    it('should handle file drop with multiple', () => {
      const element = selectors.fileInput;
      const files = [getFile(), getFile()];

      spyOn(element.selectionChange, 'emit');
      element.handleFileDrop(files);

      expect(element.value).toEqual(files);
      expect(element.selectionChange.emit).toHaveBeenCalledWith(files);
    });

    it('should replace value by default', () => {
      const element = selectors.fileInput;
      const files1 = [getFile(), getFile()];
      const files2 = [getFile(), getFile()];

      element.handleFileDrop(files1);
      expect(element.value).toEqual(files1);

      element.handleFileDrop(files2);
      expect(element.value).toEqual(files2);
    });

    it('should replace value with empty array', () => {
      const element = selectors.fileInput;
      const files = [getFile(), getFile()];

      element.handleFileDrop(files);
      expect(element.value).toEqual(files);

      element.handleFileDrop([]);
      expect(element.value).toEqual([]);
    });

    it('should reset multiple value when overriding value', () => {
      const element = selectors.fileInput;
      const files = [getFile(), getFile()];

      element.handleFileDrop(files);
      expect(element.value).toEqual(files);

      element.writeValue([]);
      expect(element.value).toEqual([]);
    });
  });

  describe('mode=append', () => {
    let selectors: Selectors<FileInputAppend>;

    beforeEach(waitForAsync(() => {
      selectors = configureFileInputTestingModule(FileInputAppend);
    }));

    it('should always replace value when not multiple', () => {
      const element = selectors.fileInput;
      const file = getFile();
      const file2 = getFile();

      element.handleFileDrop([file]);
      expect(element.value).toEqual(file);

      element.handleFileDrop([file2]);
      expect(element.value).toEqual(file2);
    });
  });

  describe('multiple and mode=append', () => {
    let selectors: Selectors<FileInputMultipleAppend>;

    beforeEach(waitForAsync(() => {
      selectors = configureFileInputTestingModule(FileInputMultipleAppend);
    }));

    it('should append value when mode is append', () => {
      const element = selectors.fileInput;
      const files1 = [getFile(), getFile()];
      const files2 = [getFile(), getFile()];

      element.handleFileDrop(files1);
      expect(element.value).toEqual(files1);

      element.handleFileDrop(files2);
      expect(element.value).toEqual([...files1, ...files2]);
    });
  });

  describe('form control', () => {
    let selectors: Selectors<FileInputWithFormControl>;

    beforeEach(waitForAsync(() => {
      selectors = configureFileInputTestingModule(FileInputWithFormControl);
    }));

    it('should return the error state correctly', () => {
      const element = selectors.fileInput;
      const formControl = selectors.inputElement.componentInstance.fileCtrl as FormControl<FileInputValue>;
      expect(formControl.touched).toBeFalse();
      expect(element.errorState).toBeFalse();

      formControl.markAsTouched();
      selectors.fixture.detectChanges();
      expect(formControl.touched).toBeTrue();
      expect(element.errorState).toBeTrue();
    });
  });

  describe('disabled', () => {
    let selectors: Selectors<FileInputDisabled>;

    beforeEach(waitForAsync(() => {
      selectors = configureFileInputTestingModule(FileInputDisabled);
    }));

    it('should return disabled state correctly', () => {
      const element = selectors.fileInput;
      expect(element.disabled).toBeTrue();

      expect(element.setDisabledState(false));
      expect(element.disabled).toBeFalse();
    });

    it('should not handle selection when disabled', () => {
      const element = selectors.fileInput;
      const file = getFile();

      spyOn(element.selectionChange, 'emit');
      element.handleFileDrop([file]);

      expect(element.value).toBeNull();
      expect(element.selectionChange.emit).not.toHaveBeenCalled();
    });
  });
});

@Component({
  imports: [FileInputDirective],
  template: `<input fileInput type="file" />`,
})
class FileInputBasic {}

@Component({
  imports: [FileInputDirective],
  template: `<input fileInput type="file" multiple />`,
})
class FileInputMultiple {}

@Component({
  imports: [FileInputDirective],
  // This combination is not valid! "Append" should only be used together with "multiple".
  template: `<input fileInput type="file" mode="append" />`,
})
class FileInputAppend {}

@Component({
  imports: [FileInputDirective],
  template: `<input fileInput type="file" multiple mode="append" />`,
})
class FileInputMultipleAppend {}

@Component({
  imports: [ReactiveFormsModule, FileInputDirective],
  template: `<input fileInput type="file" [formControl]="fileCtrl" />`,
})
class FileInputWithFormControl {
  fileCtrl = new FormControl<FileInputValue>(null, [Validators.required]);
}

@Component({
  imports: [ReactiveFormsModule, FileInputDirective],
  template: `<input fileInput type="file" disabled />`,
})
class FileInputDisabled {}
