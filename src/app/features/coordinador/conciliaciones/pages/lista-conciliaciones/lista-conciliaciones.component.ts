import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConciliacionService } from '../../services/conciliacion.service';
import { AbonoConciliacion, EstadoAbonoConciliacion } from '../../../../../core/models/conciliacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-lista-conciliaciones',
  standalone: true,
  imports: [CommonModule],
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

  conciliandoManual = signal<number | null>(null);
  errorManual = signal<string | null>(null);

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

  conciliarManual(abono: AbonoConciliacion): void {
    const relacionIdTexto = prompt('ID de la relación a la que corresponde este abono:');
    if (!relacionIdTexto) return;

    const relacionId = Number(relacionIdTexto);
    if (!relacionId || relacionId <= 0) {
      this.errorManual.set('El ID de la relación debe ser un número válido.');
      return;
    }

    const motivo = prompt('Motivo de la conciliación manual:');
    if (!motivo) return;

    this.conciliandoManual.set(abono.id);
    this.errorManual.set(null);

    this.conciliacionService.conciliarManual(abono.id, relacionId, motivo).subscribe({
      next: () => {
        this.conciliandoManual.set(null);
        this.cargar();
      },
      error: (err) => {
        this.conciliandoManual.set(null);
        this.errorManual.set(err.error?.message || 'Ocurrió un error al conciliar manualmente.');
      }
    });
  }
}
