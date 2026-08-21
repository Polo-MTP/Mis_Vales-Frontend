import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationListComponent } from '../notification-list/notification-list.component';

@Component({
  selector: 'app-notification-panel',
  imports: [CommonModule, RouterModule, NotificationListComponent],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.css',
})
export class NotificationPanelComponent {
  @Output() closePanel = new EventEmitter<void>();

  onClose(): void {
    this.closePanel.emit();
  }
}
