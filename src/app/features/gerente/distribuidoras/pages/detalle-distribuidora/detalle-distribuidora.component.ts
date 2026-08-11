import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DistribuidoraService } from '../../services/distribuidora.service';
import { CategoriaDistribuidoraService } from '../../services/categoria-distribuidora.service';
import { CategoriaDistribuidora, DistribuidoraResumen, EstadoDistribuidora } from '../../../../../core/models/distribuidora.model';

@Component({
  selector: 'app-detalle-distribuidora',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './detalle-distribuidora.component.html',
  styleUrl: './detalle-distribuidora.component.css'
})
export class DetalleDistribuidoraComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private distribuidoraService = inject(DistribuidoraService);
  private categoriaService = inject(CategoriaDistribuidoraService);

  distribuidora = signal<DistribuidoraResumen | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  cambiandoEstado = signal(false);
  errorEstado = signal<string | null>(null);

  categorias = signal<CategoriaDistribuidora[]>([]);
  guardandoCredito = signal(false);
  errorCredito = signal<string | null>(null);
  successCredito = signal<string | null>(null);

  estadosDisponibles: EstadoDistribuidora[] = ['ACTIVO', 'MOROSO', 'RECHAZADO'];

  creditoForm = this.fb.group({
    limite_credito: ['', [Validators.required, Validators.min(0)]],
    categoria_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDistribuidora(id);

    this.categoriaService.listar().subscribe({
      next: (res) => this.categorias.set(res.data ?? []),
      error: () => this.categorias.set([])
    });
  }

  cargarDistribuidora(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.distribuidoraService.detalle(id).subscribe({
      next: (data) => {
        this.distribuidora.set(data);
        this.cargando.set(false);

        this.creditoForm.patchValue({
          limite_credito: String(data.limite_credito ?? ''),
          categoria_id: data.categoria ? String(data.categoria.id) : ''
        });
      },
      error: () => {
        this.error.set('No se pudo cargar la distribuidora.');
        this.cargando.set(false);
      }
    });
  }

  cambiarEstado(nuevoEstado: EstadoDistribuidora): void {
    const d = this.distribuidora();
    if (!d || d.estado === nuevoEstado) return;

    const motivo = prompt(`Motivo del cambio a "${nuevoEstado}" (opcional):`) || undefined;

    this.cambiandoEstado.set(true);
    this.errorEstado.set(null);

    this.distribuidoraService.cambiarEstado(d.id, nuevoEstado, motivo).subscribe({
      next: (res) => {
        this.cambiandoEstado.set(false);
        this.distribuidora.set(res.data);
      },
      error: (err) => {
        this.cambiandoEstado.set(false);
        this.errorEstado.set(
          err.status === 403
            ? 'No tienes permiso para hacer este cambio de estado.'
            : err.error?.message || 'Ocurrió un error al cambiar el estado.'
        );
      }
    });
  }

  onSubmitCredito(): void {
    const d = this.distribuidora();
    if (!d || this.creditoForm.invalid) {
      this.creditoForm.markAllAsTouched();
      return;
    }

    this.guardandoCredito.set(true);
    this.errorCredito.set(null);
    this.successCredito.set(null);

    const val = this.creditoForm.value;

    this.distribuidoraService.asignarCredito(d.id, Number(val.limite_credito), Number(val.categoria_id)).subscribe({
      next: (res) => {
        this.guardandoCredito.set(false);
        this.distribuidora.set(res.data);
        this.successCredito.set('Crédito asignado exitosamente.');
      },
      error: (err) => {
        this.guardandoCredito.set(false);
        this.errorCredito.set(
          err.status === 403
            ? 'No tienes permiso para asignar crédito a esta distribuidora.'
            : err.error?.message || 'Ocurrió un error al asignar el crédito.'
        );
      }
    });
  }

  volver(): void {
    this.router.navigate(['/gerente/distribuidoras']);
  }
}
