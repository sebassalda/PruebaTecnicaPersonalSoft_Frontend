import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageResponse } from '../models/brp';
import { OfferSummary, OfferDetail } from '../models/offer-tracking';

@Injectable({
  providedIn: 'root',
})
export class OfferTrackingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/offers';

  getOffers(page = 0, size = 10): Observable<PageResponse<OfferSummary>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<OfferSummary>>(this.apiUrl, { params });
  }

  getOfferById(id: number): Observable<OfferDetail> {
    return this.http.get<OfferDetail>(`${this.apiUrl}/${id}`);
  }

  takeOffer(id: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${id}/take`, {});
  }

  escalateOffer(id: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${id}/escalate`, {});
  }

  rejectAnalysis(id: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${id}/analysis/reject`, {});
  }

  approveOffer(id: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectApproval(id: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${id}/approval/reject`, {});
  }

  returnOffer(id: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${id}/return`, {});
  }
}
