# Design

## Context

La rama parte de `feature/estructura_base`, que incluye `AppProviders` y `useAuth`. La convención vigente propone `AlumnoLayout` y `StaffLayout`; para esta experiencia se propone compartir el contenedor autenticado por la estructura común en escritorio y en móvil.

## Goals / Non-Goals

- Usar la URL como origen de la página activa y la sesión como origen de la visibilidad.
- Proveer navegación verificable y destinos informativos. Las HU de las pantallas se implementan en sus propios cambios.

## Decisions

1. Componer las rutas en `App.tsx` con un padre privado que monta `AppLayout` y un `Outlet`. El marco compartido justifica un layout único. El mismo componente de navegación coloca los enlaces al costado en escritorio y abajo en móvil. Un contexto de layout duplicaría estado derivable de la URL y la sesión.
2. Declarar una entrada por destino con su ruta, etiqueta y condición de acceso. La barra y el guard usan el mismo rol declarado por destino. Los destinos se agrupan por experiencia con el mapa de [navegación](../../../docs/navegacion.md). La raíz `/` es el panel principal privado y requiere solo una sesión confirmada. La navbar lee `user.rol` mediante `useAuth()` y selecciona el menú del rol desde el catálogo compartido con el router. Inicio usa el mismo catálogo para sus accesos directos.
3. Agrupar las rutas exclusivas en `RequireRole` bajo `RequireAuth`. `RequireAuth` usa `useAuth()` y distingue carga y error de una sesión ausente. Si falta la sesión, redirige a la ruta pública `/login`, que tendrá una vista informativa hasta que se implemente el formulario. `RequireRole` redirige a `/` cuando el rol no corresponde. Inicio y Mi cuenta requieren solo autenticación. Los permisos vienen determinados por el rol y se conservan para acciones compartidas que consulten `useCan`; la autorización de operaciones y recursos sigue en el backend. El panel principal evita un bucle al quedar disponible para toda sesión confirmada. Ante cualquier destino sin condición confirmada por contrato se omite el enlace y el ingreso directo queda denegado. Se pueden verificar las variantes de navegación con sesiones representativas de los tres roles.
4. Usar enlaces semánticos con estado de página actual y foco visible. En móvil, reservar espacio para la barra inferior de modo que el contenido y los controles sigan siendo accesibles.
5. Aplicar desde la primera entrega el tema oscuro de OpenPencil a `AuthLayout` y a la navbar, tanto lateral como inferior. Compartir tokens de Tailwind para el fondo `#121214`, la superficie `#1E1F23`, el texto `#F4F1EC` y el acento lima `#C8F25C`. El acceso usa el panel redondeado de los wireframes. La navbar usa el lima para destacar el destino activo, con texto oscuro si se presenta sobre un fondo lima. Verificar el contraste del texto secundario y el foco visible.

## Risks / Trade-offs

Mi cuenta se abre desde el encabezado y usa la ruta privada `/mi-cuenta`. La página lee `email` y `rol` mediante `useAuth()`. El correo identifica al usuario en el contrato vigente. La sesión activa es la única condición de acceso y los datos se leen del proveedor existente.

- La disponibilidad real de los destinos depende de las condiciones aprobadas y del contrato de sesión. Antes del apply se verifica cuáles están publicadas y se documenta cuáles quedan pendientes. La API conserva la autorización de operaciones y recursos.
- Validar con pruebas de integración el enlace activo, la transición de ruta, acceso directo y estados de sesión. Revisar con teclado y en anchos de móvil y escritorio las tres experiencias. Usar la paleta de OpenPencil como base, con contraste legible en texto, controles y foco.
