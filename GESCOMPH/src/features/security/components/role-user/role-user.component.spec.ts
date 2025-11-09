import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleUserComponent } from './role-user.component';

describe('RolUserComponent', () => {
  let component: RoleUserComponent;
  let fixture: ComponentFixture<RoleUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
