# Mis Vales - Frontend

Cliente web para el sistema de gestión de crédito y vales en efectivo.

## Estructura del Proyecto

El proyecto está organizado en módulos utilizando Standalone Components de Angular:

```text
src/app/
├── core/
│   ├── guards/          # AuthGuard y GuestGuard
│   ├── interceptors/    # AuthInterceptor (token Sanctum)
│   ├── models/          # Interfaces y tipos DTO
│   └── services/        # AuthService (Signals)
├── features/
│   ├── auth/            # Login, Registro y MFA Setup
│   ├── dashboard/       # Vistas por rol y tabla de auditoría
│   └── users/           # Módulo de usuarios
├── layout/              # Header y Footer globales
├── shared/              # Componentes compartidos (alertas, botones)
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## Scripts Disponibles

```bash
# Servidor de desarrollo
pnpm start

# Compilar para producción
pnpm build
```
