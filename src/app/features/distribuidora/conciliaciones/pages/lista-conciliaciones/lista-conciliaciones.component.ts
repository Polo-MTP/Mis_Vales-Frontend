import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConciliacionService } from '../../services/conciliacion.service';
import { AbonoConciliacion, EstadoAbonoConciliacion } from '../../../../../core/models/conciliacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { tipoPagoLabel} from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-lista-conciliaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PaginationComponent, DineroPipe, EstadoBadgeComponent],
  templateUrl: './lista-conciliaciones.component.html',
  styleUrl: './lista-conciliaciones.component.css'
})
export class ListaConciliacionesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private conciliacionService = inject(ConciliacionService);

  abonos = signal<AbonoConciliacion[]>([]);
  paginacion = signal<PaginatedResponse<AbonoConciliacion> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroEstado = signal<EstadoAbonoConciliacion | 'todos'>('todos');

  readonly tipoPagoLabel = tipoPagoLabel;

  // Panel de "levantar queja": abono para el que está abierto el formulario.
  abonoAbierto = signal<AbonoConciliacion | null>(null);
  enviando = signal<number | null>(null);
  errorQueja = signal<string | null>(null);
  successQueja = signal<string | null>(null);
  motivoForm = this.fb.group({
    motivo: ['', [Validators.required, Validators.maxLength(500)]]
  });
  evidenciaSeleccionada: File | null = null;

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
        this.error.set('No se pudieron cargar tus abonos.');
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

  abrirQueja(abono: AbonoConciliacion): void {
    this.abonoAbierto.set(abono);
    this.motivoForm.reset();
    this.evidenciaSeleccionada = null;
    this.errorQueja.set(null);
    this.successQueja.set(null);
  }

  cancelarQueja(): void {
    this.abonoAbierto.set(null);
    this.evidenciaSeleccionada = null;
  }

  onEvidenciaSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evidenciaSeleccionada = input.files?.[0] ?? null;
  }

  confirmarQueja(): void {
    const abono = this.abonoAbierto();
    if (!abono || this.motivoForm.invalid) {
      this.motivoForm.markAllAsTouched();
      return;
    }

    this.enviando.set(abono.id);
    this.errorQueja.set(null);
    this.successQueja.set(null);

    this.conciliacionService.levantarQueja(abono.id, this.motivoForm.value.motivo!, this.evidenciaSeleccionada ?? undefined).subscribe({
      next: () => {
        this.enviando.set(null);
        this.successQueja.set('Queja registrada. La revisará el equipo de conciliación.');
        this.cancelarQueja();
        this.cargar();
      },
      error: (err) => {
        this.enviando.set(null);
        this.errorQueja.set(err.error?.message || 'Ocurrió un error al registrar la queja.');
      }
    });
  }
}
