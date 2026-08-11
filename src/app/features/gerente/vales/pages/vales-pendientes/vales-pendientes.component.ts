import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValeService } from '../../services/vale.service';
import { Vale } from '../../../../../core/models/vale.model';

@Component({
  selector: 'app-vales-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vales-pendientes.component.html',
  styleUrl: './vales-pendientes.component.css'
})
export class ValesPendientesComponent implements OnInit {
  private valeService = inject(ValeService);

  vales = signal<Vale[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  autorizando = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.valeService.listar(1, 'solicitado').subscribe({
      next: (res) => {
        this.vales.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los vales pendientes.');
        this.cargando.set(false);
      }
    });
  }

  autorizar(vale: Vale): void {
    this.autorizando.set(vale.id);

    this.valeService.autorizar(vale.id).subscribe({
      next: () => {
        this.autorizando.set(null);
        this.cargar();
      },
      error: () => this.autorizando.set(null)
    });
  }
}
