## MODIFIED Requirements

### Requirement: Pantalla de registro

El sistema SHALL ofrecer en `/register` un formulario con nombre completo (marcado como opcional), email, contraseña y repetición de la contraseña que, al completarse con éxito, SHALL dejar a la persona ya dentro de la aplicación.

#### Scenario: Alta correcta desde la pantalla

- **WHEN** se rellenan email, contraseña y su repetición con valores válidos y se pulsa «Crear cuenta»
- **THEN** la persona pasa directamente a la lista de tareas del equipo, sin tener que iniciar sesión a continuación

#### Scenario: Aviso mientras se envía el formulario

- **WHEN** se ha pulsado «Crear cuenta» y la respuesta todavía no ha llegado
- **THEN** el botón queda deshabilitado y su texto pasa a «Creando cuenta…», de modo que no se puede enviar el formulario dos veces

#### Scenario: Las contraseñas escritas no coinciden

- **WHEN** se pulsa «Crear cuenta» con una repetición de contraseña distinta de la contraseña
- **THEN** aparece de inmediato «Las contraseñas no coinciden.» bajo el campo de repetición y no se crea ninguna cuenta

#### Scenario: El email ya está registrado

- **WHEN** se intenta crear una cuenta con un email que ya existe
- **THEN** bajo el campo de email aparece «Ese email ya está registrado. Inicia sesión en su lugar.» y la persona permanece en la pantalla de registro con lo que había escrito

#### Scenario: Ayuda sobre la contraseña

- **WHEN** se mira el campo de contraseña sin que haya ningún error en él
- **THEN** se lee la indicación «Entre 8 y 32 caracteres.»

#### Scenario: Camino hacia el inicio de sesión

- **WHEN** se está en la pantalla de registro y se pulsa el enlace «Inicia sesión»
- **THEN** se llega a la pantalla de inicio de sesión

### Requirement: Pantalla de inicio de sesión

El sistema SHALL ofrecer en `/login` un formulario de email y contraseña que, con credenciales correctas, SHALL llevar a la lista de tareas, y que SHALL explicar en un aviso visible por qué no se ha podido entrar.

#### Scenario: Entrada correcta

- **WHEN** se introducen el email y la contraseña de una cuenta existente y se pulsa «Entrar»
- **THEN** la persona pasa a la lista de tareas del equipo

#### Scenario: Credenciales incorrectas

- **WHEN** se pulsa «Entrar» con una contraseña equivocada o con un email sin cuenta
- **THEN** aparece en la parte superior del formulario el aviso «El email o la contraseña no son correctos.», sin señalar cuál de los dos campos falla

#### Scenario: El servidor no responde

- **WHEN** se intenta entrar y no hay forma de contactar con el servidor
- **THEN** aparece el aviso «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.» y la persona permanece en la pantalla de inicio de sesión

#### Scenario: Aviso mientras se envía el formulario

- **WHEN** se ha pulsado «Entrar» y la respuesta todavía no ha llegado
- **THEN** el botón queda deshabilitado y su texto pasa a «Entrando…»

#### Scenario: Camino hacia el registro

- **WHEN** se está en la pantalla de inicio de sesión y se pulsa el enlace «Crea una»
- **THEN** se llega a la pantalla de registro

### Requirement: Protección de las pantallas según el estado de sesión

El sistema SHALL impedir el acceso a las pantallas de la aplicación sin sesión iniciada y SHALL impedir el acceso a las pantallas de acceso con sesión ya iniciada, redirigiendo en ambos casos sin dejar rastro en el historial de navegación.

#### Scenario: Persona anónima pide una pantalla protegida

- **WHEN** alguien sin sesión abre `/tasks` o `/profile`
- **THEN** acaba en la pantalla de inicio de sesión, y el botón «atrás» del navegador no le devuelve a la pantalla protegida

#### Scenario: Persona con sesión pide una pantalla de acceso

- **WHEN** alguien con sesión iniciada abre `/login` o `/register`
- **THEN** acaba en la lista de tareas, porque volver a entrar o registrarse no tiene sentido teniendo la sesión abierta

#### Scenario: Dirección desconocida

- **WHEN** se abre cualquier dirección que no existe en la aplicación
- **THEN** se redirige a la lista de tareas, y desde ahí quien no tenga sesión acaba en la pantalla de inicio de sesión

### Requirement: Cierre de sesión desde la aplicación

El sistema SHALL ofrecer en el perfil una acción de cierre de sesión que SHALL devolver a la persona a la pantalla de inicio de sesión y SHALL dejar el navegador sin sesión recordada, aunque el servidor no llegue a confirmar la revocación.

#### Scenario: Cierre de sesión correcto

- **WHEN** se pulsa «Cerrar sesión» en el perfil
- **THEN** la persona vuelve a la pantalla de inicio de sesión, y ni recargar ni volver a abrir la aplicación la devuelve a la lista de tareas sin escribir de nuevo las credenciales

#### Scenario: Aviso mientras se cierra la sesión

- **WHEN** se ha pulsado «Cerrar sesión» y la operación aún no ha terminado
- **THEN** el botón queda deshabilitado y su texto pasa a «Cerrando sesión…»

#### Scenario: El servidor no responde al cerrar sesión

- **WHEN** se pulsa «Cerrar sesión» y el servidor está caído o rechaza la petición
- **THEN** la sesión se cierra igualmente en el navegador y la persona acaba en la pantalla de inicio de sesión, sin ningún mensaje de error
