import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

interface MenuItem {
  label: string;
  route: string;
}

const MENU_COORDINADOR: MenuItem[] = [
  { label: 'Dashboard', route: '/coordinador' },
  { label: 'Solicitudes', route: '/coordinador/solicitudes' },
  { label: 'Nueva Solicitud', route: '/coordinador/solicitudes/nueva' },
  { label: 'Reporte de Morosos', route: '/coordinador/reportes/morosos' },
  { label: 'Conciliación Bancaria', route: '/coordinador/conciliaciones' },
  { label: 'Autorizaciones Pendientes', route: '/coordinador/conciliaciones/autorizaciones' },
  { label: 'Ediciones de Cliente', route: '/coordinador/clientes/ediciones' },
  { label: 'Transferencias Pendientes', route: '/coordinador/clientes/transferencias' },
  { label: 'Reasignar Clientes', route: '/coordinador/distribuidoras/reasignar-clientes' }
];

const MENU_VERIFICADOR: MenuItem[] = [
  { label: 'Solicitudes Pendientes', route: '/verificador/alta-proveedor/pendientes' }
];

@Component({
  selector: 'app-tablet-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tablet-header.component.html'
})
export class TabletHeaderComponent {
  readonly authService = inject(AuthService);

  menuAbierto = signal(false);

  toggleMenu(): void {
    this.menuAbierto.update(abierto => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  get homeRoute(): string {
    switch (this.authService.userRole()) {
      case 'Coordinador':
        return '/coordinador';

      case 'Verificador':
        return '/verificador';

      default:
        return '/auth/login';
    }
  }

  get menuItems(): MenuItem[] {
    switch (this.authService.userRole()) {
      case 'Coordinador':
        return MENU_COORDINADOR;
      case 'Verificador':
        return MENU_VERIFICADOR;
      default:
        return [];
    }
  }

  logout(): void {
    this.cerrarMenu();
    this.authService.logout();
  }
}