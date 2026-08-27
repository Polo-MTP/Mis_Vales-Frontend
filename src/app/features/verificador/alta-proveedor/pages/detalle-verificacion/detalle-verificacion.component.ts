import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VerificacionService } from '../../services/verificacion.service';
import { SolicitudProveedor, VerificarSolicitudPayload } from '../../../../../core/models/solicitud-proveedor.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';
import { MapaUbicacionComponent } from '../../../../../shared/components/mapa-ubicacion/mapa-ubicacion.component';
import { EvidenciaService } from '../../../../../core/services/evidencia.service';
import { GooglePlacesAutocompleteDirective } from '../../../../../shared/directives/google-places-autocomplete.directive';
import { parsearDireccionGoogle } from '../../../../../shared/utils/google-address.util';
import { SoloNumerosDirective } from '../../../../../shared/directives/solo-numeros.directive';
import { MayusculasDirective } from '../../../../../shared/directives/mayusculas.directive';
import { MENSAJES_PATRON, codigoPostalValidators, curpValidators, numeroExtValidators, numeroIntValidators } from '../../../../../shared/utils/mexico-validators';
import { SelectorFechaComponent } from '../../../../../shared/components/selector-fecha/selector-fecha.component';

@Component({
  selector: 'app-detalle-verificacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent, MapaUbicacionComponent, GooglePlacesAutocompleteDirective, SoloNumerosDirective, MayusculasDirective, SelectorFechaComponent],
  templateUrl: './detalle-verificacion.component.html',
  styleUrl: './detalle-verificacion.component.css'
})
export class DetalleVerificacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private verificacionService = inject(VerificacionService);
  private evidenciaService = inject(EvidenciaService);

  solicitud = signal<SolicitudProveedor | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  enviando = signal(false);
  errorDictamen = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});
  sesgoDireccion = signal<{ lat: number; lng: number } | null>(null);
  subiendoEvidenciaIndex = signal<number | null>(null);

  tiposDocumento = ['foto_fachada', 'foto_interior', 'foto_ine_titular', 'otro'];
  readonly mensajesPatron = MENSAJES_PATRON;

  /** No se puede escribir la fecha a mano (readonly), solo elegirla en el calendario -- mismo
   *  criterio que DatosPersonalesFieldsComponent, que captura este mismo dato al crear la solicitud. */
  readonly fechaMaximaNacimiento = this.calcularFechaMaxima18Anios();

  datosForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', curpValidators],
    fecha_nacimiento: [''],
    lugar_nacimiento: ['', [Validators.maxLength(255)]],
    calle: ['', [Validators.required, Validators.maxLength(255)]],
    colonia: ['', [Validators.required, Validators.maxLength(255)]],
    numero_ext: ['', numeroExtValidators],
    numero_int: ['', numeroIntValidators],
    codigo_postal: ['', codigoPostalValidators],
    estado: ['', [Validators.required, Validators.maxLength(255)]],
    ciudad: ['', [Validators.required, Validators.maxLength(255)]]
  });

  dictamenForm = this.fb.group({
    cumple: ['', [Validators.required]],
    comentario_verificador: ['', [Validators.required]],
    motivo_edicion: [''],
    evidencias: this.fb.array([])
  });

  get evidencias(): FormArray {
    return this.dictamenForm.get('evidencias') as FormArray;
  }

  yaDictaminada(s: SolicitudProveedor | null = this.solicitud()): boolean {
    return s?.estado === 'verificado' || s?.estado === 'rechazado';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSolicitud(id);
  }

  cargarSolicitud(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.verificacionService.obtenerDetalle(id).subscribe({
      next: (res) => {
        const s = res.data ?? null;
        this.solicitud.set(s);
        this.cargando.set(false);

        if (s && this.yaDictaminada(s)) {
          this.datosForm.disable();
        }

        if (s) {
          this.datosForm.patchValue({
            nombre: s.datos_personales.nombre ?? '',
            apellido_paterno: s.datos_personales.apellido_paterno ?? '',
            apellido_materno: s.datos_personales.apellido_materno ?? '',
            curp: s.datos_personales.curp ?? '',
            fecha_nacimiento: s.datos_personales.fecha_nacimiento ?? '',
            lugar_nacimiento: s.datos_personales.lugar_nacimiento ?? '',
            calle: s.datos_personales.direccion.calle ?? '',
            colonia: s.datos_personales.direccion.colonia ?? '',
            numero_ext: s.datos_personales.direccion.numero_ext ?? '',
            numero_int: s.datos_personales.direccion.numero_int ?? '',
            codigo_postal: s.datos_personales.direccion.codigo_postal ?? '',
            estado: s.datos_personales.direccion.estado ?? '',
            ciudad: s.datos_personales.direccion.ciudad ?? ''
          });
        }
      },
      error: () => {
        this.error.set('No se pudo cargar la solicitud.');
        this.cargando.set(false);
      }
    });
  }

  private calcularFechaMaxima18Anios(): string {
    const hoy = new Date();
    const hace18 = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    return hace18.toISOString().slice(0, 10);
  }

  agregarEvidencia(): void {
    this.evidencias.push(
      this.fb.group({
        tipo_documento: ['foto_fachada', [Validators.required]],
        url_archivo: ['', [Validators.required, Validators.maxLength(500)]]
      })
    );
  }

  quitarEvidencia(index: number): void {
    this.evidencias.removeAt(index);
  }

  /** El usuario eligió un CP de las sugerencias: lo usamos para sesgar el autocompletado de Calle. */
  onCodigoPostalSeleccionado(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    this.datosForm.patchValue({
      codigo_postal: direccion.codigo_postal || this.datosForm.value.codigo_postal,
      estado: direccion.estado || this.datosForm.value.estado,
      ciudad: direccion.ciudad || this.datosForm.value.ciudad
    });

    if (direccion.lat && direccion.lng) {
      this.sesgoDireccion.set({ lat: direccion.lat, lng: direccion.lng });
    }
  }

  /** El usuario eligió una calle de las sugerencias: llenamos el resto de la dirección. */
  onCalleSeleccionada(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    // Estado y Ciudad son autoridad exclusiva del Código Postal (ver onCodigoPostalSeleccionado)
    // -- Google a veces nombra la misma zona distinto a nivel calle que a nivel CP (ej. "Torreón"
    // vs "Lerdo" en la Comarca Lagunera, que cruza Coahuila/Durango). Solo se llenan aquí si el
    // CP todavía no los estableció.
    this.datosForm.patchValue({
      calle: direccion.calle || this.datosForm.value.calle,
      numero_ext: direccion.numero_ext || this.datosForm.value.numero_ext,
      colonia: direccion.colonia || this.datosForm.value.colonia,
      estado: this.datosForm.value.estado || direccion.estado || '',
      ciudad: this.datosForm.value.ciudad || direccion.ciudad || ''
    });
  }

  /** Sube el archivo real de la evidencia y guarda la URL resultante en esa fila del formulario. */
  onArchivoEvidencia(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    const s = this.solicitud();

    if (!archivo || !s) {
      return;
    }

    this.subiendoEvidenciaIndex.set(index);

    const tipoDocumento = this.evidencias.at(index).get('tipo_documento')?.value ?? 'otro';

    this.evidenciaService.subir(s.id, archivo, tipoDocumento).subscribe({
      next: (res) => {
        this.subiendoEvidenciaIndex.set(null);
        if (res.data) {
          this.evidencias.at(index).get('url_archivo')?.setValue(res.data.url_archivo);
        }
      },
      error: (err) => {
        this.subiendoEvidenciaIndex.set(null);
        this.errorDictamen.set(err.error?.message || 'No se pudo subir el archivo. Verifica que sea jpg, png o pdf y pese menos de 5MB.');
        input.value = '';
      }
    });
  }

  errorFor(campo: string): string | null {
    const control = this.datosForm.get(campo) ?? this.dictamenForm.get(campo);
    if (control?.invalid && (control.touched || control.dirty)) {
      if (control.errors?.['required']) return 'Este campo es obligatorio.';
      if (control.errors?.['pattern']) return this.mensajesPatron[campo] ?? 'Formato inválido.';
    }
    return this.fieldErrors()[campo]?.[0] ?? null;
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
    if (this.enviando()) {
      return;
    }

    const s = this.solicitud();
    if (!s || this.dictamenForm.invalid || this.datosForm.invalid) {
      this.dictamenForm.markAllAsTouched();
      this.datosForm.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorDictamen.set(null);
    this.fieldErrors.set({});

    const val = this.datosForm.value;

    const datosPersonalesCambios = this.soloCambios(
      {
        nombre: s.datos_personales.nombre,
        apellido_paterno: s.datos_personales.apellido_paterno,
        apellido_materno: s.datos_personales.apellido_materno,
        curp: s.datos_personales.curp,
        fecha_nacimiento: s.datos_personales.fecha_nacimiento,
        lugar_nacimiento: s.datos_personales.lugar_nacimiento
      },
      {
        nombre: val.nombre!,
        apellido_paterno: val.apellido_paterno!,
        apellido_materno: val.apellido_materno!,
        curp: val.curp!,
        fecha_nacimiento: val.fecha_nacimiento!,
        lugar_nacimiento: val.lugar_nacimiento!
      }
    );

    const direccionCambios = this.soloCambios(
      {
        calle: s.datos_personales.direccion.calle,
        colonia: s.datos_personales.direccion.colonia,
        numero_ext: s.datos_personales.direccion.numero_ext,
        numero_int: s.datos_personales.direccion.numero_int,
        codigo_postal: s.datos_personales.direccion.codigo_postal,
        estado: s.datos_personales.direccion.estado,
        ciudad: s.datos_personales.direccion.ciudad
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

    const huboCambios = Object.keys(datosPersonalesCambios).length > 0 || Object.keys(direccionCambios).length > 0;

    const dictamenVal = this.dictamenForm.value;
    const payload: VerificarSolicitudPayload = {
      cumple: dictamenVal.cumple === 'true',
      comentario_verificador: dictamenVal.comentario_verificador!,
      dispositivo: navigator.userAgent,
      motivo_edicion: huboCambios ? (dictamenVal.motivo_edicion || 'Corrección realizada durante visita física.') : undefined,
      datos_personales: Object.keys(datosPersonalesCambios).length > 0 ? datosPersonalesCambios : undefined,
      direccion: Object.keys(direccionCambios).length > 0 ? direccionCambios : undefined,
      evidencias: this.evidencias.length > 0 ? this.evidencias.value : undefined
    };

    this.verificacionService.guardarDictamen(s.id, payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/verificador/alta-proveedor/pendientes']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorDictamen.set(err.error?.message || 'Ocurrió un error al guardar el dictamen.');
        this.fieldErrors.set(err.error?.errors || {});
      }
    });
  }

  volver(): void {
    this.router.navigate(['/verificador/alta-proveedor/pendientes']);
  }
}
