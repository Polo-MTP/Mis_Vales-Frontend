import { Routes } from '@angular/router';
import { CajeraDashboardComponent } from './pages/dashboard/cajera-dashboard.component';
import { ListaConciliacionesComponent } from './conciliaciones/pages/lista-conciliaciones/lista-conciliaciones.component';
import { MisSolicitudesComponent } from './conciliaciones/pages/mis-solicitudes/mis-solicitudes.component';
import { SolicitarEdicionComponent } from './clientes/pages/solicitar-edicion/solicitar-edicion.component';
import { CanjearPuntosComponent } from './puntos/pages/canjear-puntos/canjear-puntos.component';
import { ListaValesComponent } from './vales/pages/lista-vales/lista-vales.component';
import { ListaMorososComponent } from '../coordinador/reportes/pages/lista-morosos/lista-morosos.component';

export const CAJERA_ROUTES: Routes = [
  { path: '', component: CajeraDashboardComponent },
  { path: 'conciliaciones', component: ListaConciliacionesComponent },
  { path: 'conciliaciones/mis-solicitudes', component: MisSolicitudesComponent },
  { path: 'clientes/solicitar-edicion', component: SolicitarEdicionComponent },
  { path: 'puntos/canjear', component: CanjearPuntosComponent },
  { path: 'vales', component: ListaValesComponent },
  { path: 'reportes/morosos', component: ListaMorososComponent }
];
