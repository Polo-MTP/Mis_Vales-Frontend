import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { MovimientoAutorizadoService } from '../../services/movimiento-autorizado.service';
import { MovimientoAutorizado } from '../../../../../core/models/movimiento-autorizado.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-mis-autorizaciones',
  standalone: true,
  imports: [CommonModule, PaginationComponent, EstadoBadgeComponent],
  templateUrl: './mis-autorizaciones.component.html'
})
export class MisAutorizacionesComponent implements OnInit {
  private movimientoService = inject(MovimientoAutorizadoService);

  movimientos = signal<MovimientoAutorizado[]>([]);
  paginacion = signal<PaginatedResponse<MovimientoAutorizado> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.movimientoService.listar(this.pagina()).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.movimientos.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu historial de autorizaciones.');
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
}
