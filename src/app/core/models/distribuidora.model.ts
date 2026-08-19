import { Sucursal, UsuarioResumen } from './solicitud-proveedor.model';
import { DatosPersonalesResumen } from './cliente.model';

export interface CategoriaDistribuidora {
  id: number;
  nombre: string;
  porcentaje_comision: string;
  descripcion: string | null;
  activo: boolean;
}

export type EstadoDistribuidora =
  | 'EN_CAPTURA'
  | 'EN_VERIFICACION'
  | 'PENDIENTE_APROBACION'
  | 'ACTIVO'
  | 'RECHAZADO'
  | 'MOROSO'
  | 'INACTIVO';

export interface DistribuidoraResumen {
  id: number;
  usuario_id: number;
  numero_distribuidora: string | null;
  razon_social: string | null;
  rfc: string | null;
  limite_credito: string | number | null;
  credito_disponible: string | number | null;
  categoria: CategoriaDistribuidora | null;
  puntos_acumulados: number | null;
  estado: EstadoDistribuidora;
  sucursal: Sucursal;
  coordinador: UsuarioResumen;
  verificador: UsuarioResumen;
  datos_personales: DatosPersonalesResumen;
  comentarios_verificador: string | null;
  contrato_url: string | null;
  fecha_aprobacion: string | null;
  created_at: string;
  updated_at: string;
}
