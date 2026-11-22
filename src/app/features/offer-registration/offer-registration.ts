import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Brp } from '../../core/models/brp';
import { BrpCatalogService } from '../../core/services/brp-catalog.service';
import { OfferRegistrationService } from '../../core/services/offer-registration.service';
import { OfferRegistrationRequest } from '../../core/models/offer-registration';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-offer-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './offer-registration.html',
  styleUrl: './offer-registration.scss',
})
export class OfferRegistration implements OnInit {
  readonly Math = Math;
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly brpService = inject(BrpCatalogService);
  private readonly offerService = inject(OfferRegistrationService);

  readonly availableBrps = signal<Brp[]>([]);
  readonly loadingBrps = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly selectedBrp = signal<Brp | null>(null);

  readonly form = this.fb.group({
    brpId: [null as number | null, Validators.required],
    valorOferta: [null as number | null, [Validators.required, Validators.min(0.01)]],
    oferentes: this.fb.array<FormGroup>([]),
  });

  private readonly validDateValidator: ValidatorFn = (control: AbstractControl) => {
    const value = control.value;

    if (value === null || value === '') {
      return null;
    }

    return value instanceof Date && !Number.isNaN(value.getTime()) ? null : { invalidDate: true };
  };

  readonly discount = computed(() => {
    const brp = this.selectedBrp();
    const amount = this.offerAmount();

    if (!brp?.precio || amount <= 0) return null;

    return ((brp.precio - amount) / brp.precio) * 100;
  });

  readonly offerAmount = signal(0);

  ngOnInit(): void {
    this.addApplicant();
    this.loadAvailableBrps();

    this.form.controls.valorOferta.valueChanges.subscribe((value) => {
      this.offerAmount.set(Number(value ?? 0));
    });
  }

  get applicants(): FormArray {
    return this.form.controls.oferentes;
  }

  getPayments(applicantIndex: number): FormArray {
    return this.applicants.at(applicantIndex).get('pagos') as FormArray;
  }

  private createPayment(): FormGroup {
    const payment = this.fb.group({
      tipoPago: ['EFECTIVO', Validators.required],
      valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
      fechaPago: [null as Date | null, [Validators.required, this.validDateValidator]],
      entidadFinanciera: [null as string | null],
    });

    const typeControl = payment.controls.tipoPago;
    const entityControl = payment.controls.entidadFinanciera;

    typeControl.valueChanges.pipe(startWith(typeControl.value)).subscribe((type) => {
      if (type === 'PRESTAMO') {
        entityControl.setValidators([Validators.required, Validators.pattern(/.*\S.*/)]);
      } else {
        entityControl.clearValidators();
        entityControl.setValue(null, { emitEvent: false });
      }

      entityControl.updateValueAndValidity({
        emitEvent: false,
      });
    });

    return payment;
  }

