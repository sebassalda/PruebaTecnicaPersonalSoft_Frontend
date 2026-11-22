import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/home']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.errorMessage.set(
              'Correo electrónico o contraseña incorrectos.'
            );
          } else if (error.status === 0) {
            this.errorMessage.set(
              'No fue posible conectar con el servidor.'
            );
          } else {
            this.errorMessage.set(
              'Ocurrió un error al iniciar sesión.'
            );
          }
        }
      });
  }
}