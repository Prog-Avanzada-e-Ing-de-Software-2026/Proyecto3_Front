# Tasks

## 1. Sesión y permisos

- [x] 1.1 Registrar `SesionOtorgada` e implementar la consulta de sesión. Requisito de recuperación.
- [x] 1.2 Implementar `AuthProvider`, `useAuth` y la limpieza al expirar la sesión. Requisitos de recuperación y fin de sesión.
- [x] 1.3 Crear `PERMISSIONS` y `hasPermission` en permisos compartidos, y `useCan` junto a `useAuth`. Requisitos de recuperación y fin de sesión.
- [x] 1.4 Confirmar el tipo de credenciales según OpenAPI e implementar la operación de login en el servicio. Requisito de sesión concedida.
- [x] 1.5 Exponer `updateSession` en `useAuth` y verificar que el llamador pueda actualizar la sesión con la respuesta de `authService.login`. Requisito de sesión concedida.

## 2. Composición y verificación

- [x] 2.1 Montar los providers y ajustar el reintento de consultas sin duplicar el refresh HTTP. Requisito de recuperación.
- [x] 2.2 Verificar la URL de sesión, el contrato de errores y los intentos de consulta. Requisitos de recuperación y sesión concedida.
- [ ] 2.3 Cubrir los estados de recuperación de sesión, el inicio de sesión, la renovación concurrente y la limpieza al expirar. Requisitos de recuperación, sesión concedida y fin de sesión.
- [ ] 2.4 Verificar tipos, lint, formato, la suite completa y la validación estricta de OpenSpec tras completar la cobertura anterior. Todos los requisitos del cambio.
