import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateAngularFormComponent } from './generate-angular-form.component';

describe('GenerateAngularFormComponent', () => {
  let component: GenerateAngularFormComponent;
  let fixture: ComponentFixture<GenerateAngularFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateAngularFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateAngularFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
