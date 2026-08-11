import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { AuditTableComponent } from '../../components/audit-table/audit-table.component';

@Component({
  selector: 'app-administrador-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AuditTableComponent],
  templateUrl: './administrador-dashboard.component.html'
})
export class AdministradorDashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();
  }
}