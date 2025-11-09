import { TestBed } from '@angular/core/testing';

import { RoleFormPermissionService } from './role-form-permission.service';

describe('RolFormPermissionService', () => {
  let service: RoleFormPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleFormPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
