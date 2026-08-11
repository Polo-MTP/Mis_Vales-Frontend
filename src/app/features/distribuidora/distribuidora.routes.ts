import { Routes } from '@angular/router';
import { DistribuidoraDashboardComponent } from './pages/dashboard/distribuidora-dashboard.component';
import { ListaClientesComponent } from './clientes/pages/lista-clientes/lista-clientes.component';
import { NuevoClienteComponent } from './clientes/pages/nuevo-cliente/nuevo-cliente.component';
import { DetalleClienteComponent } from './clientes/pages/detalle-cliente/detalle-cliente.component';
import { authGuard } from '../auth/guards/auth.guard';

export const DISTRIBUIDORA_ROUTES: Routes = [
  { path: '', component: DistribuidoraDashboardComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ListaClientesComponent, canActivate: [authGuard] },
  { path: 'clientes/nuevo', component: NuevoClienteComponent, canActivate: [authGuard] },
  { path: 'clientes/:id', component: DetalleClienteComponent, canActivate: [authGuard] }
];
