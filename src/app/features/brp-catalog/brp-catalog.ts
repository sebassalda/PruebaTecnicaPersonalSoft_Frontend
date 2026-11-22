import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

import { Router } from '@angular/router';

import { Brp } from '../../core/models/brp';
import { BrpCatalogService } from '../../core/services/brp-catalog.service';

@Component({
  selector: 'app-brp-catalog',
  standalone: true,
  imports: [
    DecimalPipe,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './brp-catalog.html',
  styleUrl: './brp-catalog.scss',
})
export class BrpCatalog implements OnInit {
  private readonly brpService = inject(BrpCatalogService);
  private readonly router = inject(Router);
  readonly latestIngestionDate = signal<string | null>(null);

  readonly brps = signal<Brp[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly totalElements = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly displayedColumns = ['codigo', 'tipoBrp', 'estado', 'ubicacion', 'precio', 'acciones'];

  ngOnInit(): void {
    this.loadBrps();
    this.loadLatestIngestion();
  }

  loadBrps(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.brpService.getBrps(this.pageIndex(), this.pageSize()).subscribe({
      next: (response) => {
        this.brps.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);

        this.errorMessage.set(
          error.status === 403
            ? 'No tienes permisos para consultar el catálogo.'
            : 'No fue posible cargar el catálogo BRP.',
        );
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadBrps();
  }

  viewDetail(id: number): void {
    void this.router.navigate(['/brp-catalog', id]);
  }

  goHome(): void {
    void this.router.navigate(['/home']);
  }

  loadLatestIngestion(): void {
    this.brpService.getLatestIngestion().subscribe({
      next: (response) => {
        this.latestIngestionDate.set(response.latestIngestionDate);
      },
      error: () => {
        this.latestIngestionDate.set(null);
      },
    });
  }
}
