export type EstadoSolicitudTransferencia = 'pendiente_autorizacion' | 'autorizada' | 'rechazada' | 'aceptada';

export interface SolicitudTransferenciaCliente {
  id: number;
  cliente_id: number;
  cliente_nombre: string | null;
  distribuidora_origen_id: number;
  distribuidora_origen: string | null;
  distribuidora_destino_id: number;
  distribuidora_destino: string | null;
  solicitado_por: number;
  solicitante: string | null;
  motivo: string;
  estado: EstadoSolicitudTransferencia;
  autorizado_por: number | null;
  autorizador: string | null;
  comentario_autorizacion: string | null;
  fecha_autorizacion: string | null;
  fecha_aceptacion: string | null;
  created_at: string;
}

