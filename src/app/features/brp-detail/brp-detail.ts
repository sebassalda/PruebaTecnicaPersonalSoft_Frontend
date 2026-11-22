import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { Brp } from '../../core/models/brp';
import { BrpCatalogService } from '../../core/services/brp-catalog.service';

@Component({
  selector: 'app-brp-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './brp-detail.html',
  styleUrl: './brp-detail.scss'
})
export class BrpDetail implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly brpService = inject(BrpCatalogService);

  readonly brp = signal<Brp | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Identificador BRP inválido.');
      this.loading.set(false);
      return;
    }

    this.brpService.getBrpById(id).subscribe({
      next: response => {
        this.brp.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No fue posible consultar el BRP.');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    void this.router.navigate(['/brp-catalog']);
  }
}