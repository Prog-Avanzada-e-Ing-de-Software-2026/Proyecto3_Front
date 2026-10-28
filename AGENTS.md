# AGENTS.md — proyecto3_front

Guía operativa para agentes de IA en este repositorio. La documentación y los artefactos de OpenSpec se escriben en español; el código, los identificadores técnicos y los mensajes de commit se escriben en inglés.

## 1. Contexto del proyecto

Frontend de una aplicación de gestión de gimnasio: los profesores arman planes de entrenamiento y los alumnos registran sus entrenamientos. Está construido con React 19, TypeScript 6, Vite 8, React Router 8, TanStack Query 5, react-hook-form 7 + Zod 4 y Tailwind CSS 4, y se prueba con Vitest 5 y Testing Library sobre Yarn 4.18.1 y Node 24.

El dominio no se define acá: la fuente de verdad son los documentos del backend, en el repositorio hermano `../proyecto3_back` (`docs/preliminar/`). Este frontend consume sus contratos; cuando una regla de negocio no está escrita, es una decisión abierta y no se inventa.

Mantener el **lenguaje ubicuo** del dominio: no traducir ni renombrar sus términos en el código sin justificación.

### 1.1 Convención de estructura (lectura obligatoria)

Antes de proponer o implementar cualquier pedido, leer [`docs/agreements/estructura.md`](docs/agreements/estructura.md). Define cómo estructurar el pedido y dónde vive cada responsabilidad:

- la organización **feature-first** y el árbol de carpetas de referencia (`app/`, `features/<capacidad>/`, `components/`, `lib/`, `permissions/`, `test/`);
- qué debe y qué no debe contener cada carpeta (`estructura.md` §3), incluidas las variantes condicionales `app/layouts/`, `app/guards/` y `app/routes/`, que solo se crean cuando la funcionalidad lo necesita;
- la convención **`api/<capacidad>.service.ts`** para el acceso HTTP de cada feature (`estructura.md` §3.1), manteniendo `src/lib/api.ts` como instancia Axios compartida;
- el flujo de datos `Page → Hook → Feature Service → lib/api.ts` (`estructura.md` §4) y las dependencias permitidas entre carpetas (`estructura.md` §6);
- la nomenclatura (`estructura.md` §7) y la correspondencia entre archivo probado y test unitario (`estructura.md` §8.1).

Los números de sección entre paréntesis en esta lista refieren a `estructura.md`, no a este documento.

Es la referencia operativa para decidir dónde ubicar cada pieza. No autoriza crear carpetas vacías, refactorizar código existente ni ampliar el alcance de un cambio: eso sigue requiriendo su cambio de OpenSpec aprobado. Ante una discrepancia entre este archivo y la convención, aplicar la jerarquía de fuentes de `estructura.md` §9.1 y resolverla antes de implementar.

### 1.2 Buenas prácticas de desarrollo (lectura obligatoria)

Antes de implementar, leer también [`docs/agreements/buenas_practicas.md`](docs/agreements/buenas_practicas.md). Complementa `estructura.md` con los criterios de trabajo del equipo:

- principios (KISS, YAGNI, DRY, SRP, separación de responsabilidades, bajo acoplamiento, abstracciones justificadas) y la regla de elegir la solución más simple que cumpla el requisito (`buenas_practicas.md` §1);
- responsabilidades por carpeta y los flujos de consulta y escritura (`buenas_practicas.md` §2 y §3);
- formularios, visibilidad por permisos y responsive (`buenas_practicas.md` §4);
- pruebas por archivo, identificación de casos y qué reportar al cerrar un cambio (`buenas_practicas.md` §5);
- commits, ramas y contenido de PR (`buenas_practicas.md` §6), con el detalle operativo de ramas en §10 de este documento;
- checklist de entrega para agentes (`buenas_practicas.md` §7).

