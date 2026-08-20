import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-dashboard-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-welcome.component.html'
})
export class DashboardWelcomeComponent {

  @Input() user: User | null = null;

}