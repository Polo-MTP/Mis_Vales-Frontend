import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitudEdicionClienteService } from '../../services/solicitud-edicion-cliente.service';
import { SolicitudEdicionCliente } from '../../../../../core/models/solicitud-edicion-cliente.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

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

  form = this.fb.group({
    cliente_id: ['', [Validators.required]],
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

  ngOnInit(): void {
    this.cargarSolicitudes();
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const clienteId = Number(val.cliente_id);

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

    this.solicitudEdicionClienteService.solicitar(clienteId, { datos_personales: datosPersonales, direccion }, val.motivo!).subscribe({
      next: () => {
        this.enviando.set(false);
        this.successEnviar.set('Solicitud enviada. Se aplicará en cuanto tu superior la autorice.');
        this.form.reset();
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
