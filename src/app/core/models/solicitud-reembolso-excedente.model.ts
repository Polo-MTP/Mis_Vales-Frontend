export type EstadoSolicitudReembolsoExcedente = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudReembolsoExcedente {
  id: number;
  vale_id: number;
  vale_cliente: string | null;
  distribuidora_id: number;
  distribuidora: string | null;
  monto: number;
  solicitado_por: number;
  solicitante: string | null;
  motivo: string | null;
  estado: EstadoSolicitudReembolsoExcedente;
  autorizado_por: number | null;
  autorizador: string | null;
  comentario_autorizacion: string | null;
  fecha_decision: string | null;
  created_at: string;
}
