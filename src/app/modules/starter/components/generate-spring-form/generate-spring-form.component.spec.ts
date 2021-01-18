import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSpringFormComponent } from './generate-spring-form.component';

describe('GenerateSpringFormComponent', () => {
  let component: GenerateSpringFormComponent;
  let fixture: ComponentFixture<GenerateSpringFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateSpringFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateSpringFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