Es una guía de criterio, no una autorización: no habilita crear carpetas, refactorizar ni ampliar el alcance de un cambio, y no autoriza commits, push, PR ni merge — eso lo rigen §9 y §10. Ante una discrepancia entre este archivo y los dos documentos de `docs/agreements/`, rige `AGENTS.md`; informarla y resolverla antes de implementar.

## 2. Comandos

| Objetivo | Comando |
| --- | --- |
| Instalar dependencias | `yarn install` |
| Desarrollo con HMR | `yarn dev` |
| Build de producción | `yarn build` |
| Previsualizar el build | `yarn preview` |
| Servir el build compilado | `yarn prod` |
| Servir un build ya existente | `yarn prod:start` |
| Typecheck | `yarn typecheck` |
| Lint | `yarn lint` |
| Formatear | `yarn format` |
| Verificar formato | `yarn format:check` |
| Tests | `yarn test` |
| Tests en watch | `yarn test:watch` |
| Cobertura | `yarn test:cov` |

- El entorno está fijado: Node 24 y Yarn 4.18.1 (`packageManager` + `engines`). No cambiar a npm, pnpm ni Bun.
- `yarn dev` levanta Vite en el puerto 5173 con `strictPort`, y proxya `/api` hacia `http://localhost:3000` recortando el prefijo (`vite.config.ts`). El backend debe estar corriendo en ese puerto para trabajar contra datos reales.
- `yarn build` es `tsc -b` + `vite build`: un error de tipos rompe el build.

## 3. Flujo SDD obligatorio (OpenSpec)

**Regla principal: no se escribe código de producción sin un cambio de OpenSpec aprobado.** Un cambio es la unidad de trabajo; no hay implementación "directa" de funcionalidades.

### 3.1 Fases y gates

| # | Fase | Comandos | Gate para avanzar |
| --- | --- | --- | --- |
| 0 | Explorar (solo lectura) | `openspec context --json`, `openspec list --specs`, `openspec show <capability> --type spec` | Requisitos existentes y decisiones abiertas identificados |
| 1 | Proponer | `openspec new change <kebab-case>` | Cambio creado por el CLI, nunca a mano |
| 2 | Artefactos | `openspec status --change <name> --json`, `openspec instructions <artifact> --change <name> --json` | `proposal.md`, `specs/**/spec.md`, `design.md` (cuando aplique) y `tasks.md` completos |
| 3 | Validar planificación | `openspec validate <name> --strict` | Sale con código 0 |
| 4 | Aprobación humana | — | El usuario pide explícitamente implementar |
| 5 | Implementar | `/opsx-apply <name>` o skill `openspec-apply-change` | Todas las tareas `[x]` y suites en verde |
| 6 | Verificar | `openspec validate <name> --strict` + suites | Cada escenario demostrado con evidencia |
| 7 | Archivar | `openspec archive <name>` | Tareas completas, validación en verde y aprobación del usuario |

Comandos de workflow instalados en `.opencode/commands/`: `opsx-propose`, `opsx-explore`, `opsx-apply`, `opsx-update`, `opsx-sync`, `opsx-archive`.

### 3.2 Reglas del flujo

