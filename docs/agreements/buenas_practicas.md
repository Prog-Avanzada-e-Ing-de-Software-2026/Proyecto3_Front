# Proyecto 3 — Guía de desarrollo y buenas prácticas del Frontend

> **Destinatarios:** equipo de desarrollo y agentes de IA que trabajen en `Proyecto3_Front`.
>
> **Alcance:** aplicación React + TypeScript + Vite. Esta guía **adapta** los apartados generales, frontend y Git de *Buenas practicas final.pdf* y los complementa, cuando resulta útil, con la *Convención de estructura y responsabilidades — Proyecto3_Front*.
>
> **Precedencia durante la implementación:** comprobar las especificaciones y decisiones aprobadas, `AGENTS.md` del repositorio y el código real antes de realizar cambios. Esta guía no modifica por sí sola esos archivos ni autoriza commits, push, PR o merges. Si aparece una discrepancia, **informarla**, no elegir una regla silenciosamente.

## 1. Principios de trabajo

Aplicar los siguientes principios de forma proporcional al alcance de cada funcionalidad:

- **KISS:** preferir soluciones sencillas y comprensibles frente a estructuras innecesariamente complejas.
- **YAGNI:** no construir funciones, abstracciones ni componentes pensando solo en necesidades futuras hipotéticas.
- **DRY:** evitar duplicar reglas y conocimiento; extraer piezas reutilizables cuando exista repetición real.
- **SRP:** cada módulo, función o componente debe tener una responsabilidad clara.
- **Separación de responsabilidades (SoC):** distinguir presentación, estado, interacción y acceso a la API.
- **Encapsulamiento:** exponer interfaces y funciones necesarias sin depender de detalles internos.
- **Bajo acoplamiento y alta cohesión:** agrupar lo relacionado y limitar dependencias entre funcionalidades.
- **Abstracciones justificadas:** no agregar patrones, hooks, helpers o componentes genéricos sin una necesidad concreta.
- **Trazabilidad de pruebas:** relacionar los nombres/identificadores de casos de prueba documentados con los tests que los verifican.

La regla práctica es **elegir la solución más simple que cumpla el requisito sin comprometer la calidad**.

## 2. Organización del proyecto y responsabilidades

Adoptar una organización **por funcionalidades (*feature-first*)**, manteniendo lo específico dentro de cada feature. El siguiente árbol es **referencial**, no una instrucción para crear carpetas vacías:

```text
src/
├── app/                       # Composición: rutas, layouts, guards y providers globales
├── features/
│   └── planes/                # Ejemplo de feature
│       ├── api/
│       │   └── planes.service.ts
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── schemas/
│       └── types.ts
├── components/                # UI genérica realmente compartida
├── lib/
│   └── api.ts                 # Instancia Axios centralizada
├── permissions/               # Helpers de visibilidad, si hacen falta
└── test/                      # Configuración y utilidades comunes de prueba
```

| Responsabilidad | Ubicación / criterio | Evitar |
| --- | --- | --- |
| Composición y navegación | `app/`, layouts y rutas | lógica específica de una feature en el layout |
| Pantallas | `features/*/pages/` | peticiones HTTP directas |
| Componentes visuales | `features/*/components/` o `components/` si son compartidos | reglas del servidor o acceso directo a Axios |
| Coordinación de estado remoto | `features/*/hooks/` con TanStack Query | replicar resultados del servidor sin necesidad en Context o `useState` |
| Acceso HTTP por feature | `features/*/api/*.service.ts` | crear clientes Axios diferentes sin justificación |
| Validación de formularios | `features/*/schemas/` con Zod | tratar la validación frontend como seguridad definitiva |
| Contratos y modelos de interfaz | `types.ts` y tipos específicos cuando crezcan | confundir DTO de API con entidad de dominio del backend |

**Flujo preferido de consulta:** `Page → Hook (useQuery) → Feature Service (*.service.ts) → lib/api.ts → API`.

**Flujo preferido de escritura:** `Formulario (React Hook Form + Zod) → Hook (useMutation) → Feature Service → Axios centralizado → API`; invalidar o actualizar consultas afectadas cuando corresponda.

No trasladar al frontend por simetría capas de UseCases, Repositories, Ports o CQRS propias del backend.

## 3. Comunicación y estado

