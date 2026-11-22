import { TestBed } from '@angular/core/testing';

import { OfferAttachmentService } from './offer-attachment.service';

describe('OfferAttachmentService', () => {
  let service: OfferAttachmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferAttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
