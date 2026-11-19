# Spec Delta

## Purpose

Recuperar la sesión al abrir HercFit y retirar el acceso de la sesión anterior cuando termina.

## ADDED Requirements

### Requirement: Obtener la sesión concedida al iniciar sesión

La aplicación SHALL utilizar la identidad y los permisos efectivos de la sesión devuelta por el backend cuando se acepta el inicio de sesión. Trazabilidad: HU 14.

#### Scenario: Inicio de sesión aceptado

- **GIVEN** que el usuario proporciona su email y contraseña
- **WHEN** el backend acepta el inicio de sesión
- **THEN** la aplicación reconoce al usuario con la identidad, el rol y los permisos efectivos devueltos

### Requirement: Recuperar la sesión al abrir HercFit

La aplicación SHALL distinguir una consulta pendiente, una sesión recuperada, la ausencia de sesión y un error de consulta. Trazabilidad: HU 14.

#### Scenario: Consulta pendiente

- **GIVEN** que se abre o recarga la aplicación
- **WHEN** aún se está comprobando la sesión
- **THEN** las acciones que dependen de permisos siguen indisponibles
- **AND** no se trata la espera como una sesión ausente

#### Scenario: Sesión vigente

- **GIVEN** que el usuario tiene una sesión recuperable
- **WHEN** la comprobación devuelve la sesión otorgada
- **THEN** la aplicación reconoce al usuario y usa los permisos informados por el backend

#### Scenario: Sin sesión

- **GIVEN** que se está comprobando la sesión
- **WHEN** el backend responde definitivamente con 401
- **THEN** la aplicación queda sin sesión activa

#### Scenario: Consulta fallida

- **GIVEN** que se está comprobando la sesión
- **WHEN** la consulta falla por una causa distinta de un 401 definitivo
- **THEN** la interfaz puede informar un error de comprobación y las acciones protegidas siguen indisponibles

### Requirement: Retirar el acceso cuando termina la sesión

La aplicación SHALL retirar los permisos y los datos de la sesión anterior cuando falle la renovación según el flujo de sesión vigente. Trazabilidad: HU 14.

#### Scenario: Fin de sesión

- **GIVEN** que hay una sesión activa con datos consultados
- **WHEN** falla la renovación
- **THEN** la aplicación queda sin sesión activa
- **AND** los datos y permisos de la sesión anterior dejan de estar disponibles
