import { Routes } from '@angular/router';
import { CajeraDashboardComponent } from './pages/dashboard/cajera-dashboard.component';
import { ListaConciliacionesComponent } from './conciliaciones/pages/lista-conciliaciones/lista-conciliaciones.component';
import { MisSolicitudesComponent } from './conciliaciones/pages/mis-solicitudes/mis-solicitudes.component';
import { SolicitarEdicionComponent } from './clientes/pages/solicitar-edicion/solicitar-edicion.component';
import { CanjearPuntosComponent } from './puntos/pages/canjear-puntos/canjear-puntos.component';
import { authGuard } from '../auth/guards/auth.guard';

export const CAJERA_ROUTES: Routes = [
  { path: '', component: CajeraDashboardComponent, canActivate: [authGuard] },
  { path: 'conciliaciones', component: ListaConciliacionesComponent, canActivate: [authGuard] },
  { path: 'conciliaciones/mis-solicitudes', component: MisSolicitudesComponent, canActivate: [authGuard] },
  { path: 'clientes/solicitar-edicion', component: SolicitarEdicionComponent, canActivate: [authGuard] },
  { path: 'puntos/canjear', component: CanjearPuntosComponent, canActivate: [authGuard] }
];
