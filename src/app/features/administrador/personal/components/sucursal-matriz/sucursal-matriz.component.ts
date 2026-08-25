import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SucursalService } from '../../../../gerente/personal/services/sucursal.service';
import { Sucursal } from '../../../../../core/models/sucursal.model';

/**
 * Solo puede existir una sucursal matriz a la vez (ver SucursalStoreRequest/
 * SucursalUpdateRequest en el backend) -- determina a dónde se asigna automáticamente
 * cualquier Gerente General nuevo. Solo Administrador puede darla de alta; si ya existe, esta
 * pantalla solo la muestra (no se puede editar ni deshabilitar desde aquí, el backend lo
 * bloquea de todas formas).
 */
@Component({
  selector: 'app-sucursal-matriz',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sucursal-matriz.component.html'
})
export class SucursalMatrizComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sucursalService = inject(SucursalService);

  cargando = signal(true);
  matriz = signal<Sucursal | null>(null);
  guardando = signal(false);
  errorForm = signal<string | null>(null);
  exito = signal<string | null>(null);

  nuevaForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    codigo: ['', [Validators.required, Validators.maxLength(20)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);

    this.sucursalService.listar(false).subscribe({
      next: (res) => {
        this.matriz.set((res.data ?? []).find((s) => s.es_matriz) ?? null);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  crear(): void {
    if (this.nuevaForm.invalid) {
      this.nuevaForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorForm.set(null);
    this.exito.set(null);

    const v = this.nuevaForm.value;
    this.sucursalService
      .crear({
        nombre: v.nombre!,
        codigo: v.codigo!,
        es_matriz: true
      })
      .subscribe({
        next: (res) => {
          this.guardando.set(false);
          this.exito.set(`Sucursal matriz "${res.data?.nombre}" creada correctamente.`);
          this.nuevaForm.reset({ nombre: '', codigo: '' });
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorForm.set(err.error?.message || 'Ocurrió un error al crear la sucursal matriz.');
        }
      });
  }
}
