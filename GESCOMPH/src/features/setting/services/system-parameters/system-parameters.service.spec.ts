import { TestBed } from '@angular/core/testing';

import { SystemParametersService } from './system-parameters.service';

describe('SystemParametersService', () => {
  let service: SystemParametersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemParametersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
