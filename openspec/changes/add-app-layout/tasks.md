# Tasks

## 1. Composición y acceso

- [x] 1.1 Confirmar las condiciones disponibles en el contrato y componer los dos guards, la ruta pública `/login` y el panel privado `/`. Probar primero carga, error, redirecciones, acceso con todos los permisos e ingreso al panel sin permisos adicionales. Requisito «Acceso coherente a los destinos».
- [ ] 1.2 Montar el layout compartido y el outlet, con destinos informativos. Probar primero que al seguir un enlace aparezcan el título y el aviso de la sección y se conserve la navegación. Requisito «Destinos preparados para sus pantallas».

## 2. Navegación y documentación

- [x] 2.1 Implementar la presentación responsive y sincronizar la guía con los archivos y rutas implementados. Probar primero filtrado, enlace activo y navegación por teclado. Revisar las tres experiencias en móvil y escritorio. Requisito «Navegación adaptable por experiencia».
- [x] 2.2 Verificar en conjunto los escenarios con `yarn typecheck`, `yarn lint`, `yarn test`, `yarn format:check` y `openspec validate add-app-layout --strict`.

## 3. Mi cuenta

- [x] 3.1 Agregar el acceso desde el encabezado y la página privada de solo lectura. Probar primero que una sesión activa sin permisos adicionales pueda abrir la página y ver su correo y rol, y que una visita sin sesión redirija a `/login`. Requisito «Consultar los datos de mi cuenta».

## 4. Navegación por rol

- [ ] 4.1 Configurar el menú por rol y agrupar las rutas exclusivas con `RequireRole`. Verificar manualmente que profesor y administrador vean destinos distintos aunque compartan `alumno:read`, que la URL del otro rol redirija a Inicio y que los tres roles puedan abrir Inicio y Mi cuenta. Requisitos «Navegación adaptable por experiencia» y «Acceso coherente a los destinos».
