import { Routes } from '@angular/router';
import { roleGuard } from './features/auth/guards/role.guard';
import { DesktopLayoutComponent } from './layouts/desktop/desktop-layout/desktop-layout.component';
import { TabletLayoutComponent } from './layouts/tablet/tablet-layout/tablet-layout.component';
import { MobileLayoutComponent } from './layouts/mobile/mobile-layout/mobile-layout.component';

export const routes: Routes = [
  // Autenticación
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Rutas protegidas por rol
 {
  path: 'administrador',
  canActivate: [roleGuard(['Administrador'])],
  component: DesktopLayoutComponent,
  children: [
    {
      path: '',
      loadChildren: () =>
        import('./features/administrador/administrador.routes')
          .then(m => m.ADMINISTRADOR_ROUTES)
    }
  ]
},
  {
  path: 'gerente',
  canActivate: [roleGuard(['Gerente General', 'Gerente de Sucursal'])],
  component: DesktopLayoutComponent,
  children: [
    {
      path: '',
      loadChildren: () =>
        import('./features/gerente/gerente.routes')
          .then(m => m.GERENTE_ROUTES)
    }
  ]
},
  {
    path: 'coordinador',
    canActivate: [roleGuard(['Coordinador'])],
    component:TabletLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/coordinador/coordinador.routes').then(m => m.COORDINADOR_ROUTES)
      }
    ]
  },
  {
    path: 'verificador',
    canActivate: [roleGuard(['Verificador'])],
    component:TabletLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/verificador/verificador.routes').then(m => m.VERIFICADOR_ROUTES)
      }
    ]
  },
  {
  path: 'distribuidora',
  canActivate: [roleGuard(['Distribuidora'])],
  component: MobileLayoutComponent,
  children: [
    {
      path: '',
      loadChildren: () =>
        import('./features/distribuidora/distribuidora.routes')
          .then(m => m.DISTRIBUIDORA_ROUTES)
    }
  ]
},
{
  path: 'cajera',
  canActivate: [roleGuard(['Cajera'])],
  component: DesktopLayoutComponent,
  children: [
    {
      path: '',
      loadChildren: () =>
        import('./features/cajera/cajera.routes')
          .then(m => m.CAJERA_ROUTES)
    }
  ]
},
  // Redirect raíz al login
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
