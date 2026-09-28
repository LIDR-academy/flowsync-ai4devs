# auth Specification

## Purpose

Permite que una persona cree su cuenta en FlowSync, entre con su email y contraseña, mantenga la sesión abierta entre visitas y la cierre cuando quiera. Es la puerta de entrada al producto: sin sesión válida no se accede a ningún dato de cuenta.
## Requirements
### Requirement: Registro de una cuenta nueva

El sistema SHALL permitir crear una cuenta enviando `POST /api/v1/auth/signup` con `fullName`, `email`, `password` y `passwordConfirmation`, y SHALL devolver en la misma respuesta los datos de la cuenta creada junto con un token de acceso ya utilizable, de modo que registrarse deje a la persona con la sesión iniciada.

#### Scenario: Registro correcto

- **WHEN** se envía `POST /api/v1/auth/signup` con `{"fullName": "Ada Lovelace", "email": "ada@example.com", "password": "secreto123", "passwordConfirmation": "secreto123"}` y ese email no existe todavía
- **THEN** la respuesta es `200` con `{"data": {"user": {...}, "token": "..."}}`, donde `user` trae `id`, `fullName`, `email`, `initials`, `createdAt` y `updatedAt`, y el `token` sirve inmediatamente para autenticarse

#### Scenario: Cuenta sin nombre

- **WHEN** se envía un registro válido con `"fullName": null`
- **THEN** la cuenta se crea igualmente y la respuesta devuelve `"fullName": null`

### Requirement: Validación de los datos de registro

El sistema SHALL rechazar un registro cuyo email no tenga formato válido o supere 254 caracteres, cuya contraseña no mida entre 8 y 32 caracteres, o cuya confirmación no coincida con la contraseña, respondiendo `422` con la lista de errores desglosada por campo y sin crear la cuenta.

#### Scenario: Contraseña demasiado corta

- **WHEN** se envía un registro con `"password": "corta"` y la misma confirmación
- **THEN** la respuesta es `422` con un error cuyo `field` es `password` y cuya `rule` es `minLength`, y no se crea ninguna cuenta

#### Scenario: La confirmación no coincide

- **WHEN** se envía un registro con `"password": "secreto123"` y `"passwordConfirmation": "secreto456"`
- **THEN** la respuesta es `422` con un error cuyo `field` es `passwordConfirmation` y cuya `rule` es `sameAs`, y no se crea ninguna cuenta

#### Scenario: Email con formato inválido

- **WHEN** se envía un registro con `"email": "ada-arroba-example"`
- **THEN** la respuesta es `422` con un error cuyo `field` es `email` y cuya `rule` es `email`

### Requirement: Un email, una sola cuenta

El sistema SHALL impedir que existan dos cuentas con el mismo email, rechazando el segundo registro con `422` en lugar de sobrescribir o duplicar la cuenta existente.

#### Scenario: Email ya registrado

- **WHEN** se envía un registro con un email que ya pertenece a otra cuenta
- **THEN** la respuesta es `422` con un error cuyo `field` es `email` y cuya `rule` es `database.unique`, y la cuenta existente queda intacta

### Requirement: Inicio de sesión con email y contraseña

El sistema SHALL emitir un token de acceso nuevo al recibir `POST /api/v1/auth/login` con un email y una contraseña que correspondan a una cuenta existente, y SHALL devolver también los datos de esa cuenta.

#### Scenario: Credenciales correctas

- **WHEN** se envía `POST /api/v1/auth/login` con el email y la contraseña de una cuenta existente
- **THEN** la respuesta es `200` con `{"data": {"user": {...}, "token": "..."}}` y el token devuelto autentica peticiones posteriores

#### Scenario: Contraseña incorrecta

- **WHEN** se envía un login con un email existente pero una contraseña que no es la suya
- **THEN** la respuesta es `400` y no se emite ningún token

#### Scenario: Email que no pertenece a ninguna cuenta

- **WHEN** se envía un login con un email que no está registrado
- **THEN** la respuesta es `400`, indistinguible de la de una contraseña incorrecta, de modo que no se revela si ese email tiene cuenta

#### Scenario: Email mal formado

- **WHEN** se envía un login con `"email": "ada-arroba-example"`
- **THEN** la respuesta es `422` con un error sobre el campo `email`, sin llegar a comprobar credenciales

### Requirement: Consulta del perfil de la sesión activa

