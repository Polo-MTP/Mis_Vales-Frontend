import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../features/auth/services/auth.service';

interface SidebarItem {
  label: string;
  route?: string;
  children?: SidebarItem[];
}

const MENU_GERENTE: SidebarItem[] = [
  { label: 'Dashboard', route: '/gerente' },
  { label: 'Solicitudes', route: '/gerente/solicitudes' },
  { label: 'Distribuidoras', route: '/gerente/distribuidoras' },
  { label: 'Productos', route: '/gerente/productos' },
  { label: 'Vales', route: '/gerente/vales' },
  { label: 'Relaciones', route: '/gerente/relaciones' },
  { label: 'Conciliaciones', route: '/gerente/conciliaciones' },
  {
    label: 'Clientes',
    children: [
      { label: 'Ediciones Pendientes', route: '/gerente/clientes/ediciones' },
      { label: 'Transferencias Pendientes', route: '/gerente/clientes/transferencias' }
    ]
  },
  { label: 'Reportes', route: '/gerente/reportes/morosos' },
  { label: 'Configuraciones', route: '/gerente/configuraciones' },
  { label: 'Mis Autorizaciones', route: '/gerente/autorizaciones' }
];

@Component({
  selector: 'app-shared-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-sidebar.component.html'
})
export class SharedSidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  readonly submenuAbierto = signal<string | null>(null);

  readonly menusPorRol: Record<string, SidebarItem[]> = {
    Administrador: [
      { label: 'Dashboard', route: '/administrador' },
      { label: 'Auditoría', route: '/administrador/logs' },
      { label: 'Notificaciones', route: '/administrador/notificaciones' }
    ],
    // "Personal y Sucursales" es exclusivo de Gerente General en el backend -- Gerente de
    // Sucursal no lo ve, no le sirve de nada verlo de solo lectura.
    'Gerente General': [...MENU_GERENTE, { label: 'Personal y Sucursales', route: '/gerente/personal' }],
    'Gerente de Sucursal': MENU_GERENTE,
    Cajera: [
      { label: 'Dashboard', route: '/cajera' },
      { label: 'Conciliación Bancaria', route: '/cajera/conciliaciones' },
      { label: 'Mis Solicitudes', route: '/cajera/conciliaciones/mis-solicitudes' },
      { label: 'Corregir Datos de Cliente', route: '/cajera/clientes/solicitar-edicion' },
      { label: 'Canjear Puntos', route: '/cajera/puntos/canjear' },
      { label: 'Consultar Vales', route: '/cajera/vales' }
    ],
    Coordinador: [
      { label: 'Dashboard', route: '/coordinador' },
      { label: 'Solicitudes', route: '/coordinador/solicitudes' },
      { label: 'Nueva Solicitud', route: '/coordinador/solicitudes/nueva' },
      { label: 'Reporte de Morosos', route: '/coordinador/reportes/morosos' },
      { label: 'Conciliación Bancaria', route: '/coordinador/conciliaciones' },
      { label: 'Autorizaciones Pendientes', route: '/coordinador/conciliaciones/autorizaciones' },
      { label: 'Ediciones de Cliente', route: '/coordinador/clientes/ediciones' },
      { label: 'Transferencias Pendientes', route: '/coordinador/clientes/transferencias' },
      { label: 'Reasignar Clientes', route: '/coordinador/distribuidoras/reasignar-clientes' },
      { label: 'Vales', route: '/coordinador/vales' },
      { label: 'Mis Autorizaciones', route: '/coordinador/autorizaciones' }
    ],
    Verificador: [
      { label: 'Solicitudes Pendientes', route: '/verificador/alta-proveedor/pendientes' }
    ],
    Distribuidora: [
      { label: 'Dashboard', route: '/distribuidora' },
      { label: 'Clientes', route: '/distribuidora/clientes' },
      { label: 'Vales', route: '/distribuidora/vales' },
      { label: 'Historial de Puntos', route: '/distribuidora/puntos/historial' },
      { label: 'Mis Pagos y Abonos', route: '/distribuidora/conciliaciones' },
      { label: 'Aumento de Crédito', route: '/distribuidora/creditos/aumento' },
      { label: 'Mis Cortes', route: '/distribuidora/relaciones' }
    ]
  };

  get menuItems(): SidebarItem[] {
    return this.menusPorRol[this.authService.userRole()] ?? [];
  }

  toggleSubmenu(label: string): void {
    this.submenuAbierto.update(actual => actual === label ? null : label);
  }

  onClose(): void {
    this.closeSidebar.emit();
  }
}
