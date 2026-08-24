import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedSidebarComponent } from '../../../shared/components/shared-sidebar/shared-sidebar.component';

@Component({
  selector: 'app-tablet-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedSidebarComponent],
  templateUrl: './tablet-navigation.component.html'
})
export class TabletNavigationComponent {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}