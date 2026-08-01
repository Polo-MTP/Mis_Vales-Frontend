import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message()" [ngClass]="alertClasses()" class="p-4 mb-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between shadow-sm">
      <div class="flex items-center space-x-3">
        <svg *ngIf="type() === 'error'" class="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg *ngIf="type() === 'success'" class="w-5 h-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ message() }}</span>
      </div>
    </div>
  `
})
export class AlertComponent {
  message = input<string | null>(null);
  type = input<'error' | 'success' | 'info'>('error');

  alertClasses(): string {
    switch (this.type()) {
      case 'error':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
  }
}
