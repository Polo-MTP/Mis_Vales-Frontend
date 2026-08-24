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
  SolicitudEdicionCliente: { singular: 'Solicitud de edición de cliente', genero: 'f' },
  // Ampliación de AuditLogObserver a catálogos/config -- ver AppServiceProvider::configureAuditLog().
  CategoriaDistribuidora: { singular: 'Categoría de distribuidora', genero: 'f' },
  RelacionDetalle: { singular: 'Detalle de relación', genero: 'm' },
  RelacionPerdon: { singular: 'Perdón de relación', genero: 'm' },
  SolicitudAumentoCredito: { singular: 'Solicitud de aumento de crédito', genero: 'f' },
  SolicitudTransferenciaCliente: { singular: 'Solicitud de transferencia de cliente', genero: 'f' },
  Sucursal: { singular: 'Sucursal', genero: 'f' },
  Producto: { singular: 'Producto', genero: 'm' },
  SeguroTabla: { singular: 'Tabla de seguro', genero: 'f' },
  Evidencia: { singular: 'Evidencia', genero: 'f' },
  ConvenioBancario: { singular: 'Convenio bancario', genero: 'm' },
  Configuracion: { singular: 'Configuración', genero: 'f' },
  ConfiguracionFechas: { singular: 'Configuración de fechas', genero: 'f' }
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

/** Eventos de negocio dirigidos a un destinatario específico (accion sin puntos, a diferencia
 *  de "Modelo.evento" del feed de auditoría) -- ver NotificacionService::crear() en el backend. */
const NOTIFICACION_ACCION_LABELS: Record<string, string> = {
  corte_listo: 'Se generó un nuevo corte',
  puntos_generados: 'Ganaste puntos por pago anticipado',
  puntos_penalizados: 'Se te penalizaron puntos por pago fuera de tiempo',
  credito_asignado: 'Se te asignó tu línea de crédito',
  credito_incrementado: 'Tu línea de crédito aumentó',
  distribuidora_morosa: 'Una distribuidora de tu sucursal cayó en morosidad',
  abono_con_queja: 'Una distribuidora reportó una queja sobre un abono — inicia la conciliación manual',
  abono_excedente: 'Un corte recibió más dinero del que se debía — revisa si se reembolsa o se aplica al siguiente',
  personal_asignado: 'Se te asignó un nuevo integrante de personal',
  solicitud_verificada: 'Una solicitud fue verificada en campo (cumple)',
  solicitud_rechazada_verificador: 'Una solicitud fue rechazada en la verificación de campo',
  solicitud_aprobada_gerente: 'Gerencia aprobó tu solicitud de distribuidor',
  solicitud_rechazada_gerente: 'Gerencia rechazó tu solicitud de distribuidor',
  transferencia_cliente_solicitada: 'Otra distribuidora pidió quedarse con un cliente tuyo',
  transferencia_cliente_por_autorizar: 'Hay una transferencia de cliente esperando tu autorización',
  transferencia_cliente_autorizada: 'Se autorizó la transferencia del cliente',
  transferencia_cliente_rechazada: 'Se rechazó la transferencia del cliente',
  transferencia_cliente_aceptada: 'El cliente salió de tu cartera por una transferencia confirmada',
  aumento_credito_solicitado: 'Una distribuidora pidió un aumento de crédito — requiere tu decisión',
  aumento_credito_aprobado: 'Se aprobó tu aumento de línea de crédito',
  aumento_credito_rechazado: 'Se rechazó tu solicitud de aumento de crédito',
  edicion_cliente_solicitada: 'Una cajera pide autorización para corregir datos de un cliente',
  edicion_cliente_aprobada: 'Se autorizó tu corrección de datos — ya puedes aplicarla',
  edicion_cliente_rechazada: 'Se rechazó tu solicitud de corrección de datos',
  conciliacion_manual_solicitada: 'Una cajera pide autorizar una conciliación manual — requiere tu decisión',
  conciliacion_manual_aprobada: 'Se autorizó tu conciliación manual — ya puedes ejecutarla',
  conciliacion_manual_rechazada: 'Se rechazó tu solicitud de conciliación manual',
};

/** Notificaciones dirigidas a un usuario (accion de negocio) o del feed de auditoría
 *  ("Modelo.evento") -- unifica ambos formatos en una sola etiqueta legible. */
export function notificacionAccionLabel(accion: string | null | undefined): string {
  if (!accion) return '';
  return NOTIFICACION_ACCION_LABELS[accion] ?? auditAccionLabel(accion);
}

/** "Distribuidora#4" -> "Distribuidora N.º 4" */
export function auditRecursoLabel(recurso: string | null | undefined): string {
  if (!recurso) return '';
  const [modelo, id] = recurso.split('#');
  const info = MODELOS_AUDIT[modelo];

  if (!info) return recurso;

  return `${info.singular} N.º ${id}`;
}
