export interface Sucursal {
  id: number;
  nombre: string;
  codigo: string;
  es_matriz: boolean;
  is_active: boolean;
}

export interface CrearSucursalPayload {
  nombre: string;
  codigo: string;
  es_matriz?: boolean;
}

export interface ActualizarSucursalPayload {
  nombre: string;
  codigo: string;
  es_matriz?: boolean;
  is_active?: boolean;
}
