import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formato único de dinero para toda la app: "$1,234.50".
 *
 * El backend devuelve los montos como string decimal ("2712.00") o como número, y cada pantalla
 * los venía pintando a mano con "${{ valor }}" -- eso producía "$50000" junto a "$50000.00",
 * "$237.5" y "$0", a veces en la misma tarjeta. Este pipe centraliza el criterio: siempre símbolo,
 * separador de miles y exactamente dos decimales.
 */
@Pipe({ name: 'dinero', standalone: true })
export class DineroPipe implements PipeTransform {
  transform(valor: string | number | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') {
      return '$0.00';
    }

    const numero = typeof valor === 'number' ? valor : Number(valor);

    if (!Number.isFinite(numero)) {
      return '$0.00';
    }

    return '$' + numero.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
