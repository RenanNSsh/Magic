import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRelationshipComponent } from './dialog-relationship.component';

describe('DialogRelationshipComponent', () => {
  let component: DialogRelationshipComponent;
  let fixture: ComponentFixture<DialogRelationshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogRelationshipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogRelationshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
