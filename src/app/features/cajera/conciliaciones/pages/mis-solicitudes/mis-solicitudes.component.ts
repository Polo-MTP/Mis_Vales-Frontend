import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RouterModule } from '@angular/router';
import { ConciliacionService } from '../../services/conciliacion.service';
import { SolicitudConciliacion } from '../../../../../core/models/solicitud-conciliacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { estadoSolicitudLabel } from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './mis-solicitudes.component.html',
  styleUrl: './mis-solicitudes.component.css'
})
export class MisSolicitudesComponent implements OnInit {
  private conciliacionService = inject(ConciliacionService);

  solicitudes = signal<SolicitudConciliacion[]>([]);
  paginacion = signal<PaginatedResponse<SolicitudConciliacion> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);

  readonly estadoSolicitudLabel = estadoSolicitudLabel;

  ejecutando = signal<number | null>(null);
  errorEjecutar = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.conciliacionService.misSolicitudes(this.pagina()).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.solicitudes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus solicitudes.');
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

  ejecutar(solicitud: SolicitudConciliacion): void {
    this.ejecutando.set(solicitud.id);
    this.errorEjecutar.set(null);

    this.conciliacionService.ejecutar(solicitud.abono_conciliacion_id, solicitud.id).subscribe({
      next: () => {
        this.ejecutando.set(null);
        this.cargar();
      },
      error: (err) => {
        this.ejecutando.set(null);
        this.errorEjecutar.set(err.error?.message || 'Ocurrió un error al ejecutar la conciliación.');
      }
    });
  }
}
