# Convención de estructura y responsabilidades — Proyecto3_Front

> **Propósito:** servir como guía de organización del frontend para el equipo y para los agentes de IA. Define **dónde ubicar cada responsabilidad**, cómo colaboran las carpetas y qué límites deben respetarse. No busca imponer Clean Architecture, DDD ni casos de uso de backend dentro de React.
>
> **Alcance:** Proyecto 3, SPA React + Vite + TypeScript. Convención elaborada a partir de la estructura previamente acordada y contrastada con `Proyecto3_Front` (rama `main`, consultada el 27/10/2026). Los directorios de ejemplo **son una estructura objetivo**, no una afirmación de que ya existen.
>
> **Cambio expresamente acordado:** los archivos de acceso HTTP específicos de cada feature terminan en **`.service.ts`**, por ejemplo `features/planes/api/planes.service.ts` en lugar de `planes.api.ts`. **Se conserva el directorio `api/`** porque identifica la frontera de comunicación. `src/lib/api.ts` mantiene su nombre actual: contiene la instancia Axios compartida y **no** es un servicio de una feature.

---

## 1. Criterio principal de organización

El frontend se organiza **por funcionalidades (feature-first)**. Cada capacidad contiene sus propias pantallas, componentes, hooks, llamadas HTTP, esquemas y tipos, en lugar de distribuir todos los archivos del proyecto en carpetas globales de `pages`, `hooks` o `services`.

Principios de trabajo:

1. **Una responsabilidad por lugar:** componentes renderizan, hooks coordinan la interfaz con el estado del servidor, services se comunican con la API y schemas validan datos.
2. **Lo específico se queda en la feature.** Promover algo a `components/`, `lib/` o `app/` únicamente cuando sea verdaderamente transversal.
3. **Una sola SPA**, con navegación y estructuras visuales distintas según la experiencia de usuario. No dividir el frontend en aplicaciones separadas por rol.
4. **Sin capas artificiales:** no introducir `use-cases/`, `repositories/`, `domain/`, interfaces para todos los servicios, stores globales ni patrones CQRS por analogía con el backend.
5. **No inventar comportamiento:** el backend y las especificaciones del proyecto definen reglas y contratos. La interfaz guía la interacción, pero no sustituye validaciones ni autorización del servidor.

---

## 2. Árbol de carpetas de referencia

```text
src/
├── app/                                  # Composición de la aplicación
│   ├── layouts/                          # Estructuras visuales por experiencia
│   │   ├── AlumnoLayout.tsx
│   │   ├── StaffLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── guards/                           # Protección de navegación (solo UI)
│   │   └── ProtectedRoute.tsx
│   ├── providers/                        # Contextos/proveedores transversales si hacen falta
│   └── routes/                           # Definición y composición de rutas
│       └── index.tsx
│
├── features/                             # Capacidades independientes de la interfaz
│   ├── auth/
│   ├── alumnos/
│   ├── profesores/
│   ├── planes/
│   ├── entrenamientos/
│   ├── seguimiento/
│   └── catalogo/                         # Organizar subcapacidades si crece
│
├── components/                           # UI compartida, sin conocimiento de una feature
│   ├── ui/                               # Botones, inputs, modales genéricos, etc.
│   ├── forms/                            # Primitivas compartidas de formularios
│   └── feedback/                         # Carga, error, vacío, confirmaciones
│
├── lib/                                  # Clientes/configuración reutilizables
│   └── api.ts                            # Instancia Axios compartida (ya existente)
│
├── permissions/                          # Si se necesita visibilidad reutilizable por permisos
│   ├── permissions.ts
│   └── Can.tsx
│
├── test/                                 # Setup y utilidades comunes de pruebas
│   └── setup.ts
├── App.tsx                               # Composición raíz
├── main.tsx                              # Montaje y providers globales
└── index.css                             # Tailwind y estilos globales mínimos
```

