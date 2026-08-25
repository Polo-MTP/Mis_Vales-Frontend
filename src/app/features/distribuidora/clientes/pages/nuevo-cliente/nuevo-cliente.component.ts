import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { CrearClientePayload } from '../../../../../core/models/cliente.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';
import { GooglePlacesAutocompleteDirective } from '../../../../../shared/directives/google-places-autocomplete.directive';
import { parsearDireccionGoogle } from '../../../../../shared/utils/google-address.util';
import { SoloNumerosDirective } from '../../../../../shared/directives/solo-numeros.directive';
import { MayusculasDirective } from '../../../../../shared/directives/mayusculas.directive';
import { MENSAJES_PATRON, codigoPostalValidators, curpValidators, numeroExtValidators, numeroIntValidators } from '../../../../../shared/utils/mexico-validators';
import { SelectorFechaComponent } from '../../../../../shared/components/selector-fecha/selector-fecha.component';

@Component({
  selector: 'app-nuevo-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent, GooglePlacesAutocompleteDirective, SoloNumerosDirective, MayusculasDirective, SelectorFechaComponent],
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
  sesgoDireccion = signal<{ lat: number; lng: number } | null>(null);

  /** No se puede escribir la fecha a mano (readonly), solo elegirla en el calendario, y no permite menores de edad. */
  readonly fechaMaximaNacimiento = this.calcularFechaMaxima18Anios();

  readonly mensajesPatron = MENSAJES_PATRON;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', curpValidators],
    fecha_nacimiento: [''],
    lugar_nacimiento: ['', [Validators.maxLength(255)]],
    codigo_postal: ['', codigoPostalValidators],
    calle: ['', [Validators.required, Validators.maxLength(255)]],
    colonia: ['', [Validators.required, Validators.maxLength(255)]],
    numero_ext: ['', numeroExtValidators],
    numero_int: ['', numeroIntValidators],
    estado: ['', [Validators.required, Validators.maxLength(255)]],
    ciudad: ['', [Validators.required, Validators.maxLength(255)]]
  });

  private calcularFechaMaxima18Anios(): string {
    const hoy = new Date();
    const hace18 = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    return hace18.toISOString().slice(0, 10);
  }

  errorFor(campo: string): string | null {
    const control = this.form.get(campo);
    if (control?.invalid && (control.touched || control.dirty)) {
      if (control.errors?.['required']) return 'Este campo es obligatorio.';
      if (control.errors?.['pattern']) return this.mensajesPatron[campo] ?? 'Formato inválido.';
    }
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  /** El usuario eligió un CP de las sugerencias: lo usamos para sesgar el autocompletado de Calle. */
  onCodigoPostalSeleccionado(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    this.form.patchValue({
      codigo_postal: direccion.codigo_postal || this.form.value.codigo_postal,
      estado: direccion.estado || this.form.value.estado,
      ciudad: direccion.ciudad || this.form.value.ciudad
    });

    if (direccion.lat && direccion.lng) {
      this.sesgoDireccion.set({ lat: direccion.lat, lng: direccion.lng });
    }
  }

  /**
   * El usuario eligió una calle de las sugerencias: llenamos calle/colonia. Estado y Ciudad son
   * autoridad exclusiva del Código Postal (ver onCodigoPostalSeleccionado) -- Google a veces
   * nombra la misma zona distinto a nivel calle que a nivel CP (ej. "Torreón" vs "Lerdo" en la
   * Comarca Lagunera, que cruza Coahuila/Durango), así que si la calle los tocara podría
   * contradecir al CP ya elegido. Solo los llenamos aquí si el CP todavía no los estableció.
   */
  onCalleSeleccionada(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    this.form.patchValue({
      calle: direccion.calle || this.form.value.calle,
      numero_ext: direccion.numero_ext || this.form.value.numero_ext,
      colonia: direccion.colonia || this.form.value.colonia,
      estado: this.form.value.estado || direccion.estado || '',
      ciudad: this.form.value.ciudad || direccion.ciudad || ''
    });
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

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
