import { DatosPersonales, Sucursal, UsuarioResumen } from './solicitud-proveedor.model';

export interface HistorialAsignacionCliente {
  id: number;
  distribuidor_id: number;
  distribuidora_numero: string | null;
  cliente_id: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  activo_con_distribuidora: boolean;
  created_at: string;
}

export interface Cliente {
  id: number;
  estado: boolean;
  /** Últimos 4 dígitos de la CLABE ya registrada, o null si todavía no tiene una. Nunca se
   *  expone la CLABE completa (dato bancario sensible, cifrado en BD). */
  clabe_ultimos4: string | null;
  created_at: string;
  updated_at: string;
  datos_personales: DatosPersonales;
  historial_asignacion: HistorialAsignacionCliente[];
}

export interface CrearClientePayload {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  curp: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  calle: string;
  colonia: string;
  numero_ext: string;
  numero_int?: string;
  codigo_postal: string;
  estado: string;
  ciudad: string;
}

export interface EditarClientePayload {
  datos_personales?: {
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    curp?: string;
    fecha_nacimiento?: string;
    lugar_nacimiento?: string;
  };
  direccion?: {
    calle?: string;
    colonia?: string;
    numero_ext?: string;
    numero_int?: string;
    codigo_postal?: string;
    estado?: string;
    ciudad?: string;
  };
}

/** Datos personales del titular de la distribuidora, tal como los regresa /distribuidora/perfil (sin id). */
export interface DatosPersonalesResumen {
  nombre: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  curp: string | null;
  fecha_nacimiento: string | null;
  lugar_nacimiento: string | null;
  direccion: {
    calle: string | null;
    colonia: string | null;
    numero_ext: string | null;
    numero_int: string | null;
    codigo_postal: string | null;
    estado: string | null;
    ciudad: string | null;
    latitud: number | null;
    longitud: number | null;
  };
}

export interface DistribuidoraPerfil {
  id: number;
  usuario_id: number;
  numero_distribuidora: string | null;
  nombre: string | null;
  rfc: string | null;
  limite_credito: string | number | null;
  credito_disponible: string | number | null;
  puntos_acumulados: number | null;
  /** Saldo a favor por un pago de más en conciliación bancaria que todavía no se le ha
   *  aplicado a ningún corte -- se descuenta solo, sin que nadie tenga que hacer nada. */
  saldo_excedente: string | number | null;
  estado: string | null;
  sucursal: Sucursal;
  coordinador: UsuarioResumen;
  verificador: UsuarioResumen;
  datos_personales: DatosPersonalesResumen;
  comentarios_verificador: string | null;
  fecha_aprobacion: string | null;
  created_at: string;
  updated_at: string;
}
