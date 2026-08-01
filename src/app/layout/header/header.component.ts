import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Logo Brand -->
        <div class="flex items-center space-x-3">
          <a [routerLink]="homeRoute" class="flex items-center space-x-2 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              V
            </div>
            <div class="flex flex-col">
              <span class="font-black text-slate-800 text-lg tracking-tight">MisVales</span>
              <span class="text-[10px] uppercase tracking-wider font-semibold text-blue-600 -mt-1">Login Seguro API</span>
            </div>
          </a>
        </div>

        <!-- User Actions & Info -->
        <div *ngIf="authService.isAuthenticated()" class="flex items-center space-x-4">
          <div class="hidden sm:flex flex-col text-right">
            <span class="text-xs font-semibold text-slate-700">{{ authService.currentUser()?.name }}</span>
            <div class="flex items-center justify-end space-x-1.5 mt-0.5">
              <span [ngClass]="getRoleBadgeClass()" class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold">
                {{ authService.userRole() }}
              </span>
            </div>
          </div>

          <button (click)="logout()" class="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-200">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>

        <!-- Guest Links -->
        <div *ngIf="!authService.isAuthenticated()" class="flex items-center space-x-3">
          <a routerLink="/auth/login" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200">
            Iniciar Sesión
          </a>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);

  get homeRoute(): string {
    switch (this.authService.userRole()) {
      case 'Administrador': return '/administrador';
      case 'Gerente General':
      case 'Gerente de Sucursal': return '/gerente';
      case 'Coordinador': return '/coordinador';
      case 'Verificador': return '/verificador';
      case 'Distribuidora': return '/distribuidora';
      default: return '/auth/login';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleBadgeClass(): string {
    switch (this.authService.userRole()) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Usuario':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  }
}