- **Services por dominio:** centralizar las operaciones de acceso a la API por capacidad, no en un servicio HTTP general que conozca todo el sistema.
- **Axios centralizado:** reutilizar la configuración común (`src/lib/api.ts`) para base URL, credenciales y tratamiento transversal de errores. No llamar Axios/fetch desde componentes o páginas.
- **TanStack Query:** manejar lecturas, mutaciones, caché, estado de carga y error del servidor; definir claves estables e invalidaciones coherentes.
- **Estado local:** reservar `useState`/`useReducer` para modales, pestañas, entradas temporales y elementos propios de la vista.
- **Context:** usarlo para datos transversales cuando realmente lo requieran varios componentes; evitar que reemplace indiscriminadamente TanStack Query.
- **Hooks personalizados:** extraer comportamiento reutilizable cuando reduzca complejidad, no por obligación.
- **Errores:** no ocultarlos con `catch` vacío ni presentar errores del backend como operaciones exitosas.
- **Flujo de dependencias:** UI → hooks → services → cliente HTTP; evitar referencias inversas y dependencias circulares.

## 4. Formularios, permisos y experiencia de usuario

### 4.1 Formularios y validaciones

Utilizar React Hook Form y Zod según los contratos aprobados. Mostrar errores claros y validar las entradas desde la interfaz **sin sustituir** la validación definitiva del backend. No crear reglas de negocio o permisos nuevos a partir de suposiciones del frontend.

### 4.2 Visibilidad según permisos

Aplicar los controles de visibilidad previstos por la convención del frontend en **tres niveles**:

1. **Navegación:** mostrar menús y enlaces según permisos disponibles.
2. **Rutas y páginas:** verificar la condición de acceso también ante ingreso directo de la URL.
3. **Componentes y acciones:** mostrar, ocultar o deshabilitar elementos de acuerdo con el permiso requerido y la experiencia aprobada.

Centralizar comprobaciones repetidas cuando sea útil (`ProtectedRoute`, helpers, `Can.tsx`). No asumir nombres de permisos, roles ni contratos de autenticación que aún no estén aprobados. Durante la carga del estado de permisos, no habilitar temporalmente acciones protegidas.

**Seguridad:** ocultar un botón o bloquear una ruta en React **no autoriza ni protege** el recurso. NestJS debe verificar permisos en todas las operaciones correspondientes.

### 4.3 Diseño responsive

**Todas las pantallas deben funcionar en móvil y escritorio**:

- **Alumno:** priorizar navegación y usabilidad móvil (consulta de planes y registro de entrenamientos).
- **Profesor y administrador:** priorizar la experiencia de escritorio en gestión, formularios y tablas, sin excluir el móvil.
- **Pantallas compartidas:** verificar ambas experiencias, incluyendo acciones y estados de carga/error/vacío.

Diseñar componentes comprensibles, cohesivos y accesibles. Evitar reutilización artificial que complique pantallas distintas.

## 5. Pruebas y calidad

- **Unitarias y de componentes:** ubicar el test junto al archivo probado y conservar el nombre base, por ejemplo `PlanForm.tsx` → `PlanForm.test.tsx`.
- **Services:** verificar solicitudes, datos, adaptación de respuestas y propagación de errores con mocks del cliente HTTP cuando proceda.
- **Hooks:** comprobar estados, consultas, mutaciones e invalidación de caché.
- **Componentes y páginas:** probar comportamiento visible, interacción, navegación y accesibilidad; evitar tests atados a clases de Tailwind o detalles internos.
- **Integración/E2E:** se pueden organizar por flujos o escenarios, no necesariamente un test por archivo.
- **Identificación de pruebas:** usar nombres de `describe`/`it` que expresen claramente lo verificado; si existe un caso de prueba formal, incorporar su nombre o identificador.
- **Alcance:** no crear archivos de pruebas vacíos ni agregar dependencias solo para cumplir una estructura.

Antes de cerrar un cambio, ejecutar los comandos disponibles y aprobados del repositorio (por ejemplo, `yarn typecheck`, `yarn lint`, `yarn test` y comprobación de formato cuando corresponda). **Informar qué se ejecutó, qué falló y qué quedó sin ejecutar**; nunca inventar resultados.

## 6. Git y colaboración

> Esta sección recoge el flujo de ramas **adoptado** por el repositorio, adaptado de *Buenas practicas final.pdf*. El detalle operativo está en `AGENTS.md` §10.

### 6.1. GitFlow adaptado

