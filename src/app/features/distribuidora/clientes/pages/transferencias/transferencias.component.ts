import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { SolicitudTransferenciaClienteService } from '../../services/solicitud-transferencia-cliente.service';
import { Cliente } from '../../../../../core/models/cliente.model';
import { SolicitudTransferenciaCliente } from '../../../../../core/models/solicitud-transferencia-cliente.model';

@Component({
  selector: 'app-transferencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EstadoBadgeComponent],
  templateUrl: './transferencias.component.html',
  styleUrl: './transferencias.component.css'
})
export class TransferenciasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private solicitudTransferenciaClienteService = inject(SolicitudTransferenciaClienteService);

  curpForm = this.fb.group({
    curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]]
  });
  buscando = signal(false);
  errorBuscar = signal<string | null>(null);
  clienteEncontrado = signal<Cliente | null>(null);

  motivoForm = this.fb.group({
    motivo: ['', [Validators.required, Validators.maxLength(500)]]
  });
  solicitando = signal(false);
  errorSolicitar = signal<string | null>(null);
  successSolicitar = signal<string | null>(null);

  solicitudes = signal<SolicitudTransferenciaCliente[]>([]);
  cargandoSolicitudes = signal(true);
  errorSolicitudes = signal<string | null>(null);

  decidiendo = signal<number | null>(null);
  errorDecidir = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargandoSolicitudes.set(true);
    this.errorSolicitudes.set(null);

    this.solicitudTransferenciaClienteService.misSolicitudes().subscribe({
      next: (res) => {
        this.solicitudes.set(res.data?.data ?? []);
        this.cargandoSolicitudes.set(false);
      },
      error: () => {
        this.errorSolicitudes.set('No se pudieron cargar tus solicitudes de transferencia.');
        this.cargandoSolicitudes.set(false);
      }
    });
  }

  buscar(): void {
    if (this.curpForm.invalid) {
      this.curpForm.markAllAsTouched();
      return;
    }

    this.buscando.set(true);
    this.errorBuscar.set(null);
    this.clienteEncontrado.set(null);
    this.successSolicitar.set(null);

    const curp = this.curpForm.value.curp!.toUpperCase();

    this.clienteService.buscarPorCurp(curp).subscribe({
      next: (res) => {
        this.buscando.set(false);
        this.clienteEncontrado.set(res.data ?? null);
      },
      error: (err) => {
        this.buscando.set(false);
        this.errorBuscar.set(err.error?.message || 'No se encontró ningún cliente con esa CURP.');
      }
    });
  }

  solicitarTransferencia(): void {
    const cliente = this.clienteEncontrado();
    if (!cliente || this.motivoForm.invalid) {
      this.motivoForm.markAllAsTouched();
      return;
    }

    this.solicitando.set(true);
    this.errorSolicitar.set(null);
    this.successSolicitar.set(null);

    this.solicitudTransferenciaClienteService.solicitar(cliente.id, this.motivoForm.value.motivo!).subscribe({
      next: () => {
        this.solicitando.set(false);
        this.successSolicitar.set('Solicitud enviada. Queda pendiente de autorización del coordinador/gerente de la distribuidora origen.');
        this.clienteEncontrado.set(null);
        this.curpForm.reset();
        this.motivoForm.reset();
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.solicitando.set(false);
        this.errorSolicitar.set(err.error?.message || 'Ocurrió un error al enviar la solicitud.');
      }
    });
  }

  confirmar(solicitud: SolicitudTransferenciaCliente): void {
    this.decidir(solicitud, 'aceptada');
  }

  declinar(solicitud: SolicitudTransferenciaCliente): void {
    this.decidir(solicitud, 'rechazada');
  }

  private decidir(solicitud: SolicitudTransferenciaCliente, decision: 'aceptada' | 'rechazada'): void {
    this.decidiendo.set(solicitud.id);
    this.errorDecidir.set(null);

    this.solicitudTransferenciaClienteService.aceptar(solicitud.id, decision).subscribe({
      next: () => {
        this.decidiendo.set(null);
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.decidiendo.set(null);
        this.errorDecidir.set(err.error?.message || 'Ocurrió un error al registrar tu decisión.');
      }
    });
  }
}
