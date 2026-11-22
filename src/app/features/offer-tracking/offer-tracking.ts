
import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OfferSummary } from '../../core/models/offer-tracking';
import { OfferTrackingService } from '../../core/services/offer-tracking.service';

@Component({
  selector: 'app-offer-tracking',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './offer-tracking.html',
  styleUrl: './offer-tracking.scss'
})
export class OfferTracking implements OnInit {
  private readonly service = inject(OfferTrackingService);
  private readonly router = inject(Router);

  readonly offers = signal<OfferSummary[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly totalElements = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly displayedColumns = [
    'id',
    'brpCodigo',
    'valorOferta',
    'porcentajeDescuento',
    'estado',
    'fechaRadicacion',
    'acciones'
  ];

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.service.getOffers(
      this.pageIndex(),
      this.pageSize()
    ).subscribe({
      next: response => {
        this.offers.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.status === 403
            ? 'No tienes permisos para consultar las ofertas.'
            : 'No fue posible cargar las ofertas.'
        );
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadOffers();
  }

  viewDetail(id: number): void {
    void this.router.navigate(['/offer-tracking', id]);
  }

  goHome(): void {
    void this.router.navigate(['/home']);
  }
}
