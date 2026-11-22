import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  OfferRegistrationRequest
} from '../models/offer-registration';

@Injectable({
  providedIn: 'root'
})
export class OfferRegistrationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/offers';

  createOffer(
    request: OfferRegistrationRequest
  ): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(
      this.apiUrl,
      request
    );
  }
}