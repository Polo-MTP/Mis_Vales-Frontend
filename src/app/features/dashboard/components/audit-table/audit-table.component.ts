import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginAttempt, PaginatedResponse } from '../../../../core/models/user.model';

@Component({
  selector: 'app-audit-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 class="text-base font-black text-slate-800">Historial Forense de Accesos (Auditoría)</h3>
          <p class="text-xs text-slate-500 font-medium">Registro detallado de los intentos e inicio de sesión en el sistema</p>
        </div>
        <span class="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
          Solo Administrador
        </span>
      </div>

      <div *ngIf="isLoading()" class="py-8 text-center text-xs text-slate-400">
        Cargando registros de auditoría...
      </div>

      <div *ngIf="!isLoading()" class="overflow-x-auto border border-slate-200/80 rounded-2xl">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="p-3.5">Fecha / Hora</th>
              <th class="p-3.5">Usuario / Correo</th>
              <th class="p-3.5">Dirección IP</th>
              <th class="p-3.5">Paso Factor</th>
              <th class="p-3.5">Estado / Resultado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr *ngFor="let item of paginationData()?.data" class="hover:bg-slate-50/50 transition-colors">
              <td class="p-3.5 font-mono text-[11px] text-slate-500">{{ item.created_at | date:'short' }}</td>
              <td class="p-3.5">
                <div class="font-bold text-slate-800">{{ item.user?.name || item.email_attempted }}</div>
                <div class="text-[11px] text-slate-400">{{ item.email_attempted }}</div>
              </td>
              <td class="p-3.5 font-mono text-slate-600">{{ item.ip_address }}</td>
              <td class="p-3.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Paso {{ item.factor_step }}</span>
              </td>
              <td class="p-3.5">
                <span [ngClass]="getStatusClass(item.status)" class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold">
                  {{ item.status }}
                </span>
              </td>
            </tr>

            <tr *ngIf="paginationData()?.data?.length === 0">
              <td colspan="5" class="p-6 text-center text-slate-400">No hay registros de accesos aún.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Buttons -->
      <div *ngIf="paginationData()" class="flex items-center justify-between pt-2 text-xs text-slate-500">
        <span>Mostrando {{ paginationData()?.from || 0 }} a {{ paginationData()?.to || 0 }} de {{ paginationData()?.total || 0 }} intentos</span>
        <div class="flex items-center space-x-2">
          <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 1 || isLoading()"
                  class="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 disabled:opacity-40">
            Anterior
          </button>
          <span class="font-bold text-slate-700">Página {{ currentPage() }}</span>
          <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() >= (paginationData()?.last_page || 1) || isLoading()"
                  class="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 disabled:opacity-40">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  `
})
export class AuditTableComponent implements OnInit {
  private authService = inject(AuthService);

  paginationData = signal<PaginatedResponse<LoginAttempt> | null>(null);
  currentPage = signal<number>(1);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadLogs(1);
  }

  loadLogs(page: number): void {
    this.isLoading.set(true);
    this.authService.getAuditLogs(page).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.paginationData.set(res.data);
          this.currentPage.set(res.data.current_page);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= (this.paginationData()?.last_page || 1)) {
      this.loadLogs(newPage);
    }
  }

  getStatusClass(status: string): string {
    if (status.startsWith('success')) {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }
    if (status.includes('locked')) {
      return 'bg-red-100 text-red-700 border border-red-200';
    }
    return 'bg-amber-100 text-amber-700 border border-amber-200';
  }
}
