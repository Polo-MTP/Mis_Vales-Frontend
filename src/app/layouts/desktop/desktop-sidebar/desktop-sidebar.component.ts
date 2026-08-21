import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../features/auth/services/auth.service';

interface SidebarItem {
  label: string;
  route?: string;
  children?: SidebarItem[];
}

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

  private readonly menuGerente: SidebarItem[] = [
    { label: 'Dashboard', route: '/gerente' },
    { label: 'Solicitudes', route: '/gerente/solicitudes' },
    {
      label: 'Distribuidoras',
      children: [
        { label: 'Catálogo', route: '/gerente/distribuidoras' },
        { label: 'Reasignar Coordinador', route: '/gerente/distribuidoras/reasignar-coordinador' },
        { label: 'Aumento de Crédito', route: '/gerente/distribuidoras/aumento-credito' }
      ]
    },
    { label: 'Productos', route: '/gerente/productos' },
    { label: 'Relaciones (Cortes)', route: '/gerente/relaciones' },
    { label: 'Reporte de Morosos', route: '/gerente/reportes/morosos' },
    {
      label: 'Conciliaciones',
      children: [
        { label: 'Conciliación Bancaria', route: '/gerente/conciliaciones' },
        { label: 'Autorizaciones Pendientes', route: '/gerente/conciliaciones/autorizaciones' }
      ]
    },
    {
      label: 'Clientes',
      children: [
        { label: 'Ediciones Pendientes', route: '/gerente/clientes/ediciones' },
        { label: 'Transferencias Pendientes', route: '/gerente/clientes/transferencias' }
      ]
    },
    { label: 'Configuraciones', route: '/gerente/configuraciones' },
    { label: 'Mis Autorizaciones', route: '/gerente/autorizaciones' }
  ];

  readonly menusPorRol: Record<string, SidebarItem[]> = {

    Administrador: [
      { label: 'Dashboard', route: '/administrador' },
      { label: 'Auditoría', route: '/administrador/logs' },
      { label: 'Notificaciones', route: '/administrador/notificaciones' }
    ],

    // "Personal y Sucursales" (dar de alta Gerentes de Sucursal, administrar sucursales) es
    // exclusivo de Gerente General en el backend -- a Gerente de Sucursal no le sirve de nada
    // verlo de solo lectura, así que ni se le muestra el link.
    'Gerente General': [...this.menuGerente, { label: 'Personal y Sucursales', route: '/gerente/personal' }],
    'Gerente de Sucursal': this.menuGerente,

    Cajera: [
      { label: 'Dashboard', route: '/cajera' },
      { label: 'Conciliación Bancaria', route: '/cajera/conciliaciones' },
      { label: 'Mis Solicitudes', route: '/cajera/conciliaciones/mis-solicitudes' },
      { label: 'Corregir Datos de Cliente', route: '/cajera/clientes/solicitar-edicion' },
      { label: 'Canjear Puntos', route: '/cajera/puntos/canjear' },
      { label: 'Consultar Vales', route: '/cajera/vales' }
    ]
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