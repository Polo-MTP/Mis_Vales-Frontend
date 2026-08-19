import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DistribuidoraService } from '../../services/distribuidora.service';
import { DistribuidoraResumen } from '../../../../../core/models/distribuidora.model';

@Component({
  selector: 'app-reasignar-clientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reasignar-clientes.component.html',
  styleUrl: './reasignar-clientes.component.css'
})
export class ReasignarClientesComponent implements OnInit {
  private distribuidoraService = inject(DistribuidoraService);

  distribuidoras = signal<DistribuidoraResumen[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  origenId = signal<number | null>(null);
  destinoId = signal<number | null>(null);

  confirmando = signal(false);
  errorConfirmar = signal<string | null>(null);
  resultado = signal<{ mensaje: string; total: number } | null>(null);

  ngOnInit(): void {
    this.distribuidoraService.listar().subscribe({
      next: (res) => {
        this.distribuidoras.set(res ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu cartera de distribuidoras.');
        this.cargando.set(false);
      }
    });
  }

  elegirOrigen(id: number): void {
    this.origenId.set(id);
    this.resultado.set(null);
    this.errorConfirmar.set(null);
  }

  elegirDestino(id: number): void {
    this.destinoId.set(id);
    this.resultado.set(null);
    this.errorConfirmar.set(null);
  }

  confirmar(): void {
    const origen = this.origenId();
    const destino = this.destinoId();
    if (!origen || !destino || origen === destino) return;

    this.confirmando.set(true);
    this.errorConfirmar.set(null);
    this.resultado.set(null);

    this.distribuidoraService.reasignarClientes(origen, destino).subscribe({
      next: (res) => {
        this.confirmando.set(false);
        this.resultado.set({ mensaje: res.message, total: res.data.clientes_reasignados });
        this.origenId.set(null);
        this.destinoId.set(null);
      },
      error: (err) => {
        this.confirmando.set(false);
        this.errorConfirmar.set(err.error?.message || 'Ocurrió un error al reasignar los clientes.');
      }
    });
  }
}
