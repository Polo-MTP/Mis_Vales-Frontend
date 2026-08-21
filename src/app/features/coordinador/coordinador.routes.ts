import { Routes } from '@angular/router';
import { CoordinadorDashboardComponent } from './pages/dashboard/coordinador-dashboard.component';
import { NuevaSolicitudComponent } from './alta-proveedor/pages/nueva-solicitud/nueva-solicitud.component';
import { ListaSolicitudesComponent } from './alta-proveedor/pages/lista-solicitudes/lista-solicitudes.component';
import { DetalleSolicitudComponent } from './alta-proveedor/pages/detalle-solicitud/detalle-solicitud.component';
import { ListaMorososComponent } from './reportes/pages/lista-morosos/lista-morosos.component';
import { ListaConciliacionesComponent } from './conciliaciones/pages/lista-conciliaciones/lista-conciliaciones.component';
import { AutorizacionesPendientesComponent } from './conciliaciones/pages/autorizaciones-pendientes/autorizaciones-pendientes.component';
import { EdicionesPendientesComponent } from './clientes/pages/ediciones-pendientes/ediciones-pendientes.component';
import { ReasignarClientesComponent } from './distribuidoras/pages/reasignar-clientes/reasignar-clientes.component';
import { TransferenciasPendientesComponent } from './clientes/pages/transferencias-pendientes/transferencias-pendientes.component';

export const COORDINADOR_ROUTES: Routes = [
  { path: '', component: CoordinadorDashboardComponent },
  { path: 'solicitudes', component: ListaSolicitudesComponent },
  { path: 'solicitudes/nueva', component: NuevaSolicitudComponent },
  { path: 'solicitudes/:id', component: DetalleSolicitudComponent },
  { path: 'reportes/morosos', component: ListaMorososComponent },
  { path: 'conciliaciones', component: ListaConciliacionesComponent },
  { path: 'conciliaciones/autorizaciones', component: AutorizacionesPendientesComponent },
  { path: 'clientes/ediciones', component: EdicionesPendientesComponent },
  { path: 'clientes/transferencias', component: TransferenciasPendientesComponent },
  { path: 'distribuidoras/reasignar-clientes', component: ReasignarClientesComponent }
];
