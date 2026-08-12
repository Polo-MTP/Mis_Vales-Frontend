import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../../../../core/models/notificacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { auditAccionLabel, auditRecursoLabel } from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-lista-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-notificaciones.component.html',
  styleUrl: './lista-notificaciones.component.css'
})
export class ListaNotificacionesComponent implements OnInit {
  private notificacionService = inject(NotificacionService);

  notificaciones = signal<Notificacion[]>([]);
  paginacion = signal<PaginatedResponse<Notificacion> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);

  readonly auditAccionLabel = auditAccionLabel;
  readonly auditRecursoLabel = auditRecursoLabel;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.notificacionService.listar(this.pagina()).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.notificaciones.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las notificaciones.');
        this.cargando.set(false);
      }
    });
  }

  cambiarPagina(delta: number): void {
    const p = this.paginacion();
    if (!p) return;
    const nuevaPagina = this.pagina() + delta;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargar();
  }
}
