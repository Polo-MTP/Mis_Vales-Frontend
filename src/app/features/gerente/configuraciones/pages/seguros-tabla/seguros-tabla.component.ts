import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeguroTablaService } from '../../services/seguro-tabla.service';
import { SeguroTabla } from '../../../../../core/models/configuracion.model';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-seguros-tabla',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seguros-tabla.component.html'
})
export class SegurosTablaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private seguroService = inject(SeguroTablaService);
  private authService = inject(AuthService);

  /** El backend solo deja escribir a Gerente General -- Gerente de Sucursal comparte esta
   *  misma pantalla, pero solo para consulta. */
  puedeEditar = computed(() => this.authService.userRole() === 'Gerente General');

  seguros = signal<SeguroTabla[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  editando = signal<number | null>(null);
  guardando = signal(false);
  errorForm = signal<string | null>(null);

  mostrandoNueva = signal(false);

  editForm = this.fb.group({
    monto_desde: [0, [Validators.required, Validators.min(0)]],
    monto_hasta: [null as number | null],
    seguro_monto: [0, [Validators.required, Validators.min(0)]]
  });

  nuevaForm = this.fb.group({
    monto_desde: [0, [Validators.required, Validators.min(0)]],
    monto_hasta: [null as number | null],
    seguro_monto: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.seguroService.listar(true).subscribe({
      next: (res) => {
        this.seguros.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la tabla de seguros.');
        this.cargando.set(false);
      }
    });
  }

  iniciarEdicion(seguro: SeguroTabla): void {
    this.editando.set(seguro.id);
    this.errorForm.set(null);
    this.editForm.setValue({
      monto_desde: Number(seguro.monto_desde),
      monto_hasta: seguro.monto_hasta !== null ? Number(seguro.monto_hasta) : null,
      seguro_monto: Number(seguro.seguro_monto)
    });
  }

  cancelarEdicion(): void {
    this.editando.set(null);
  }

  guardar(seguro: SeguroTabla): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorForm.set(null);

    const v = this.editForm.value;
    this.seguroService
      .actualizar(seguro.id, {
        monto_desde: v.monto_desde!,
        monto_hasta: v.monto_hasta ?? null,
        seguro_monto: v.seguro_monto!
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.editando.set(null);
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorForm.set(err.error?.message || 'Ocurrió un error al guardar los cambios.');
        }
      });
  }

  mostrarFormNueva(): void {
    this.mostrandoNueva.set(true);
    this.errorForm.set(null);
    this.nuevaForm.reset({ monto_desde: 0, monto_hasta: null, seguro_monto: 0 });
  }

  cancelarNueva(): void {
    this.mostrandoNueva.set(false);
  }

  crear(): void {
    if (this.nuevaForm.invalid) {
      this.nuevaForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorForm.set(null);

    const v = this.nuevaForm.value;
    this.seguroService
      .crear({
        monto_desde: v.monto_desde!,
        monto_hasta: v.monto_hasta ?? null,
        seguro_monto: v.seguro_monto!
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrandoNueva.set(false);
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorForm.set(err.error?.message || 'Ocurrió un error al crear el rango.');
        }
      });
  }

  desactivar(seguro: SeguroTabla): void {
    if (!confirm(`¿Desactivar el rango de seguro desde $${seguro.monto_desde}?`)) return;

    this.seguroService.desactivar(seguro.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.error.set(err.error?.message || 'No se pudo desactivar el rango.')
    });
  }
}
