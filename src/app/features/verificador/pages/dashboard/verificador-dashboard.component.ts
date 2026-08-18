import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-verificador-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="layout-view-tablet">

      <!-- Encabezado -->
      <div class="dash-card space-y-2">
        <h1 class="text-2xl font-black text-slate-100 uppercase tracking-tight">
          Dashboard Verificador
        </h1>
        <p class="text-xs text-slate-400 font-medium">
          Bienvenido, {{ authService.currentUser()?.name }} ({{ authService.currentUser()?.email }})
        </p>
      </div>

    </div>
  `
})
export class VerificadorDashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();
  }
}