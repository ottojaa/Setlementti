import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFilesPage } from './my-files.page';

describe('MyFilesPage', () => {
  let component: MyFilesPage;
  let fixture: ComponentFixture<MyFilesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyFilesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyFilesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
