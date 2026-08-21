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
  /** Descuento por la categoría (Cobre/Plata/Oro) de la distribuidora; solo se reconoce si esta
   *  cuota se paga a tiempo -- con recargo queda en 0. Ya viene restado del `total`. `null` en
   *  cortes generados antes de que este campo existiera en el backend. */
  categoria: string | null;
  recargo: string;
  pago: string;
  total: string;
  estado: string;
}

/** Próximo corte antes de que exista -- fecha_corte/referencia_pago son deterministas
 *  (distribuidora_id + fecha_corte), no dependen de que el corte ya se haya generado. */
export interface ProximoPago {
  fecha_corte: string;
  fecha_limite_pago: string;
  referencia_pago: string;
  monto_estimado: number;
  vales: Array<{ vale_id: number; monto: number; pago_estimado: number }>;
  nota: string;
}

export interface Relacion {
  id: number;
  distribuidora_id: number;
  distribuidora: { numero_distribuidora: string | null; razon_social: string | null } | null;
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
    categoria: string | null;
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
