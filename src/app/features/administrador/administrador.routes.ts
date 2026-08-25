import { Routes } from '@angular/router';
import { NotificationListComponent } from '../../shared/components/notifications/notification-list/notification-list.component';
import { ListaAuditoriaComponent } from './auditoria/pages/lista-auditoria/lista-auditoria.component';
import { CambiarPasswordComponent } from '../../shared/components/cambiar-password/cambiar-password.component';
import { AdministradorPersonalComponent } from './personal/pages/personal/personal.component';

export const ADMINISTRADOR_ROUTES: Routes = [
  { path: '', redirectTo: 'logs', pathMatch: 'full' },
  { path: 'logs', component: ListaAuditoriaComponent },
  { path: 'personal', component: AdministradorPersonalComponent },
  { path: 'notificaciones', component: NotificationListComponent },
  { path: 'cuenta/contrasena', component: CambiarPasswordComponent }
];
