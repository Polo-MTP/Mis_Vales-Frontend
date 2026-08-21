import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { SolicitudEdicionClienteService } from '../../services/solicitud-edicion-cliente.service';
import { SolicitudEdicionCliente } from '../../../../../core/models/solicitud-edicion-cliente.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-ediciones-pendientes',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './ediciones-pendientes.component.html',
  styleUrl: './ediciones-pendientes.component.css'
})
export class EdicionesPendientesComponent implements OnInit {
  private solicitudEdicionClienteService = inject(SolicitudEdicionClienteService);

  solicitudes = signal<SolicitudEdicionCliente[]>([]);
  paginacion = signal<PaginatedResponse<SolicitudEdicionCliente> | null>(null);
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

    this.solicitudEdicionClienteService.pendientes(this.pagina()).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.solicitudes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes de edición.');
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

  aprobar(solicitud: SolicitudEdicionCliente): void {
    this.decidir(solicitud, 'aprobada');
  }

  rechazar(solicitud: SolicitudEdicionCliente): void {
    const comentario = prompt('Motivo del rechazo (opcional):') || undefined;
    this.decidir(solicitud, 'rechazada', comentario);
  }

  private decidir(solicitud: SolicitudEdicionCliente, decision: 'aprobada' | 'rechazada', comentario?: string): void {
    this.decidiendo.set(solicitud.id);
    this.errorDecidir.set(null);

    this.solicitudEdicionClienteService.decidir(solicitud.id, decision, comentario).subscribe({
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
