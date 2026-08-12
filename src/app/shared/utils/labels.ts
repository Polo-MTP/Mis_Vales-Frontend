function humanizarClave(valor: string): string {
  const texto = valor.replace(/_/g, ' ').trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const TIPO_PAGO_LABELS: Record<string, string> = {
  transferencia: 'Transferencia',
  banca_en_linea: 'Banca en línea',
  pago_en_ventanilla: 'Pago en ventanilla',
  efectivo: 'Efectivo',
  cheque: 'Cheque'
};

export function tipoPagoLabel(tipo: string | null | undefined): string {
  if (!tipo) return '';
  return TIPO_PAGO_LABELS[tipo] ?? humanizarClave(tipo);
}

const ESTADO_ABONO_LABELS: Record<string, string> = {
  conciliado: 'Conciliado',
  conciliado_manual: 'Conciliado manual',
  sin_coincidencia: 'Sin coincidencia'
};

export function estadoAbonoLabel(estado: string | null | undefined): string {
  if (!estado) return '';
  return ESTADO_ABONO_LABELS[estado] ?? humanizarClave(estado);
}

const ESTADO_SOLICITUD_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  aplicada: 'Aplicada'
};

export function estadoSolicitudLabel(estado: string | null | undefined): string {
  if (!estado) return '';
  return ESTADO_SOLICITUD_LABELS[estado] ?? humanizarClave(estado);
}

const ESTADO_VALE_LABELS: Record<string, string> = {
  solicitado: 'Solicitado',
  autorizado: 'Autorizado',
  pagado: 'Pagado',
  parcial: 'Pago parcial',
  vencido: 'Vencido',
  incidencia: 'Con incidencia'
};

export function estadoValeLabel(estado: string | null | undefined): string {
  if (!estado) return '';
  return ESTADO_VALE_LABELS[estado] ?? humanizarClave(estado);
}

const LOGIN_STATUS_LABELS: Record<string, string> = {
  failed_user_not_found: 'Usuario no encontrado',
  account_inactive: 'Cuenta inactiva',
  account_locked: 'Cuenta bloqueada',
  failed_password: 'Contraseña incorrecta',
  success_factor_1: 'Acceso correcto (usuario y contraseña)',
  requires_mfa_setup: 'Requiere configurar autenticación de dos pasos',
  requires_mfa_code: 'Requiere código de autenticación',
  failed_mfa: 'Código de autenticación incorrecto',
  failed_mfa_mail_error: 'Error al enviar el código por correo',
  success_factor_2: 'Segundo factor correcto',
  failed_otp_expired: 'Código de correo expirado',
  failed_otp: 'Código de correo incorrecto',
  success_factor_3: 'Acceso completo (autenticado)'
};

export function loginStatusLabel(status: string | null | undefined): string {
  if (!status) return '';
  return LOGIN_STATUS_LABELS[status] ?? humanizarClave(status);
}

const CONFIGURACION_CLAVE_LABELS: Record<string, string> = {
  comision_base_pct: 'Comisión base (%)',
  interes_pct_quincena: 'Interés por quincena (%)',
  limite_perdones_relacion: 'Límite de perdones por relación',
  margen_tolerancia: 'Margen de tolerancia',
  margen_tolerancia_conciliacion: 'Margen de tolerancia (conciliación)',
  margen_tolerancia_credito: 'Margen de tolerancia (crédito)',
  multa_no_pago: 'Multa por no pago',
  puntos_divisor: 'Divisor de puntos',
  puntos_multiplicador: 'Multiplicador de puntos',
  puntos_penalizacion_pct: 'Penalización de puntos (%)',
  regla_50_pct: 'Regla del 50%',
  valor_punto: 'Valor de un punto'
};

export function configuracionClaveLabel(clave: string | null | undefined): string {
  if (!clave) return '';
  return CONFIGURACION_CLAVE_LABELS[clave] ?? humanizarClave(clave);
}

interface ModeloAuditInfo {
  singular: string;
  genero: 'm' | 'f';
}

const MODELOS_AUDIT: Record<string, ModeloAuditInfo> = {
  Vale: { singular: 'Vale', genero: 'm' },
  Distribuidora: { singular: 'Distribuidora', genero: 'f' },
  Cliente: { singular: 'Cliente', genero: 'm' },
  AbonoConciliacion: { singular: 'Abono de conciliación', genero: 'm' },
  Relacion: { singular: 'Relación', genero: 'f' },
  PuntoMovimiento: { singular: 'Movimiento de puntos', genero: 'm' },
  SolicitudProveedor: { singular: 'Solicitud de proveedor', genero: 'f' },
  SolicitudConciliacion: { singular: 'Solicitud de conciliación', genero: 'f' },
  SolicitudEdicionCliente: { singular: 'Solicitud de edición de cliente', genero: 'f' }
};

const EVENTO_PARTICIPIOS: Record<string, { m: string; f: string }> = {
  creado: { m: 'creado', f: 'creada' },
  actualizado: { m: 'actualizado', f: 'actualizada' },
  eliminado: { m: 'eliminado', f: 'eliminada' }
};

/** "Distribuidora.actualizado" -> "Distribuidora actualizada" */
export function auditAccionLabel(accion: string | null | undefined): string {
  if (!accion) return '';
  const [modelo, evento] = accion.split('.');
  const info = MODELOS_AUDIT[modelo];
  const participio = EVENTO_PARTICIPIOS[evento];

  if (!info || !participio) return accion;

  return `${info.singular} ${participio[info.genero]}`;
}

/** "Distribuidora#4" -> "Distribuidora N.º 4" */
export function auditRecursoLabel(recurso: string | null | undefined): string {
  if (!recurso) return '';
  const [modelo, id] = recurso.split('#');
  const info = MODELOS_AUDIT[modelo];

  if (!info) return recurso;

  return `${info.singular} N.º ${id}`;
}
