import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationPanelComponent } from '../notification-panel/notification-panel';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule, NotificationPanelComponent],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css'
})
export class NotificationBellComponent implements OnInit {
  private notificationService = inject(NotificationService);

  readonly panelAbierto = signal(false);
  readonly unreadCount = signal(0);

  ngOnInit(): void {
    this.actualizarConteo();
  }

  private actualizarConteo(): void {
    // per_page=1 solo para no traer datos de más -- lo que importa es 'total' de la
    // paginación (el conteo real de no leídas), no el arreglo en sí.
    this.notificationService.listar(1, false, 1).subscribe({
      next: (res) => this.unreadCount.set(res.data?.meta?.total ?? 0),
      error: () => this.unreadCount.set(0)
    });
  }

  togglePanel(): void {
    this.panelAbierto.update((a) => !a);
  }

  cerrarPanel(): void {
    this.panelAbierto.set(false);
    // Puede haber marcado notificaciones como leídas dentro del panel.
    this.actualizarConteo();
  }
}
