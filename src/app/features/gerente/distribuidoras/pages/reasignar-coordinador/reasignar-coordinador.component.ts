import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DistribuidoraService } from '../../services/distribuidora.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { User } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-reasignar-coordinador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reasignar-coordinador.component.html',
  styleUrl: './reasignar-coordinador.component.css'
})
export class ReasignarCoordinadorComponent implements OnInit {
  private distribuidoraService = inject(DistribuidoraService);
  private usuarioService = inject(UsuarioService);

  coordinadores = signal<User[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  origenId = signal<number | null>(null);
  destinoId = signal<number | null>(null);

  confirmando = signal(false);
  errorConfirmar = signal<string | null>(null);
  resultado = signal<{ mensaje: string; total: number } | null>(null);

  ngOnInit(): void {
    this.usuarioService.listar('Coordinador').subscribe({
      next: (res) => {
        this.coordinadores.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de coordinadores.');
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

    this.distribuidoraService.reasignarCoordinador(origen, destino).subscribe({
      next: (res) => {
        this.confirmando.set(false);
        this.resultado.set({ mensaje: res.message, total: res.data.distribuidoras_reasignadas });
        this.origenId.set(null);
        this.destinoId.set(null);
      },
      error: (err) => {
        this.confirmando.set(false);
        this.errorConfirmar.set(err.error?.message || 'Ocurrió un error al reasignar el coordinador.');
      }
    });
  }
}
