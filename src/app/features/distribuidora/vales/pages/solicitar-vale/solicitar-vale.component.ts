import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ValeService } from '../../services/vale.service';
import { ProductoCatalogoService } from '../../services/producto-catalogo.service';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { Cliente } from '../../../../../core/models/cliente.model';
import { Producto, SimulacionProducto } from '../../../../../core/models/producto.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-solicitar-vale',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent, DineroPipe],
  templateUrl: './solicitar-vale.component.html',
  styleUrl: './solicitar-vale.component.css'
})
export class SolicitarValeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private valeService = inject(ValeService);
  private productoService = inject(ProductoCatalogoService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  clientes = signal<Cliente[]>([]);
  productos = signal<Producto[]>([]);
  cargandoDatos = signal(true);

  enviando = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  simulacion = signal<SimulacionProducto | null>(null);
  simulando = signal(false);

  form = this.fb.group({
    cliente_id: ['', [Validators.required]],
    producto_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // El selector debe listar TODOS los clientes activos, no solo la primera página -- con
    // page=1 a secas (sin per_page) el endpoint regresaba máximo 15 (default del backend), así
    // que una distribuidora con más de 15 clientes activos no podía elegir a los demás: el vale
    // parecía fallar "a veces sí, a veces no" según qué tan grande fuera su cartera.
    this.clienteService.listar(1, undefined, true, 1000).subscribe({
      next: (res) => this.clientes.set(res.data?.data ?? []),
      error: () => this.clientes.set([])
    });

    this.productoService.listarActivos().subscribe({
      next: (data) => {
        this.productos.set(data ?? []);
        this.cargandoDatos.set(false);
      },
      error: () => this.cargandoDatos.set(false)
    });

    this.form.controls.producto_id.valueChanges.subscribe((id) => this.onProductoChange(id));
  }

  private onProductoChange(id: string | null): void {
    this.simulacion.set(null);
    if (!id) {
      return;
    }

    this.simulando.set(true);
    this.productoService.simular(Number(id)).subscribe({
      next: (data) => {
        this.simulacion.set(data);
        this.simulando.set(false);
      },
      error: () => this.simulando.set(false)
    });
  }

  productoSeleccionado(): Producto | undefined {
    const id = this.form.value.producto_id;
    return this.productos().find((p) => String(p.id) === id);
  }

  errorFor(campo: string): string | null {
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.enviando()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const val = this.form.value;

    this.valeService
      .solicitar({
        cliente_id: Number(val.cliente_id),
        producto_id: Number(val.producto_id)
      })
      .subscribe({
        next: () => this.router.navigate(['/distribuidora/vales']),
        error: (err) => {
          this.enviando.set(false);
          this.errorMessage.set(err.error?.message || 'Ocurrió un error al solicitar el vale.');
          this.fieldErrors.set(err.error?.errors || {});
        }
      });
  }
}
