import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonPayComponent } from './button-pay.component';

describe('ButtonPayComponent', () => {
  let component: ButtonPayComponent;
  let fixture: ComponentFixture<ButtonPayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonPayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
