import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSquareComponent } from './form-square.component';

describe('FormSquareComponent', () => {
  let component: FormSquareComponent;
  let fixture: ComponentFixture<FormSquareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSquareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSquareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
