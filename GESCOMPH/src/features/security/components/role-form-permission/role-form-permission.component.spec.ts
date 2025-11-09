import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleFormPermissionComponent } from './role-form-permission.component';

describe('RoleFormPermissionComponent', () => {
  let component: RoleFormPermissionComponent;
  let fixture: ComponentFixture<RoleFormPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFormPermissionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RoleFormPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