**Este árbol es orientativo, no una tarea de crear carpetas vacías.** Actualmente `App.tsx` compone rutas y `main.tsx` configura `QueryClientProvider` y `BrowserRouter`: conservarlos mientras funcionen. Extraer `app/routes/`, `app/providers/` o `lib/query-client.ts` solo cuando aumente la complejidad y mediante el cambio aprobado correspondiente. Crear layouts, guards y permisos únicamente cuando la funcionalidad lo necesite.

### 2.1 Estructura interna de una feature

```text
features/planes/
├── api/
│   └── planes.service.ts                 # Peticiones HTTP y adaptación de respuestas
├── components/
│   ├── PlanCard.tsx
│   └── PlanForm.tsx
├── hooks/
│   ├── usePlanes.ts
│   └── useCreatePlan.ts
├── pages/
│   ├── PlanesPage.tsx
│   └── PlanDetallePage.tsx
├── schemas/
│   └── plan.schema.ts
└── types.ts
```

Los nombres son ejemplos, no funcionalidades implementadas ni contratos confirmados. Si una feature solo necesita un archivo, evitar abrir todas las subcarpetas preventivamente. Si crece, subdividir por flujo o subcapacidad sin romper los límites de responsabilidad.

---

## 3. Responsabilidades por carpeta

| Ubicación                          | Sí debe contener                                                                                 | No debe contener                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `app/`                             | Composición global, rutas, providers, layouts, guards y estructura de navegación                 | CRUD, peticiones específicas de una capacidad, lógica de pantallas concretas       |
| `app/layouts/`                     | Header, sidebar, navegación inferior, contenedor `<Outlet />`, estructura reutilizable           | Consultas HTTP, lógica de planes o entrenamientos                                  |
| `app/guards/`                      | Redirecciones y control de acceso visual a rutas según el estado conocido                        | Reglas de autorización definitivas ni decisiones que correspondan al backend       |
| `features/<capacidad>/pages/`      | Pantallas conectadas al router; coordinación de componentes y hooks                              | Axios/fetch directo, lógica de persistencia                                        |
| `features/<capacidad>/components/` | Componentes específicos de la feature, principalmente de presentación                            | Acceso HTTP directo; dependencias con features ajenas sin contrato claro           |
| `features/<capacidad>/hooks/`      | Hooks propios, TanStack `useQuery`/`useMutation`, claves de caché, estados y acciones para la UI | Llamadas Axios sueltas o reglas de negocio autoritativas                           |
| `features/<capacidad>/api/`        | `*.service.ts`, construcción de solicitudes HTTP, mapeo/normalización del contrato de API        | JSX, hooks React, `useQuery`, navegación, mensajes visuales, estado de formularios |
| `features/<capacidad>/schemas/`    | Zod para entradas/formularios y validación o adaptación de datos cuando corresponda              | Requests HTTP, componentes                                                         |
| `features/<capacidad>/types.ts`    | Tipos e interfaces de datos de la feature (request/response/modelos UI)                          | Implementaciones HTTP o lógica de UI                                               |
| `components/`                      | UI genérica reutilizable entre features                                                          | Reglas y dependencias específicas de una capacidad                                 |
| `lib/`                             | Instancia Axios global y utilidades de infraestructura frontend compartidas                      | Un `planes.service.ts` o servicios propios de otras capacidades                    |
| `permissions/`                     | Helpers y componentes reutilizables para visibilidad/permisos en UI                              | Autorización real del servidor o lógica específica sin reutilización               |

### 3.1 Regla explícita para `*.service.ts`

**`*.service.ts` significa "cliente del backend para una capacidad"**, no un servicio de aplicación al estilo NestJS. Es una convención de nombre solicitada para el frontend, sin implicar nuevas capas arquitectónicas.

