import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { EstadoSolicitud, SolicitudProveedor } from '../../../../../core/models/solicitud-proveedor.model';

// Debe coincidir con el tamaño de página por defecto de Laravel (Model::$perPage) en el backend.
const PER_PAGE = 15;

@Component({
  selector: 'app-lista-solicitudes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-solicitudes.component.html',
  styleUrl: './lista-solicitudes.component.css'
})
export class ListaSolicitudesComponent implements OnInit {
  private solicitudService = inject(SolicitudService);
  private router = inject(Router);

  solicitudes = signal<SolicitudProveedor[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  filtroEstado = signal<EstadoSolicitud>('verificado');

  pagina = signal(1);
  hayPaginaSiguiente = signal(false);

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudService.listar(this.filtroEstado(), this.pagina()).subscribe({
      next: (res) => {
        const items = res.data ?? [];
        this.solicitudes.set(items);
        this.hayPaginaSiguiente.set(items.length === PER_PAGE);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(estado: EstadoSolicitud): void {
    if (this.filtroEstado() !== estado) {
      this.filtroEstado.set(estado);
      this.pagina.set(1);
      this.cargarSolicitudes();
    }
  }

  paginaSiguiente(): void {
    if (!this.hayPaginaSiguiente()) return;
    this.pagina.set(this.pagina() + 1);
    this.cargarSolicitudes();
  }

  paginaAnterior(): void {
    if (this.pagina() <= 1) return;
    this.pagina.set(this.pagina() - 1);
    this.cargarSolicitudes();
  }

  irADetalle(id: number): void {
    this.router.navigate(['/gerente/solicitudes', id]);
  }
}
