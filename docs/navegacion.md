# Layout y navegación de HercFit

Guía del layout implementado y del contenido previsto para las pantallas de negocio.

## Cómo se renderiza una pantalla

En `App.tsx`, `RequireAuth` espera la confirmación de la sesión antes de montar `AppLayout` y redirige a `/login` si falta una sesión. **Inicio** y **Mi cuenta** quedan disponibles para cualquier sesión activa. Las demás rutas se agrupan por rol a partir de `src/app/routes/navigation.ts`. `RequireRole` compara el rol de la sesión con el del grupo y redirige a Inicio si son distintos. React Router renderiza la página hija dentro del `<Outlet />` de `AppLayout`, que conserva la navbar al cambiar de pantalla.

`Navbar` y `HomeRoute` leen la sesión con `useAuth()` y consultan el mismo catálogo que el router. Así, un `Profesor` ve **Mis alumnos** y un `Administrador` ve **Alumnos**, aun cuando ambos tengan permisos de lectura. Un rol sin menú configurado conserva el acceso a Inicio y Mi cuenta. El ancho de pantalla ubica la barra al costado o abajo. Los permisos efectivos siguen disponibles mediante `useCan` para las acciones compartidas que los requieran. La API autoriza cada operación y verifica el alcance sobre cada recurso.

## Por qué las rutas exclusivas se controlan por rol

En HercFit los permisos se asignan al rol. Profesor y administrador pueden compartir el permiso de consultar alumnos, pero sus pantallas tienen propósitos distintos. **Mis alumnos** lleva al profesor al seguimiento de sus alumnos asignados. **Alumnos** lleva al administrador a la nómina y sus operaciones de gestión. Un guard basado únicamente en ese permiso habilitaría ambas rutas para los dos perfiles. El rol permite distinguirlas con una sola condición, que comparten la navbar y el router.

Los permisos efectivos siguen disponibles en `useCan` para decidir si un componente compartido ofrece una acción concreta. La API autoriza cada operación y verifica a qué recursos puede acceder el usuario.

## Destinos y contenido previsto

Las HU corresponden al documento de Historias de Usuario del 14/11. Los detalles, pestañas y acciones se abren dentro de cada destino. La estructura base puede mostrar una vista de sección pendiente hasta que se implemente cada capacidad mediante su propio cambio.

### Alumno

| Destino     | Contenido previsto                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Entrenar    | Registro de ejercicios y series (HU 8) y consulta de la última carga usada por ejercicio (HU 10). |
| Mi plan     | Plan vigente (HU 3) e historial de planes (HU 4).                                                 |
| Historial   | Lista y detalle de los entrenamientos propios (HU 9).                                             |
| Seguimiento | Asistencias (HU 11), récord histórico (HU 12) y evolución por ejercicio (HU 13).                  |

### Profesor

| Destino                       | Contenido previsto                                                                                                                                                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mis alumnos                   | Búsqueda y selección de alumnos asignados (HU 22). En el detalle se consulta el plan vigente (HU 3) y su historial (HU 4), se registra, modifica o elimina un plan según corresponda (HU 1, 6 y 7), y se consultan entrenamientos, asistencias, récords y evolución (HU 9, 11, 12 y 13). |
| Alumnos sin plan o por vencer | Alumnos asignados sin plan vigente o cuyo plan se acerca al vencimiento (HU 5), con acceso al detalle del alumno.                                                                                                                                                                        |

### Administrador

| Destino    | Contenido previsto                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Alumnos    | Nómina de alumnos (HU 25), alta, modificación, baja, asignación o reasignación y reactivación (HU 16, 18, 20, 23 y 24).               |
| Profesores | Nómina de profesores (HU 25), alta, modificación y baja (HU 17, 19 y 21).                                                             |
| Catálogo   | Secciones de Ejercicios (HU 26), Categorías de ejercicios (HU 27), Materiales (HU 28), Unidades (HU 29) y Objetivos de planes (HU 2). |

### Rutas públicas

| Pantalla             | Contenido previsto                                |
| -------------------- | ------------------------------------------------- |
| Acceso               | Inicio de sesión (HU 14).                         |
| Restaurar contraseña | Solicitud y confirmación de restauración (HU 15). |

El panel principal (`/`) es la entrada común de las sesiones autenticadas. Presenta el inicio de la aplicación y un aviso si la sesión carece de secciones de negocio disponibles.

**Mi cuenta** (`/mi-cuenta`) se abre desde el encabezado con cualquier sesión activa. Muestra el correo que identifica al usuario y su rol, en modo de lectura.

## Dirección visual

El layout público de acceso y la navbar usan desde la primera entrega el tema oscuro de OpenPencil. Comparten fondo carbón, superficies oscuras, texto crema y acento lima. El acceso usa un panel redondeado. La navbar resalta el destino activo tanto en escritorio como en móvil.
