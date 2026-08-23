import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SolicitudAumentoCreditoService } from '../../services/solicitud-aumento-credito.service';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { SolicitudAumentoCredito } from '../../../../../core/models/solicitud-aumento-credito.model';

@Component({
  selector: 'app-aumento-credito',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DineroPipe, EstadoBadgeComponent],
  templateUrl: './aumento-credito.component.html',
  styleUrl: './aumento-credito.component.css'
})
export class AumentoCreditoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private solicitudAumentoCreditoService = inject(SolicitudAumentoCreditoService);
  private clienteService = inject(ClienteService);

  distribuidoraId = signal<number | null>(null);

  solicitudForm = this.fb.group({
    monto_solicitado: [null as number | null, [Validators.required, Validators.min(1)]],
    motivo: ['', [Validators.required, Validators.maxLength(500)]]
  });
  enviando = signal(false);
  errorSolicitar = signal<string | null>(null);
  successSolicitar = signal<string | null>(null);

  solicitudes = signal<SolicitudAumentoCredito[]>([]);
  cargando = signal(true);
  errorSolicitudes = signal<string | null>(null);

  ngOnInit(): void {
    this.clienteService.miPerfil().subscribe({
      next: (res) => this.distribuidoraId.set(res.data?.id ?? null)
    });
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.errorSolicitudes.set(null);

    this.solicitudAumentoCreditoService.misSolicitudes().subscribe({
      next: (res) => {
        this.solicitudes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.errorSolicitudes.set('No se pudieron cargar tus solicitudes de aumento de crédito.');
        this.cargando.set(false);
      }
    });
  }

  solicitar(): void {
    const distribuidoraId = this.distribuidoraId();
    if (!distribuidoraId || this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorSolicitar.set(null);
    this.successSolicitar.set(null);

    const { monto_solicitado, motivo } = this.solicitudForm.value;

    this.solicitudAumentoCreditoService.solicitar(distribuidoraId, monto_solicitado!, motivo!).subscribe({
      next: () => {
        this.enviando.set(false);
        this.successSolicitar.set('Solicitud enviada. Queda pendiente de decisión del gerente.');
        this.solicitudForm.reset();
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorSolicitar.set(err.error?.message || 'Ocurrió un error al enviar la solicitud.');
      }
    });
  }
}
