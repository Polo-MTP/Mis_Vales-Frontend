import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SucursalService } from '../../../../gerente/personal/services/sucursal.service';
import { Sucursal } from '../../../../../core/models/sucursal.model';

/**
 * Solo puede existir una sucursal matriz a la vez -- determina a dónde se asigna
 * automáticamente cualquier Gerente General nuevo. Se provisiona por seeder al desplegar el
 * ambiente, no hay forma de crearla desde la app: esta pantalla solo la muestra.
 */
@Component({
  selector: 'app-sucursal-matriz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sucursal-matriz.component.html'
})
export class SucursalMatrizComponent implements OnInit {
  private sucursalService = inject(SucursalService);

  cargando = signal(true);
  matriz = signal<Sucursal | null>(null);

  ngOnInit(): void {
    this.sucursalService.listar(false).subscribe({
      next: (res) => {
        this.matriz.set((res.data ?? []).find((s) => s.es_matriz) ?? null);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }
}
