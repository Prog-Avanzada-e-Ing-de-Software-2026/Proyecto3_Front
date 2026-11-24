# Spec Delta

## ADDED Requirements

### Requirement: Navegación adaptable por experiencia

La aplicación SHALL presentar los destinos habilitados del perfil y señalar el destino activo. Referencias de navegación: HU 3–5, 8–13, 22 y 25–29, más HU 2 dentro de Catálogo.

#### Scenario: Navegación de escritorio

- **GIVEN** una sesión confirmada con destinos habilitados
- **WHEN** la persona abre la aplicación en escritorio
- **THEN** encuentra sus destinos en una barra lateral

#### Scenario: Navegación móvil

- **GIVEN** una sesión confirmada con destinos habilitados
- **WHEN** la persona abre la aplicación en móvil
- **THEN** encuentra los destinos en una barra inferior tanto si es alumno como si es profesor o administrador

### Requirement: Acceso coherente a los destinos

La aplicación SHALL usar el rol de la sesión para mostrar los destinos exclusivos en la navegación y controlar su acceso directo. Trazabilidad: HU 14.

#### Scenario: Comprobación de sesión pendiente o fallida

- **GIVEN** una visita a un destino privado
- **WHEN** la comprobación sigue pendiente o falla
- **THEN** se informa la espera o el error correspondiente y los destinos protegidos permanecen indisponibles

#### Scenario: Acceso directo sin sesión

- **GIVEN** una visita por URL directa a un destino privado
- **WHEN** la comprobación termina sin una sesión activa
- **THEN** la aplicación redirige a `/login`, una página pública

#### Scenario: Acceso directo con un rol distinto

- **GIVEN** una sesión confirmada y un destino exclusivo de otro rol
- **WHEN** la persona abre la URL, aunque su rol comparta permisos con el rol admitido
- **THEN** la aplicación redirige al panel principal (`/`)

#### Scenario: Acceso a un destino común

- **GIVEN** una sesión confirmada
- **WHEN** la persona abre el panel principal o Mi cuenta
- **THEN** la aplicación muestra esa página

#### Scenario: Sesión sin destinos habilitados

- **GIVEN** una sesión confirmada
- **WHEN** la persona abre el panel principal y carece de destinos de negocio habilitados
- **THEN** se muestra un estado que informa que no hay secciones disponibles

### Requirement: Destinos preparados para sus pantallas

La aplicación SHALL identificar cada destino habilitado y mostrar un estado informativo si su pantalla de negocio está pendiente.

#### Scenario: Selección de una sección pendiente

- **GIVEN** que la navegación presenta un destino habilitado cuya pantalla de negocio está pendiente
- **WHEN** la persona selecciona ese destino
- **THEN** ve el título de la sección y un aviso de disponibilidad pendiente

### Requirement: Consultar los datos de mi cuenta

La aplicación SHALL ofrecer a toda persona con sesión activa un acceso a Mi cuenta desde el encabezado y mostrar únicamente su correo y rol en modo de lectura. Trazabilidad de los datos de sesión: HU 14.

#### Scenario: Consultar Mi cuenta

- **GIVEN** una sesión activa, incluso si carece de permisos adicionales
- **WHEN** la persona abre Mi cuenta desde el encabezado o mediante `/mi-cuenta`
- **THEN** ve el correo y el rol de su sesión en modo de lectura
