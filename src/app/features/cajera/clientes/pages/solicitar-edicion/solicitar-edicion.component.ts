import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitudEdicionClienteService } from '../../services/solicitud-edicion-cliente.service';
import { ClienteService } from '../../services/cliente.service';
import { SolicitudEdicionCliente } from '../../../../../core/models/solicitud-edicion-cliente.model';
import { Cliente } from '../../../../../core/models/cliente.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { GooglePlacesAutocompleteDirective } from '../../../../../shared/directives/google-places-autocomplete.directive';
import { parsearDireccionGoogle } from '../../../../../shared/utils/google-address.util';
import { SoloNumerosDirective } from '../../../../../shared/directives/solo-numeros.directive';
import { MayusculasDirective } from '../../../../../shared/directives/mayusculas.directive';
import { MENSAJES_PATRON, CODIGO_POSTAL_PATTERN, CURP_PATTERN, NUMERO_PATTERN } from '../../../../../shared/utils/mexico-validators';

@Component({
  selector: 'app-solicitar-edicion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GooglePlacesAutocompleteDirective, SoloNumerosDirective, MayusculasDirective, PaginationComponent, EstadoBadgeComponent],
  templateUrl: './solicitar-edicion.component.html',
  styleUrl: './solicitar-edicion.component.css'
})
export class SolicitarEdicionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private solicitudEdicionClienteService = inject(SolicitudEdicionClienteService);
  private clienteService = inject(ClienteService);
  sesgoDireccion = signal<{ lat: number; lng: number } | null>(null);
  readonly mensajesPatron = MENSAJES_PATRON;

  // Búsqueda de cliente
  terminoBusqueda = signal('');
  buscando = signal(false);
  errorBusqueda = signal<string | null>(null);
  resultados = signal<Cliente[]>([]);
  clienteSeleccionado = signal<Cliente | null>(null);
  /** Si llegamos aquí desde "Validar Datos" de un vale, ya sabemos qué cliente corregir. */
  cargandoClientePreseleccionado = signal(false);

  form = this.fb.group({
    nombre: ['', [Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', [Validators.pattern(CURP_PATTERN)]],
    calle: ['', [Validators.maxLength(255)]],
    colonia: ['', [Validators.maxLength(255)]],
    numero_ext: ['', [Validators.pattern(NUMERO_PATTERN), Validators.maxLength(50)]],
    numero_int: ['', [Validators.pattern(NUMERO_PATTERN), Validators.maxLength(50)]],
    codigo_postal: ['', [Validators.pattern(CODIGO_POSTAL_PATTERN)]],
    estado: ['', [Validators.maxLength(255)]],
    ciudad: ['', [Validators.maxLength(255)]],
    motivo: ['', [Validators.required, Validators.maxLength(500)]]
  });

  enviando = signal(false);
  errorEnviar = signal<string | null>(null);
  successEnviar = signal<string | null>(null);

  solicitudes = signal<SolicitudEdicionCliente[]>([]);
  paginacion = signal<PaginatedResponse<SolicitudEdicionCliente> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  aplicando = signal<number | null>(null);
  errorAplicar = signal<string | null>(null);


  ngOnInit(): void {
    this.cargarSolicitudes();

    const clienteId = Number(this.route.snapshot.queryParamMap.get('clienteId'));
    if (clienteId) {
      this.cargandoClientePreseleccionado.set(true);
      this.clienteService.detalle(clienteId).subscribe({
        next: (res) => {
          this.cargandoClientePreseleccionado.set(false);
          if (res.data) {
            this.seleccionarCliente(res.data);
          }
        },
        error: () => this.cargandoClientePreseleccionado.set(false)
      });
    }
  }

  buscarCliente(termino: string): void {
    this.terminoBusqueda.set(termino);

    if (!termino.trim()) {
      this.resultados.set([]);
      return;
    }

    this.buscando.set(true);
    this.errorBusqueda.set(null);

    this.clienteService.buscar(termino).subscribe({
      next: (res) => {
        this.buscando.set(false);
        this.resultados.set(res.data?.data ?? []);
      },
      error: () => {
        this.buscando.set(false);
        this.errorBusqueda.set('No se pudo buscar el cliente.');
      }
    });
  }

  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado.set(cliente);
    this.resultados.set([]);
    this.terminoBusqueda.set('');

    // Precarga lo que ya existe: la cajera ve los datos actuales y solo toca el campo que
    // esté mal, en vez de partir de un formulario vacío sin nada contra qué comparar.
    const dp = cliente.datos_personales;
    this.form.patchValue({
      nombre: dp?.nombre ?? '',
      apellido_paterno: dp?.apellido_paterno ?? '',
      apellido_materno: dp?.apellido_materno ?? '',
      curp: dp?.curp ?? '',
      calle: dp?.direccion?.calle ?? '',
      colonia: dp?.direccion?.colonia ?? '',
      numero_ext: dp?.direccion?.numero_ext ?? '',
      numero_int: dp?.direccion?.numero_int ?? '',
      codigo_postal: dp?.direccion?.codigo_postal ?? '',
      estado: dp?.direccion?.estado ?? '',
      ciudad: dp?.direccion?.ciudad ?? ''
    });
  }

  quitarSeleccion(): void {
    this.clienteSeleccionado.set(null);
    this.form.reset();
    this.sesgoDireccion.set(null);
  }

  errorFor(campo: string): string | null {
    const control = this.form.get(campo);
    if (control?.invalid && (control.touched || control.dirty)) {
      if (control.errors?.['required']) return 'Este campo es obligatorio.';
      if (control.errors?.['pattern']) return this.mensajesPatron[campo] ?? 'Formato inválido.';
    }
    return null;
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
   * Comarca Lagunera, que cruza Coahuila/Durango). Solo se llenan aquí si el CP todavía no los
   * estableció.
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

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudEdicionClienteService.misSolicitudes(this.pagina()).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.solicitudes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus solicitudes.');
        this.cargando.set(false);
      }
    });
  }

    cambiarPagina(nuevaPagina: number): void {
    const p = this.paginacion();
    if (!p) return;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargarSolicitudes();
  }

  onSubmit(): void {
    const cliente = this.clienteSeleccionado();
    if (!cliente || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const dp = cliente.datos_personales;

    const datosPersonales = this.soloCambios(
      {
        nombre: dp?.nombre,
        apellido_paterno: dp?.apellido_paterno,
        apellido_materno: dp?.apellido_materno,
        curp: dp?.curp
      },
      {
        nombre: val.nombre,
        apellido_paterno: val.apellido_paterno,
        apellido_materno: val.apellido_materno,
        curp: val.curp
      }
    );

    const direccion = this.soloCambios(
      {
        calle: dp?.direccion?.calle,
        colonia: dp?.direccion?.colonia,
        numero_ext: dp?.direccion?.numero_ext,
        numero_int: dp?.direccion?.numero_int,
        codigo_postal: dp?.direccion?.codigo_postal,
        estado: dp?.direccion?.estado,
        ciudad: dp?.direccion?.ciudad
      },
      {
        calle: val.calle,
        colonia: val.colonia,
        numero_ext: val.numero_ext,
        numero_int: val.numero_int,
        codigo_postal: val.codigo_postal,
        estado: val.estado,
        ciudad: val.ciudad
      }
    );

    if (Object.keys(datosPersonales).length === 0 && Object.keys(direccion).length === 0) {
      this.errorEnviar.set('Captura al menos un campo a corregir.');
      return;
    }

    this.enviando.set(true);
    this.errorEnviar.set(null);
    this.successEnviar.set(null);

    this.solicitudEdicionClienteService.solicitar(cliente.id, { datos_personales: datosPersonales, direccion }, val.motivo!).subscribe({
      next: () => {
        this.enviando.set(false);
        this.successEnviar.set('Solicitud enviada. Se aplicará en cuanto tu superior la autorice.');
        this.quitarSeleccion();
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorEnviar.set(err.error?.message || 'Ocurrió un error al enviar la solicitud.');
      }
    });
  }

  aplicar(solicitud: SolicitudEdicionCliente): void {
    this.aplicando.set(solicitud.id);
    this.errorAplicar.set(null);

    this.solicitudEdicionClienteService.aplicar(solicitud.cliente_id, solicitud.id).subscribe({
      next: () => {
        this.aplicando.set(null);
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.aplicando.set(null);
        this.errorAplicar.set(err.error?.message || 'Ocurrió un error al aplicar la edición.');
      }
    });
  }

  /** Como los campos vienen precargados con lo ya guardado, solo se manda lo que realmente cambió. */
  private soloCambios(
    original: Record<string, string | null | undefined>,
    actual: Record<string, string | null | undefined>
  ): Record<string, string> {
    const cambios: Record<string, string> = {};

    for (const campo of Object.keys(actual)) {
      const valorOriginal = original[campo] ?? '';
      const valorActual = actual[campo] ?? '';
      if (valorActual !== valorOriginal && valorActual !== '') {
        cambios[campo] = valorActual;
      }
    }

    return cambios;
  }
}
