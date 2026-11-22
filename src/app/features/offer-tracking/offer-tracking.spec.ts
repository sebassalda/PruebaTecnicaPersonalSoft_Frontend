import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferTracking } from './offer-tracking';

describe('OfferTracking', () => {
  let component: OfferTracking;
  let fixture: ComponentFixture<OfferTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