- Ejemplos válidos: `planes.service.ts`, `entrenamientos.service.ts`, `alumnos.service.ts`.
- Ubicación preferida: `features/<capacidad>/api/<capacidad>.service.ts`.
- La carpeta **permanece `api/`**. No crear paralelamente `services/` para las mismas llamadas.
- Las funciones expuestas por el service deben ser explícitas: `getPlans`, `getPlanById`, `createPlan`, etc., usando los términos aprobados para el proyecto.
- El service utiliza la instancia `api` exportada desde `src/lib/api.ts`; **no crea una nueva instancia Axios por feature** salvo decisión aprobada.
- No administra caché ni invalidaciones de TanStack Query; eso corresponde a `hooks/`.
- No muestra alertas, no navega y no administra el estado del formulario.
- Devuelve valores y errores tipados de acuerdo con el contrato real. No inventar endpoints ni formas de respuesta.

**Ejemplo ilustrativo** (la ruta y los DTO son supuestos, _no_ un contrato confirmado):

```ts
// features/planes/api/planes.service.ts
import { api } from '../../../lib/api';
import type { PlanResponse } from '../types';

export async function getPlans(): Promise<PlanResponse[]> {
  const { data } = await api.get<PlanResponse[]>('/planes');
  return data;
}
```

> Al implementar, adaptar `'/planes'` y `PlanResponse` al endpoint realmente disponible y aprobado. Nunca convertir este ejemplo en un contrato supuesto.

---

## 4. Flujo de datos y comunicación

**Lectura:**

```text
Ruta -> Page -> Hook (useQuery) -> Feature Service (*.service.ts)
                                   -> src/lib/api.ts (Axios)
                                   -> API de NestJS
```

**Escritura:**

```text
Formulario -> Schema Zod + React Hook Form
           -> Hook (useMutation) -> Feature Service (*.service.ts)
                                 -> src/lib/api.ts -> API de NestJS
           -> invalidación de queries afectadas en onSuccess
           -> actualización de la interfaz
```

Reglas:

1. Toda petición de una feature pasa por su `*.service.ts` y la instancia central `src/lib/api.ts`; no llamar Axios/fetch directamente desde páginas, layouts o componentes.
2. TanStack Query es la fuente de estado remoto: los hooks definen claves estables, manejan carga, error, éxito e invalidación. No duplicar respuestas remotas en `useState` ni en contextos globales.
3. Estado local (`useState`, `useReducer`): modales, filtros locales, pestañas, pasos de formulario. Estado remoto: TanStack Query.
4. `pages/` utiliza hooks y compone componentes; un componente de presentación recibe datos y callbacks por props cuando sea posible.
5. No ocultar errores con `catch` vacíos. Distinguir respuestas de validación, falta de autenticación/autorización y fallas de servidor mediante los contratos existentes.
6. No inventar comportamientos optimistas; invalidar o actualizar la caché según el diseño aprobado.

### 4.1 Reglas y validaciones

- `schemas/` centraliza validaciones de formularios mediante Zod y `zodResolver` de React Hook Form.
- Los DTO/tipos frontend reflejan contratos de transporte: **no son entidades de dominio del backend**.
- Reglas como permisos, vigencia de planes, integridad de entrenamientos y restricciones transaccionales se validan de forma autoritativa en NestJS. La UI puede anticipar mensajes y deshabilitar acciones para orientar al usuario, pero no sustituye al servidor.
- Un service no convierte fallos del backend en "éxito" ni decide una regla del gimnasio por sí mismo.

---

## 5. Navegación, layouts y roles

El frontend será una **única aplicación React**. Se prevén dos experiencias principales, además del acceso público/autenticación:

- **`AlumnoLayout`**: navegación principalmente móvil (por ejemplo, barra inferior), adecuada para consultar planes y registrar entrenamientos.
- **`StaffLayout`**: navegación principalmente de escritorio (por ejemplo, sidebar), compartida por las interfaces de profesor y administrador cuando corresponda.
- **`AuthLayout`**: estructura simple para pantallas de acceso, si se requiere.