  private createApplicant(): FormGroup {
    return this.fb.group({
      tipoIdentificacion: ['CC', Validators.required],

      numeroIdentificacion: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],

      nombre: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],

      porcentajeParticipacion: [
        null as number | null,
        [Validators.required, Validators.min(0.01), Validators.max(100)],
      ],

      email: ['', Validators.email],

      telefono: [''],

      pagos: this.fb.array<FormGroup>([this.createPayment()]),
    });
  }

  addApplicant(): void {
    if (this.applicants.length >= 5) return;
    this.applicants.push(this.createApplicant());
  }

  removeApplicant(index: number): void {
    if (this.applicants.length <= 1) return;
    this.applicants.removeAt(index);
  }

  addPayment(applicantIndex: number): void {
    const payments = this.getPayments(applicantIndex);
    if (payments.length >= 6) return;
    payments.push(this.createPayment());
  }

  removePayment(applicantIndex: number, paymentIndex: number): void {
    const payments = this.getPayments(applicantIndex);
    if (payments.length <= 1) return;
    payments.removeAt(paymentIndex);
  }

  loadAvailableBrps(): void {
    this.loadingBrps.set(true);
    const collected: Brp[] = [];

    const loadPage = (page: number): void => {
      this.brpService.getBrps(page, 100).subscribe({
        next: (response) => {
          collected.push(...response.content);

          if (page + 1 < response.totalPages) {
            loadPage(page + 1);
          } else {
            this.availableBrps.set(collected.filter((brp) => brp.estado === 'DISPONIBLE'));
            this.loadingBrps.set(false);
          }
        },
        error: () => {
          this.loadingBrps.set(false);
          this.errorMessage.set('No fue posible cargar los BRP disponibles.');
        },
      });
    };

    loadPage(0);
  }

  onBrpChange(id: number): void {
    this.selectedBrp.set(this.availableBrps().find((brp) => brp.id === id) ?? null);
  }

  getTotalPayments(): number {
    return this.applicants.controls.reduce((total, applicant) => {
      const payments = applicant.get('pagos') as FormArray;
      return (
        total +
        payments.controls.reduce(
          (sum, payment) => sum + Number(payment.get('valor')?.value ?? 0),
          0,
        )
      );
    }, 0);
  }

  getTotalParticipation(): number {
    return this.applicants.controls.reduce(
      (total, applicant) => total + Number(applicant.get('porcentajeParticipacion')?.value ?? 0),
      0,
    );
  }

  getApplicantPaymentsTotal(index: number): number {
    return this.getPayments(index).controls.reduce(
      (total, payment) => total + Number(payment.get('valor')?.value ?? 0),
      0,
    );
  }

  private hasValidBusinessTotals(): boolean {
    const amount = Number(this.form.controls.valorOferta.value ?? 0);

    if (Math.abs(this.getTotalParticipation() - 100) > 0.000001) {
      this.errorMessage.set('La participación de los oferentes debe sumar 100 %.');
      return false;
    }

    if (Math.abs(this.getTotalPayments() - amount) > 0.009) {
      this.errorMessage.set('La suma de los pagos debe coincidir con el valor de la oferta.');
      return false;
    }

    for (let i = 0; i < this.applicants.length; i++) {
      const applicant = this.applicants.at(i);
      const percentage = Number(applicant.get('porcentajeParticipacion')?.value ?? 0);
      const expected = (amount * percentage) / 100;

      if (Math.abs(this.getApplicantPaymentsTotal(i) - expected) > 0.009) {
        this.errorMessage.set(
          `Los pagos del oferente ${i + 1} no corresponden a su participación.`,
        );
        return false;
      }

      for (const payment of this.getPayments(i).controls) {
        if (
          payment.get('tipoPago')?.value === 'PRESTAMO' &&
          !String(payment.get('entidadFinanciera')?.value ?? '').trim()
        ) {
          this.errorMessage.set('Los préstamos requieren entidad financiera.');
          return false;
        }
      }
    }

    return true;
  }

  submit(): void {
    if (this.submitting() || this.form.disabled) {
      return;
    }
    if (!this.canSubmit) {
      this.form.markAllAsTouched();
      this.errorMessage.set('La oferta contiene datos incompletos o inconsistentes.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Revisa los campos obligatorios o con valores inválidos.');
      return;
    }

    if (!this.hasValidBrp()) {
      this.errorMessage.set('Selecciona un BRP disponible que tenga un precio válido.');
      return;
    }

    if (!this.hasValidFinancialEntities()) {
      this.errorMessage.set('Los pagos de tipo préstamo requieren entidad financiera.');
      return;
    }

    if (!this.hasValidBusinessTotals()) {
      return;
    }

    const request: OfferRegistrationRequest = {
      brpId: Number(this.form.controls.brpId.value),
      valorOferta: Number(this.form.controls.valorOferta.value),

      oferentes: this.applicants.controls.map((applicant) => {
        const payments = applicant.get('pagos') as FormArray<FormGroup>;

        return {
          tipoIdentificacion: String(applicant.get('tipoIdentificacion')?.value ?? ''),
          numeroIdentificacion: String(applicant.get('numeroIdentificacion')?.value ?? ''),
          nombre: String(applicant.get('nombre')?.value ?? ''),
          porcentajeParticipacion: Number(applicant.get('porcentajeParticipacion')?.value ?? 0),
          email: applicant.get('email')?.value || null,
          telefono: applicant.get('telefono')?.value || null,

          pagos: payments.controls.map((payment) => {
            const tipoPago = String(payment.get('tipoPago')?.value ?? '');

            return {
              tipoPago,
              valor: Number(payment.get('valor')?.value ?? 0),
              fechaPago: this.formatPaymentDate(payment.get('fechaPago')?.value as Date),
              entidadFinanciera:
                tipoPago === 'PRESTAMO' ? payment.get('entidadFinanciera')?.value || null : null,
            };
          }),
        };
      }),
    };

    this.submitting.set(true);

    this.offerService.createOffer(request).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.successMessage.set(`Oferta ${response.id} registrada correctamente.`);
        this.form.disable();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error.status === 403
            ? 'No tienes permisos para radicar ofertas.'
            : error.status === 409
              ? 'Existe un conflicto con el BRP o la oferta.'
              : error.status === 400
                ? 'El backend rechazó los datos. Revisa los valores y las validaciones.'
                : 'No fue posible registrar la oferta.',
        );
      },
    });
  }

  goHome(): void {
    void this.router.navigate(['/home']);
  }

  private formatPaymentDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  get canSubmit(): boolean {
    return (
      !this.submitting() &&
      !this.loadingBrps() &&
      this.form.enabled &&
      this.form.valid &&
      this.hasValidTotals() &&
      this.hasValidBrp() &&
      this.hasValidFinancialEntities()
    );
  }

  private hasValidBrp(): boolean {
    const brp = this.selectedBrp();

    return (
      brp !== null &&
      brp.id === this.form.controls.brpId.value &&
      brp.estado === 'DISPONIBLE' &&
      brp.precio !== null &&
      brp.precio > 0
    );
  }

  private hasValidTotals(): boolean {
    const amount = Number(this.form.controls.valorOferta.value ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return false;
    }

    if (this.applicants.length < 1 || this.applicants.length > 5) {
      return false;
    }

    if (Math.abs(this.getTotalParticipation() - 100) > 0.000001) {
      return false;
    }

    if (Math.abs(this.getTotalPayments() - amount) > 0.009) {
      return false;
    }

    for (let i = 0; i < this.applicants.length; i++) {
      const payments = this.getPayments(i);

      if (payments.length < 1 || payments.length > 6) {
        return false;
      }

      const percentage = Number(this.applicants.at(i).get('porcentajeParticipacion')?.value ?? 0);

      const expected = (amount * percentage) / 100;
      const actual = this.getApplicantPaymentsTotal(i);

      if (Math.abs(expected - actual) > 0.009) {
        return false;
      }
    }

    return true;
  }

  private hasValidFinancialEntities(): boolean {
    for (let i = 0; i < this.applicants.length; i++) {
      for (const payment of this.getPayments(i).controls) {
        const type = payment.get('tipoPago')?.value;
        const entity = String(payment.get('entidadFinanciera')?.value ?? '').trim();

        if (type === 'PRESTAMO' && !entity) {
          return false;
        }
      }
    }

    return true;
  }

  get offerTotal(): number {
    return Number(this.form.controls.valorOferta.value ?? 0);
  }

  getExpectedApplicantTotal(index: number): number {
    const percentage = Number(this.applicants.at(index).get('porcentajeParticipacion')?.value ?? 0);

    return (this.offerTotal * percentage) / 100;
  }
}
