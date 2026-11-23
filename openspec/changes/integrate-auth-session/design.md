# Design

## Context

En `develop`, `src/main.tsx` monta el cliente de consultas y el router con `retry: 1` para cualquier error. Este cambio agrega el interceptor HTTP que comparte una renovación entre solicitudes concurrentes y permite repetir cada petición original como máximo una vez ante un 401.

## Goals / Non-Goals

Implementar la sesión, sus hooks y la composición de providers. Mantener las rutas actuales y dejar el catálogo preparado para los valores aprobados por el backend.

## Decisions

| Decisión             | Opción elegida                                                                                                                                                               | Justificación                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Estado remoto        | TanStack Query para la sesión y Context para exponerla                                                                                                                       | Se reutiliza el cliente existente. Con estado local se tendría que coordinar manualmente la carga y la caché al cambiar de sesión. |
| Composición          | Un cliente estable en `AppProviders`, en orden Query → Router → Auth                                                                                                         | El proveedor de sesión puede acceder a la caché y se conserva un solo router.                                                      |
| Reintentos           | Hasta dos reintentos globales solo para errores de conexión. Límite de 10 segundos por petición HTTP. La consulta de sesión usa `retry: false` y `staleTime: Infinity`.      | Un timeout ya consumió el tiempo de espera de la petición. El interceptor se encarga de renovar ante un 401.                       |
| Expiración de sesión | Cancelar consultas pendientes, quitar los datos anteriores y conservar la entrada de sesión con valor nulo                                                                   | El proveedor observa esa entrada y una respuesta tardía no debe recuperar los datos de la cuenta anterior.                         |
| Permisos             | Leer los permisos otorgados por el backend y hacer comparaciones exactas. Dejar `PERMISSIONS` vacío y aceptar nombres de tipo `string` hasta incorporar el catálogo aprobado | Evita fijar nombres provisionales y permite consultar los permisos que el backend ya devuelve.                                     |

### Contrato

`useCan` vive junto a `useAuth` porque combina la sesión con la comprobación de permisos. La función compartida `hasPermission` recibe los datos que necesita por parámetro.

```ts
export interface SesionOtorgada {
  id: number;
  email: string;
  rol: string;
  permisos: string[];
}
```

`GET /auth/me`, `POST /auth/login` y `POST /auth/refresh` devuelven este contrato. Un 401 definitivo de `/auth/me` representa ausencia de sesión. Otros errores de esa consulta se exponen mediante `useAuth`. El servicio `authService.login` envía las credenciales y devuelve la sesión. Quien lo llama debe pasar esa respuesta a `updateSession`, disponible en `useAuth`. Cuando exista el formulario, puede conectar la mutación con `mutationFn: authService.login` y `onSuccess: updateSession`. El provider guarda la sesión devuelta, cancela lecturas pendientes y descarta la caché anterior sin volver a pedir `/auth/me`. Si el llamador omite ese paso, la sesión local conserva el usuario anterior hasta que se consulte de nuevo. El interceptor incorporado en este cambio coordina la renovación.

El cliente HTTP usa `/api` cuando `VITE_API_URL` está vacía o ausente. Las respuestas de error del backend incluyen `statusCode`, `code`, `message` y `requestId`. Los errores de validación agregan `errores` con un `campo` y un `mensaje` por entrada. La normalización usa el estado HTTP de la respuesta y conserva el código, el identificador de solicitud y el detalle por campo.

## Risks / Trade-offs

La integración afecta a `main.tsx`, `AppProviders`, el cliente HTTP, los módulos de autenticación y los helpers de permisos. Las rutas y controles visibles se conservan. La disponibilidad de endpoints y cookies depende del backend. El límite de 10 segundos hace visible antes una petición detenida y también corta las respuestas que superen ese plazo.

## Testing Strategy

- Verificar la URL efectiva con configuración ausente, vacía y explícita, y la normalización de un 400 de validación en el cliente HTTP.
- Verificar los intentos de consulta ante fallos de conexión, timeouts y cancelación en los providers.
- Cubrir los estados de recuperación de sesión, la sesión al iniciar sesión, la renovación concurrente y la limpieza de datos cuando falla la renovación.
