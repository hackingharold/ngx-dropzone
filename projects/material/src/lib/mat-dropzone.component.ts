import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DropzoneComponent } from 'cdk';

@Component({
  selector: 'ngx-mat-dropzone',
  exportAs: 'mat-dropzone',
  template: `
    <div class="dropzone">
      <p>hello</p>
    </div>
  `,
  styleUrls: ['mat-dropzone-filled.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatDropzoneComponent extends DropzoneComponent {}
