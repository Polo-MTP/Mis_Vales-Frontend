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

    Gerente: [],

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