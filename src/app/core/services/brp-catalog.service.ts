import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Brp, PageResponse, LatestIngestionResponse } from '../models/brp';

@Injectable({
  providedIn: 'root',
})
export class BrpCatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/brps';

  getBrps(page: number = 0, size: number = 10): Observable<PageResponse<Brp>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<Brp>>(this.apiUrl, { params });
  }

  getBrpById(id: number): Observable<Brp> {
    return this.http.get<Brp>(`${this.apiUrl}/${id}`);
  }

  getLatestIngestion(): Observable<LatestIngestionResponse> {
    return this.http.get<LatestIngestionResponse>(`${this.apiUrl}/latest-ingestion`);
  }
}
