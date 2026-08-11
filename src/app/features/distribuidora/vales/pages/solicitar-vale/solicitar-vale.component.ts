import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ValeService } from '../../services/vale.service';
import { ProductoCatalogoService } from '../../services/producto-catalogo.service';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { Cliente } from '../../../../../core/models/cliente.model';
import { Producto } from '../../../../../core/models/producto.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-solicitar-vale',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
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

  form = this.fb.group({
    cliente_id: ['', [Validators.required]],
    producto_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.clienteService.listar(1, undefined, true).subscribe({
      next: (res) => this.clientes.set(res.data?.data ?? [])
    });

    this.productoService.listarActivos().subscribe({
      next: (data) => {
        this.productos.set(data ?? []);
        this.cargandoDatos.set(false);
      },
      error: () => this.cargandoDatos.set(false)
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
