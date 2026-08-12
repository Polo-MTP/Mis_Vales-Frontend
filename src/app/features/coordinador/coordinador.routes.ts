import { Routes } from '@angular/router';
import { CoordinadorDashboardComponent } from './pages/dashboard/coordinador-dashboard.component';
import { NuevaSolicitudComponent } from './alta-proveedor/pages/nueva-solicitud/nueva-solicitud.component';
import { ListaMorososComponent } from './reportes/pages/lista-morosos/lista-morosos.component';
import { ListaConciliacionesComponent } from './conciliaciones/pages/lista-conciliaciones/lista-conciliaciones.component';
import { AutorizacionesPendientesComponent } from './conciliaciones/pages/autorizaciones-pendientes/autorizaciones-pendientes.component';
import { EdicionesPendientesComponent } from './clientes/pages/ediciones-pendientes/ediciones-pendientes.component';

export const COORDINADOR_ROUTES: Routes = [
  { path: '', component: CoordinadorDashboardComponent },
  { path: 'solicitudes/nueva', component: NuevaSolicitudComponent },
  { path: 'reportes/morosos', component: ListaMorososComponent },
  { path: 'conciliaciones', component: ListaConciliacionesComponent },
  { path: 'conciliaciones/autorizaciones', component: AutorizacionesPendientesComponent },
  { path: 'clientes/ediciones', component: EdicionesPendientesComponent }
];
