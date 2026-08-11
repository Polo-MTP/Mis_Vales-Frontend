import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RelacionService } from '../../services/relacion.service';
import { Relacion } from '../../../../../core/models/relacion.model';

@Component({
  selector: 'app-detalle-relacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-relacion.component.html',
  styleUrl: './detalle-relacion.component.css'
})
export class DetalleRelacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private relacionService = inject(RelacionService);

  relacion = signal<Relacion | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  perdonando = signal(false);
  errorPerdonar = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.relacionService.detalle(id).subscribe({
      next: (res) => {
        this.relacion.set(res.data ?? null);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la relación.');
        this.cargando.set(false);
      }
    });
  }

  puedePerdonar(): boolean {
    const r = this.relacion();
    return !!r && ['pendiente', 'parcial', 'vencida'].includes(r.estado);
  }

  perdonar(): void {
    const r = this.relacion();
    if (!r) return;

    const motivo = prompt('Motivo del perdón (opcional):') || undefined;

    this.perdonando.set(true);
    this.errorPerdonar.set(null);

    this.relacionService.perdonar(r.id, motivo).subscribe({
      next: (res) => {
        this.perdonando.set(false);
        this.relacion.set(res.data ?? r);
      },
      error: (err) => {
        this.perdonando.set(false);
        this.errorPerdonar.set(err.error?.message || 'Ocurrió un error al perdonar la relación.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/gerente/relaciones']);
  }
}
