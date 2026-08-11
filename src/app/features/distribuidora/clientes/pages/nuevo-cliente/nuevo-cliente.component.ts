import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { CrearClientePayload } from '../../../../../core/models/cliente.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-nuevo-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  templateUrl: './nuevo-cliente.component.html',
  styleUrl: './nuevo-cliente.component.css'
})
export class NuevoClienteComponent {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
    fecha_nacimiento: [''],
    lugar_nacimiento: ['', [Validators.maxLength(255)]],
    calle: ['', [Validators.required, Validators.maxLength(255)]],
    colonia: ['', [Validators.required, Validators.maxLength(255)]],
    numero_ext: ['', [Validators.required, Validators.maxLength(50)]],
    numero_int: ['', [Validators.maxLength(50)]],
    codigo_postal: ['', [Validators.required, Validators.maxLength(10)]],
    estado: ['', [Validators.required, Validators.maxLength(255)]],
    ciudad: ['', [Validators.required, Validators.maxLength(255)]]
  });

  errorFor(campo: string): string | null {
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const val = this.form.value;
    const payload: CrearClientePayload = {
      nombre: val.nombre!,
      apellido_paterno: val.apellido_paterno!,
      apellido_materno: val.apellido_materno || undefined,
      curp: val.curp!,
      fecha_nacimiento: val.fecha_nacimiento || undefined,
      lugar_nacimiento: val.lugar_nacimiento || undefined,
      calle: val.calle!,
      colonia: val.colonia!,
      numero_ext: val.numero_ext!,
      numero_int: val.numero_int || undefined,
      codigo_postal: val.codigo_postal!,
      estado: val.estado!,
      ciudad: val.ciudad!
    };

    this.clienteService.crear(payload).subscribe({
      next: () => this.router.navigate(['/distribuidora/clientes']),
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al registrar el cliente.');
        this.fieldErrors.set(err.error?.errors || {});
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/distribuidora/clientes']);
  }
}
