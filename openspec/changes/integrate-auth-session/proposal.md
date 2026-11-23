# Proposal

## Why

HercFit necesita recuperar la sesión al abrirse y actualizar el acceso de la interfaz cuando termina. Esto prepara la base de autenticación de la HU 14.

## What Changes

- Implementar el servicio de autenticación, `AuthProvider` y `useAuth`, y montarlos en el punto de entrada.
- Consumir `POST /auth/login` desde el servicio y registrar sus tipos según OpenAPI. La respuesta usa `SesionOtorgada`, igual que `GET /auth/me`.
- Crear `permissions.ts` con `PERMISSIONS` y `hasPermission.ts` con `hasPermission`. Ubicar `useCan` en los hooks de autenticación.
- Incorporar la renovación de sesión mediante `POST /auth/refresh`, con un solo reintento de la petición original.
- Alinear el cliente HTTP con el contrato de errores del backend y ajustar el tiempo de espera y los reintentos de consultas.

## Capabilities

### New Capabilities

- `authentication-session` — recuperación y expiración de la sesión de usuario.

### Modified Capabilities

## Impact

El arranque consulta `GET /auth/me`. El cambio incorpora un interceptor que llama a `POST /auth/refresh`. Si falla la comprobación de sesión, se expone el error y las acciones protegidas quedan indisponibles.

## Fuera de alcance

- Definición de los valores del catálogo de permisos.
- Operación de cierre de sesión, pantallas de autenticación, guards y navegación por rol.
- Archivado del cambio.
