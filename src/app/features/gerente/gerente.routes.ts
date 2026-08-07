import { Routes } from '@angular/router';
import { GerenteDashboardComponent } from './pages/dashboard/gerente-dashboard.component';
import { ListaSolicitudesComponent } from './alta-proveedor/pages/lista-solicitudes/lista-solicitudes.component';
import { authGuard } from '../auth/guards/auth.guard';

export const GERENTE_ROUTES: Routes = [
  { path: '', component: GerenteDashboardComponent, canActivate: [authGuard] },
  { path: 'solicitudes', component: ListaSolicitudesComponent, canActivate: [authGuard] }
];
