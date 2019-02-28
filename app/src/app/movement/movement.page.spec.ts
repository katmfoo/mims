import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementPage } from './movement.page';

describe('MovementPage', () => {
  let component: MovementPage;
  let fixture: ComponentFixture<MovementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
