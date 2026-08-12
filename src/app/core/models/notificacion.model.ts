export interface Notificacion {
  id: number;
  accion: string;
  recurso: string | null;
  sucursal: { id: number; nombre: string } | null;
  usuario: { id: number; name: string } | null;
  created_at: string;
}
