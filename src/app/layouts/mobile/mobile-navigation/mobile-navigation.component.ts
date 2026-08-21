import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { SharedSidebarComponent } from '../../../shared/components/shared-sidebar/shared-sidebar.component';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedSidebarComponent],
  templateUrl: './mobile-navigation.component.html'
})
export class MobileNavigationComponent {
  readonly authService = inject(AuthService);
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}