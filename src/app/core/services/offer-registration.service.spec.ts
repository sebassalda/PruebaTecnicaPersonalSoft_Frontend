import { TestBed } from '@angular/core/testing';

import { OfferRegistrationService } from './offer-registration.service';

describe('OfferRegistration', () => {
  let service: OfferRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
