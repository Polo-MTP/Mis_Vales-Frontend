import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SucursalService } from '../../services/sucursal.service';
import { Sucursal } from '../../../../../core/models/sucursal.model';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sucursales.component.html'
})
export class SucursalesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sucursalService = inject(SucursalService);
  private authService = inject(AuthService);

  /** El backend solo deja crear/editar sucursales normales a Gerente General -- la sucursal
   *  matriz la controla Administrador desde su propia pantalla (ver
   *  features/administrador/personal), por eso esta página nunca expone el campo "es_matriz"
   *  ni deja editar la fila que ya es matriz. */
  puedeEditar = computed(() => this.authService.userRole() === 'Gerente General');

  sucursales = signal<Sucursal[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  editando = signal<number | null>(null);
  guardando = signal(false);
  errorForm = signal<string | null>(null);

  mostrandoNueva = signal(false);

  editForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    is_active: [true]
  });

  nuevaForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    codigo: ['', [Validators.required, Validators.maxLength(20)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.sucursalService.listar(false).subscribe({
      next: (res) => {
        this.sucursales.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las sucursales.');
        this.cargando.set(false);
      }
    });
  }

  iniciarEdicion(sucursal: Sucursal): void {
    this.editando.set(sucursal.id);
    this.errorForm.set(null);
    this.editForm.setValue({
      nombre: sucursal.nombre,
      codigo: sucursal.codigo,
      is_active: sucursal.is_active
    });
  }

  cancelarEdicion(): void {
    this.editando.set(null);
  }

  guardar(sucursal: Sucursal): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorForm.set(null);

    const v = this.editForm.value;
    this.sucursalService
      .actualizar(sucursal.id, {
        nombre: v.nombre!,
        codigo: v.codigo!,
        is_active: v.is_active ?? true
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
    this.nuevaForm.reset({ nombre: '', codigo: '' });
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
    this.sucursalService
      .crear({
        nombre: v.nombre!,
        codigo: v.codigo!
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrandoNueva.set(false);
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorForm.set(err.error?.message || 'Ocurrió un error al crear la sucursal.');
        }
      });
  }
}
