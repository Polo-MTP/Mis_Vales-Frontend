import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../services/audit.service';
import { LoginAttempt, PaginatedResponse } from '../../../../../core/models/user.model';
import { loginStatusLabel } from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-audit-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-table.component.html'
})
export class AuditTableComponent implements OnInit {
  private auditService = inject(AuditService);

  paginationData = signal<PaginatedResponse<LoginAttempt> | null>(null);
  currentPage = signal<number>(1);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadLogs(1);
  }

  loadLogs(page: number): void {
    this.isLoading.set(true);
    this.auditService.listar(page).subscribe({
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

  getStatusLabel(status: string): string {
    return loginStatusLabel(status);
  }

  getStatusClass(status: string): string {
    if (status.startsWith('success')) {
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    }
    if (status.includes('locked')) {
      return 'bg-red-500/15 text-red-300 border border-red-500/30';
    }
    return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
  }
}