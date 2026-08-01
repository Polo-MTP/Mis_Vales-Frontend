import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { AuditTableComponent } from '../../components/audit-table/audit-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AuditTableComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Minimalist Header per Role -->
      <div class="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-2">
        <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tight">
          DASHBOARD {{ authService.userRole() }}
        </h1>
        <p class="text-xs text-slate-500 font-medium">
          Bienvenido, {{ authService.currentUser()?.name }} ({{ authService.currentUser()?.email }})
        </p>
      </div>

      <!-- Audit Logs Table for Administrador -->
      <div *ngIf="authService.userRole() === 'Administrador'">
        <app-audit-table></app-audit-table>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();
  }
}
