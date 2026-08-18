import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileLayout } from './mobile-layout';

describe('MobileLayout', () => {
  let component: MobileLayout;
  let fixture: ComponentFixture<MobileLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
