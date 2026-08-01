import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-distribuidora-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div class="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-2">
        <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tight">
          DASHBOARD DISTRIBUIDORA
        </h1>
        <p class="text-xs text-slate-500 font-medium">
          Bienvenido, {{ authService.currentUser()?.name }} ({{ authService.currentUser()?.email }})
        </p>
      </div>
      <!-- Aquí irán los módulos de la Distribuidora -->
    </div>
  `
})
export class DistribuidoraDashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();
  }
}
