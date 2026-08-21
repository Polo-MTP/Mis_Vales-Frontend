import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RouterModule } from '@angular/router';
import { PuntoMovimientoService } from '../../services/punto-movimiento.service';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { PuntoMovimiento } from '../../../../../core/models/punto-movimiento.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-historial-puntos',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './historial-puntos.component.html',
  styleUrl: './historial-puntos.component.css'
})
export class HistorialPuntosComponent implements OnInit {
  private puntoMovimientoService = inject(PuntoMovimientoService);
  private clienteService = inject(ClienteService);

  movimientos = signal<PuntoMovimiento[]>([]);
  paginacion = signal<PaginatedResponse<PuntoMovimiento> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);

  private distribuidoraId: number | null = null;

  ngOnInit(): void {
    this.clienteService.miPerfil().subscribe({
      next: (res) => {
        this.distribuidoraId = res.data?.id ?? null;
        if (this.distribuidoraId) {
          this.cargar();
        } else {
          this.error.set('No se pudo determinar tu distribuidora.');
          this.cargando.set(false);
        }
      },
      error: () => {
        this.error.set('No se pudo cargar tu perfil.');
        this.cargando.set(false);
      }
    });
  }

  cargar(): void {
    if (!this.distribuidoraId) return;

    this.cargando.set(true);
    this.error.set(null);

    this.puntoMovimientoService.historial(this.distribuidoraId, this.pagina()).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.movimientos.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu historial de puntos.');
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
