import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CVPage } from './cv.page';

describe('CVPage', () => {
  let component: CVPage;
  let fixture: ComponentFixture<CVPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CVPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CVPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
