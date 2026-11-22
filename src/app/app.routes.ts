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
    path: '**',
    redirectTo: 'home',
  },
];
