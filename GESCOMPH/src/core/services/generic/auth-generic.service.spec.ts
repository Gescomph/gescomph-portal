import { TestBed } from '@angular/core/testing';

import { AuthGenericService } from './auth-generic.service';

describe('AuthGenericService', () => {
  let service: AuthGenericService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthGenericService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