1. **Explorar antes de proponer.** Leer los specs existentes y los documentos de dominio del backend. No proponer algo que ya existe o que contradice una regla de negocio.
2. **Un cambio = un comportamiento coherente.** Nombre en kebab-case (`add-plan-builder`, `register-training`). Nunca crear directorios dentro de `openspec/changes/` a mano: usar siempre `openspec new change`.
3. **Orden de artefactos:** `proposal` → `specs` → `design` → `tasks`. Respetar las dependencias que devuelve `openspec status`.
4. **`specs` es obligatorio.** Es un delta (`ADDED`, `MODIFIED`, `REMOVED`) con requisitos en `SHALL`/`MUST` y al menos un escenario `Given/When/Then` por requisito. Solo comportamiento observable en la interfaz, incluidos los estados de carga, vacío y error; nada de detalles de implementación.
5. **`design.md`** se crea siempre que el cambio toque más de una capacidad, altere el contrato consumido, agregue dependencias, o implique decisiones de accesibilidad, estado del servidor o rendimiento. Debe registrar: decisión, alternativas descartadas, rutas/componentes/hooks afectados, riesgos y estrategia de pruebas.
6. **`tasks.md` es el contrato de ejecución.** Una tarea por unidad verificable, ordenada por dependencia, con su prueba asociada y trazabilidad al requisito que la origina.
7. **La planificación y la implementación nunca ocurren en el mismo turno.** Terminar la propuesta, presentarla y esperar un pedido explícito de implementación.
8. **Validar antes de implementar y antes de archivar:** `openspec validate <name> --strict`.
9. **No ampliar alcance en silencio.** Si durante la implementación aparece comportamiento no especificado, detenerse y actualizar los artefactos (skill `openspec-update-change`) antes de escribir código.
10. **Archivar sincroniza los specs principales.** `openspec archive` mueve el cambio a `openspec/changes/archive/` y aplica el delta sobre `openspec/specs/`. No editar `openspec/specs/` a mano para reflejar un cambio: usar `openspec-sync-specs` o archivar.
11. **Artefactos en español**, con los encabezados estructurales y las palabras clave `SHALL`/`MUST` en inglés, según `openspec/config.yaml`.
12. **Trazabilidad:** cada requisito referencia las reglas (RN-n), user stories (US-nn) o decisiones (D-nn, DW-nn) del backend cuando existan; cada commit referencia el cambio con `Refs: openspec/changes/<name>`.
13. **Endpoints inexistentes.** Si el cambio necesita un endpoint que el backend todavía no expone, el `design.md` lo declara y el cambio define qué muestra la interfaz mientras tanto. No se inventa el contrato.

### 3.3 Capacidades (capability paths)

Usar nombres en kebab-case, descriptivos y alineados al dominio del backend. Mantener el path existente de una capacidad ya especificada y no crear una capacidad nueva si el comportamiento pertenece a una que ya existe.

### 3.4 Excepción documental

Solo los cambios sin efecto en comportamiento, contratos, esquema o código (typos, aclaraciones en documentación) pueden hacerse sin un cambio de OpenSpec. La excepción debe declararse explícitamente en la respuesta. Ante la duda, crear el cambio.

## 4. Convenciones de código

- **ESM y bundler:** `package.json` tiene `"type": "module"` y el tsconfig usa `moduleResolution: bundler`. Los imports entre módulos TS van **sin extensión** (`import App from './App'`); los assets y CSS sí llevan extensión (`import './index.css'`).
- **`verbatimModuleSyntax` está activo:** todo import que solo se usa como tipo se escribe con `import type` / `export type`. Un import de valor sin uso rompe el build.
- **TypeScript:** `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` y `noFallthroughCasesInSwitch` están activos. `strict` todavía **no** está habilitado en `tsconfig.app.json`; no introducir patrones que se rompan al activarlo (`any` implícito, accesos sin guarda). Habilitarlo es un cambio propio, con su tarea y su verificación.
- **Sin alias de paths:** no hay `paths` configurado. Usar imports relativos.
- **Estructura objetivo para código nuevo**, una carpeta por capacidad (los límites de cada carpeta están en `docs/agreements/estructura.md`):

  ```
  src/
    app/                          # composición global (condicional)
      layouts/                    # AlumnoLayout, StaffLayout, AuthLayout
      guards/                     # protección de navegación (solo UI)
      providers/                  # providers transversales, si hacen falta
      routes/                     # definición y composición de rutas
    features/<capacidad>/
      api/
        <capacidad>.service.ts    # peticiones HTTP y mapeo del contrato
      components/                 # componentes presentacionales de la capacidad
      hooks/                      # queries y mutations de TanStack Query
      pages/                      # pantallas montadas por el router
      schemas/                    # esquemas Zod (formularios y contratos)
      types.ts                    # tipos del contrato con la API
    components/                   # UI compartida, sin lógica de dominio
      ui/                         # controles genéricos
      forms/                      # primitivas compartidas de formularios
      feedback/                   # carga, error, vacío, confirmaciones
    permissions/                  # helpers y componentes de visibilidad (condicional)
    lib/api.ts                    # instancia única de axios (no es un service)
    App.tsx                       # composición raíz
    main.tsx                      # providers globales (QueryClient, Router)
    test/setup.ts                 # setup de Vitest
  ```

