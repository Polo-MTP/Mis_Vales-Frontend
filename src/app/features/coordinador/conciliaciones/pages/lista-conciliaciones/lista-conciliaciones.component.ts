import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConciliacionService } from '../../services/conciliacion.service';
import { AbonoConciliacion, EstadoAbonoConciliacion } from '../../../../../core/models/conciliacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { tipoPagoLabel, estadoAbonoLabel } from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-lista-conciliaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-conciliaciones.component.html',
  styleUrl: './lista-conciliaciones.component.css'
})
export class ListaConciliacionesComponent implements OnInit {
  private conciliacionService = inject(ConciliacionService);

  abonos = signal<AbonoConciliacion[]>([]);
  paginacion = signal<PaginatedResponse<AbonoConciliacion> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroEstado = signal<EstadoAbonoConciliacion | 'todos'>('todos');

  readonly tipoPagoLabel = tipoPagoLabel;
  readonly estadoAbonoLabel = estadoAbonoLabel;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const filtro = this.filtroEstado();
    const estado = filtro === 'todos' ? undefined : filtro;

    this.conciliacionService.listar(this.pagina(), estado).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.abonos.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los abonos de conciliación.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(estado: EstadoAbonoConciliacion | 'todos'): void {
    this.filtroEstado.set(estado);
    this.pagina.set(1);
    this.cargar();
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
