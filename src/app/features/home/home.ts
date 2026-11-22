import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  goToCatalog(): void {
    void this.router.navigate(['/brp-catalog']);
  }

  goToOfferRegistration(): void {
    void this.router.navigate(['/offer-registration']);
  }

  goToOfferTracking(): void {
    void this.router.navigate(['/offer-tracking']);
  }

  goToUserManagement(): void {
    void this.router.navigate(['/user-management']);
  }
}
