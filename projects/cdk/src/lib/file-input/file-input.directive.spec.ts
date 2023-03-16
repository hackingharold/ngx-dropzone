import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FileInputDirective } from './file-input.directive';
import { getArrayValueError, getNonArrayValueError } from './file-input-errors';

@Component({
  template: `
    <input type="file" />
    <input fileInput type="file" [formControl]="fileCtrl" />
    <input fileInput type="file" multiple />
    <input fileInput type="file" disabled />
  `
})
class TestComponent {
  fileCtrl = new FormControl(null, [Validators.required]);
}

/** Returns a simple fake file. */
const getFile = () => new File(['...'], `${Date.now()}.txt`);

const getFileList = (files: File[]): FileList => {
  const dt = new DataTransfer();
  files.forEach(f => dt.items.add(f));
  return dt.files;
};

describe('FileInputDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let elements: DebugElement[];

  const getElement = (index: number) => elements[index].injector.get(FileInputDirective);

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [FileInputDirective, TestComponent],
    }).createComponent(TestComponent);

    fixture.detectChanges();
    elements = fixture.debugElement.queryAll(By.directive(FileInputDirective));
  });

  it('should create test elements', () => {
    expect(elements.length).toBe(3);
  });

  it('should return multiple property correctly', () => {
    [0, 1].forEach(i => {
      const element = getElement(i);
      expect(element.multiple).toBe(!!i);
    })
  });

  it('should update value and fire selectionChange', () => {
    const element = getElement(1);
    const testFiles = [getFile(), getFile()];

    spyOn(element.selectionChange, 'emit');
    element.writeValue(testFiles);

    expect(element.value).toEqual(testFiles);
    expect(element.selectionChange.emit).toHaveBeenCalledWith(testFiles);
  });

  it('should throw when not multiple array', () => {
    const element = getElement(0);
    expect(() => {
      element._fileValue = [getFile(), getFile()];
    }).toThrowError(getArrayValueError().message);
  });

  it('should throw when multiple non-array', () => {
    const element = getElement(1);
    expect(() => {
      element._fileValue = getFile();
    }).toThrowError(getNonArrayValueError().message);
  });

  it('should handle selection using native change event', () => {
    const element = getElement(0);
    const file = getFile();

    spyOn(element.selectionChange, 'emit');
    element._handleChange(getFileList([file]));

    expect(element.value).toEqual(file);
    expect(element.selectionChange.emit).toHaveBeenCalledWith(file);
  });

  it('should handle multiple selection using native change event', () => {
    const element = getElement(1);
    const files = [getFile(), getFile()];

    spyOn(element.selectionChange, 'emit');
    element._handleChange(getFileList(files));

    expect(element.value).toEqual(files);
    expect(element.selectionChange.emit).toHaveBeenCalledWith(files);
  });

  it('should handle file drop', () => {
    const element = getElement(0);
    const file = getFile();

    spyOn(element.selectionChange, 'emit');
    element.handleFileDrop([file]);

    expect(element.value).toEqual(file);
    expect(element.selectionChange.emit).toHaveBeenCalledWith(file);
  });

  it('should handle file drop with multiple', () => {
    const element = getElement(1);
    const files = [getFile(), getFile()];

    spyOn(element.selectionChange, 'emit');
    element.handleFileDrop(files);

    expect(element.value).toEqual(files);
    expect(element.selectionChange.emit).toHaveBeenCalledWith(files);
  });

  it('should return disabled state correctly', () => {
    const element = getElement(2);
    expect(element.disabled).toBeTrue();

    expect(element.setDisabledState(false));
    expect(element.disabled).toBeFalse();
  });

  it('should return the error state correctly', () => {
    const element = getElement(0);
    const formControl = elements[0].componentInstance.fileCtrl as FormControl;
    expect(formControl.touched).toBeFalse();
    expect(element.errorState).toBeFalse();

    formControl.markAsTouched();
    fixture.detectChanges();
    expect(formControl.touched).toBeTrue();
    expect(element.errorState).toBeTrue();
  });

  it('should return the focused state correctly', () => {
    const element = getElement(0);
    const input = elements[0].nativeElement as HTMLInputElement;
    expect(element.focused).toBeFalse();

    input.dispatchEvent(new Event('focus'));
    expect(element.focused).toBeTrue();

    input.dispatchEvent(new Event('blur'));
    expect(element.focused).toBeFalse();
  });

  it('should lose focus when disabled', () => {
    const element = getElement(0);
    const input = elements[0].nativeElement as HTMLInputElement;
    expect(element.focused).toBeFalse();

    input.dispatchEvent(new Event('focus'));
    expect(element.focused).toBeTrue();

    element.disabled = true;
    expect(element.focused).toBeFalse();
  });

  it('should return the empty state correctly', () => {
    const element = getElement(1);
    expect(element.empty).toBeTrue();

    element._fileValue = [getFile(), getFile()];
    expect(element.empty).toBeFalse();
  });
});
