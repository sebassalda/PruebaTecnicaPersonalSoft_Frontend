import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferRegistration } from './offer-registration';

describe('OfferRegistration', () => {
  let component: OfferRegistration;
  let fixture: ComponentFixture<OfferRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferRegistration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
