export type EstadoRelacion = 'pendiente' | 'parcial' | 'vencida' | 'perdonada' | 'en_perdida' | 'liquidada';

export interface RelacionDetalle {
  id: number;
  vale_id: number;
  cliente: { id: number | null; nombre: string };
  producto: string | null;
  cuota: string;
  capital: string;
  comision: string;
  interes: string;
  seguro: string;
  recargo: string;
  pago: string;
  total: string;
  estado: string;
}

export interface Relacion {
  id: number;
  distribuidora_id: number;
  sucursal: string | null;
  referencia_pago: string;
  fecha_corte: string;
  fecha_limite_pago: string;
  fecha_pago_anticipado_desde: string;
  fecha_pago_anticipado_hasta: string;
  limite_credito_snapshot: string | null;
  categoria_snapshot: string | null;
  porcentaje_comision_snapshot: string | null;
  totales: {
    capital: string;
    comision: string;
    interes: string;
    seguro: string;
    recargos: string;
    a_pagar: string;
    abonado: string;
    saldo_pendiente: number;
  };
  puntos_generados: number | null;
  estado: EstadoRelacion;
  detalles: RelacionDetalle[];
  created_at: string;
}
