import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarterGeneratorComponent } from './starter-generator.component';

describe('StarterGeneratorComponent', () => {
  let component: StarterGeneratorComponent;
  let fixture: ComponentFixture<StarterGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarterGeneratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StarterGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
