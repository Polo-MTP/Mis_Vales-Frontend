import { Routes } from '@angular/router';

export const VERIFICADOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'alta-proveedor/pendientes',
    pathMatch: 'full'
  },
  {
    path: 'alta-proveedor',
    children: [
      {
        path: '',
        redirectTo: 'pendientes',
        pathMatch: 'full'
      },
      {
        path: 'pendientes',
        loadComponent: () =>
          import('./alta-proveedor/pages/lista-pendientes/lista-pendientes.component').then(
            (m) => m.ListaPendientesComponent
          ),
        title: 'Verificador - Solicitudes Pendientes'
      },
     /* {
        path: 'verificar/:id',
        loadComponent: () =>
          import('./alta-proveedor/pages/detalle-verificacion/detalle-verificacion.component').then(
            (m) => m.DetalleVerificacionComponent
          ),
        title: 'Verificador - Inspección en Campo'
      }*/
    ]
  }
];