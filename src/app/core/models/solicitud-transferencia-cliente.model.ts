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

/**
 * El index de transferencias regresa un LengthAwarePaginator envuelto por
 * ResourceCollection::response()->getData(true), que anida la paginación en
 * `meta` en vez del formato plano que usa el resto de la API. Verificado
 * contra SolicitudTransferenciaClienteController::index + el Service (paginate()).
 */
export interface PaginacionAnidada<T> {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}
