import { TestBed } from '@angular/core/testing';

import { OfferTrackingService } from './offer-tracking.service';

describe('OfferTrackingService', () => {
  let service: OfferTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