- **Estructura condicional, no preventiva:** `app/`, `permissions/` y las subcarpetas de `components/` se crean cuando la funcionalidad lo exige. `App.tsx` y `main.tsx` conservan hoy la composición de rutas y providers; extraer `app/routes/`, `app/providers/` o `lib/query-client.ts` es un cambio propio con su aprobación, no una limpieza. No abrir las subcarpetas de una feature que todavía no las necesita.

- **Componentes:** presentacional vs. contenedor. El presentacional recibe props y no conoce la API; el contenedor usa los hooks de la capacidad. Sin componentes de más de ~150 líneas: si crece, se parte por responsabilidad.
- **Nombres:** componentes y páginas en `PascalCase` (`PlanBuilderPage.tsx`), layouts en `PascalCase` + `Layout.tsx` (`StaffLayout.tsx`), hooks en `useCamelCase` (`usePlanes.ts`), esquemas con identificador `camelCase` + `Schema` (`planSchema`, `planFormSchema`) en archivo `<descriptivo>.schema.ts` (`plan.schema.ts`, `plan-form.schema.ts`), y archivos HTTP de feature `<capacidad>.service.ts` (`planes.service.ts`). Un archivo exporta un componente de React (`react/only-export-components`, activa).
- **Formato:** Prettier (`singleQuote`, `trailingComma: all`, plugin de Tailwind) y oxlint. No introducir reglas nuevas de lint sin justificarlo.
- **Lint y lo que no cubre:** `.oxlintrc.json` hace cumplir lo automatizable de estos acuerdos — ciclos de imports, un solo componente exportado por archivo, tamaño de archivo, `any` explícito, sufijo de los tests y `label` asociado a su control. No cubre los límites entre features (`estructura.md` §6): con imports relativos esos siguen siendo revisión de código. No desactivar reglas sin justificarlo en el mismo cambio.
- **Dependencias entre carpetas:** `app/` y las páginas componen, los hooks consumen el `api/<capacidad>.service.ts` de su feature y los `components/` compartidos no conocen ninguna capacidad. No importar internals de otra feature (`features/planes/...` → `features/alumnos/...`): si la integración es legítima, exponer una API pública mínima de la feature o mover la pieza a un lugar realmente compartido, y justificarlo en el `design.md`. Sin dependencias circulares, sin acoplar features a un layout y sin `index.ts` obligatorios.

## 5. Acceso a datos y estado del servidor

- **TanStack Query es la única fuente de estado del servidor.** No copiar respuestas de la API a `useState` ni a un store global; ese patrón duplica la verdad y desincroniza la caché.
- `useState`/`useReducer` quedan para estado de interfaz (abrir/cerrar, filtros locales, pasos de un formulario).
- **Toda llamada HTTP de una feature pasa por su `api/<capacidad>.service.ts` y de ahí por la instancia compartida `src/lib/api.ts`.** No usar `axios` ni `fetch` sueltos en páginas, layouts, hooks ni componentes.
- **Claves de query:** array que empieza por la capacidad y sigue con los parámetros reales. `['plans']`, `['plans', { studentId }]`, `['plans', planId]`. Sin claves ad-hoc por componente.
- **Mutations:** invalidar en `onSuccess` las claves afectadas (`queryClient.invalidateQueries({ queryKey: ['plans'] })`). No actualizar la caché a mano salvo que el `design.md` del cambio lo justifique.
- **Configuración global** en `src/main.tsx` (`staleTime` 60 s, `retry` 1, sin refetch al enfocar). No reconfigurar por componente sin justificación.
- Los componentes no consumen la forma cruda de la respuesta: el mapeo y la validación viven en `api/<capacidad>.service.ts` o en los `schemas/` de la capacidad.
- **Errores de red:** el estado de error se muestra en la interfaz; nunca se silencia con un `catch` vacío. Un 401/403 y un 500 no se tratan igual.

