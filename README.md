# Mis Vales - Frontend

Cliente web para el sistema de gestión de crédito y vales en efectivo.

## Estructura del Proyecto

```text
src/app/
├── core/
│   ├── interceptors/
│   │   └── auth/                  # Inyecta el token Sanctum en cada petición HTTP
│   └── models/                    # Interfaces globales (User, Role, ApiResponse, etc.)
│
├── features/
│   ├── auth/                      # Todo lo relacionado con autenticación
│   │   ├── guards/                # authGuard y guestGuard
│   │   ├── services/              # AuthService (Signals, sesión, MFA)
│   │   └── pages/
│   │       ├── login/             # Login con soporte 1FA / 2FA / 3FA
│   │       └── mfa-setup/         # Vinculación de Google Authenticator
│   │
│   ├── administrador/             # Vistas y lógica del rol Administrador
│   │   ├── components/
│   │   │   └── audit-table/       # Tabla forense de accesos al sistema
│   │   └── pages/
│   │       └── dashboard/
│   │
│   ├── gerente/                   # Gerente General y Gerente de Sucursal
│   │   ├── alta-proveedor/        # Proceso: Aprobación de solicitudes de distribuidores
│   │   │   ├── pages/
│   │   │   │   ├── lista-solicitudes/
│   │   │   │   └── detalle-solicitud/
│   │   │   └── services/
│   │   └── pages/
│   │       └── dashboard/
│   │
│   ├── coordinador/               # Rol Coordinador
│   │   ├── alta-proveedor/        # Proceso: Captura de nuevos distribuidores
│   │   │   ├── pages/
│   │   │   │   └── nueva-solicitud/
│   │   │   └── services/
│   │   └── pages/
│   │       └── dashboard/
│   │
│   ├── verificador/               # Rol Verificador
│   │   ├── alta-proveedor/        # Proceso: Verificación en campo
│   │   │   ├── pages/
│   │   │   │   └── verificar-solicitud/
│   │   │   └── services/
│   │   └── pages/
│   │       └── dashboard/
│   │
│   └── distribuidora/             # Rol Distribuidora
│       └── pages/
│           └── dashboard/
│
├── layout/
│   ├── header/                    # Header con nombre, rol y botón de logout
│   └── footer/
│
└── shared/                        # Componentes UI sin lógica de negocio
    └── components/
        └── alert/
```

## Scripts Disponibles

```bash
# Servidor de desarrollo
pnpm start

# Compilar para producción
pnpm build
```
