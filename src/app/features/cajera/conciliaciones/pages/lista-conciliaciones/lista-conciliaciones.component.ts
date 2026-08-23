import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConciliacionService } from '../../services/conciliacion.service';
import { RelacionService } from '../../services/relacion.service';
import { AbonoConciliacion, EstadoAbonoConciliacion, ResumenImportacionConciliacion } from '../../../../../core/models/conciliacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { Relacion } from '../../../../../core/models/relacion.model';
import { tipoPagoLabel, estadoAbonoLabel } from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-lista-conciliaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PaginationComponent, DineroPipe],
  templateUrl: './lista-conciliaciones.component.html',
  styleUrl: './lista-conciliaciones.component.css'
})
export class ListaConciliacionesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private conciliacionService = inject(ConciliacionService);
  private relacionService = inject(RelacionService);

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

  solicitando = signal<number | null>(null);
  errorSolicitar = signal<string | null>(null);
  successSolicitar = signal<string | null>(null);

  // Panel de "solicitar autorización": abono para el que está abierto, resultados de la
  // búsqueda de relación por referencia de pago, y la relación que la cajera ya eligió.
  abonoAbierto = signal<AbonoConciliacion | null>(null);
  buscandoRelacion = signal(false);
  resultadosRelacion = signal<Relacion[]>([]);
  relacionElegida = signal<Relacion | null>(null);
  motivoForm = this.fb.group({
    motivo: ['', [Validators.required, Validators.maxLength(255)]]
  });

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

  abrirSolicitud(abono: AbonoConciliacion): void {
    this.abonoAbierto.set(abono);
    this.relacionElegida.set(null);
    this.resultadosRelacion.set([]);
    this.motivoForm.reset();
    this.errorSolicitar.set(null);
  }

  cancelarSolicitud(): void {
    this.abonoAbierto.set(null);
    this.relacionElegida.set(null);
    this.resultadosRelacion.set([]);
  }

  buscarRelacion(termino: string): void {
    this.relacionElegida.set(null);

    if (!termino.trim()) {
      this.resultadosRelacion.set([]);
      return;
    }

    this.buscandoRelacion.set(true);
    this.relacionService.buscar(termino.trim()).subscribe({
      next: (res) => {
        this.buscandoRelacion.set(false);
        this.resultadosRelacion.set(res.data?.data ?? []);
      },
      error: () => {
        this.buscandoRelacion.set(false);
        this.resultadosRelacion.set([]);
      }
    });
  }

  elegirRelacion(relacion: Relacion): void {
    this.relacionElegida.set(relacion);
    this.resultadosRelacion.set([]);
  }

  confirmarSolicitud(): void {
    const abono = this.abonoAbierto();
    const relacion = this.relacionElegida();
    if (!abono || !relacion || this.motivoForm.invalid) {
      this.motivoForm.markAllAsTouched();
      return;
    }

    this.solicitando.set(abono.id);
    this.errorSolicitar.set(null);
    this.successSolicitar.set(null);

    this.conciliacionService.solicitarAutorizacion(abono.id, relacion.id, this.motivoForm.value.motivo!).subscribe({
      next: () => {
        this.solicitando.set(null);
        this.successSolicitar.set('Solicitud enviada. Revisa "Mis Solicitudes" cuando tu superior la autorice.');
        this.cancelarSolicitud();
        this.cargar();
      },
      error: (err) => {
        this.solicitando.set(null);
        this.errorSolicitar.set(err.error?.message || 'Ocurrió un error al solicitar la autorización.');
      }
    });
  }
}
