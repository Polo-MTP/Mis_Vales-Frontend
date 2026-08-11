import { Routes } from '@angular/router';
import { AdministradorDashboardComponent } from './pages/dashboard/administrador-dashboard.component';
import { ConfiguracionesComponent } from './configuraciones/pages/configuraciones/configuraciones.component';
import { ListaMorososComponent } from './reportes/pages/lista-morosos/lista-morosos.component';
import { ListaConciliacionesComponent } from './conciliaciones/pages/lista-conciliaciones/lista-conciliaciones.component';
import { authGuard } from '../auth/guards/auth.guard';

export const ADMINISTRADOR_ROUTES: Routes = [
  { path: '', component: AdministradorDashboardComponent, canActivate: [authGuard] },
  { path: 'configuraciones', component: ConfiguracionesComponent, canActivate: [authGuard] },
  { path: 'reportes/morosos', component: ListaMorososComponent, canActivate: [authGuard] },
  { path: 'conciliaciones', component: ListaConciliacionesComponent, canActivate: [authGuard] }
];
