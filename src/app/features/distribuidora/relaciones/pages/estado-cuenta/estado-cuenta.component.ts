import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { EstadoCuentaService } from '../../../../../core/services/estado-cuenta.service';
import { EstadoCuenta } from '../../../../../core/models/estado-cuenta.model';
import { ClienteService } from '../../../clientes/services/cliente.service';

@Component({
  selector: 'app-estado-cuenta',
  standalone: true,
  imports: [CommonModule, DineroPipe],
  templateUrl: './estado-cuenta.component.html',
  styleUrl: './estado-cuenta.component.css'
})
export class EstadoCuentaComponent implements OnInit {
  private estadoCuentaService = inject(EstadoCuentaService);
  private clienteService = inject(ClienteService);

  estadoCuenta = signal<EstadoCuenta | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  clienteExpandido = signal<number | null>(null);

  ngOnInit(): void {
    this.clienteService.miPerfil().subscribe({
      next: (res) => {
        const distribuidoraId = res.data?.id ?? null;
        if (!distribuidoraId) {
          this.error.set('No se pudo determinar tu distribuidora.');
          this.cargando.set(false);
          return;
        }
        this.cargar(distribuidoraId);
      },
      error: () => {
        this.error.set('No se pudo cargar tu perfil.');
        this.cargando.set(false);
      }
    });
  }

  private cargar(distribuidoraId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.estadoCuentaService.obtener(distribuidoraId).subscribe({
      next: (res) => {
        this.estadoCuenta.set(res.data ?? null);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu estado de cuenta.');
        this.cargando.set(false);
      }
    });
  }

  toggleCliente(clienteId: number): void {
    this.clienteExpandido.update((actual) => (actual === clienteId ? null : clienteId));
  }
}
