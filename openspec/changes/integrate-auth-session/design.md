# Design

## Context

`src/main.tsx` monta el cliente de consultas y el router. Tiene `retry: 1` para cualquier error. El interceptor HTTP ya coordina la renovación y repite la petición original como máximo una vez ante un 401.

## Goals / Non-Goals

Implementar la sesión, sus hooks y la composición de providers. Mantener las rutas actuales y dejar el catálogo preparado para los valores aprobados por el backend.

## Decisions

| Decisión | Opción elegida | Justificación |
| --- | --- | --- |
| Estado remoto | TanStack Query para la sesión y Context para exponerla | Se reutiliza el cliente existente. Con estado local se tendría que coordinar manualmente la carga y la caché al cambiar de sesión. |
| Composición | Un cliente estable en `AppProviders`, en orden Query → Router → Auth | El proveedor de sesión puede acceder a la caché y se conserva un solo router. |
| Reintentos | Hasta dos reintentos globales para `ApiError` de estado 0. La consulta de sesión usa `retry: false` y `staleTime: Infinity` | El interceptor existente ya atiende el 401 y las consultas con respuesta HTTP no necesitan otro intento automático. |
| Expiración de sesión | Cancelar consultas pendientes, quitar los datos anteriores y conservar la entrada de sesión con valor nulo | El proveedor observa esa entrada y una respuesta tardía no debe recuperar los datos de la cuenta anterior. |
| Permisos | Leer los permisos otorgados por el backend y hacer comparaciones exactas. Dejar `PERMISSIONS` vacío y aceptar nombres de tipo `string` hasta incorporar el catálogo aprobado | Evita fijar nombres provisionales y permite consultar los permisos que el backend ya devuelve. |

### Contrato

```ts
export interface SesionOtorgada {
  id: number;
  email: string;
  rol: string;
  permisos: string[];
}
```

`GET /auth/me`, `POST /auth/login` y `POST /auth/refresh` devuelven este contrato. Un 401 definitivo de `/auth/me` representa ausencia de sesión. Otros errores de esa consulta se exponen mediante `useAuth`. La interfaz llama directamente a `authService.login` con `email` y `password`. Tras un login exitoso, el servicio avisa a `AuthProvider` mediante una función registrada al montar. El provider guarda la sesión en caché, cancela lecturas pendientes y descarta la caché anterior. La respuesta completa permite actualizar el contexto sin volver a pedir `/auth/me`. Los errores de login se propagan a quien lo invoca. El interceptor existente sigue a cargo de refresh.

## Risks / Trade-offs

La integración afecta a `main.tsx`, `AppProviders`, los módulos de autenticación y los helpers de permisos. Las rutas y controles visibles se conservan. La disponibilidad de endpoints y cookies depende del backend. Se acordó omitir pruebas manuales y automatizadas en este cambio.
