export type EstadoSolicitudAumentoCredito = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudAumentoCredito {
  id: number;
  distribuidora_id: number;
  distribuidora: string | null;
  solicitado_por: number;
  solicitante: string | null;
  limite_credito_anterior: number;
  monto_solicitado: number;
  monto_otorgado: number | null;
  motivo: string;
  estado: EstadoSolicitudAumentoCredito;
  decidido_por: number | null;
  decisor: string | null;
  comentario_decision: string | null;
  fecha_decision: string | null;
  created_at: string;
}
