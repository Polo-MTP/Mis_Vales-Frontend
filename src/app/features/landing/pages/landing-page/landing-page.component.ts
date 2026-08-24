import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrandLogoComponent } from '../../../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, BrandLogoComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  menuMovilAbierto = signal(false);
  modoSeleccionado = signal<'distribuidoras' | 'clientes'>('distribuidoras');

  toggleMenuMovil(): void {
    this.menuMovilAbierto.update(v => !v);
  }

  setModo(modo: 'distribuidoras' | 'clientes'): void {
    this.modoSeleccionado.set(modo);
  }
}
