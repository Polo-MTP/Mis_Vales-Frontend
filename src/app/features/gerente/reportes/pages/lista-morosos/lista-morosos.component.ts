import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReporteService } from '../../services/reporte.service';
import { DistribuidoraMorosa } from '../../../../../core/models/reporte.model';

@Component({
  selector: 'app-lista-morosos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-morosos.component.html',
  styleUrl: './lista-morosos.component.css'
})
export class ListaMorososComponent implements OnInit {
  private reporteService = inject(ReporteService);

  distribuidoras = signal<DistribuidoraMorosa[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.reporteService.morosos().subscribe({
      next: (res) => {
        this.distribuidoras.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el reporte de morosos.');
        this.cargando.set(false);
      }
    });
  }

  get saldoTotal(): number {
    return this.distribuidoras().reduce((acc, d) => acc + d.saldo_pendiente_total, 0);
  }
}
