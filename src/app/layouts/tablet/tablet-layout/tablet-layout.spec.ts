import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletLayout } from './tablet-layout';

describe('TabletLayout', () => {
  let component: TabletLayout;
  let fixture: ComponentFixture<TabletLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabletLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(TabletLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