Los layouts son **contenedores de navegación**, no features ni responsables de obtener datos de cada pantalla. React Router determina qué página aparece en el `<Outlet />` correspondiente. La selección de rutas visibles y la protección de navegación se apoyan en el estado de autenticación y los permisos disponibles, pero la **API siempre valida la autorización real**.

No imponer dos frontends, no crear un layout separado por cada página y no duplicar el mismo menú en múltiples componentes de feature. No dar por implementada la autenticación ni asumir un esquema de permisos antes de aprobarlo.

### 5.1 Visibilidad y acceso según permisos

La interfaz deberá considerar los permisos correspondientes en **tres niveles complementarios**, de acuerdo con el mecanismo de autenticación y autorización que apruebe el equipo:

1. **Navegación:** los menús, enlaces y opciones de navegación solo mostrarán las funcionalidades a las que el usuario tenga permiso de acceder.
2. **Rutas y páginas:** el acceso a una página deberá comprobar los permisos requeridos, incluso cuando el usuario intente ingresar directamente mediante su URL. Los guards de React Router podrán redirigir o mostrar una pantalla de acceso denegado, según el comportamiento especificado.
3. **Componentes y acciones:** dentro de cada página, los controles, secciones y acciones deberán mostrarse, ocultarse o deshabilitarse según los permisos necesarios para visualizarlos y utilizarlos. La decisión entre ocultar o deshabilitar dependerá de la experiencia definida para cada funcionalidad.

Cuando se necesite reutilizar las comprobaciones de visibilidad, podrán centralizarse en `permissions/` mediante helpers o componentes como `Can.tsx`, sin duplicar reglas por pantalla. La información de permisos deberá provenir del mecanismo de autenticación y los contratos aprobados, no de suposiciones sobre roles o nombres de permisos. Mientras esa información se esté cargando, no se deben presentar acciones protegidas como disponibles.

**Estos controles son únicamente de experiencia de usuario.** El backend debe verificar la identidad y autorización de cada operación y recurso, incluso si la interfaz oculta la opción correspondiente; conocer o escribir una URL no habilita el acceso a datos protegidos.

### 5.2 Diseño responsive por experiencia de usuario

**Todas las pantallas deberán ser responsive** y conservar su funcionalidad y legibilidad tanto en dispositivos móviles como en pantallas de escritorio. El diseño priorizará la experiencia más habitual para cada perfil, sin excluir los demás tamaños de pantalla:

- **Alumno:** prioridad _mobile-first_, especialmente en navegación, consulta de planes y registro de entrenamientos.
- **Profesor y administrador:** prioridad en la experiencia de escritorio, especialmente en formularios, tablas, gestión y seguimiento, manteniendo una versión utilizable en dispositivos móviles.
- **Pantallas compartidas entre perfiles:** especial cuidado en ambas experiencias, sin sacrificar operaciones, claridad visual ni acceso a la información según el tamaño de pantalla.

Las decisiones de layout, distribución de información y componentes adaptativos deberán responder a estas prioridades. Al implementar o revisar una pantalla, se deberán comprobar sus estados e interacciones relevantes en vistas móviles y de escritorio; no alcanza con ajustar únicamente el ancho de los contenedores.

---

## 6. Dependencias permitidas entre carpetas

```text
app/routes ----> features/*/pages ----> features/*/hooks
    |                    |                       |
    v                    v                       v
app/layouts        components/*             features/*/api/*.service.ts
                                             |
                                             v
                                         lib/api.ts
```

- `app/` compone rutas y componentes **públicos** de las features; no necesita conocer sus detalles HTTP.
- Una feature puede reutilizar `components/` y `lib/` sin convertirlos en dependientes del negocio.
- Evitar imports profundos entre features (`features/planes/...` importando archivos internos de `features/alumnos/...`). Si existe integración legítima, exponer una API pública mínima de la feature o mover la pieza a un lugar compartido con responsabilidad real; justificar en el diseño.
- No crear `index.ts` en todas las carpetas por obligación. Los _barrel exports_ se agregan cuando simplifican un límite público.
- No introducir dependencias circulares ni acoplar features a layouts particulares.