El sistema SHALL devolver los datos de la cuenta asociada al token presentado cuando se solicite `GET /api/v1/account/profile`, y SHALL usar esta ruta como forma de comprobar que un token sigue siendo válido.

#### Scenario: Perfil con token válido

- **WHEN** se solicita `GET /api/v1/account/profile` con la cabecera `Authorization: Bearer <token>` de una sesión activa
- **THEN** la respuesta es `200` con `{"data": {"id": ..., "fullName": ..., "email": ..., "initials": ..., "createdAt": ..., "updatedAt": ...}}`

### Requirement: Cierre de sesión

El sistema SHALL revocar el token presentado al recibir `POST /api/v1/account/logout`, de forma que ese token deje de servir a partir de ese momento, sin afectar a los demás tokens de la misma cuenta.

#### Scenario: Cierre de sesión correcto

- **WHEN** se envía `POST /api/v1/account/logout` con un token válido
- **THEN** la respuesta es `200` con `{"message": "Logged out successfully"}`

#### Scenario: El token revocado ya no vale

- **WHEN** se vuelve a usar un token con el que ya se cerró sesión
- **THEN** la respuesta es `401`

#### Scenario: Las demás sesiones siguen abiertas

- **WHEN** una cuenta tiene dos sesiones abiertas y se cierra una de ellas
- **THEN** el token de la otra sesión sigue autenticando con normalidad

### Requirement: Protección de los recursos de cuenta

El sistema SHALL exigir un token de acceso válido en todas las rutas bajo `/api/v1/account`, respondiendo `401` cuando falte, esté mal formado o ya no sea válido, sin ejecutar la acción solicitada.

#### Scenario: Petición sin credenciales

- **WHEN** se solicita `GET /api/v1/account/profile` sin cabecera `Authorization`
- **THEN** la respuesta es `401` y no se devuelve ningún dato de cuenta

#### Scenario: Token inventado

- **WHEN** se solicita cualquier ruta de `/api/v1/account` con un token que no corresponde a ninguna sesión
- **THEN** la respuesta es `401`

#### Scenario: El registro y el login son públicos

- **WHEN** se envía `POST /api/v1/auth/signup` o `POST /api/v1/auth/login` sin cabecera `Authorization`
- **THEN** la petición se procesa con normalidad

### Requirement: Forma de las respuestas de la API

El sistema SHALL responder siempre en JSON, envolver los datos de cuenta en una clave `data`, y no exponer nunca la contraseña ni su hash en ninguna respuesta.

#### Scenario: JSON aunque el cliente pida HTML

- **WHEN** se envía cualquier petición de esta capability con `Accept: text/html`
- **THEN** la respuesta llega en JSON, también en los casos de error

#### Scenario: La contraseña nunca sale

- **WHEN** se obtiene una cuenta por registro, login o consulta de perfil
- **THEN** el objeto devuelto no contiene ningún campo con la contraseña ni con su hash

### Requirement: Iniciales de la cuenta

El sistema SHALL incluir junto a cada cuenta unas iniciales de dos letras mayúsculas, calculadas a partir del nombre cuando lo hay y del email cuando no, para poder representar a la persona sin necesidad de una foto.

#### Scenario: Nombre de dos palabras

- **WHEN** la cuenta tiene `fullName` "Ada Lovelace"
- **THEN** sus `initials` son "AL"

#### Scenario: Nombre de una sola palabra

- **WHEN** la cuenta tiene `fullName` "Ada"
- **THEN** sus `initials` son "AD"

#### Scenario: Cuenta sin nombre

- **WHEN** la cuenta tiene `fullName` nulo y email "ada@example.com"
- **THEN** sus `initials` se derivan del email, dando "AE"

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

### Requirement: Errores comprensibles en los formularios de acceso

La interfaz SHALL traducir los errores del servidor a mensajes en castellano, colocarlos bajo el campo al que corresponden cuando ese campo está en pantalla, y mostrarlos como aviso general en la parte superior del formulario cuando no lo está, de modo que ningún error quede oculto.

#### Scenario: Error atribuible a un campo visible

- **WHEN** el servidor rechaza el registro porque el email ya está en uso
- **THEN** el mensaje "Ese email ya está registrado. Inicia sesión en su lugar." aparece asociado al campo de email

#### Scenario: Error sin campo en pantalla

- **WHEN** el servidor devuelve un error que no corresponde a ninguno de los campos que la pantalla muestra
- **THEN** el mensaje aparece en el aviso general de la cabecera del formulario

### Requirement: Pantalla de perfil

