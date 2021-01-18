import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateFlutterFormComponent } from './generate-flutter-form.component';

describe('GenerateFlutterFormComponent', () => {
  let component: GenerateFlutterFormComponent;
  let fixture: ComponentFixture<GenerateFlutterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateFlutterFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateFlutterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
