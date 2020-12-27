import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInvalidJsonComponent } from './dialog-invalid-json.component';

describe('DialogInvalidJsonComponent', () => {
  let component: DialogInvalidJsonComponent;
  let fixture: ComponentFixture<DialogInvalidJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInvalidJsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInvalidJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
