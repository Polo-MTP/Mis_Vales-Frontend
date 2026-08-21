import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationPanelComponent } from '../notification-panel/notification-panel';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule, NotificationPanelComponent],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css'
})
export class NotificationBellComponent {
  readonly panelAbierto = signal(false);
  readonly unreadCount = signal(3); // Mock value for now

  togglePanel(): void {
    this.panelAbierto.update(a => !a);
  }

  cerrarPanel(): void {
    this.panelAbierto.set(false);
  }
}