---

## 7. Nomenclatura

| Tipo                          | Convención                                                  | Ejemplo                                 |
| ----------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| Feature                       | kebab-case o término ya acordado en el repositorio          | `planes/`, `categorias-ejercicio/`      |
| Página                        | PascalCase + `Page.tsx`                                     | `PlanesPage.tsx`                        |
| Layout                        | PascalCase + `Layout.tsx`                                   | `StaffLayout.tsx`                       |
| Componente                    | PascalCase                                                  | `PlanCard.tsx`                          |
| Hook                          | `use` + PascalCase                                          | `usePlanes.ts`, `useCreatePlan.ts`      |
| Servicio HTTP por feature     | **`<capacidad>.service.ts`**                                | **`planes.service.ts`**                 |
| Schema                        | nombre descriptivo + `.schema.ts`                           | `plan.schema.ts`                        |
| Tipos                         | `types.ts` o archivo de tipos concreto si crecen            | `types.ts`                              |
| Prueba unitaria/de componente | junto al archivo probado, mismo nombre base + `.test.ts(x)` | `PlanForm.test.tsx` para `PlanForm.tsx` |

Los ejemplos usan terminología del proyecto. Mantener los términos de dominio y nombres ya fijados por el equipo; **no renombrar todo el repositorio para adecuarlo a un ejemplo**. En imports TypeScript de este proyecto ESM con bundler, seguir la convención de `AGENTS.md`: imports relativos sin `.js`.

**Excepción importante:** `src/lib/api.ts` **no** se renombra a `api.service.ts`; configura el cliente Axios común. Renombrarlo solo porque contiene `.api` confundiría una infraestructura compartida con un service funcional.

---

## 8. Pruebas y calidad enfocadas en responsabilidades

- **`*.service.ts`**: comprobar métodos, payloads, normalización y propagación de errores en la frontera HTTP, con mocks de la instancia Axios; no probar JSX allí.
- **Hooks**: comprobar que exponen estado remoto e invalidan caché correctamente cuando corresponda; configurar un `QueryClientProvider` aislado para pruebas.
- **Componentes**: verificar interacción, semántica, carga, errores y estados vacíos con Vitest + Testing Library, preferentemente por roles y etiquetas accesibles.
- **Páginas**: comprobar la integración de la UI con rutas y hooks según los escenarios aprobados, no acoplar pruebas a clases de Tailwind ni a detalles internos.
- Antes de cerrar un cambio implementado: `yarn typecheck`, `yarn lint`, `yarn test` y, si corresponde, `yarn format:check`, sin afirmar un resultado que no se ejecutó.

### 8.1 Organización y correspondencia de las pruebas

- **Correspondencia por archivo en pruebas unitarias y de componentes:** cuando se pruebe directamente un archivo de implementación, su prueba tendrá un archivo propio ubicado junto a él y con el mismo nombre base (`PlanForm.tsx` → `PlanForm.test.tsx`; `planes.service.ts` → `planes.service.test.ts`). No agrupar pruebas unitarias de múltiples archivos independientes en un único archivo organizado por historia de usuario.
- **Identificación de casos de prueba:** los títulos de `describe`/`it`/`test` deberán expresar claramente el comportamiento verificado. Si existe un caso de prueba formal documentado, utilizar su nombre o identificador para permitir la trazabilidad entre caso y test, sin sacrificar claridad.
- **Pruebas de integración y extremo a extremo:** podrán agruparse por flujo o escenario, dado que verifican la colaboración entre varios componentes; no están sujetas a una relación uno a uno con archivos de implementación.
- **Alcance:** esta convención no obliga a crear pruebas vacías para todos los archivos. Se aplica a las funcionalidades que deban probarse según los requisitos, riesgos y criterios de testing vigentes en `AGENTS.md`.

