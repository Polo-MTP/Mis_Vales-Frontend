import { UsuarioResumen } from './solicitud-proveedor.model';

export type TipoDatoConfiguracion = 'decimal' | 'int' | 'boolean' | 'string';

export interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  valor_casteado: string | number | boolean | null;
  tipo_dato: TipoDatoConfiguracion;
  vigente_desde: string | null;
  vigente_hasta: string | null;
  es_vigente: boolean;
  modificado_por: UsuarioResumen;
  created_at: string;
}

export interface CambiarConfiguracionPayload {
  clave: string;
  valor: string;
  tipo_dato: TipoDatoConfiguracion;
}

export interface ConfiguracionFechas {
  id: number;
  sucursal_id: number | null;
  sucursal: { id: number; nombre: string; codigo: string } | null;
  es_default_global: boolean;
  dia_corte: number;
  dia_limite_pago: number;
  dias_pago_anticipado: number;
  vigente_desde: string | null;
  vigente_hasta: string | null;
  es_vigente: boolean;
  modificado_por: UsuarioResumen;
  created_at: string;
}

export interface CambiarConfiguracionFechasPayload {
  sucursal_id?: number | null;
  dia_corte: number;
  dia_limite_pago: number;
  dias_pago_anticipado: number;
}

export interface SeguroTabla {
  id: number;
  monto_desde: string;
  monto_hasta: string | null;
  seguro_monto: string;
  activo: boolean;
}

export interface SeguroTablaPayload {
  monto_desde: number;
  monto_hasta: number | null;
  seguro_monto: number;
  activo?: boolean;
}
