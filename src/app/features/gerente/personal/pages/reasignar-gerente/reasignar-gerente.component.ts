import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioService as UsuariosPorRolService } from '../../../../../core/services/usuario.service';
import { User } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-reasignar-gerente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reasignar-gerente.component.html'
})
export class ReasignarGerenteComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private usuariosPorRolService = inject(UsuariosPorRolService);

  gerentes = signal<User[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  origenId = signal<number | null>(null);
  destinoId = signal<number | null>(null);

  confirmando = signal(false);
  errorConfirmar = signal<string | null>(null);
  resultado = signal<{ mensaje: string; total: number } | null>(null);

  ngOnInit(): void {
    this.usuariosPorRolService.listar('Gerente de Sucursal').subscribe({
      next: (res) => {
        this.gerentes.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de Gerentes de Sucursal.');
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

    this.usuarioService.reasignarPersonal({ gerente_origen_id: origen, gerente_destino_id: destino }).subscribe({
      next: (res) => {
        this.confirmando.set(false);
        this.resultado.set({ mensaje: res.message, total: res.data?.personal_reasignado ?? 0 });
        this.origenId.set(null);
        this.destinoId.set(null);
      },
      error: (err) => {
        this.confirmando.set(false);
        this.errorConfirmar.set(err.error?.message || 'Ocurrió un error al reasignar el personal.');
      }
    });
  }
}
