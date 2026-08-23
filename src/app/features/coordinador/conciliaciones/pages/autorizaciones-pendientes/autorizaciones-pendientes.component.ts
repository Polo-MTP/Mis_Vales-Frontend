import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RouterModule } from '@angular/router';
import { ConciliacionService } from '../../services/conciliacion.service';
import { SolicitudConciliacion } from '../../../../../core/models/solicitud-conciliacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-autorizaciones-pendientes',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent, DineroPipe],
  templateUrl: './autorizaciones-pendientes.component.html',
  styleUrl: './autorizaciones-pendientes.component.css'
})
export class AutorizacionesPendientesComponent implements OnInit {
  private conciliacionService = inject(ConciliacionService);

  solicitudes = signal<SolicitudConciliacion[]>([]);
  paginacion = signal<PaginatedResponse<SolicitudConciliacion> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);

  decidiendo = signal<number | null>(null);
  errorDecidir = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.conciliacionService.autorizacionesPendientes(this.pagina()).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.solicitudes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes de conciliación.');
        this.cargando.set(false);
      }
    });
  }

    cambiarPagina(nuevaPagina: number): void {
    const p = this.paginacion();
    if (!p) return;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargar();
  }

  aprobar(solicitud: SolicitudConciliacion): void {
    this.decidir(solicitud, 'aprobada');
  }

  rechazar(solicitud: SolicitudConciliacion): void {
    const comentario = prompt('Motivo del rechazo (opcional):') || undefined;
    this.decidir(solicitud, 'rechazada', comentario);
  }

  private decidir(solicitud: SolicitudConciliacion, decision: 'aprobada' | 'rechazada', comentario?: string): void {
    this.decidiendo.set(solicitud.id);
    this.errorDecidir.set(null);

    this.conciliacionService.decidirAutorizacion(solicitud.id, decision, comentario).subscribe({
      next: () => {
        this.decidiendo.set(null);
        this.cargar();
      },
      error: (err) => {
        this.decidiendo.set(null);
        this.errorDecidir.set(err.error?.message || 'Ocurrió un error al registrar la decisión.');
      }
    });
  }
}
