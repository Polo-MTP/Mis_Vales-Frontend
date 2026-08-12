import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitudEdicionClienteService } from '../../services/solicitud-edicion-cliente.service';
import { ClienteService } from '../../services/cliente.service';
import { SolicitudEdicionCliente } from '../../../../../core/models/solicitud-edicion-cliente.model';
import { Cliente } from '../../../../../core/models/cliente.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { estadoSolicitudLabel } from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-solicitar-edicion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitar-edicion.component.html',
  styleUrl: './solicitar-edicion.component.css'
})
export class SolicitarEdicionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private solicitudEdicionClienteService = inject(SolicitudEdicionClienteService);
  private clienteService = inject(ClienteService);

  // Búsqueda de cliente
  terminoBusqueda = signal('');
  buscando = signal(false);
  errorBusqueda = signal<string | null>(null);
  resultados = signal<Cliente[]>([]);
  clienteSeleccionado = signal<Cliente | null>(null);

  form = this.fb.group({
    nombre: [''],
    apellido_paterno: [''],
    apellido_materno: [''],
    curp: [''],
    calle: [''],
    colonia: [''],
    numero_ext: [''],
    numero_int: [''],
    codigo_postal: [''],
    estado: [''],
    ciudad: [''],
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

  readonly estadoSolicitudLabel = estadoSolicitudLabel;

  ngOnInit(): void {
    this.cargarSolicitudes();
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
  }

  quitarSeleccion(): void {
    this.clienteSeleccionado.set(null);
    this.form.reset();
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

  cambiarPagina(delta: number): void {
    const p = this.paginacion();
    if (!p) return;
    const nuevaPagina = this.pagina() + delta;
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

    const datosPersonales = this.filtrarVacios({
      nombre: val.nombre,
      apellido_paterno: val.apellido_paterno,
      apellido_materno: val.apellido_materno,
      curp: val.curp
    });

    const direccion = this.filtrarVacios({
      calle: val.calle,
      colonia: val.colonia,
      numero_ext: val.numero_ext,
      numero_int: val.numero_int,
      codigo_postal: val.codigo_postal,
      estado: val.estado,
      ciudad: val.ciudad
    });

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

  private filtrarVacios(obj: Record<string, string | null | undefined>): Record<string, string> {
    const resultado: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value) {
        resultado[key] = value;
      }
    }
    return resultado;
  }
}
