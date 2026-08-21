import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../../services/notification.service';
import { Notificacion } from '../../../../core/models/notificacion.model';
import { PaginacionAnidada } from '../../../../core/models/paginacion-anidada.model';
import { PaginationComponent } from '../../pagination/pagination.component';
import {
  notificacionAccionLabel,
  auditRecursoLabel
} from '../../../utils/labels';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './notification-list.component.html'
})
export class NotificationListComponent implements OnInit {

  private notificationService = inject(NotificationService);

  notificaciones = signal<Notificacion[]>([]);
  paginacion = signal<PaginacionAnidada<Notificacion>['meta'] | null>(null);

  cargando = signal(true);
  error = signal<string | null>(null);

  pagina = signal(1);

  readonly notificacionAccionLabel = notificacionAccionLabel;
  readonly auditRecursoLabel = auditRecursoLabel;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {

    this.cargando.set(true);
    this.error.set(null);

    this.notificationService.listar(this.pagina()).subscribe({

      next: (res) => {

        this.paginacion.set(res.data?.meta ?? null);
        this.notificaciones.set(res.data?.data ?? []);

        this.cargando.set(false);
      },

      error: () => {

        this.error.set(
          'No se pudieron cargar las notificaciones.'
        );

        this.cargando.set(false);
      }

    });
  }

 cambiarPagina(nuevaPagina: number): void {

  const p = this.paginacion();

  if (!p) {
    return;
  }

  if (nuevaPagina < 1 || nuevaPagina > p.last_page) {
    return;
  }

  this.pagina.set(nuevaPagina);
  this.cargar();
}

  marcarComoLeida(n: Notificacion): void {
    // Las entradas del feed de supervisión (Gerente/Administrador) no tienen destinatario --
    // son de todos y de nadie a la vez, no se marcan como leídas.
    if (n.leida || n.destinatario_id === null) return;

    this.notificationService.marcarLeida(n.id).subscribe({
      next: (res) => {
        if (res.data) {
          this.notificaciones.update((lista) => lista.map((item) => (item.id === n.id ? res.data! : item)));
        }
      }
    });
  }

}