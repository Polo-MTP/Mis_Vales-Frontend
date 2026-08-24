import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { UserMenuComponent } from '../../../shared/components/user-menu/user-menu.component';
import { NotificationBellComponent } from '../../../shared/components/notifications/notification-bell/notification-bell';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-tablet-header',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenuComponent, NotificationBellComponent, BrandLogoComponent],
  templateUrl: './tablet-header.component.html'
})
export class TabletHeaderComponent {
  readonly authService = inject(AuthService);
}
