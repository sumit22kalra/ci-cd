import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildHistory } from './build-history';

describe('BuildHistory', () => {
  let component: BuildHistory;
  let fixture: ComponentFixture<BuildHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(BuildHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
