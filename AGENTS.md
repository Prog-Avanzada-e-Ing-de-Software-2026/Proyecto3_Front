# AGENTS.md — proyecto3_front

Guía operativa para agentes de IA en este repositorio. La documentación y los artefactos de OpenSpec se escriben en español; el código, los identificadores técnicos y los mensajes de commit se escriben en inglés.

## 1. Contexto del proyecto

Frontend de una aplicación de gestión de gimnasio: los profesores arman planes de entrenamiento y los alumnos registran sus entrenamientos. Está construido con React 19, TypeScript 6, Vite 8, React Router 8, TanStack Query 5, react-hook-form 7 + Zod 4 y Tailwind CSS 4, y se prueba con Vitest 5 y Testing Library sobre Yarn 4.18.1 y Node 24.

El dominio no se define acá: la fuente de verdad son los documentos del backend, en el repositorio hermano `../proyecto3_back` (`docs/preliminar/`). Este frontend consume sus contratos; cuando una regla de negocio no está escrita, es una decisión abierta y no se inventa.

Mantener el **lenguaje ubicuo** del dominio: no traducir ni renombrar sus términos en el código sin justificación.

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
- **Estructura objetivo para código nuevo**, una carpeta por capacidad:

  ```
  src/
    features/<capacidad>/
      api/           # llamadas HTTP de la capacidad
      components/    # componentes presentacionales de la capacidad
      hooks/         # queries y mutations de TanStack Query
      pages/         # pantallas montadas por el router
      schemas/       # esquemas Zod (formularios y contratos)
      types.ts       # tipos del contrato con la API
    components/      # UI compartida, sin lógica de dominio
    lib/api.ts       # instancia única de axios
    App.tsx          # composición del árbol de rutas
    main.tsx         # providers globales (QueryClient, Router)
    test/setup.ts    # setup de Vitest
  ```

- **Componentes:** presentacional vs. contenedor. El presentacional recibe props y no conoce la API; el contenedor usa los hooks de la capacidad. Sin componentes de más de ~150 líneas: si crece, se parte por responsabilidad.
- **Nombres:** componentes y páginas en `PascalCase` (`PlanBuilderPage.tsx`), hooks en `useCamelCase` (`usePlans.ts`), esquemas en `camelCase` + `Schema` (`planFormSchema`). Un archivo exporta un componente de React (regla `react/only-export-components` si se activa).
- **Formato:** Prettier (`singleQuote`, `trailingComma: all`, plugin de Tailwind) y oxlint. No introducir reglas nuevas de lint sin justificarlo.

## 5. Acceso a datos y estado del servidor

- **TanStack Query es la única fuente de estado del servidor.** No copiar respuestas de la API a `useState` ni a un store global; ese patrón duplica la verdad y desincroniza la caché.
- `useState`/`useReducer` quedan para estado de interfaz (abrir/cerrar, filtros locales, pasos de un formulario).
- **Toda llamada HTTP pasa por `src/lib/api.ts`.** No usar `axios` ni `fetch` sueltos dentro de componentes.
- **Claves de query:** array que empieza por la capacidad y sigue con los parámetros reales. `['plans']`, `['plans', { studentId }]`, `['plans', planId]`. Sin claves ad-hoc por componente.
- **Mutations:** invalidar en `onSuccess` las claves afectadas (`queryClient.invalidateQueries({ queryKey: ['plans'] })`). No actualizar la caché a mano salvo que el `design.md` del cambio lo justifique.
- **Configuración global** en `src/main.tsx` (`staleTime` 60 s, `retry` 1, sin refetch al enfocar). No reconfigurar por componente sin justificación.
- Los componentes no consumen la forma cruda de la respuesta: el mapeo y la validación viven en `api/` o en los `schemas/` de la capacidad.
- **Errores de red:** el estado de error se muestra en la interfaz; nunca se silencia con un `catch` vacío. Un 401/403 y un 500 no se tratan igual.

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

## 8. Testing y verificación

- **Vitest 5 + jsdom + Testing Library**, con `globals: true` y setup en `src/test/setup.ts` (`@testing-library/jest-dom`).
- Tests colocados junto al código, con sufijo `.test.tsx` (o `.test.ts` para lógica pura). El runner incluye `**/*.{test,spec}.?(c|m)[jt]s?(x)`.
- Los tests pasan por la **interfaz pública** y por lo que el usuario observa: `getByRole`, `getByLabelText`, `userEvent`. Nunca por clases CSS, por `data-testid` decorativo ni por detalles internos.
- Para componentes que usan datos, envolver en un `QueryClientProvider` con un cliente de test (`retry: false`, sin `staleTime` heredado). No mockear TanStack Query.
- HTTP: mockear en el borde con `vi.mock('./lib/api')` o `vi.spyOn(api, 'get')`. No levantar un servidor falso para un test unitario.
- Todo cambio de comportamiento sigue test-first: primero un test que falla (RED), luego la implementación (GREEN), luego refactor. Cada test verifica todos los efectos observables de la regla.
- **Antes de declarar terminada una tarea:** `yarn typecheck && yarn lint && yarn test`. Un cambio de estilos o de markup significativo suma `yarn format:check`.
- No desactivar ni saltear tests para "dejar todo en verde". Si un test falla por una causa preexistente, documentarlo con evidencia.

### 8.1 Estado conocido del baseline

Verificado al inicializar el repositorio; no es una regresión de tu cambio:

- `yarn typecheck` pasa.
- `yarn lint` pasa con warnings de `react(react-in-jsx-scope)` en `src/App.tsx`. Es ruido de la config de oxlint con el JSX transform moderno de React 19: no "arreglarlo" importando `React`.
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

- Cada cambio de OpenSpec se implementa en una rama `change/<change-name>`; no commitear directamente sobre `main`.
- Antes de commitear: `yarn typecheck && yarn lint && yarn test`.
- Revisar `git diff` completo antes de cada commit; no commitear archivos generados (`dist/`, `node_modules/`) ni secretos.
- No usar `--no-verify` para saltear hooks.
- El push, la creación de PR y el merge son decisiones del usuario.

## 11. CodeGraph

El proyecto tiene un índice de CodeGraph en `.codegraph/` (datos locales, no se commitean).

- Para preguntas estructurales (arquitectura, flujos, impacto de un cambio, referencias de componentes), usar `codegraph_explore` o `codegraph explore` antes de búsquedas amplias con `grep`/`find`.
- Después de editar código, ejecutar `codegraph sync -q .` antes de confiar en consultas del CLI.
- Cada worktree necesita su propio índice; nunca copiar ni symlinkear `.codegraph/`.

## 12. Seguridad

- **Todo lo que empieza con `VITE_` termina en el bundle público.** Nunca poner secretos, tokens ni claves en variables `VITE_*` ni en `import.meta.env`.
- No leer ni exponer `.env`, credenciales, claves ni tokens.
- No implementar almacenamiento de sesión, manejo de tokens ni autorización del lado del cliente sin un cambio de OpenSpec que lo especifique: la UI no es un límite de seguridad, el backend decide.
- No ejecutar comandos remotos (`ssh`, `scp`, `rsync`) ni publicar artefactos sin autorización explícita.
- Ante una operación destructiva o irreversible, detenerse y pedir aprobación.
