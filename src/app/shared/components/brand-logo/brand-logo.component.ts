import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brand-logo.component.html'
})
export class BrandLogoComponent {
  @Input() to: string | null = '/';
  @Input() size: 'sm' | 'lg' = 'sm';
}