| Rama | Propósito y destino |
| --- | --- |
| `main` | Versiones estables o liberadas; sin cambios directos fuera del proceso de revisión. |
| `develop` | Integración habitual del desarrollo. |
| `feature/<nombre>` | Nueva funcionalidad; nace de `develop` y vuelve a ella mediante PR. |
| `fix/<nombre>` | Corrección durante desarrollo; nace de `develop` y vuelve a ella mediante PR. |
| `hotfix/<nombre>` | Incidencia urgente sobre versión estable; nace de `main` y se integra a `main` y `develop`. |

Utilizar `hotfix/*` solo cuando se justifique. Mantener ramas enfocadas en cambios concretos y evitar commits directos sobre ramas protegidas.

`develop` todavía no existe: se crea al iniciar el primer cambio de desarrollo. Mientras el proyecto esté en configuración inicial y solo exista `main`, los commits de documentación y configuración van directo a `main`.

### 6.2. Conventional Commits

Los commits se redactan **en inglés**, con verbos en **imperativo** y el formato:

```text
<type>(<scope>): <subject>

<body opcional>

<footer opcional>
```

- **`subject`:** comenzar en minúscula, no cerrar con punto y mantener el encabezado completo en **72 caracteres o menos**.
- **`scope`:** nombre corto que identifique la feature o el área (`auth`, `plans`, `ui`, `api`, `deps`, etc.); no introducir convenciones de scopes sin necesidad.
- **`body`:** explicar qué cambió y por qué; líneas de 72 caracteres o menos.
- **`footer`:** referencias a tareas o OpenSpec cuando corresponda. Para un cambio implementado mediante OpenSpec: `Refs: openspec/changes/<change-name>`.
- **Cambios incompatibles:** marcar `!` y añadir el footer `BREAKING CHANGE:` con la explicación.

| Tipo | Uso |
| --- | --- |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de defectos |
| `docs` | Documentación |
| `style` | Solo formato |
| `refactor` | Reestructuración sin cambio funcional |
| `perf` | Rendimiento |
| `test` | Pruebas |
| `build` | Compilación, herramientas o dependencias |
| `ci` | Integración continua |
| `chore` | Mantenimiento |
| `revert` | Reversión de commits |

Ejemplos:

```text
feat(plans): add plan detail page
fix(auth): handle expired session state
test(plans): cover plan form validation
```

Un commit debe representar una **unidad lógica**; acompañar el cambio con pruebas y documentación cuando sea necesario. No mezclar funcionalidades con refactorizaciones no relacionadas.

### 6.3. Pull requests

Un PR debe permitir conocer **qué se cambió, por qué y cómo se verificó**, sin obligar a reconstruirlo a partir de los commits. El título debe ser claro. Contenido mínimo adaptable al alcance:

```md
## Objetivo y contexto
<!-- Problema, necesidad, tarea, historia o cambio OpenSpec -->

## Resumen de cambios
<!-- Qué se modificó y qué queda fuera del alcance -->

## Validación y pruebas
<!-- Comandos y resultados reales; lo no ejecutado y su motivo -->

## Impacto y consideraciones
<!-- Rutas, contratos API, permisos, configuración, compatibilidad o riesgos; "No aplica" si corresponde -->

## Evidencias
<!-- Capturas/grabaciones de UI cuando ayuden; enlaces de referencia -->
```

No colocar secretos, credenciales, tokens ni datos personales en commits, PR o evidencias.

## 7. Instrucciones para agentes de IA y checklist de entrega

Antes de implementar:

- [ ] Leer `AGENTS.md`, las guías de `docs/agreements/` y las especificaciones vigentes.
- [ ] Identificar la **feature** y el flujo del usuario; no inventar endpoints, roles ni permisos.
- [ ] Separar claramente página, componentes, hooks, servicios, esquemas y tipos según necesidad real.
- [ ] Decidir estados remoto, local y compartido sin duplicación innecesaria.
- [ ] Revisar navegación, permisos de UI, validación y responsive en los perfiles afectados.
- [ ] Preparar tests asociados a los comportamientos y casos de prueba aplicables.

Antes de dar por finalizado un cambio:

- [ ] Confirmar que toda comunicación HTTP pasa por la frontera de la feature y Axios compartido.
- [ ] Verificar que los permisos de UI no se presentan como sustituto de la autorización del backend.
- [ ] Ejecutar verificaciones disponibles y **reportar resultados reales**.
- [ ] Revisar el diff y detectar cambios ajenos a la tarea.
- [ ] Redactar commit/PR conforme a §6.2 y a `AGENTS.md` §9.
- [ ] No realizar push, abrir PR o mergear sin la autorización que exijan las reglas operativas vigentes.