### 5.1 Flujo HTTP y responsabilidad de cada capa

**Lectura:** `Ruta → Page → Hook (useQuery) → api/<capacidad>.service.ts → src/lib/api.ts → API`.
**Escritura:** `Formulario → Schema Zod + react-hook-form → Hook (useMutation) → api/<capacidad>.service.ts → src/lib/api.ts → invalidación en onSuccess`.

- El service construye la petición y adapta el contrato con funciones explícitas (`getPlans`, `getPlanById`, `createPlan`), sin JSX, sin hooks, sin navegación, sin mensajes visuales ni estado de formulario.
- No administra caché ni invalidaciones: eso corresponde a los `hooks/`.
- Usa la instancia `api` de `src/lib/api.ts`; no crear una instancia Axios por feature sin decisión aprobada.
- `src/lib/api.ts` conserva su nombre y **no** es un service de feature.
- Devuelve valores y errores tipados según el contrato real: no inventar endpoints ni formas de respuesta.

### 5.2 Visibilidad por permisos (solo UI)

La interfaz puede ocultar, deshabilitar o redirigir según los permisos del usuario en tres niveles: navegación (menús y enlaces), rutas y páginas (incluido el acceso directo por URL) y componentes o acciones dentro de la página. Mientras los permisos se están cargando no se presentan acciones protegidas como disponibles. Cuando haga falta reutilizar esas comprobaciones, centralizarlas en `permissions/` en lugar de duplicarlas por pantalla.

Esto es **experiencia de usuario, no seguridad**: la autorización real la valida el backend en cada operación (ver §12). El mecanismo de autenticación y los nombres de permisos provienen de los contratos aprobados; no se asumen roles ni permisos.

## 6. Formularios y validación

- `react-hook-form` con `zodResolver`. El esquema Zod es la **única** fuente de reglas de validación: no duplicarlas en `register(..., { required: ... })`.
- Preferir inputs no controlados (`register`) sobre `Controller`; usar `Controller` solo para componentes que no exponen `ref` ni `onChange` nativos.
- Los errores de validación del servidor se mapean al campo correspondiente con `setError`; los errores generales van al nivel del formulario.
- Deshabilitar el submit mientras la mutation está pendiente; no bloquear la interfaz entera.

## 7. Estilos y accesibilidad

- **Tailwind CSS 4** por `@import 'tailwindcss'` en `src/index.css`. No hay `tailwind.config.js`: los tokens del tema se declaran con `@theme` en el CSS.
- Prettier ordena las clases con `prettier-plugin-tailwindcss`. No ordenarlas a mano ni pelear con el formateador.
- No agregar CSS global nuevo si se resuelve con utilidades. `src/App.css` y los assets del template no se usan: no sumar estilos ahí.
- **Accesibilidad obligatoria** (`jsx-a11y` está activo en oxlint):
  - HTML semántico primero; nunca un `div` con `onClick` donde corresponde un `button`.
  - Todo input con `label` asociado; los errores se enlazan con `aria-describedby` y marcan `aria-invalid`.
  - Foco visible y navegación completa por teclado.
  - El atributo `lang` de `index.html` debe reflejar el idioma de la interfaz.

### 7.1 Diseño responsive por experiencia

