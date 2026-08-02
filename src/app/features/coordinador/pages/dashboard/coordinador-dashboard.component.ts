import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-coordinador-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-[820px] mx-auto py-8 space-y-8">
      <div class="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-2">
        <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tight">
          DASHBOARD COORDINADOR
        </h1>
        <p class="text-xs text-slate-500 font-medium">
          Bienvenido, {{ authService.currentUser()?.name }} ({{ authService.currentUser()?.email }})
        </p>
      </div>

      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <a routerLink="/coordinador/solicitudes/nueva"
           class="inline-flex items-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200">
          + Nueva Solicitud de Distribuidor
        </a>
      </div>
    </div>
  `
})
export class CoordinadorDashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();
  }
}
