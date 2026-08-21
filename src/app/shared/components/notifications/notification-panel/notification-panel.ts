import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { AuthService } from '../../../../features/auth/services/auth.service';

@Component({
  selector: 'app-notification-panel',
  imports: [CommonModule, RouterModule, NotificationListComponent],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.css',
})
export class NotificationPanelComponent {
  @Output() closePanel = new EventEmitter<void>();

  private authService = inject(AuthService);

  /** /administrador/notificaciones solo existe para ese rol -- el resto ya ve la lista
   *  completa (paginada) aquí mismo en el panel, no necesita a dónde más ir. */
  get tieneVistaCompleta(): boolean {
    return this.authService.userRole() === 'Administrador';
  }

  onClose(): void {
    this.closePanel.emit();
  }
}
