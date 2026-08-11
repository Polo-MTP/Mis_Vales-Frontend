import { Routes } from '@angular/router';
import { GerenteDashboardComponent } from './pages/dashboard/gerente-dashboard.component';
import { ListaSolicitudesComponent } from './alta-proveedor/pages/lista-solicitudes/lista-solicitudes.component';
import { DetalleSolicitudComponent } from './alta-proveedor/pages/detalle-solicitud/detalle-solicitud.component';
import { ListaDistribuidorasComponent } from './distribuidoras/pages/lista-distribuidoras/lista-distribuidoras.component';
import { DetalleDistribuidoraComponent } from './distribuidoras/pages/detalle-distribuidora/detalle-distribuidora.component';
import { ListaProductosComponent } from './productos/pages/lista-productos/lista-productos.component';
import { ValesPendientesComponent } from './vales/pages/vales-pendientes/vales-pendientes.component';
import { authGuard } from '../auth/guards/auth.guard';

export const GERENTE_ROUTES: Routes = [
  { path: '', component: GerenteDashboardComponent, canActivate: [authGuard] },
  { path: 'solicitudes', component: ListaSolicitudesComponent, canActivate: [authGuard] },
  { path: 'solicitudes/:id', component: DetalleSolicitudComponent, canActivate: [authGuard] },
  { path: 'distribuidoras', component: ListaDistribuidorasComponent, canActivate: [authGuard] },
  { path: 'distribuidoras/:id', component: DetalleDistribuidoraComponent, canActivate: [authGuard] },
  { path: 'productos', component: ListaProductosComponent, canActivate: [authGuard] },
  { path: 'vales', component: ValesPendientesComponent, canActivate: [authGuard] }
];
