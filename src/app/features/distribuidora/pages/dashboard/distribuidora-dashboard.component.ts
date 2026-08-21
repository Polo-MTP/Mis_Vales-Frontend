import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ClienteService } from '../../clientes/services/cliente.service';
import { RelacionService } from '../../relaciones/services/relacion.service';
import { DistribuidoraPerfil } from '../../../../core/models/cliente.model';
import { ProximoPago } from '../../../../core/models/relacion.model';

@Component({
  selector: 'app-distribuidora-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './distribuidora-dashboard.component.html',
  styleUrl: './distribuidora-dashboard.component.css'
})
export class DistribuidoraDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private clienteService = inject(ClienteService);
  private relacionService = inject(RelacionService);

  perfil = signal<DistribuidoraPerfil | null>(null);
  cargandoPerfil = signal(true);

  proximoPago = signal<ProximoPago | null>(null);
  /** Solo se muestra si ya hay algo autorizado detrás -- una solicitud sola todavía se puede
   *  cancelar, así que no hay nada firme que respalde una referencia. */
  proximoPagoConReferencia = computed(() => (this.proximoPago()?.referencia_pago ? this.proximoPago() : null));

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();

    this.clienteService.miPerfil().subscribe({
      next: (res) => {
        this.perfil.set(res.data ?? null);
        this.cargandoPerfil.set(false);
      },
      error: () => this.cargandoPerfil.set(false)
    });

    this.relacionService.proximoPago().subscribe({
      next: (res) => this.proximoPago.set(res.data ?? null),
      error: () => this.proximoPago.set(null)
    });
  }
}
