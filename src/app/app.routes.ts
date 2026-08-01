import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  // Autenticación
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Rutas protegidas por rol
  {
    path: 'administrador',
    canActivate: [authGuard],
    loadChildren: () => import('./features/administrador/administrador.routes').then(m => m.ADMINISTRADOR_ROUTES)
  },
  {
    path: 'gerente',
    canActivate: [authGuard],
    loadChildren: () => import('./features/gerente/gerente.routes').then(m => m.GERENTE_ROUTES)
  },
  {
    path: 'coordinador',
    canActivate: [authGuard],
    loadChildren: () => import('./features/coordinador/coordinador.routes').then(m => m.COORDINADOR_ROUTES)
  },
  {
    path: 'verificador',
    canActivate: [authGuard],
    loadChildren: () => import('./features/verificador/verificador.routes').then(m => m.VERIFICADOR_ROUTES)
  },
  {
    path: 'distribuidora',
    canActivate: [authGuard],
    loadChildren: () => import('./features/distribuidora/distribuidora.routes').then(m => m.DISTRIBUIDORA_ROUTES)
  },

  // Redirect raíz al login
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
