import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../features/auth/services/auth.service';

interface SidebarItem {
  label: string;
  route?: string;
  children?: SidebarItem[];
}

const MENU_GERENTE: SidebarItem[] = [
  {
    label: 'Dashboard',
    route: '/gerente'
  },
  {
    label: 'Solicitudes',
    route: '/gerente/solicitudes'
  },
  {
    label: 'Distribuidoras',
    route: '/gerente/distribuidoras'
  },
  {
    label: 'Productos',
    route: '/gerente/productos'
  },
  {
    label: 'Relaciones',
    route: '/gerente/relaciones'
  },
  {
    label: 'Conciliaciones',
    route: '/gerente/conciliaciones'
  },
  {
    label: 'Clientes',
    children: [
      { label: 'Ediciones Pendientes', route: '/gerente/clientes/ediciones' },
      { label: 'Transferencias Pendientes', route: '/gerente/clientes/transferencias' }
    ]
  },
  {
    label: 'Reportes',
    route: '/gerente/reportes/morosos'
  },
  {
    label: 'Configuraciones',
    route: '/gerente/configuraciones'
  }
];

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './desktop-sidebar.component.html'
})
export class DesktopSidebarComponent {

  readonly authService = inject(AuthService);

  readonly submenuAbierto = signal<string | null>(null);

  readonly menusPorRol: Record<string, SidebarItem[]> = {

    Administrador: [
      {
        label: 'Dashboard',
        route: '/administrador'
      },
      {
        label: 'Auditoría',
        route: '/administrador/logs'
      }
    ],

    'Gerente General': MENU_GERENTE,
    'Gerente de Sucursal': MENU_GERENTE,

    Cajera: []
  };

  get menuItems(): SidebarItem[] {
    return this.menusPorRol[this.authService.userRole()] ?? [];
  }

  toggleSubmenu(label: string): void {
    this.submenuAbierto.update(actual =>
      actual === label ? null : label
    );
  }
}