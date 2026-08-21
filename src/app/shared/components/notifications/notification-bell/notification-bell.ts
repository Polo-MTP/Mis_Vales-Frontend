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
  /** Aproximado: cuenta solo lo no leído dentro de la primera página, no el total real --
   *  suficiente para el puntito rojo, no hace falta el número exacto. */
  readonly unreadCount = signal(0);

  ngOnInit(): void {
    this.actualizarConteo();
  }

  private actualizarConteo(): void {
    this.notificationService.listar(1).subscribe({
      next: (res) => {
        const notificaciones = res.data?.data ?? [];
        this.unreadCount.set(notificaciones.filter((n) => n.destinatario_id !== null && !n.leida).length);
      },
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
