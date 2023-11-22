import { TestBed } from '@angular/core/testing';
import { DropzoneService } from './dropzone.service';

describe('DropzoneService', () => {
  let service: DropzoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropzoneService);
  });

  it('returns dropped files', async () => {
    const dataTransfer = new DataTransfer();
    const file1 = new File(['...'], `${Date.now()}.txt`);
    const file2 = new File(['...'], `${Date.now()}.txt`);

    [file1, file2].forEach((f) => dataTransfer.items.add(f));

    const drop = new DragEvent('drop', { dataTransfer });
    const files = await service.getFiles(drop);

    expect(files.length).toEqual(2);
  });
});
