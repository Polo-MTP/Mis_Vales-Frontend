import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-t border-slate-200 py-6 mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 MisVales - Sistema de Autenticación de Alta Seguridad (1FA / 2FA / 3FA)</p>
      </div>
    </footer>
  `
})
export class FooterComponent {}
