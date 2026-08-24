import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { UserMenuComponent } from '../../../shared/components/user-menu/user-menu.component';
import { NotificationBellComponent } from '../../../shared/components/notifications/notification-bell/notification-bell';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-desktop-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserMenuComponent,
    NotificationBellComponent,
    BrandLogoComponent
  ],
  templateUrl: './desktop-header.component.html',
  styleUrl: './desktop-header.component.css'
})
export class DesktopHeaderComponent {
  readonly authService = inject(AuthService);

  /** Colapsa/expande el sidebar fijo -- mismo botón hamburguesa que ya existe en mobile/tablet,
   *  para que las tres capas de layout tengan el mismo control de navegación. */
  @Output() toggleSidebar = new EventEmitter<void>();
}