import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { LoginAttempt, PaginatedResponse } from '../../../../core/models/user.model';

@Component({
  selector: 'app-audit-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-table.component.html'
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