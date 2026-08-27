import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../features/auth/services/auth.service';

interface SidebarItem {
  label: string;
  route?: string;
  children?: SidebarItem[];
}

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

  // Administrador, Gerente General, Gerente de Sucursal y Cajera siempre usan
  // DesktopLayoutComponent (ver app.routes.ts), nunca este sidebar -- por eso no tienen
  // entrada aquí. Antes sí la tenían, pero era código muerto inalcanzable que había divergido
  // del menú real en desktop-sidebar.component.ts (le faltaban submenús como "Autorizaciones
  // Pendientes").
  readonly menusPorRol: Record<string, SidebarItem[]> = {
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
      { label: 'Aumento de Crédito', route: '/coordinador/creditos/aumento' },
      { label: 'Mis Autorizaciones', route: '/coordinador/autorizaciones' }
    ],
    Verificador: [
      { label: 'Solicitudes Pendientes', route: '/verificador/alta-proveedor/pendientes' },
      { label: 'Distribuidoras', route: '/verificador/distribuidoras' }
    ],
    Distribuidora: [
      { label: 'Dashboard', route: '/distribuidora' },
      { label: 'Clientes', route: '/distribuidora/clientes' },
      { label: 'Transferencia de Clientes', route: '/distribuidora/clientes/transferencias' },
      { label: 'Vales', route: '/distribuidora/vales' },
      { label: 'Historial de Puntos', route: '/distribuidora/puntos/historial' },
      { label: 'Mis Pagos y Abonos', route: '/distribuidora/conciliaciones' },
      { label: 'Aumento de Crédito', route: '/distribuidora/creditos/aumento' },
      { label: 'Mis Cortes', route: '/distribuidora/relaciones' },
      { label: 'Estado de Cuenta', route: '/distribuidora/estado-cuenta' }
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