No añadir dependencias o herramientas de pruebas distintas de las ya aprobadas solo para cumplir con el árbol sugerido.

---

## 9. Reglas para agentes de IA y modificaciones futuras

1. **Leer `AGENTS.md` antes de planificar o implementar** y respetar sus reglas operativas, especialmente OpenSpec/SDD, pruebas, permisos para commits/push y seguridad.
2. **Consultar la especificación vigente antes de asumir rutas o endpoints.** Si la API del backend todavía no expone algo, documentar la dependencia; no inventar payloads ni datos fingiendo que son el contrato real.
3. **Ubicar la feature primero** y elegir la carpeta por responsabilidad: `page`, `component`, `hook`, `api/*.service.ts`, `schema` o `types`.
4. **No bypass del flujo HTTP:** `Page/Component -> Hook -> Feature Service -> lib/api.ts` es la convención base.
5. **No crear archivos vacíos ni reorganizaciones preventivas.** Toda extracción de rutas, provider, componente compartido o feature depende de una necesidad comprobable y de un cambio aprobado cuando altere código.
6. **No traducir el frontend a la arquitectura del backend.** No introducir Use Cases/Repositories/Ports en React por simetría estética.
7. **No mezclar reglas de autorización de servidor con visibilidad de UI.** La interfaz no es una frontera de seguridad.
8. **No cambiar accidentalmente una convención global.** Si se acuerda modificar el sufijo de los servicios HTTP, actualizar en la misma decisión los ejemplos y la sección de estructura de `AGENTS.md`.
9. **Respetar el alcance del trabajo.** No hacer limpieza masiva, reinstalar paquetes, reordenar todo el código ni crear funcionalidades adicionales sin aprobación.
10. **Reportar con evidencia:** archivos afectados, reglas seguidas, pruebas ejecutadas y bloqueos reales. No afirmar que existen directorios o funcionalidades que solo están planificados.

### 9.1 Jerarquía de fuentes

1. Solicitud explícita del usuario y alcance aprobado por el equipo.
2. Cambio OpenSpec y especificaciones vigentes, para el comportamiento que se implementará.
3. `AGENTS.md` del frontend, código real y contratos disponibles en la rama de trabajo.
4. Requisitos y documentación de dominio del backend aceptados por el equipo.
5. Esta convención de organización, una vez aprobada y sincronizada con `AGENTS.md`.

Ante discrepancias, **se informa y se resuelve la fuente antes de implementar**, en lugar de elegir por intuición una instrucción conveniente.

---

## 10. Lista de verificación para una nueva funcionalidad

- [ ] Identificar la capacidad y la especificación aprobada.
- [ ] Determinar la(s) ruta(s) y si corresponde un layout existente.
- [ ] Definir la pantalla en `pages/` y los componentes propios en `components/`.
- [ ] Definir el contrato tipado y esquemas en `types.ts`/`schemas/` si son necesarios.
- [ ] Centralizar los llamados en `api/<capacidad>.service.ts`.
- [ ] Exponer lecturas/mutaciones mediante hooks de TanStack Query.
- [ ] Resolver carga, vacío, error y permisos de visibilidad en navegación, rutas y componentes, según corresponda.
- [ ] Comprobar que la autorización real y las reglas del negocio siguen en el backend.
- [ ] Verificar la experiencia responsive en móvil y escritorio, aplicando la prioridad del perfil correspondiente.
- [ ] Añadir/verificar pruebas con correspondencia entre archivo probado y test unitario, y trazabilidad con casos de prueba formales cuando existan; ejecutar typecheck y lint y reportar resultados.
- [ ] Evitar carpetas, abstracciones o dependencias añadidas sin necesidad.
