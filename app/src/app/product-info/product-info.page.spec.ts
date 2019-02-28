import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductInfoPage } from './product-info.page';

describe('ProductInfoPage', () => {
  let component: ProductInfoPage;
  let fixture: ComponentFixture<ProductInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductInfoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
