import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DesktopHeaderComponent } from '../desktop-header/desktop-header.component';
import { DesktopSidebarComponent } from '../desktop-sidebar/desktop-sidebar.component';
import { DesktopFooterComponent } from '../desktop-footer/desktop-footer.component';

@Component({
  selector: 'app-desktop-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DesktopHeaderComponent,
    DesktopSidebarComponent,
    DesktopFooterComponent
  ],
  templateUrl: './desktop-layout.component.html'
})
export class DesktopLayoutComponent {
  /** Visible por defecto -- el botón hamburguesa del header solo da la opción de colapsarlo,
   *  no cambia el comportamiento que ya tenían Administrador/Gerente/Cajera. */
  sidebarOpen = signal(true);
}