import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { moduleGuard } from './core/guards/module-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'brp-catalog',
    canActivate: [authGuard, moduleGuard],
    data: {
      module: 'BRP_CATALOG',
    },
    loadComponent: () => import('./features/brp-catalog/brp-catalog').then((m) => m.BrpCatalog),
  },
  {
    path: 'brp-catalog/:id',
    canActivate: [authGuard, moduleGuard],
    data: {
      module: 'BRP_CATALOG',
    },
    loadComponent: () => import('./features/brp-detail/brp-detail').then((m) => m.BrpDetail),
  },
  {
    path: 'offer-registration',
    canActivate: [authGuard, moduleGuard],
    data: { module: 'OFFER_REGISTRATION', role: 'RADICADOR' },
    loadComponent: () =>
      import('./features/offer-registration/offer-registration').then((m) => m.OfferRegistration),
  },
  {
    path: 'offer-tracking',
    canActivate: [authGuard, moduleGuard],
    data: {
      module: 'OFFER_TRACKING',
    },
    loadComponent: () =>
      import('./features/offer-tracking/offer-tracking').then((m) => m.OfferTracking),
  },
  {
    path: 'offer-tracking/:id',
    canActivate: [authGuard, moduleGuard],
    data: {
      module: 'OFFER_TRACKING',
    },
    loadComponent: () => import('./features/offer-detail/offer-detail').then((m) => m.OfferDetail),
  },
  {
    path: 'user-management',
    canActivate: [authGuard, moduleGuard],
    data: {
      module: 'USER_MANAGEMENT',
      role: 'ADMINISTRADOR',
    },
    loadComponent: () =>
      import('./features/user-management/user-management').then((m) => m.UserManagement),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
