import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-security-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Grid of Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Estado -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 border-l-4 border-l-emerald-500 shadow-sm space-y-2">
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de Cuenta</h4>
          <div class="text-lg font-black text-slate-800">Protección Activa</div>
          <span class="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded border border-emerald-200">
            {{ authService.currentUser()?.role?.factor_count || 1 }} Factores Requeridos
          </span>
        </div>

        <!-- Card 2: Sesión -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 border-l-4 border-l-blue-500 shadow-sm space-y-2">
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sesión Actual</h4>
          <div class="text-lg font-black text-slate-800">Bearer Token Sanctum</div>
          <span class="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[11px] rounded border border-blue-200">
            Headless API Connection
          </span>
        </div>

        <!-- Card 3: Rol -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 border-l-4 border-l-purple-500 shadow-sm space-y-2">
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nivel de Usuario</h4>
          <div class="text-lg font-black text-slate-800">{{ authService.userRole() }}</div>
          <span class="inline-flex px-2 py-0.5 bg-purple-50 text-purple-700 font-bold text-[11px] rounded border border-purple-200">
            Permisos Asignados
          </span>
        </div>

        <!-- Card 4: Seguridad -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 border-l-4 border-l-amber-500 shadow-sm space-y-2">
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Métodos MFA</h4>
          <div class="text-lg font-black text-slate-800">Google Authenticator</div>
          <span class="inline-flex px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[11px] rounded border border-amber-200">
            TOTP Integrado
          </span>
        </div>
      </div>

      <!-- User Information Box -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-base font-black text-slate-800 border-b border-slate-100 pb-3">Detalles del Perfil Autenticado</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-slate-400 font-bold block mb-0.5">Nombre Completo:</span>
            <span class="text-slate-800 font-black text-sm">{{ authService.currentUser()?.name }}</span>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-slate-400 font-bold block mb-0.5">Correo Electrónico:</span>
            <span class="text-slate-800 font-black text-sm">{{ authService.currentUser()?.email }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SecurityCenterComponent {
  authService = inject(AuthService);
}
