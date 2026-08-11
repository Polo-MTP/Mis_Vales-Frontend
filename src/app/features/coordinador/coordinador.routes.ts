import { Routes } from '@angular/router';
import { CoordinadorDashboardComponent } from './pages/dashboard/coordinador-dashboard.component';
import { NuevaSolicitudComponent } from './alta-proveedor/pages/nueva-solicitud/nueva-solicitud.component';
import { ListaMorososComponent } from './reportes/pages/lista-morosos/lista-morosos.component';
import { authGuard } from '../auth/guards/auth.guard';

export const COORDINADOR_ROUTES: Routes = [
  { path: '', component: CoordinadorDashboardComponent, canActivate: [authGuard] },
  { path: 'solicitudes/nueva', component: NuevaSolicitudComponent, canActivate: [authGuard] },
  { path: 'reportes/morosos', component: ListaMorososComponent, canActivate: [authGuard] }
];
