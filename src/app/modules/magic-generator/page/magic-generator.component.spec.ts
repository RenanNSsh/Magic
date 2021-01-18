import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagicGeneratorComponent } from './magic-generator.component';

describe('MagicGeneratorComponent', () => {
  let component: MagicGeneratorComponent;
  let fixture: ComponentFixture<MagicGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MagicGeneratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MagicGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
