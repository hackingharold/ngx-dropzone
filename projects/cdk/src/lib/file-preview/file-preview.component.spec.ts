import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DropzoneCdkModule } from './../cdk.module';
import { FilePreviewComponent } from './file-preview.component';

interface Selectors<T> {
  fixture: ComponentFixture<T>;
  element: DebugElement;
  component: FilePreviewComponent;
}

describe('FilePreviewComponent', () => {
  function configureFilePreviewTestingModule<T>(testComponent: Type<T>): Selectors<T> {
    const fixture = TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DropzoneCdkModule],
      declarations: [testComponent],
    }).createComponent(testComponent);

    const element = fixture.debugElement.query(By.directive(FilePreviewComponent));
    const component = element.componentInstance;

    fixture.detectChanges();

    return {
      fixture,
      element,
      component,
    };
  }

  describe('url', () => {
    let selectors: Selectors<FilePreviewUrl>;

    beforeEach(waitForAsync(() => {
      selectors = configureFilePreviewTestingModule(FilePreviewUrl);
    }));

    it('should create component with file url', () => {
      expect(selectors.component).toBeTruthy();
      expect(selectors.element.nativeElement.textContent).toBe('GitHub-Mark.png');
    });
  });

  describe('blob', () => {
    let selectors: Selectors<FilePreviewBlob>;

    beforeEach(waitForAsync(() => {
      selectors = configureFilePreviewTestingModule(FilePreviewBlob);
    }));

    it('should create component with blob file', () => {
      expect(selectors.component).toBeTruthy();
      expect(selectors.element.nativeElement.textContent).toBe('my-file.txt');
    });

    it('should trigger remove event on backspace', () => {
      spyOn(selectors.component, 'triggerFilePreviewRemoveEvent').and.callThrough();

      selectors.element.nativeElement.dispatchEvent(new Event('focus'));
      selectors.element.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { code: 'backspace' }));

      selectors.fixture.detectChanges();
      expect(selectors.component.triggerFilePreviewRemoveEvent).toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'url-preview',
  template: `
    <ngx-dropzone-file-preview
      file="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
    ></ngx-dropzone-file-preview>
  `,
})
class FilePreviewUrl {}

@Component({
  selector: 'blob-preview',
  template: ` <ngx-dropzone-file-preview [file]="blob"></ngx-dropzone-file-preview> `,
})
class FilePreviewBlob {
  blob = new File(['...'], `my-file.txt`);
}