Todas las pantallas deben funcionar y leerse en móvil y en escritorio. La prioridad de diseño depende del perfil: **alumno** *mobile-first* (navegación, consulta de planes, registro de entrenamientos); **profesor y administrador** con prioridad escritorio (formularios, tablas, gestión y seguimiento), manteniendo una versión utilizable en móvil; **pantallas compartidas** cuidadas en ambas experiencias. Al implementar o revisar una pantalla, comprobar sus estados e interacciones en ambos tamaños: no alcanza con ajustar el ancho de los contenedores.

## 8. Testing y verificación

- **Vitest 5 + jsdom + Testing Library**, con `globals: true` y setup en `src/test/setup.ts` (`@testing-library/jest-dom`).
- Tests colocados junto al código, con sufijo `.test.tsx` (o `.test.ts` para lógica pura). El runner incluye `**/*.{test,spec}.?(c|m)[jt]s?(x)`.
- **Correspondencia entre archivo y test unitario:** cada prueba unitaria o de componente vive junto al archivo que prueba y comparte su nombre base (`PlanForm.tsx` → `PlanForm.test.tsx`, `planes.service.ts` → `planes.service.test.ts`). No agrupar pruebas unitarias de archivos independientes en un solo archivo organizado por historia de usuario; las de integración o extremo a extremo sí pueden agruparse por flujo. No crear tests vacíos para cumplir la convención.
- Los títulos de `describe`/`it` describen el comportamiento verificado; si existe un caso de prueba formal documentado, incluir su nombre o identificador para mantener la trazabilidad.
- Los tests pasan por la **interfaz pública** y por lo que el usuario observa: `getByRole`, `getByLabelText`, `userEvent`. Nunca por clases CSS, por `data-testid` decorativo ni por detalles internos.
- Para componentes que usan datos, envolver en un `QueryClientProvider` con un cliente de test (`retry: false`, sin `staleTime` heredado). No mockear TanStack Query.
- HTTP: mockear en el borde con `vi.mock('./lib/api')` o `vi.spyOn(api, 'get')`. No levantar un servidor falso para un test unitario.
- Todo cambio de comportamiento sigue test-first: primero un test que falla (RED), luego la implementación (GREEN), luego refactor. Cada test verifica todos los efectos observables de la regla.
- **Antes de declarar terminada una tarea:** `yarn typecheck && yarn lint && yarn test`. Un cambio de estilos o de markup significativo suma `yarn format:check`.
- No desactivar ni saltear tests para "dejar todo en verde". Si un test falla por una causa preexistente, documentarlo con evidencia.

### 8.1 Estado conocido del baseline

Verificado al inicializar el repositorio; no es una regresión de tu cambio:

- `yarn typecheck` pasa.
- `yarn lint` pasa sin warnings: `.oxlintrc.json` desactiva `react/react-in-jsx-scope`, que el JSX transform de React 19 no necesita. Un warning nuevo es señal real, no ruido: no silenciarlo importando `React`.
- `yarn test` falla hoy con `No test files found, exiting with code 1`. El primer cambio que agregue tests lo resuelve.
- `yarn format:check` reporta archivos sin formatear. Se corrige con `yarn format` una sola vez, no dentro de un cambio ajeno.

## 9. Conventional Commits

