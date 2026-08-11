import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ClienteService } from '../../clientes/services/cliente.service';
import { DistribuidoraPerfil } from '../../../../core/models/cliente.model';

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

  perfil = signal<DistribuidoraPerfil | null>(null);
  cargandoPerfil = signal(true);

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();

    this.clienteService.miPerfil().subscribe({
      next: (res) => {
        this.perfil.set(res.data ?? null);
        this.cargandoPerfil.set(false);
      },
      error: () => this.cargandoPerfil.set(false)
    });
  }
}
