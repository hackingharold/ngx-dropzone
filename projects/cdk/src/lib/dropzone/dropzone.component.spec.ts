import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DropzoneComponent } from '.';
import { FileInputDirective, FileInputValidators, FileInputValue } from '../file-input';

@Component({
  template: `
    <ngx-dropzone>
      <input fileInput type="file" [formControl]="fileCtrl" multiple />
    </ngx-dropzone>
  `,
})
class TestComponent {
  fileCtrl = new FormControl<FileInputValue>(null, [FileInputValidators.minSize(200)]);
}

describe('DropzoneComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: DebugElement;
  let component: DropzoneComponent;
  let inputElement: DebugElement;
  let fileInput: FileInputDirective;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DropzoneComponent, FileInputDirective, TestComponent],
    }).createComponent(TestComponent);

    element = fixture.debugElement.query(By.directive(DropzoneComponent));
    component = element.componentInstance;

    inputElement = fixture.debugElement.query(By.directive(FileInputDirective));
    fileInput = inputElement.injector.get(FileInputDirective);

    fixture.detectChanges();
  });

  it('should create component with file input control child', () => {
    expect(component?.fileInputDirective).toBeTruthy();
    expect(fileInput?.ngControl).toBeTruthy();
  });

  it('should forward the disabled property', () => {
    expect(fileInput.disabled).toBeFalse();
    expect(component.disabled).toBeFalse();

    fileInput.ngControl?.control?.disable();
    fixture.detectChanges();

    expect(component.disabled).toBeTrue();
    expect(element.nativeElement.classList).toContain('disabled');
  });

  it('should forward the focused property', () => {
    expect(fileInput.focused).toBeFalse();
    expect(component.focused).toBeFalse();

    inputElement.nativeElement.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(component.focused).toBeTrue();
    expect(element.nativeElement.classList).toContain('focused');
  });

  it('should apply form control state classes', () => {
    expect(element.nativeElement.classList).toContain('ng-pristine');
    expect(element.nativeElement.classList).toContain('ng-untouched');
    expect(element.nativeElement.classList).toContain('ng-valid');
    expect(element.nativeElement.classList).not.toContain('ng-dirty');
    expect(element.nativeElement.classList).not.toContain('ng-touched');
    expect(element.nativeElement.classList).not.toContain('ng-invalid');

    const invalidFile = new File(['...'], `${Date.now()}.txt`);
    fileInput.ngControl?.control?.setValue([invalidFile]);
    fileInput.ngControl?.control?.markAsDirty(); // simulate user UI action
    fixture.detectChanges();

    expect(element.nativeElement.classList).not.toContain('ng-pristine');
    expect(element.nativeElement.classList).not.toContain('ng-untouched');
    expect(element.nativeElement.classList).not.toContain('ng-valid');
    expect(element.nativeElement.classList).toContain('ng-dirty');
    expect(element.nativeElement.classList).toContain('ng-touched');
    expect(element.nativeElement.classList).toContain('ng-invalid');
  });

  it('should add and remove "dragover" class', () => {
    const dragEnter = new DragEvent('dragenter');
    const dragLeave = new DragEvent('dragleave');

    expect(element.nativeElement.classList).not.toContain('dragover');

    element.nativeElement.dispatchEvent(dragEnter);
    fixture.detectChanges();
    expect(element.nativeElement.classList).toContain('dragover');

    element.nativeElement.dispatchEvent(dragLeave);
    fixture.detectChanges();
    expect(element.nativeElement.classList).not.toContain('dragover');
  });

  it('should update form control value after file drop', () => {
    const dragEnter = new DragEvent('dragenter');

    // Create fake file data transfer object.
    const dt = new DataTransfer();
    const getFile = () => new File(['...'], `${Date.now()}.txt`);
    [getFile(), getFile(), getFile()].forEach((f) => dt.items.add(f));

    const drop = new DragEvent('drop', { dataTransfer: dt });

    element.nativeElement.dispatchEvent(dragEnter);
    fixture.detectChanges();
    expect(element.nativeElement.classList).toContain('dragover');

    element.nativeElement.dispatchEvent(drop);
    fixture.detectChanges();
    expect(element.nativeElement.classList).not.toContain('dragover');
    expect((fileInput.value as File[]).length).toEqual(3);
  });
});
