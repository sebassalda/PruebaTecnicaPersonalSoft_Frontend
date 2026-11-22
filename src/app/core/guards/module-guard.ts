import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../auth/auth.service';

export const moduleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const requiredModule = route.data['module'] as string | undefined;

  if (!requiredModule) {
    return router.createUrlTree(['/home']);
  }

  if (authService.hasModule(requiredModule)) {
    return true;
  }

  return router.createUrlTree(['/home']);
};