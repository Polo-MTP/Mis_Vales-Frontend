import { Routes } from '@angular/router';
import { DistribuidoraDashboardComponent } from './pages/dashboard/distribuidora-dashboard.component';
import { ListaClientesComponent } from './clientes/pages/lista-clientes/lista-clientes.component';
import { NuevoClienteComponent } from './clientes/pages/nuevo-cliente/nuevo-cliente.component';
import { DetalleClienteComponent } from './clientes/pages/detalle-cliente/detalle-cliente.component';
import { MisValesComponent } from './vales/pages/mis-vales/mis-vales.component';
import { SolicitarValeComponent } from './vales/pages/solicitar-vale/solicitar-vale.component';
import { HistorialPuntosComponent } from './puntos/pages/historial-puntos/historial-puntos.component';

export const DISTRIBUIDORA_ROUTES: Routes = [
  { path: '', component: DistribuidoraDashboardComponent },
  { path: 'clientes', component: ListaClientesComponent },
  { path: 'clientes/nuevo', component: NuevoClienteComponent },
  { path: 'clientes/:id', component: DetalleClienteComponent },
  { path: 'vales', component: MisValesComponent },
  { path: 'vales/solicitar', component: SolicitarValeComponent },
  { path: 'puntos/historial', component: HistorialPuntosComponent }
];
