import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OfferDetail as OfferDetailModel } from '../../core/models/offer-tracking';
import { OfferTrackingService } from '../../core/services/offer-tracking.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';

import {
  OfferAttachment,
  OfferAttachmentService,
} from '../../core/services/offer-attachment.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './offer-detail.html',
  styleUrl: './offer-detail.scss',
})
export class OfferDetail implements OnInit {
  private readonly authService = inject(AuthService);

  readonly processingAction = signal(false);
  readonly actionMessage = signal<string | null>(null);

  get userRole(): string | null {
    return this.authService.userRole();
  }

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(OfferTrackingService);

  readonly offer = signal<OfferDetailModel | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  private readonly attachmentService = inject(OfferAttachmentService);

  readonly attachments = signal<OfferAttachment[]>([]);
  readonly loadingAttachments = signal(false);
  readonly uploadingAttachment = signal(false);
  readonly attachmentMessage = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Identificador de oferta inválido.');
      this.loading.set(false);
      return;
    }

    this.service.getOfferById(id).subscribe({
      next: (response) => {
        this.offer.set(response);
        this.loading.set(false);
        this.loadAttachments(response.id);
      },
      error: () => {
        this.errorMessage.set('No fue posible consultar el detalle de la oferta.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    void this.router.navigate(['/offer-tracking']);
  }

  canTakeOffer(offer: OfferDetailModel): boolean {
    const userId = this.authService.getCurrentUserId();

    return (
      userId !== null &&
      this.authService.userRole() === 'ANALISTA' &&
      this.authService.hasModule('OFFER_MANAGEMENT') &&
      offer.estado === 'RADICADO' &&
      offer.radicadorId !== userId
    );
  }

  canAnalyzeOffer(offer: OfferDetailModel): boolean {
    const userId = this.authService.getCurrentUserId();

    return (
      userId !== null &&
      this.authService.userRole() === 'ANALISTA' &&
      this.authService.hasModule('OFFER_MANAGEMENT') &&
      offer.estado === 'EN_PROCESO' &&
      offer.analistaId === userId
    );
  }

  canApproveOffer(offer: OfferDetailModel): boolean {
    return (
      this.userRole === 'JEFE' &&
      this.authService.hasModule('OFFER_APPROVAL') &&
      offer.estado === 'ESCALADO'
    );
  }

  executeAction(
    action: 'take' | 'escalate' | 'analysisReject' | 'approve' | 'approvalReject' | 'return',
  ): void {
    const currentOffer = this.offer();

    if (!currentOffer || this.processingAction()) {
      return;
    }

    const allowed =
      (action === 'take' && this.canTakeOffer(currentOffer)) ||
      (['escalate', 'analysisReject'].includes(action) && this.canAnalyzeOffer(currentOffer)) ||
      (['approve', 'approvalReject', 'return'].includes(action) &&
        this.canApproveOffer(currentOffer));

    if (!allowed) {
      this.actionMessage.set('Esta acción no está permitida.');
      return;
    }

    const confirmed = window.confirm(`¿Confirmas que deseas ${this.actionLabels[action]}?`);

    if (!confirmed) {
      return;
    }
    const actions: Record<string, (id: number) => Observable<unknown>> = {
      take: (id) => this.service.takeOffer(id),
      escalate: (id) => this.service.escalateOffer(id),
      analysisReject: (id) => this.service.rejectAnalysis(id),
      approve: (id) => this.service.approveOffer(id),
      approvalReject: (id) => this.service.rejectApproval(id),
      return: (id) => this.service.returnOffer(id),
    };

    this.processingAction.set(true);
    this.actionMessage.set(null);

    actions[action](currentOffer.id).subscribe({
      next: () => {
        this.service.getOfferById(currentOffer.id).subscribe({
          next: (updated) => {
            this.offer.set(updated);
            this.processingAction.set(false);
            this.actionMessage.set('Acción realizada correctamente.');
          },
          error: () => {
            this.processingAction.set(false);
            this.actionMessage.set(
              'La acción se ejecutó, pero no fue posible actualizar el detalle. Recarga la página.',
            );
          },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.processingAction.set(false);

        const messages: Record<number, string> = {
          400: 'La acción no es válida.',
          403: 'No tienes permisos para gestionar esta oferta.',
          404: 'La oferta no existe.',
          409: 'La oferta cambió de estado o existe un conflicto. Actualiza la página.',
        };

        this.actionMessage.set(messages[error.status] ?? 'No fue posible ejecutar la acción.');
      },
    });
  }

  private readonly actionLabels: Record<string, string> = {
    take: 'tomar esta oferta',
    escalate: 'escalar esta oferta al jefe',
    analysisReject: 'rechazar esta oferta',
    approve: 'aprobar esta oferta',
    approvalReject: 'rechazar esta oferta',
    return: 'devolver esta oferta al analista',
  };

  get canViewAttachments(): boolean {
    return this.authService.hasModule('OFFER_TRACKING');
  }

  get canUploadAttachments(): boolean {
    const currentOffer = this.offer();

    return (
      currentOffer !== null &&
      this.authService.userRole() === 'RADICADOR' &&
      this.authService.hasModule('OFFER_REGISTRATION') &&
      currentOffer.radicadorId === this.authService.getCurrentUserId()
    );
  }

  loadAttachments(offerId: number): void {
    if (!this.canViewAttachments) {
      return;
    }

    this.loadingAttachments.set(true);

    this.attachmentService
      .list(offerId)
      .pipe(finalize(() => this.loadingAttachments.set(false)))
      .subscribe({
        next: (attachments) => this.attachments.set(attachments),
        error: () => {
          this.attachmentMessage.set('No fue posible consultar los documentos adjuntos.');
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile.set(null);
    this.attachmentMessage.set(null);

    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      this.attachmentMessage.set('Solo se permiten PDF, JPG y PNG.');
      input.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024 || file.size === 0) {
      this.attachmentMessage.set(
        'El archivo debe tener un tamaño mayor que cero y máximo de 10 MB.',
      );
      input.value = '';
      return;
    }

    this.selectedFile.set(file);
  }

  uploadAttachment(): void {
    const currentOffer = this.offer();
    const file = this.selectedFile();

    if (!currentOffer || !file || !this.canUploadAttachments || this.uploadingAttachment()) {
      return;
    }

    this.uploadingAttachment.set(true);
    this.attachmentMessage.set(null);

    this.attachmentService
      .upload(currentOffer.id, file)
      .pipe(finalize(() => this.uploadingAttachment.set(false)))
      .subscribe({
        next: () => {
          this.selectedFile.set(null);
          this.attachmentMessage.set('Documento cargado correctamente.');

          if (this.canViewAttachments) {
            this.loadAttachments(currentOffer.id);
          }
        },
        error: (error: HttpErrorResponse) => {
          const messages: Record<number, string> = {
            400: 'Archivo inválido. Verifica su formato, nombre y tamaño.',
            403: 'No tienes permisos para adjuntar documentos.',
            404: 'La oferta no existe o no está disponible.',
          };

          this.attachmentMessage.set(
            messages[error.status] ?? 'No fue posible subir el documento.',
          );
        },
      });
  }

  downloadAttachment(attachment: OfferAttachment): void {
    const currentOffer = this.offer();

    if (!currentOffer || !this.canViewAttachments) return;

    this.attachmentService.download(currentOffer.id, attachment.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = attachment.nombreArchivo;
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
      },
      error: () => {
        this.attachmentMessage.set('No fue posible descargar el documento.');
      },
    });
  }
}
