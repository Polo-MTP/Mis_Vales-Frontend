import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-gerente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div class="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-2">
        <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tight">
          DASHBOARD {{ authService.userRole() | uppercase }}
        </h1>
        <p class="text-xs text-slate-500 font-medium">
          Bienvenido, {{ authService.currentUser()?.name }} ({{ authService.currentUser()?.email }})
        </p>
      </div>

      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <a routerLink="/gerente/solicitudes"
           class="inline-flex items-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200">
          Solicitudes de Nuevo Distribuidor
        </a>
      </div>
    </div>
  `
})
export class GerenteDashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();
  }
}
