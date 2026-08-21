import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserMenuComponent } from '../../../shared/components/user-menu/user-menu.component';
import { NotificationBellComponent } from '../../../shared/components/notifications/notification-bell/notification-bell';

@Component({
  selector: 'app-tablet-header',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenuComponent, NotificationBellComponent],
  templateUrl: './tablet-header.component.html'
})
export class TabletHeaderComponent {}
