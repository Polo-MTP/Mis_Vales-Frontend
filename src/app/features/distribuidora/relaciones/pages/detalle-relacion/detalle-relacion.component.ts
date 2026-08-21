import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RelacionService } from '../../services/relacion.service';
import { Relacion } from '../../../../../core/models/relacion.model';
import { CopyButtonComponent } from '../../../../../shared/components/copy-button/copy-button.component';

@Component({
  selector: 'app-detalle-relacion',
  standalone: true,
  imports: [CommonModule, RouterModule, CopyButtonComponent],
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
      error: (err) => {
        this.error.set(
          err.status === 403
            ? 'No puedes ver este corte.'
            : 'No se pudo cargar el corte.'
        );
        this.cargando.set(false);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/distribuidora/relaciones']);
  }
}
