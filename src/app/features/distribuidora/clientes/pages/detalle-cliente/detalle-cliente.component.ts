import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, EditarClientePayload } from '../../../../../core/models/cliente.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';
import { GooglePlacesAutocompleteDirective } from '../../../../../shared/directives/google-places-autocomplete.directive';
import { parsearDireccionGoogle } from '../../../../../shared/utils/google-address.util';
import { SoloNumerosDirective } from '../../../../../shared/directives/solo-numeros.directive';
import { MayusculasDirective } from '../../../../../shared/directives/mayusculas.directive';
import { MENSAJES_PATRON, codigoPostalValidators, curpValidators, numeroExtValidators, numeroIntValidators } from '../../../../../shared/utils/mexico-validators';

@Component({
  selector: 'app-detalle-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent, GooglePlacesAutocompleteDirective, SoloNumerosDirective, MayusculasDirective, EstadoBadgeComponent],
  templateUrl: './detalle-cliente.component.html',
  styleUrl: './detalle-cliente.component.css'
})
export class DetalleClienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clienteService = inject(ClienteService);

  cliente = signal<Cliente | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  guardando = signal(false);
  errorGuardar = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});
  sesgoDireccion = signal<{ lat: number; lng: number } | null>(null);

  readonly mensajesPatron = MENSAJES_PATRON;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', curpValidators],
    codigo_postal: ['', codigoPostalValidators],
    calle: ['', [Validators.required, Validators.maxLength(255)]],
    colonia: ['', [Validators.required, Validators.maxLength(255)]],
    numero_ext: ['', numeroExtValidators],
    numero_int: ['', numeroIntValidators],
    estado: ['', [Validators.required, Validators.maxLength(255)]],
    ciudad: ['', [Validators.required, Validators.maxLength(255)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarCliente(id);
  }

  cargarCliente(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clienteService.detalle(id).subscribe({
      next: (res) => {
        const c = res.data ?? null;
        this.cliente.set(c);
        this.cargando.set(false);

        if (c) {
          this.form.patchValue({
            nombre: c.datos_personales.nombre ?? '',
            apellido_paterno: c.datos_personales.apellido_paterno ?? '',
            apellido_materno: c.datos_personales.apellido_materno ?? '',
            curp: c.datos_personales.curp ?? '',
            calle: c.datos_personales.direccion.calle ?? '',
            colonia: c.datos_personales.direccion.colonia ?? '',
            numero_ext: c.datos_personales.direccion.numero_ext ?? '',
            numero_int: c.datos_personales.direccion.numero_int ?? '',
            codigo_postal: c.datos_personales.direccion.codigo_postal ?? '',
            estado: c.datos_personales.direccion.estado ?? '',
            ciudad: c.datos_personales.direccion.ciudad ?? ''
          });
        }
      },
      error: () => {
        this.error.set('No se pudo cargar el cliente.');
        this.cargando.set(false);
      }
    });
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

  /** El usuario eligió una calle de las sugerencias: llenamos el resto de la dirección. */
  onCalleSeleccionada(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    this.form.patchValue({
      calle: direccion.calle || this.form.value.calle,
      numero_ext: direccion.numero_ext || this.form.value.numero_ext,
      colonia: direccion.colonia || this.form.value.colonia,
      codigo_postal: direccion.codigo_postal || this.form.value.codigo_postal,
      estado: direccion.estado || this.form.value.estado,
      ciudad: direccion.ciudad || this.form.value.ciudad
    });
  }

  private soloCambios(
    original: Record<string, string | null | undefined>,
    actual: Record<string, string | null | undefined>
  ): Record<string, string> {
    const cambios: Record<string, string> = {};

    for (const campo of Object.keys(actual)) {
      const valorOriginal = original[campo] ?? '';
      const valorActual = actual[campo] ?? '';
      if (valorActual !== valorOriginal) {
        cambios[campo] = valorActual;
      }
    }

    return cambios;
  }

  onSubmit(): void {
    const c = this.cliente();
    if (!c || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;

    const datosPersonalesCambios = this.soloCambios(
      {
        nombre: c.datos_personales.nombre,
        apellido_paterno: c.datos_personales.apellido_paterno,
        apellido_materno: c.datos_personales.apellido_materno,
        curp: c.datos_personales.curp
      },
      {
        nombre: val.nombre!,
        apellido_paterno: val.apellido_paterno!,
        apellido_materno: val.apellido_materno!,
        curp: val.curp!
      }
    );

    const direccionCambios = this.soloCambios(
      {
        calle: c.datos_personales.direccion.calle,
        colonia: c.datos_personales.direccion.colonia,
        numero_ext: c.datos_personales.direccion.numero_ext,
        numero_int: c.datos_personales.direccion.numero_int,
        codigo_postal: c.datos_personales.direccion.codigo_postal,
        estado: c.datos_personales.direccion.estado,
        ciudad: c.datos_personales.direccion.ciudad
      },
      {
        calle: val.calle!,
        colonia: val.colonia!,
        numero_ext: val.numero_ext!,
        numero_int: val.numero_int!,
        codigo_postal: val.codigo_postal!,
        estado: val.estado!,
        ciudad: val.ciudad!
      }
    );

    if (Object.keys(datosPersonalesCambios).length === 0 && Object.keys(direccionCambios).length === 0) {
      this.successMessage.set('No hay cambios que guardar.');
      return;
    }

    const payload: EditarClientePayload = {
      datos_personales: Object.keys(datosPersonalesCambios).length > 0 ? datosPersonalesCambios : undefined,
      direccion: Object.keys(direccionCambios).length > 0 ? direccionCambios : undefined
    };

    this.guardando.set(true);
    this.errorGuardar.set(null);
    this.successMessage.set(null);
    this.fieldErrors.set({});

    this.clienteService.actualizar(c.id, payload).subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.cliente.set(res.data ?? c);
        this.successMessage.set('Cambios guardados exitosamente.');
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorGuardar.set(err.error?.message || 'Ocurrió un error al guardar los cambios.');
        this.fieldErrors.set(err.error?.errors || {});
      }
    });
  }

  toggleEstado(): void {
    const c = this.cliente();
    if (!c) return;

    this.clienteService.cambiarEstado(c.id, !c.estado).subscribe({
      next: (res) => this.cliente.set(res.data ?? c)
    });
  }

  volver(): void {
    this.router.navigate(['/distribuidora/clientes']);
  }
}
