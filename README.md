# Proyecto 3 — Frontend de gestión de gimnasio

SPA del MVP de una aplicación de gestión de gimnasio: los profesores arman
planes de entrenamiento y los alumnos registran sus entrenamientos.

Proyecto académico de **Ingeniería y Calidad de Software 2026** — Facultad
Regional de Villa María, Ingeniería en Sistemas de Información (Grupo 10).

Este repositorio es el **frontend**. El dominio no se define acá: las reglas de
negocio (`RN-01`..`RN-42`), las historias de usuario (`HU 1`..`HU 29`) y los
contratos de la API viven en el repositorio del backend
([`Proyecto3_Back`](https://github.com/Prog-Avanzada-e-Ing-de-Software-2026/Proyecto3_Back)).
Cuando una regla de negocio no está escrita es una decisión abierta: no se
inventa.

El sistema se especifica antes de implementarse: cada funcionalidad nace como un
cambio de OpenSpec aprobado.

## Stack

| Área                     | Tecnología                                                         |
| ------------------------ | ------------------------------------------------------------------ |
| Interfaz                 | React 19                                                           |
| Lenguaje                 | TypeScript 6 (`moduleResolution: bundler`, `verbatimModuleSyntax`) |
| Build y servidor de dev  | Vite 8                                                             |
| Ruteo                    | React Router 8                                                     |
| Estado del servidor      | TanStack Query 5                                                   |
| Formularios              | react-hook-form 7 + Zod 4                                          |
| Estilos                  | Tailwind CSS 4 (plugin de Vite, sin `tailwind.config.js`)          |
| HTTP                     | Axios, una instancia única en `src/lib/api.ts`                     |
| Pruebas                  | Vitest 5 + Testing Library sobre jsdom                             |
| Lint y formato           | oxlint + Prettier con `prettier-plugin-tailwindcss`                |
| Runtime y gestor de paq. | Node.js 24 + Yarn 4.18.1                                           |
| Especificación           | OpenSpec                                                           |

## Documentación

| Documento                                                                    | Contenido                                                                   |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                                                     | Guía operativa: flujo SDD, comandos, convenciones y límites de cada carpeta |
| [`docs/agreements/estructura.md`](docs/agreements/estructura.md)             | Estructura feature-first, responsabilidades y dependencias permitidas       |
| [`docs/agreements/buenas_practicas.md`](docs/agreements/buenas_practicas.md) | Principios de trabajo, flujos de datos, pruebas, ramas y PR                 |
| [`openspec/`](openspec)                                                      | Especificaciones vigentes y cambios propuestos                              |

La documentación de dominio (`docs/dominio/`) se consulta en el repositorio del
backend: es la fuente de verdad del lenguaje ubicuo y de las reglas de negocio.

## Requisitos previos

Antes de comenzar, asegurate de tener instalado:

- **Node.js 24** ([descargar](https://nodejs.org/))
- **Yarn 4.18.1** (se habilita con `corepack enable`)
- **Git** ([descargar](https://git-scm.com/))
- **El backend corriendo** en `http://localhost:3000` para trabajar contra datos
  reales; no es obligatorio para compilar ni para correr los tests.

Verificá las versiones:

```bash
node --version    # v24.x.x
yarn --version    # 4.18.1
```

El proyecto está fijado con `packageManager` y `engines` en `package.json`: una
versión distinta de Node o Yarn produce instalaciones y builds distintos a los
del equipo.

## Puesta en marcha

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/Prog-Avanzada-e-Ing-de-Software-2026/Proyecto3_Front.git
cd Proyecto3_Front
```

### Paso 2: Instalar dependencias

```bash
corepack enable
yarn install
```

`yarn install` instala todo lo declarado en `package.json` y lo fija en
`yarn.lock`. Para instalar exactamente las versiones del lockfile sin
actualizarlo usá `yarn install --immutable`.

### Paso 3: Conectar con la API

En desarrollo no hace falta configurar nada. `vite.config.ts` levanta el servidor
en el puerto **5173** con `strictPort` y proxya `/api` hacia
`http://localhost:3000` **conservando el prefijo**: una petición del frontend a
`/api/alumnos` llega al backend como `/api/alumnos`. Por eso el backend tiene que
exponer sus rutas bajo `/api` (ver la advertencia al final de esta sección).

La instancia Axios de `src/lib/api.ts` usa `VITE_API_URL` como `baseURL` y cae en
`/api` cuando la variable no está definida:

```ts
baseURL: import.meta.env.VITE_API_URL || '/api';
```

#### Configurar la URL de la API

La URL base del backend vive en `VITE_API_URL` y se lee desde archivos `.env` en
la raíz. El repositorio trae una plantilla versionada:

```bash
cp env.example .env
```

`env.example` documenta la variable; `.env` queda ignorado por git. Hay dos modos
de desarrollo y conviene elegir a conciencia:

| Modo                            | `.env`                                   | Qué pasa                                                                                                   |
| ------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Proxy de Vite** (recomendado) | `VITE_API_URL=` vacía                    | El frontend llama `/api/alumnos` y Vite lo reenvía a `http://localhost:3000/api/alumnos`. Sin CORS.        |
| **URL directa**                 | `VITE_API_URL=http://localhost:3000/api` | El navegador llama al backend en otro origen (`:5173` → `:3000`) y necesita CORS habilitado en el backend. |

Para apuntar al backend desplegado desde tu máquina:

```dotenv
VITE_API_URL=https://proyecto3-back.herokuapp.com/api
```

Sin barra final, pero **con el prefijo `/api`**: la instancia Axios agrega solo la
ruta del service (`/alumnos`), así que el prefijo tiene que venir en la variable.

> **CORS hoy:** el backend todavía no llama a `enableCors()` en `src/main.ts`. Por
> eso en local usá el proxy (dejá `VITE_API_URL` vacía): con una URL directa el
> navegador bloquea las peticiones.

> **Prerrequisito del backend:** el backend todavía sirve en la raíz (`GET /`, sin
> `setGlobalPrefix`). Mientras no exponga sus rutas bajo `/api`, tanto el proxy
> como `VITE_API_URL` devuelven 404. El prefijo `/api` es el contrato acordado; el
> backend tiene que cumplirlo.

> **Importante:** todo lo que empieza con `VITE_` termina en el bundle público.
> Nunca pongas secretos, tokens ni claves en variables `VITE_*` ni en
> `import.meta.env`. La autorización real la valida el backend en cada operación.

### Paso 4: Levantar el servidor de desarrollo

```bash
yarn dev
```

Vite queda disponible en `http://localhost:5173` con recarga en caliente (HMR).
Si el puerto está ocupado, el arranque falla a propósito: `strictPort` evita que
dos procesos distintos se repartan el proxy sin que te enteres.

### Paso 5: Verificar que todo funciona

Abrí `http://localhost:5173`. La aplicación muestra por ahora las rutas de
ejemplo `Inicio` y `Usuarios` (`src/App.tsx`): son el andamiaje de navegación, no
funcionalidad del dominio.

Si vas a consumir datos, arrancá el backend en el puerto 3000 siguiendo su propio
README. Mientras el backend no exponga los endpoints del dominio, la interfaz no
tiene datos reales que mostrar.

### Paso 6: Compilar y previsualizar

```bash
yarn build       # tsc -b + vite build: genera dist/
yarn preview     # sirve dist/ localmente
```

`yarn build` es `tsc -b` + `vite build`: un error de tipos rompe el build. Para
servir el build compilado con fallback de SPA (todas las rutas a `index.html`):

```bash
yarn prod        # yarn build && serve -s dist
yarn prod:start  # sirve un dist/ ya compilado
```

### Paso 7: Ejecutar los tests

```bash
yarn test        # una corrida
yarn test:watch  # modo watch
yarn test:cov    # con cobertura
```

Los tests corren con Vitest sobre jsdom (`globals: true`, setup en
`src/test/setup.ts`) y no necesitan backend ni base de datos: las llamadas HTTP se
mockean en el borde.

> **Estado actual del baseline:** el repositorio todavía no tiene archivos de
> prueba, así que `yarn test` sale con código 1 y el mensaje
> `No test files found, exiting with code 1`. Es la ausencia inicial de tests, no
> un fallo. El primer cambio que agregue pruebas lo resuelve, y desde ese momento
> la suite se ejecuta y se reporta como cualquier otra verificación.

## Calidad de código

Antes de cada commit:

```bash
yarn typecheck    # tsc -b --pretty false, sin emitir archivos
yarn lint         # oxlint
yarn format       # Prettier sobre src/, vite.config.ts y los .md
yarn test         # Vitest
```

Para verificar el formato sin escribir archivos:

```bash
yarn format:check
```

`oxlint` (`.oxlintrc.json`) hace cumplir lo automatizable de los acuerdos:
`import/no-cycle`, un solo componente exportado por archivo
(`react/only-export-components`), tamaño de archivo (`max-lines`), `any` explícito,
sufijo `.test.ts`/`.test.tsx` de los tests y `label` asociado a su control
(`jsx-a11y/label-has-associated-control`). Los límites entre features
(`estructura.md` §6) no son automatizables con imports relativos: se revisan a
mano.

No desactives reglas de lint ni saltees tests para "dejar todo en verde". Si un
test falla por una causa preexistente, documentalo con evidencia.

## Estructura del proyecto

Estado actual del repositorio:

```text
src/
├── main.tsx           # providers globales (QueryClientProvider, BrowserRouter)
├── App.tsx            # composición raíz y rutas
├── index.css          # Tailwind (`@import 'tailwindcss'`)
├── lib/
│   └── api.ts         # instancia única de Axios
├── assets/            # assets del template (no se usan en la aplicación)
└── test/
    └── setup.ts       # setup de Vitest
```

La estructura **objetivo** del código nuevo es feature-first, con una carpeta por
capacidad:

```text
src/
├── app/               # composición global (layouts, guards, providers, routes)
├── features/<cap>/
│   ├── api/<cap>.service.ts   # peticiones HTTP y mapeo del contrato
│   ├── components/            # componentes presentacionales de la capacidad
│   ├── hooks/                 # queries y mutations de TanStack Query
│   ├── pages/                 # pantallas montadas por el router
│   ├── schemas/               # esquemas Zod
│   └── types.ts               # tipos del contrato con la API
├── components/        # UI compartida: ui/, forms/, feedback/
├── permissions/       # helpers de visibilidad por permisos (solo UI)
├── lib/api.ts         # instancia única de Axios (no es un service)
├── App.tsx
├── main.tsx
└── test/setup.ts
```

`app/`, `permissions/` y las subcarpetas de `components/` se crean cuando la
funcionalidad lo exige, no de forma preventiva. Los límites de cada carpeta y la
dirección permitida de dependencias están en `docs/agreements/estructura.md` y en
`AGENTS.md` §4.

## Flujo de trabajo

No se escribe código de producción sin un cambio de OpenSpec aprobado. Un cambio
es la unidad de trabajo:

1. **Explorar** los specs existentes (`openspec list --specs`) y la documentación
   de dominio del backend.
2. **Proponer** un cambio de OpenSpec (`openspec new change <nombre-en-kebab-case>`)
   con `proposal`, `specs`, `design` (cuando aplique) y `tasks`.
3. **Validar** la planificación: `openspec validate <nombre> --strict`.
4. **Implementar** solo con aprobación explícita, en la rama
   `feature/<change-name>` creada desde `develop`.
5. **Verificar** con `yarn typecheck && yarn lint && yarn test` (y
   `yarn format:check` cuando el cambio toca estilos o markup de forma
   significativa).
6. **Archivar** con `openspec archive <nombre>` cuando todas las tareas estén
   completas.

La planificación y la implementación nunca ocurren en el mismo turno: la propuesta
se presenta y se espera un pedido explícito de implementación.

El repositorio sigue **GitFlow**: `main` conserva las versiones estables y
`develop` integra el desarrollo; cada trabajo nace y vuelve por PR. Mientras el
proyecto siga en configuración inicial y solo exista `main`, los commits de
documentación y configuración van directo a `main`; al arrancar el primer cambio
de desarrollo se crea `develop`. Los commits siguen
[Conventional Commits](https://www.conventionalcommits.org/) y todo commit que
implementa un cambio lleva el footer `Refs: openspec/changes/<change-name>`.

El push, la creación del Pull Request y el merge son decisiones del equipo:
ninguna herramienta del repositorio las ejecuta por su cuenta.

> **CI:** el repositorio todavía no tiene workflows. Por ahora las verificaciones
> se ejecutan y se reportan a mano antes de cada commit.

## Despliegue

El frontend es una SPA estática: `yarn build` genera `dist/` con HTML, CSS, JS y
los assets de `public/`, y cualquier hosting estático puede servirlo.

### Requisitos del entorno

- **Node.js 24** y **Yarn 4.18.1** en el entorno de build.
- **API accesible desde el navegador del usuario.** El proxy de `/api` solo existe
  en desarrollo (`vite.config.ts` no se usa en el build); en producción definí
  `VITE_API_URL` con la URL pública del backend **incluyendo `/api` y antes de
  compilar**, porque las variables `VITE_*` se incrustan en el bundle.
- **Backend sirviendo bajo `/api`.** El frontend no agrega el prefijo: lo espera
  como parte de la URL base.
- **CORS habilitado en el backend.** Con front y back en dominios distintos, el
  navegador exige que el backend permita el origen del frontend.
- **Fallback de SPA:** todas las rutas del cliente (React Router) deben servirse
  con `index.html`, o un refresco sobre `/usuarios` devuelve 404.

### Pasos

```bash
# 1. Instalar exactamente lo que fija el lockfile y compilar
yarn install --immutable
VITE_API_URL=https://api.ejemplo.com yarn build

# 2. Publicar el contenido de dist/ en el hosting estático
```

### Heroku

El repositorio incluye un `Procfile` con el proceso web:

```text
web: yarn prod:start
```

`yarn prod:start` sirve `dist/` con `serve -s`: respeta el `$PORT` que inyecta
Heroku y resuelve el fallback de SPA. El buildpack de Node ejecuta
`yarn install --immutable` y `yarn build`, y Vite inyecta `VITE_API_URL` desde el
entorno del build.

1. Definí la config var **antes** del primer build:

   ```bash
   heroku config:set VITE_API_URL=https://<backend>.herokuapp.com/api
   ```

2. Desplegá el repositorio. El slug queda con esa URL incrustada y `serve` escucha
   en el puerto que Heroku asigna.

Dos advertencias que cuestan un deploy fallido:

- **Cambiar la config var no reconstruye el slug.** Heroku reinicia la dyno, pero
  `VITE_API_URL` ya está incrustada en el JavaScript compilado: para que el cambio
  llegue al bundle hay que desplegar de nuevo (o purgar el build cache).
- **CORS.** El backend no habilita CORS hoy (`src/main.ts` no llama a
  `enableCors()`). Con el front y el back en dominios distintos de Heroku, el
  navegador bloquea cada petición: la URL puede estar bien configurada y el
  frontend igual no funciona. Mientras eso no se resuelva del lado del backend, el
  frontend no puede consumir la API en producción.

Si no querés depender del build, la alternativa es inyectar la URL en tiempo de
ejecución (un `config.js` servido junto al `index.html`). Eso reemplaza a `serve`
por un servidor propio y **no está implementado**: hoy el mecanismo es el build.

### Otras plataformas PaaS (Render, Railway)

| Ajuste               | Valor                                              |
| -------------------- | -------------------------------------------------- |
| Build command        | `yarn install --immutable && yarn build`           |
| Start command        | `yarn prod:start` (o lo que declare el `Procfile`) |
| Variables de entorno | `VITE_API_URL` con la URL pública del backend      |
| Base de datos        | ninguna: el frontend no persiste datos             |

### Checklist antes de desplegar

- [ ] `yarn typecheck && yarn lint && yarn test` en verde.
- [ ] `yarn format:check` en verde si el cambio tocó estilos o markup.
- [ ] `VITE_API_URL` apunta a la API del entorno correcto y el slug se reconstruyó
      después del último cambio de esa variable.
- [ ] El backend permite el origen del frontend (CORS).
- [ ] Ningún secreto en variables `VITE_*` ni en el repositorio.
- [ ] El hosting sirve `index.html` para las rutas del cliente.

## Autores

Grupo 10 — Ingeniería y Calidad de Software 2026, Facultad Regional de Villa
María:

- Correa, Valentín
- Gómez Ferrero, Andrés
- Letona, Mateo
- Liendo Ortiz, Agustín
- Wursten Gill, Santiago
