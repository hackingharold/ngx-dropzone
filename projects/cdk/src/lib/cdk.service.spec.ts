import { TestBed } from '@angular/core/testing';

import { CdkService } from './cdk.service';

describe('CdkService', () => {
  let service: CdkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
