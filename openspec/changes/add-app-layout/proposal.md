# Proposal

## Why

HercFit necesita una navegación inicial que refleje las tareas de alumno, profesor y administrador y que se adapte a escritorio y móvil.

## What Changes

- Agregar una barra lateral en escritorio y una barra inferior en móvil para alumno, profesor y administrador.
- Mostrar un menú por rol. Redirigir a `/login` si falta autenticación y al panel principal (`/`) si el rol no corresponde a la ruta solicitada.
- Presentar vistas informativas de los destinos pendientes y documentar el contenido previsto de cada uno.
- Agregar Mi cuenta como pantalla privada de solo lectura con el correo y el rol de la sesión.

## Capabilities

### New Capabilities

- `app-navigation` — navegación autenticada por experiencia y acceso directo a sus destinos.

### Modified Capabilities

## Impact

Afecta la composición de rutas y consume el estado de la sesión de la HU 14 mediante el proveedor existente, que utiliza `GET /auth/me`. No requiere endpoints nuevos. El mapa completo de destinos y HU se documenta en [Layout y navegación](../../../docs/navegacion.md).

## Fuera de alcance

Implementación de las HU de negocio, formularios públicos, cambios del backend y generación del catálogo de permisos.
