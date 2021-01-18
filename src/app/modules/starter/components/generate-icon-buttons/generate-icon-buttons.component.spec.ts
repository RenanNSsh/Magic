import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateIconButtonsComponent } from './generate-icon-buttons.component';

describe('GenerateIconButtonsComponent', () => {
  let component: GenerateIconButtonsComponent;
  let fixture: ComponentFixture<GenerateIconButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateIconButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateIconButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