Todos los commits siguen [Conventional Commits](https://www.conventionalcommits.org/). Los mensajes se escriben en inglés, en modo imperativo.

### 9.1 Formato

```text
<type>(<scope>): <subject>

<body>

<footer>
```

- `subject`: imperativo, minúsculas, sin punto final, encabezado total ≤ 72 caracteres.
- `body`: qué y por qué, no cómo; líneas ≤ 72 caracteres.
- `footer`: referencias y breaking changes.

### 9.2 Tipos permitidos

| Tipo | Uso |
| --- | --- |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un defecto |
| `docs` | Documentación, incluidos artefactos OpenSpec |
| `style` | Formato sin cambio de comportamiento |
| `refactor` | Cambio interno sin alterar comportamiento |
| `perf` | Mejora de rendimiento |
| `test` | Tests nuevos o corregidos |
| `build` | Build, dependencias o herramientas |
| `ci` | Configuración de integración continua |
| `chore` | Tareas de mantenimiento |
| `revert` | Reversión de un commit anterior |

### 9.3 Scopes

Usar un scope corto que identifique el área afectada. Ejemplos: `ui`, `plans`, `training`, `api`, `forms`, `styles`, `a11y`, `config`, `openspec`, `deps`, `test`.

### 9.4 Reglas

- Un commit = una unidad lógica de trabajo. No mezclar refactors no relacionados ni cambios de formato masivos.
- El código, sus tests y su documentación van en el mismo commit.
- Todo commit que implementa un cambio de OpenSpec incluye el footer `Refs: openspec/changes/<change-name>`.
- El commit de archivado usa `chore(openspec): archive <change-name>`.
- Los breaking changes se marcan con `!` en el tipo/scope y un footer `BREAKING CHANGE: <descripción>`.
- Sin atribución de IA: nunca agregar `Co-Authored-By` ni trailers equivalentes.
- No hacer `push`, abrir PR ni mergear sin pedido explícito del usuario.

### 9.5 Ejemplos

```text
feat(plans): add weekly prescription form

Refs: openspec/changes/add-plan-builder
```

```text
fix(training): reject duplicate exercise in same session

Refs: openspec/changes/register-training
```

```text
test(plans): cover duplicate exercise name
```

## 10. Git y revisión

- **Estrategia de ramas: GitFlow** (`buenas_practicas.md` §6.1). `main` conserva las versiones estables, `develop` integra el desarrollo y cada trabajo nace y vuelve por PR: `feature/<nombre>` y `fix/<nombre>` desde `develop`, `hotfix/<nombre>` desde `main`. Cada cambio de OpenSpec se implementa en su rama correspondiente; no commitear directamente sobre `main` ni sobre `develop`.
- **Excepción de configuración inicial:** mientras el proyecto siga en setup y solo exista `main`, los commits de documentación y configuración van directo a `main`. Al arrancar el primer cambio de desarrollo se crea `develop` y desde ahí rige GitFlow sin excepciones.
- Antes de commitear: `yarn typecheck && yarn lint && yarn test`.
- Revisar `git diff` completo antes de cada commit; no commitear archivos generados (`dist/`, `node_modules/`) ni secretos.
- No usar `--no-verify` para saltear hooks.
- El push, la creación de PR y el merge son decisiones del usuario.
- Cuando el usuario pida una PR, el contenido sigue la plantilla de `buenas_practicas.md` §6.3.

## 11. CodeGraph

El proyecto tiene un índice de CodeGraph en `.codegraph/` (datos locales, no se commitean).

- Para preguntas estructurales (arquitectura, flujos, impacto de un cambio, referencias de componentes), usar `codegraph_explore` o `codegraph explore` antes de búsquedas amplias con `grep`/`find`.
- Después de editar código, ejecutar `codegraph sync -q .` antes de confiar en consultas del CLI.
- Cada worktree necesita su propio índice; nunca copiar ni symlinkear `.codegraph/`.

## 12. Seguridad

- **Todo lo que empieza con `VITE_` termina en el bundle público.** Nunca poner secretos, tokens ni claves en variables `VITE_*` ni en `import.meta.env`.
- No leer ni exponer `.env`, credenciales, claves ni tokens.
- No implementar almacenamiento de sesión, manejo de tokens ni un mecanismo de autorización propio del lado del cliente sin un cambio de OpenSpec que lo especifique: la UI no es un límite de seguridad, el backend decide. La visibilidad por permisos de §5.2 es solo experiencia de usuario y nunca reemplaza la validación del servidor.
- No ejecutar comandos remotos (`ssh`, `scp`, `rsync`) ni publicar artefactos sin autorización explícita.
- Ante una operación destructiva o irreversible, detenerse y pedir aprobación.
