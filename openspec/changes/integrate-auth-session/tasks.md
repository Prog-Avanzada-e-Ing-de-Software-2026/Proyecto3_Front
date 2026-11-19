# Tasks

## 1. Sesión y permisos

- [x] 1.1 Registrar `SesionOtorgada` e implementar la consulta de sesión. Requisito de recuperación.
- [x] 1.2 Implementar `AuthProvider`, `useAuth` y la limpieza al expirar la sesión. Requisitos de recuperación y fin de sesión.
- [x] 1.3 Crear `PERMISSIONS`, `hasPermission` y `useCan`. Requisitos de recuperación y fin de sesión.
- [x] 1.4 Confirmar el tipo de credenciales según OpenAPI e implementar la operación de login en el servicio. Requisito de sesión concedida.
- [x] 1.5 Reflejar en el contexto el resultado de llamar directamente a `authService.login`. Requisito de sesión concedida.

## 2. Composición y verificación estática

- [x] 2.1 Montar los providers y ajustar el reintento de consultas sin duplicar el refresh HTTP. Requisito de recuperación.
- [x] 2.2 Verificar tipos, lint y validación estricta de OpenSpec. Requisitos de recuperación y fin de sesión.
