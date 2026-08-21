import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RouterModule } from '@angular/router';
import { ConciliacionService } from '../../services/conciliacion.service';
import { AbonoConciliacion, EstadoAbonoConciliacion, ResumenImportacionConciliacion } from '../../../../../core/models/conciliacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { tipoPagoLabel, estadoAbonoLabel } from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-lista-conciliaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
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

  archivoSeleccionado = signal<File | null>(null);
  importando = signal(false);
  errorImportar = signal<string | null>(null);
  resumenImportar = signal<ResumenImportacionConciliacion | null>(null);

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

    cambiarPagina(nuevaPagina: number): void {
    const p = this.paginacion();
    if (!p) return;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargar();
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado.set(input.files?.[0] ?? null);
  }

  importar(): void {
    const archivo = this.archivoSeleccionado();
    if (!archivo) return;

    this.importando.set(true);
    this.errorImportar.set(null);
    this.resumenImportar.set(null);

    this.conciliacionService.importar(archivo).subscribe({
      next: (res) => {
        this.importando.set(false);
        this.resumenImportar.set(res.data ?? null);
        this.archivoSeleccionado.set(null);
        this.cargar();
      },
      error: (err) => {
        this.importando.set(false);
        this.errorImportar.set(err.error?.message || 'Ocurrió un error al importar el archivo.');
      }
    });
  }
}
