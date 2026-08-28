export type EstadoVale = 'solicitado' | 'validado' | 'autorizado' | 'pagado' | 'vencido' | 'incidencia' | 'parcial';
export type TipoVale = 'pre-vale' | 'vale-digital';

/** Cuota de este vale que ya se incluyó en un corte (Relación) -- para saber "de qué corte es". */
export interface CorteDeVale {
  relacion_id: number;
  referencia_pago: string | null;
  /** Identificador único de esta cuota dentro del corte -- lo que va en "Concepto" de la
   *  transferencia si el corte junta más de un vale y se paga cada uno por separado. null si
   *  esta cuota es 'arrastrada': ya no se puede pagar por separado. */
  concepto: string | null;
  fecha_corte: string | null;
  cuota: string;
  estado_cuota: string;
  total: string;
  pago: string;
}

/** Estimado del pago quincenal mientras el vale no tiene ninguna cuota facturada en un corte. */
export interface EstimacionPagoVale {
  capital: number;
  comision: number;
  interes: number;
  seguro: number;
  categoria: number;
  pago_quincenal: number;
  total_estimado_plazo: number;
  nota: string;
}

export interface Vale {
  id: number;
  distribuidora_id: number;
  distribuidora: { id: number; nombre: string | null; numero_distribuidora: string | null } | null;
  cliente: { id: number; nombre: string; curp: string | null; direccion: string | null; clabe_ultimos4: string | null } | null;
  producto: { id: number; monto: string; descripcion: string | null } | null;
  monto: string;
  quincenas: number | null;
  tipo: TipoVale;
  estado: EstadoVale;
  activo: boolean;
  fecha_solicitud: string | null;
  validado_por: number | null;
  fecha_validacion: string | null;
  ine_verificada: boolean | null;
  comprobante_domicilio_verificado: boolean | null;
  fecha_autorizacion: string | null;
  numero_transferencia: string | null;
  /** Saldo a favor de ESTE vale (no de la distribuidora) por un pago de más en conciliación --
   *  se aplica solo a las cuotas futuras de este mismo vale. Si el vale ya está 'pagado' y
   *  esto sigue siendo mayor a cero, ya no hay ninguna cuota que lo consuma sola: la cajera
   *  puede solicitar su reembolso. */
  saldo_excedente: number;
  created_at: string;
  /** Suma de 'total' de todas las cuotas de este vale que ya entraron a un corte. */
  total_acumulado_a_pagar: number;
  /** Suma de 'pago' de todas esas mismas cuotas -- lo que ya se le ha abonado en total. */
  total_acumulado_pagado: number;
  cortes: CorteDeVale[];
  estimacion: EstimacionPagoVale | null;
}

export interface SolicitarValePayload {
  cliente_id: number;
  producto_id: number;
  tipo?: TipoVale;
}
