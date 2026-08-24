import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { SharedSidebarComponent } from '../../../shared/components/shared-sidebar/shared-sidebar.component';
import { NotificationBellComponent } from '../../../shared/components/notifications/notification-bell/notification-bell';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-tablet-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedSidebarComponent, NotificationBellComponent, BrandLogoComponent],
  templateUrl: './tablet-navigation.component.html'
})
export class TabletNavigationComponent {
  readonly authService = inject(AuthService);
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}