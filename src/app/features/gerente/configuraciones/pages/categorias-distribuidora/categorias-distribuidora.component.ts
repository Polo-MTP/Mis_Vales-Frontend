import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaDistribuidoraService } from '../../../distribuidoras/services/categoria-distribuidora.service';
import { CategoriaDistribuidora } from '../../../../../core/models/distribuidora.model';

@Component({
  selector: 'app-categorias-distribuidora',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categorias-distribuidora.component.html'
})
export class CategoriasDistribuidoraComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaDistribuidoraService);

  categorias = signal<CategoriaDistribuidora[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  editando = signal<number | null>(null);
  guardando = signal(false);
  errorForm = signal<string | null>(null);

  mostrandoNueva = signal(false);

  editForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    porcentaje_comision: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    descripcion: ['']
  });

  nuevaForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    porcentaje_comision: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.categoriaService.listar(true).subscribe({
      next: (res) => {
        this.categorias.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las categorías.');
        this.cargando.set(false);
      }
    });
  }

  iniciarEdicion(categoria: CategoriaDistribuidora): void {
    this.editando.set(categoria.id);
    this.errorForm.set(null);
    this.editForm.setValue({
      nombre: categoria.nombre,
      porcentaje_comision: Number(categoria.porcentaje_comision),
      descripcion: categoria.descripcion ?? ''
    });
  }

  cancelarEdicion(): void {
    this.editando.set(null);
  }

  guardar(categoria: CategoriaDistribuidora): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorForm.set(null);

    const v = this.editForm.value;
    this.categoriaService
      .actualizar(categoria.id, {
        nombre: v.nombre!,
        porcentaje_comision: v.porcentaje_comision!,
        descripcion: v.descripcion || null
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
    this.nuevaForm.reset({ nombre: '', porcentaje_comision: 0, descripcion: '' });
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
    this.categoriaService
      .crear({
        nombre: v.nombre!,
        porcentaje_comision: v.porcentaje_comision!,
        descripcion: v.descripcion || null
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrandoNueva.set(false);
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorForm.set(err.error?.message || 'Ocurrió un error al crear la categoría.');
        }
      });
  }

  desactivar(categoria: CategoriaDistribuidora): void {
    if (!confirm(`¿Desactivar la categoría "${categoria.nombre}"?`)) return;

    this.categoriaService.desactivar(categoria.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.error.set(err.error?.message || 'No se pudo desactivar la categoría.')
    });
  }
}
