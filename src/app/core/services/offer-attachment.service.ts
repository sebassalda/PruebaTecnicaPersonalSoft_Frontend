
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OfferAttachment {
  id: number;
  nombreArchivo: string;
  fechaCarga: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfferAttachmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/offers';

  list(offerId: number): Observable<OfferAttachment[]> {
    return this.http.get<OfferAttachment[]>(
      `${this.apiUrl}/${offerId}/attachments`
    );
  }

  upload(offerId: number, file: File): Observable<OfferAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<OfferAttachment>(
      `${this.apiUrl}/${offerId}/attachments`,
      formData
    );
  }

  download(offerId: number, attachmentId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${offerId}/attachments/${attachmentId}`,
      { responseType: 'blob' }
    );
  }
}
