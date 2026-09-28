## MODIFIED Requirements

### Requirement: Pantalla de registro

La interfaz SHALL ofrecer en `/register` un formulario con nombre completo marcado como opcional, email, contraseña y repetición de la contraseña, indicando que la contraseña debe tener entre 8 y 32 caracteres, y SHALL dejar a la persona dentro de la aplicación al completarlo con éxito.

#### Scenario: Alta correcta

- **WHEN** se rellena el formulario con datos válidos y se pulsa "Crear cuenta"
- **THEN** el botón pasa a "Creando cuenta…" y queda deshabilitado mientras se envía, y al terminar se muestra la lista de tareas del equipo con la sesión ya iniciada

#### Scenario: Las contraseñas no coinciden

- **WHEN** se pulsa "Crear cuenta" con dos contraseñas distintas
- **THEN** aparece "Las contraseñas no coinciden." bajo el campo de repetición, sin llegar a enviar nada al servidor y sin perder lo ya escrito

#### Scenario: Nombre vacío

- **WHEN** se completa el registro dejando el nombre en blanco
- **THEN** la cuenta se crea igualmente, porque el campo está marcado como opcional

### Requirement: Pantalla de inicio de sesión

La interfaz SHALL ofrecer en `/login` un formulario de email y contraseña que abra sesión, y SHALL enlazar ambas pantallas de acceso entre sí para poder pasar de una a otra.

#### Scenario: Entrada correcta

- **WHEN** se introducen unas credenciales válidas y se pulsa "Entrar"
- **THEN** el botón pasa a "Entrando…" mientras se envía y después se muestra la lista de tareas del equipo

#### Scenario: Credenciales incorrectas

- **WHEN** se pulsa "Entrar" con un email o una contraseña que no son correctos
- **THEN** se muestra el aviso "El email o la contraseña no son correctos.", se permanece en la pantalla de inicio de sesión y el botón vuelve a estar disponible

#### Scenario: Ir a crear cuenta

- **WHEN** se pulsa el enlace "Crea una" desde el inicio de sesión
- **THEN** se muestra la pantalla de registro

### Requirement: Acceso a las pantallas según el estado de la sesión

La interfaz SHALL reservar la lista de tareas y el perfil a quien tenga sesión abierta y las pantallas de acceso a quien no la tenga, redirigiendo en ambos sentidos y llevando cualquier dirección desconocida al lugar que corresponda a su estado.

#### Scenario: Perfil sin sesión

- **WHEN** alguien sin sesión abre `/profile`
- **THEN** se le lleva a `/login`, sin dejar rastro de la pantalla anterior en el historial

#### Scenario: Acceso con sesión ya abierta

- **WHEN** alguien con sesión abierta abre `/login` o `/register`
- **THEN** se le lleva a la lista de tareas del equipo

#### Scenario: Dirección desconocida

- **WHEN** se abre una dirección que no existe en la aplicación
- **THEN** se le lleva a la lista de tareas del equipo si tiene sesión, y a `/login` si no la tiene

## ADDED Requirements

### Requirement: Acceso al perfil desde el resto de la aplicación

Ahora que la pantalla de entrada deja de ser el perfil, la interfaz SHALL ofrecer desde la lista de tareas una forma visible de llegar al perfil, para que la cuenta y el cierre de sesión sigan estando a un gesto de distancia.

#### Scenario: Llegar al perfil

- **WHEN** una persona con sesión abierta está en la lista de tareas
- **THEN** dispone de una forma visible de abrir su perfil, desde donde puede cerrar sesión

#### Scenario: Volver de vuelta

- **WHEN** está en el perfil y no cierra sesión
- **THEN** dispone de una forma de volver a la lista de tareas
