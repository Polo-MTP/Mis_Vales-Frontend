import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudTransferenciaClienteService } from '../../services/solicitud-transferencia-cliente.service';
import { SolicitudTransferenciaCliente } from '../../../../../core/models/solicitud-transferencia-cliente.model';

@Component({
  selector: 'app-transferencias-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transferencias-pendientes.component.html',
  styleUrl: './transferencias-pendientes.component.css'
})
export class TransferenciasPendientesComponent implements OnInit {
  private solicitudTransferenciaClienteService = inject(SolicitudTransferenciaClienteService);

  solicitudes = signal<SolicitudTransferenciaCliente[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  decidiendo = signal<number | null>(null);
  errorDecidir = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudTransferenciaClienteService.pendientes().subscribe({
      next: (res) => {
        this.solicitudes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes de transferencia.');
        this.cargando.set(false);
      }
    });
  }

  autorizar(solicitud: SolicitudTransferenciaCliente): void {
    this.decidir(solicitud, 'autorizada');
  }

  rechazar(solicitud: SolicitudTransferenciaCliente): void {
    const comentario = prompt('Motivo del rechazo (opcional):') || undefined;
    this.decidir(solicitud, 'rechazada', comentario);
  }

  private decidir(solicitud: SolicitudTransferenciaCliente, decision: 'autorizada' | 'rechazada', comentario?: string): void {
    this.decidiendo.set(solicitud.id);
    this.errorDecidir.set(null);

    this.solicitudTransferenciaClienteService.decidir(solicitud.id, decision, comentario).subscribe({
      next: () => {
        this.decidiendo.set(null);
        this.cargar();
      },
      error: (err) => {
        this.decidiendo.set(null);
        this.errorDecidir.set(err.error?.message || 'Ocurrió un error al registrar la decisión.');
      }
    });
  }
}
