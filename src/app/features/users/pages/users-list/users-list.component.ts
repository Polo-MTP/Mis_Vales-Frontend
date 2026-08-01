import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h2 class="text-xl font-black text-slate-800">Gestión de Usuarios</h2>
        <p class="text-xs text-slate-500">Módulo de administración de usuarios y asignación de roles.</p>
      </div>
    </div>
  `
})
export class UsersListComponent {}