La interfaz SHALL mostrar en `/profile` los datos de la cuenta con la sesión abierta: sus iniciales, su nombre, su email y la fecha de alta, y SHALL indicar explícitamente cuándo la cuenta no tiene nombre.

#### Scenario: Perfil de una cuenta con nombre

- **WHEN** una persona con sesión abierta y nombre "Ada Lovelace" abre `/profile`
- **THEN** ve sus iniciales, "Ada Lovelace", su email y la fecha de alta bajo el rótulo "Miembro desde", con la fecha escrita en castellano

#### Scenario: Perfil de una cuenta sin nombre

- **WHEN** una persona sin nombre en su cuenta abre `/profile`
- **THEN** en lugar del nombre ve "Sin nombre", y el resto de los datos se muestran igual

### Requirement: Cierre de sesión desde la interfaz

La interfaz SHALL ofrecer un botón "Cerrar sesión" en el perfil que termine la sesión y devuelva a la pantalla de inicio de sesión, y SHALL cerrarla localmente aunque el servidor no conteste, porque el objetivo de la persona ya se ha cumplido.

#### Scenario: Cierre de sesión normal

- **WHEN** se pulsa "Cerrar sesión"
- **THEN** el botón pasa a "Cerrando sesión…" y a continuación se muestra la pantalla de inicio de sesión, sin acceso ya al perfil

#### Scenario: El servidor no responde al cerrar sesión

- **WHEN** se pulsa "Cerrar sesión" y la petición al servidor falla
- **THEN** la sesión se cierra igualmente en el navegador y se muestra la pantalla de inicio de sesión, sin ningún error

### Requirement: Persistencia de la sesión entre visitas

La interfaz SHALL recordar la sesión en el navegador y revalidarla contra el servidor al arrancar, mostrando un indicador de carga mientras lo comprueba en lugar de decidir a ciegas, de modo que recargar la página no expulse a nadie.

#### Scenario: Recarga con sesión válida

- **WHEN** se recarga la página estando con la sesión abierta
- **THEN** se muestra brevemente un indicador de carga y después la misma pantalla, con la sesión intacta

#### Scenario: Nueva visita sin sesión previa

- **WHEN** se abre la aplicación en un navegador que nunca ha iniciado sesión
- **THEN** se muestra directamente la pantalla de inicio de sesión, sin indicador de carga

### Requirement: Recuperación de una sesión que ya no vale

La interfaz SHALL devolver a la pantalla de inicio de sesión cuando la sesión recordada deje de ser válida, y SHALL explicar el motivo en pantalla para que nadie acabe allí sin saber por qué.

#### Scenario: El servidor rechaza la sesión recordada

- **WHEN** se abre la aplicación con una sesión guardada que el servidor ya no reconoce
- **THEN** se muestra la pantalla de inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Un error de acceso nuevo tapa al anterior

- **WHEN** desde esa pantalla se intenta entrar y el intento falla por otro motivo
- **THEN** el aviso pasa a explicar el fallo del intento actual, no el de la sesión anterior

### Requirement: Aviso cuando el servidor no está disponible

La interfaz SHALL distinguir la falta de conexión con el servidor de un rechazo de credenciales, avisando con un mensaje propio, y SHALL conservar la sesión guardada en ese caso para que vuelva a estar disponible cuando el servidor responda.

#### Scenario: Backend apagado al intentar entrar

- **WHEN** se pulsa "Entrar" y no se puede contactar con el servidor
- **THEN** se muestra "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Backend apagado al arrancar con sesión guardada

- **WHEN** se abre la aplicación con una sesión guardada y el servidor no responde
- **THEN** se muestra la pantalla de inicio de sesión con el aviso de conexión, y al recargar con el servidor ya disponible la sesión se restaura sin volver a introducir credenciales

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

### Requirement: Acceso al perfil desde el resto de la aplicación

Ahora que la pantalla de entrada deja de ser el perfil, la interfaz SHALL ofrecer desde la lista de tareas una forma visible de llegar al perfil, para que la cuenta y el cierre de sesión sigan estando a un gesto de distancia.

#### Scenario: Llegar al perfil

- **WHEN** una persona con sesión abierta está en la lista de tareas
- **THEN** dispone de una forma visible de abrir su perfil, desde donde puede cerrar sesión

#### Scenario: Volver de vuelta

- **WHEN** está en el perfil y no cierra sesión
- **THEN** dispone de una forma de volver a la lista de tareas

