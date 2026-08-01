# MisValesFrontend

Frontend web modular para la plataforma **Mis Vales**, construido con **Angular 19+ (Standalone Components, Signals y Reactive Forms)** y estilizado con **Tailwind CSS v4**.

---

## 📁 Arquitectura y Estructura de Carpetas

El proyecto sigue una arquitectura modular limpia orientada a dominio (`core`, `features`, `layout`, `shared`):

```text
src/
└── app/
    ├── core/                               # Núcleo global de la aplicación (Singleton)
    │   ├── guards/                         # Guardias de protección de rutas
    │   │   ├── auth.guard.ts               # Protege rutas privadas que requieren autenticación
    │   │   └── guest.guard.ts              # Redirige usuarios autenticados fuera de las páginas de login
    │   ├── interceptors/
    │   │   └── auth.interceptor.ts         # Inyecta automáticamente el Bearer token Sanctum en headers HTTP
    │   ├── models/                         # DTOs e interfaces de respuestas de la API Backend
    │   │   ├── auth-response.model.ts
    │   │   └── user.model.ts
    │   └── services/
    │       └── auth.service.ts             # Gestión de estado reactivo con Angular Signals (currentUser, token)
    │
    ├── features/                           # Módulos por dominio de negocio (Lazy Loaded Routes)
    │   ├── auth/                           # Módulo de Autenticación
    │   │   ├── auth.routes.ts
    │   │   └── pages/
    │   │       ├── login/                  # Pantalla de inicio de sesión
    │   │       ├── register/               # Pantalla de registro
    │   │       └── mfa-setup/              # Configuración de vinculación TOTP Authenticator
    │   ├── dashboard/                      # Módulo de Panel Principal
    │   │   ├── dashboard.routes.ts
    │   │   ├── components/
    │   │   │   ├── audit-table/            # Tabla forense de accesos e historial para Administrador
    │   │   │   └── security-center/        # Resumen de estado de seguridad y perfil
    │   │   └── pages/
    │   │       └── dashboard/              # Dashboard unificado por Rol (DASHBOARD {ROL})
    │   └── users/                          # Módulo de Gestión de Usuarios
    │       └── users.routes.ts
    │
    ├── layout/                             # Componentes de estructura visual global
    │   ├── header/                         # Cabecera principal con información del rol y botón de logout
    │   └── footer/                         # Pie de página del sistema
    │
    ├── shared/                             # Componentes UI reutilizables
    │   └── components/
    │       └── alert/                      # Componente de alertas adaptativo (Success, Error, Info)
    │
    ├── app.component.ts                    # Componente raíz con <app-header> + <router-outlet> + <app-footer>
    ├── app.config.ts                       # Configuración Standalone (HttpClient, Router, Zone.js)
    └── app.routes.ts                       # Tabla global de rutas de navegación
```

---

## 🚀 Comandos Principales

### Servidor de Desarrollo
```bash
pnpm start
# o: ng serve
```
Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente al modificar archivos.

### Construir para Producción
```bash
pnpm build
# o: ng build
```
Compila la aplicación y almacena los artefactos optimizados en la carpeta `dist/Mis_Vales_Frontend`.

---

## 🛠️ Tecnologías Empleadas
- **Core Framework**: Angular 19+ (Standalone Components, Signals, Reactive Forms, Zone.js polyfills)
- **Estilos & UI**: Tailwind CSS v4 + Vanilla CSS
- **Autenticación**: Laravel Sanctum Interceptor + Role Guards
