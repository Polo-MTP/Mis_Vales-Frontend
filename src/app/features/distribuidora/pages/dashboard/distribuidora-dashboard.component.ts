import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-distribuidora-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './distribuidora-dashboard.component.html',
  styleUrl: './distribuidora-dashboard.component.css'
})
export class DistribuidoraDashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe();
  }
}
