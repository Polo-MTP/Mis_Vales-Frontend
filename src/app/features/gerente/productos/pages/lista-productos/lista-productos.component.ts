import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../../../../core/models/producto.model';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.css'
})
export class ListaProductosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);

  productos = signal<Producto[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  mostrarInactivos = signal(false);

  creando = signal(false);
  errorCrear = signal<string | null>(null);

  editando = signal<number | null>(null);
  guardando = signal(false);
  errorEditar = signal<string | null>(null);

  crearForm = this.fb.group({
    monto: ['', [Validators.required, Validators.min(100)]],
    quincenas: [''],
    variante: ['', [Validators.maxLength(50)]],
    descripcion: ['', [Validators.maxLength(255)]]
  });

  editForm = this.fb.group({
    monto: ['', [Validators.required, Validators.min(100)]],
    quincenas: [''],
    variante: ['', [Validators.maxLength(50)]],
    descripcion: ['', [Validators.maxLength(255)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.productoService.listar(!this.mostrarInactivos()).subscribe({
      next: (data) => {
        this.productos.set(data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos.');
        this.cargando.set(false);
      }
    });
  }

  toggleMostrarInactivos(): void {
    this.mostrarInactivos.set(!this.mostrarInactivos());
    this.cargar();
  }

  onSubmitCrear(): void {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }

    this.creando.set(true);
    this.errorCrear.set(null);

    const val = this.crearForm.value;

    this.productoService
      .crear({
        monto: Number(val.monto),
        quincenas: val.quincenas ? Number(val.quincenas) : undefined,
        variante: val.variante || undefined,
        descripcion: val.descripcion || undefined
      })
      .subscribe({
        next: () => {
          this.creando.set(false);
          this.crearForm.reset();
          this.cargar();
        },
        error: (err) => {
          this.creando.set(false);
          this.errorCrear.set(err.error?.message || 'Ocurrió un error al crear el producto.');
        }
      });
  }

  iniciarEdicion(p: Producto): void {
    this.editando.set(p.id);
    this.errorEditar.set(null);
    this.editForm.setValue({
      monto: p.monto,
      quincenas: p.quincenas !== null ? String(p.quincenas) : '',
      variante: p.variante ?? '',
      descripcion: p.descripcion ?? ''
    });
  }

  cancelarEdicion(): void {
    this.editando.set(null);
  }

  guardarEdicion(p: Producto): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorEditar.set(null);

    const val = this.editForm.value;

    this.productoService
      .actualizar(p.id, {
        monto: Number(val.monto),
        quincenas: val.quincenas ? Number(val.quincenas) : undefined,
        variante: val.variante || undefined,
        descripcion: val.descripcion || undefined,
        activo: p.activo
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.editando.set(null);
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorEditar.set(err.error?.message || 'Ocurrió un error al guardar los cambios.');
        }
      });
  }

  toggleActivo(p: Producto): void {
    if (p.activo) {
      this.productoService.desactivar(p.id).subscribe({ next: () => this.cargar() });
      return;
    }

    this.productoService
      .actualizar(p.id, {
        monto: Number(p.monto),
        quincenas: p.quincenas ?? undefined,
        variante: p.variante ?? undefined,
        descripcion: p.descripcion ?? undefined,
        activo: true
      })
      .subscribe({ next: () => this.cargar() });
  }
}
