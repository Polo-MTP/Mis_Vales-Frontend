export interface Producto {
  id: number;
  monto: string;
  quincenas: number | null;
  variante: string | null;
  descripcion: string | null;
  activo: boolean;
  creado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrearProductoPayload {
  monto: number;
  quincenas?: number;
  variante?: string;
  descripcion?: string;
}

export interface ActualizarProductoPayload {
  monto: number;
  quincenas?: number;
  variante?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface SimulacionProducto {
  producto_id: number;
  monto: number;
  quincenas: number;
  capital: number;
  comision: number;
  interes: number;
  seguro: number;
  categoria: number;
  pago_quincenal: number;
  total_estimado_plazo: number;
  nota: string;
}
