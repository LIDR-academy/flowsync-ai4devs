# auth Specification

## Purpose

Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión, mantenga la sesión entre recargas y consulte su perfil. Cubre tanto la API HTTP (bajo `/api/v1`) como las pantallas de acceso de la aplicación web.

## Requirements

### Requirement: Registro de cuenta por API

El sistema SHALL aceptar `POST /api/v1/auth/signup` con un cuerpo JSON que contenga las claves `fullName` (texto o `null`), `email`, `password` y `passwordConfirmation`, y, si los datos son válidos, SHALL crear la cuenta y responder `200` con `{ "data": { "user": <usuario>, "token": <token> } }`, de modo que la persona queda autenticada sin un inicio de sesión adicional.

#### Scenario: Registro con nombre completo

- **WHEN** se envía `fullName: "Ada Lovelace"`, `email: "ada@x.com"`, `password` y `passwordConfirmation` iguales de entre 8 y 32 caracteres
- **THEN** la respuesta es `200` con `data.user` que incluye `fullName: "Ada Lovelace"` y `email: "ada@x.com"`, y `data.token` es una cadena que empieza por `oat_`

#### Scenario: Registro sin nombre

- **WHEN** se envía un registro válido con `fullName: null`
- **THEN** la respuesta es `200` y `data.user.fullName` es `null`

#### Scenario: Nombre vacío o en blanco

- **WHEN** se envía un registro válido con `fullName: ""` o `fullName: "  "`
- **THEN** la respuesta es `200` y `data.user.fullName` es `null`, igual que si se hubiera enviado `null`

#### Scenario: El token del registro sirve para autenticarse

- **WHEN** se usa el `data.token` devuelto por el registro como `Authorization: Bearer <token>` en `GET /api/v1/account/profile`
- **THEN** la respuesta es `200` con los datos de la cuenta recién creada

### Requirement: Validación de los datos de registro

El sistema SHALL rechazar con `422` cualquier registro que no cumpla las reglas siguientes, devolviendo `{ "errors": [ { "message", "rule", "field", "meta"? } ] }` con como máximo un error por campo (el de la primera regla que ese campo incumple): la clave `fullName` MUST estar presente (aunque sea `null`); `email` MUST ser una dirección de email válida de como máximo 254 caracteres y MUST NOT coincidir exactamente con el de una cuenta existente; `password` y `passwordConfirmation` MUST tener entre 8 y 32 caracteres; y `passwordConfirmation` MUST ser idéntica a `password`. Ante un rechazo, el sistema SHALL NOT crear ninguna cuenta.

#### Scenario: Cuerpo vacío

- **WHEN** se envía `{}`
- **THEN** la respuesta es `422` con un error `rule: "required"` para cada uno de `fullName`, `email`, `password` y `passwordConfirmation`

#### Scenario: Falta la clave del nombre

- **WHEN** se envía un registro por lo demás válido pero sin la clave `fullName`
- **THEN** la respuesta es `422` con un error `rule: "required"` y `field: "fullName"`

#### Scenario: Email mal formado

- **WHEN** se envía `email: "nope"`
- **THEN** la respuesta es `422` con un único error para `email`, `rule: "email"`, sin comprobar además si el email ya existe

#### Scenario: Contraseña demasiado corta

- **WHEN** se envía una `password` de 3 caracteres
- **THEN** la respuesta es `422` con un error `rule: "minLength"`, `field: "password"` y `meta.min: 8`

#### Scenario: Contraseña demasiado larga

- **WHEN** se envía una `password` de 33 caracteres
- **THEN** la respuesta es `422` con un error `rule: "maxLength"`, `field: "password"` y `meta.max: 32`

#### Scenario: Las contraseñas no coinciden

- **WHEN** `passwordConfirmation` tiene una longitud válida pero es distinta de `password`
- **THEN** la respuesta es `422` con un error `rule: "sameAs"` y `field: "passwordConfirmation"`

#### Scenario: Email ya registrado

- **WHEN** se intenta registrar `ada@x.com` y ya existe una cuenta con exactamente ese email
- **THEN** la respuesta es `422` con un error `rule: "database.unique"` y `field: "email"`, y no se crea una segunda cuenta

### Requirement: Inicio de sesión por API

El sistema SHALL aceptar `POST /api/v1/auth/login` con `email` y `password` y, si corresponden a una cuenta existente, SHALL responder `200` con `{ "data": { "user": <usuario>, "token": <token> } }`. Cada inicio de sesión SHALL emitir un token nuevo, y los tokens emitidos antes SHALL seguir siendo válidos.

#### Scenario: Credenciales correctas

- **WHEN** se envían el email y la contraseña de una cuenta existente
- **THEN** la respuesta es `200` con `data.user` de esa cuenta y un `data.token` nuevo

#### Scenario: Varias sesiones simultáneas

- **WHEN** la misma cuenta inicia sesión dos veces y obtiene dos tokens distintos
- **THEN** ambos tokens permiten consultar `GET /api/v1/account/profile` con respuesta `200`

### Requirement: Rechazo de inicios de sesión inválidos

El sistema SHALL responder `422` con errores por campo cuando falten `email` o `password` o cuando `email` no sea una dirección válida, y SHALL responder `400` con `{ "errors": [ { "message": "Invalid user credentials" } ] }` cuando el email no pertenezca a ninguna cuenta o la contraseña no sea la correcta, sin distinguir entre ambos casos.

#### Scenario: Faltan campos

- **WHEN** se envía `{}` al inicio de sesión
- **THEN** la respuesta es `422` con un error `rule: "required"` para `email` y otro para `password`

#### Scenario: Email con formato inválido

- **WHEN** se envía `email: "nope"`
- **THEN** la respuesta es `422` con un error `rule: "email"` y `field: "email"`

#### Scenario: Contraseña incorrecta

- **WHEN** se envía el email de una cuenta existente con una contraseña equivocada
- **THEN** la respuesta es `400` con el mensaje `Invalid user credentials` y sin `field`

#### Scenario: Email desconocido

- **WHEN** se envía un email que no pertenece a ninguna cuenta
- **THEN** la respuesta es exactamente la misma que con una contraseña incorrecta: `400` con `Invalid user credentials`

### Requirement: Representación pública del usuario

Siempre que la API devuelva un usuario, el sistema SHALL exponer únicamente `id`, `fullName`, `email`, `initials`, `createdAt` y `updatedAt` (fechas en ISO 8601), y SHALL NOT incluir la contraseña ni ningún derivado de ella. `initials` SHALL calcularse así: si hay nombre, las iniciales en mayúscula de sus dos primeras palabras separadas por un espacio simple, o las dos primeras letras en mayúscula si no contiene ningún espacio; si no hay nombre, la primera letra de la parte local del email seguida de la primera letra de su dominio, en mayúscula.

#### Scenario: Iniciales con nombre y apellido

- **WHEN** la cuenta tiene `fullName: "Ada Lovelace"`
- **THEN** `initials` es `"AL"`

#### Scenario: Iniciales con un único nombre

- **WHEN** la cuenta tiene `fullName: "Grace"`
- **THEN** `initials` es `"GR"`

#### Scenario: Iniciales con un espacio doble

- **WHEN** la cuenta tiene `fullName: "Ada  Lovelace"` (dos espacios)
- **THEN** `initials` es `"AD"`

#### Scenario: Iniciales sin nombre

- **WHEN** la cuenta tiene `fullName: null` y `email: "bob@x.com"`
- **THEN** `initials` es `"BX"`

#### Scenario: La contraseña nunca sale en la respuesta

- **WHEN** se registra una cuenta, se inicia sesión o se consulta el perfil
- **THEN** el objeto usuario de la respuesta no contiene ninguna clave `password`

### Requirement: Consulta del perfil autenticado

El sistema SHALL responder a `GET /api/v1/account/profile` con `200` y `{ "data": <usuario> }` del dueño del token enviado en la cabecera `Authorization: Bearer <token>`.

#### Scenario: Perfil con token válido

- **WHEN** se pide el perfil con un token emitido por el registro o el inicio de sesión y no revocado
- **THEN** la respuesta es `200` con `data` igual al usuario dueño de ese token

### Requirement: Protección de las rutas de cuenta

El sistema SHALL responder `401` con `{ "errors": [ { "message": "Unauthorized access" } ] }` a cualquier petición a `GET /api/v1/account/profile` o `POST /api/v1/account/logout` que no traiga un token, traiga uno inexistente o traiga uno ya revocado.

#### Scenario: Sin cabecera de autorización

- **WHEN** se pide el perfil sin cabecera `Authorization`
- **THEN** la respuesta es `401` con el mensaje `Unauthorized access`

#### Scenario: Token inventado

- **WHEN** se pide el perfil con `Authorization: Bearer oat_xxx`
- **THEN** la respuesta es `401`

#### Scenario: Cierre de sesión sin token

- **WHEN** se llama a `POST /api/v1/account/logout` sin cabecera `Authorization`
- **THEN** la respuesta es `401`

### Requirement: Cierre de sesión por API

El sistema SHALL aceptar `POST /api/v1/account/logout` con un token válido, SHALL revocar solo ese token y SHALL responder `200` con `{ "message": "Logged out successfully" }`, sin envoltorio `data`. Los demás tokens de la misma cuenta SHALL seguir siendo válidos.

#### Scenario: El token queda revocado

- **WHEN** se cierra sesión con un token y después se pide el perfil con ese mismo token
- **THEN** el cierre responde `200` con `Logged out successfully` y la petición de perfil responde `401`

#### Scenario: Cerrar dos veces con el mismo token

- **WHEN** se repite `POST /api/v1/account/logout` con un token ya revocado
- **THEN** la respuesta es `401`

#### Scenario: Otras sesiones no se ven afectadas

- **WHEN** una cuenta tiene dos tokens y cierra sesión con uno de ellos
- **THEN** el otro token sigue obteniendo `200` en `GET /api/v1/account/profile`

### Requirement: Navegación según el estado de sesión

La aplicación web SHALL ofrecer las pantallas `/login` y `/register` solo a quien no tiene sesión y la pantalla `/profile` solo a quien la tiene; SHALL redirigir a `/profile` a una persona con sesión que abra `/login` o `/register`, a `/login` a una persona sin sesión que abra `/profile`, y a `/profile` cualquier otra dirección. Mientras se comprueba una sesión guardada, la aplicación SHALL mostrar un indicador de carga en lugar de redirigir.

#### Scenario: Visitante sin sesión abre el perfil

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** se la lleva a la pantalla de inicio de sesión

#### Scenario: Persona con sesión abre el login

- **WHEN** una persona con sesión abre `/login` o `/register`
- **THEN** se la lleva a su perfil

#### Scenario: Dirección desconocida

- **WHEN** alguien abre una dirección que no es `/login`, `/register` ni `/profile`
- **THEN** se le redirige a `/profile`, y de ahí a `/login` si no tiene sesión

#### Scenario: Comprobando la sesión guardada

- **WHEN** se carga la aplicación con una sesión guardada que todavía no se ha verificado
- **THEN** se ve un indicador de carga a pantalla completa y no se redirige hasta tener respuesta

### Requirement: Pantalla de inicio de sesión

La pantalla de inicio de sesión SHALL mostrar el título "Inicia sesión", campos "Email" y "Contraseña", un botón "Entrar" y un enlace "Crea una" hacia el registro. Al enviarla con credenciales correctas, la aplicación SHALL abrir la sesión y llevar a la persona a su perfil. Mientras el envío está en curso, el botón SHALL mostrar "Entrando…" y estar deshabilitado.

#### Scenario: Inicio de sesión correcto

- **WHEN** la persona introduce el email y la contraseña de su cuenta y pulsa "Entrar"
- **THEN** pasa a ver su perfil

#### Scenario: Credenciales incorrectas

- **WHEN** la persona introduce una contraseña equivocada o un email que no existe y pulsa "Entrar"
- **THEN** ve un aviso de error encima del formulario con el texto "El email o la contraseña no son correctos." y sigue en la pantalla de inicio de sesión

#### Scenario: Error de validación en un campo

- **WHEN** la persona envía el formulario con el email vacío o con un formato inválido
- **THEN** ve bajo el campo Email un mensaje en castellano ("Falta rellenar el email." o "Introduce una dirección de email válida.") y no se abre la sesión

#### Scenario: Contraseña vacía

- **WHEN** la persona envía el formulario con un email válido y la contraseña vacía
- **THEN** ve "Falta rellenar la contraseña." bajo el campo Contraseña y no se abre la sesión

#### Scenario: Envío en curso

- **WHEN** la persona pulsa "Entrar" y la respuesta aún no ha llegado
- **THEN** el botón muestra "Entrando…" y no se puede volver a pulsar

### Requirement: Pantalla de registro

La pantalla de registro SHALL mostrar el título "Crea tu cuenta", los campos "Nombre completo (opcional)", "Email", "Contraseña" (con la indicación "Entre 8 y 32 caracteres.") y "Repite la contraseña", un botón "Crear cuenta" y un enlace "Inicia sesión" hacia el inicio de sesión. Al registrarse con éxito, la aplicación SHALL abrir la sesión y llevar a la persona a su perfil. Si el nombre se deja vacío o solo con espacios, la cuenta SHALL crearse sin nombre. Mientras el envío está en curso, el botón SHALL mostrar "Creando cuenta…" y estar deshabilitado.

#### Scenario: Registro correcto

- **WHEN** la persona rellena email y dos contraseñas iguales de entre 8 y 32 caracteres y pulsa "Crear cuenta"
- **THEN** pasa a ver su perfil ya con la sesión abierta

#### Scenario: Nombre en blanco

- **WHEN** la persona deja "Nombre completo" vacío o solo con espacios y se registra
- **THEN** su perfil muestra "Sin nombre"

#### Scenario: Contraseñas distintas

- **WHEN** la persona escribe dos contraseñas diferentes y pulsa "Crear cuenta"
- **THEN** ve "Las contraseñas no coinciden." bajo "Repite la contraseña" y no se envía nada al servidor

#### Scenario: Email ya registrado

- **WHEN** la persona intenta registrarse con un email que ya tiene cuenta
- **THEN** ve bajo el campo Email el mensaje "Ese email ya está registrado. Inicia sesión en su lugar."

#### Scenario: Contraseña fuera de rango

- **WHEN** la persona envía una contraseña de menos de 8 o más de 32 caracteres
- **THEN** ve bajo el campo Contraseña un mensaje en castellano que indica el mínimo o el máximo de caracteres, en lugar de la indicación "Entre 8 y 32 caracteres."

### Requirement: Pantalla de perfil

La pantalla de perfil SHALL mostrar las iniciales de la persona en un círculo, su nombre completo (o "Sin nombre" si no tiene), su email, la fecha de alta como "Miembro desde" en formato largo en castellano y un botón "Cerrar sesión".

#### Scenario: Perfil con nombre

- **WHEN** Ada Lovelace (`ada@x.com`), registrada el 1 de octubre de 2026, abre su perfil
- **THEN** ve "AL", "Ada Lovelace", "ada@x.com" y "Miembro desde 1 de octubre de 2026"

#### Scenario: Perfil sin nombre

- **WHEN** una persona registrada sin nombre abre su perfil
- **THEN** ve "Sin nombre" en el lugar del nombre

### Requirement: Cierre de sesión en la aplicación

Al pulsar "Cerrar sesión", la aplicación SHALL cerrar la sesión en el navegador y llevar a la persona a la pantalla de inicio de sesión, de inmediato, sin esperar a que el servidor confirme el cierre y aunque no llegue a confirmarlo. Tras cerrar sesión, recargar la página SHALL NOT restaurar la sesión.

#### Scenario: Cerrar sesión

- **WHEN** la persona pulsa "Cerrar sesión" en su perfil
- **THEN** pasa a la pantalla de inicio de sesión, sin ningún aviso de error

#### Scenario: Cerrar sesión con el servidor caído

- **WHEN** la persona pulsa "Cerrar sesión" y el servidor no responde
- **THEN** igualmente pasa a la pantalla de inicio de sesión y, al recargar, sigue sin sesión en el navegador (aunque el token pueda seguir siendo válido en el servidor)

### Requirement: Persistencia de la sesión entre recargas

La aplicación SHALL conservar la sesión abierta al recargar la página o volver a abrirla en el mismo navegador, verificándola contra el servidor al arrancar. Si el servidor rechaza la sesión guardada, la aplicación SHALL descartarla y mostrar en la pantalla de inicio de sesión el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión.". Si el servidor no está disponible o responde con un error distinto de rechazar la sesión, la aplicación SHALL tratar a la persona como sin sesión y mostrar el aviso correspondiente ("No se pudo conectar con el servidor. Comprueba que el backend está arrancado." o "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento."), pero SHALL conservar la sesión guardada, de modo que una recarga posterior con el servidor disponible la restaure. Estos avisos SHALL mostrarse solo en la pantalla de inicio de sesión, no en la de registro.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión abierta recarga la página de su perfil
- **THEN** tras un indicador de carga sigue viendo su perfil sin volver a iniciar sesión

#### Scenario: Sesión revocada desde fuera

- **WHEN** la sesión guardada ya no es válida en el servidor y la persona recarga la aplicación
- **THEN** ve la pantalla de inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Servidor caído al arrancar

- **WHEN** la persona recarga la aplicación con una sesión guardada y el servidor no responde
- **THEN** ve la pantalla de inicio de sesión con el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Error interno del servidor al arrancar

- **WHEN** la persona recarga la aplicación con una sesión guardada y la consulta del perfil responde con un error 500
- **THEN** ve la pantalla de inicio de sesión con el aviso "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento." y una recarga posterior con el servidor sano restaura la sesión

#### Scenario: Recarga en la pantalla de registro

- **WHEN** la persona recarga estando en `/register` con una sesión guardada que el servidor rechaza o no puede verificar
- **THEN** sigue en la pantalla de registro sin ningún aviso de sesión perdida

#### Scenario: El servidor vuelve

- **WHEN** después de ese fallo el servidor vuelve a estar disponible y la persona recarga la página
- **THEN** recupera su sesión y ve su perfil

#### Scenario: El aviso desaparece al entrar

- **WHEN** la persona ve un aviso de sesión perdida e inicia sesión o se registra correctamente
- **THEN** el aviso deja de mostrarse

### Requirement: Errores de conexión y de servidor en los formularios

Cuando el envío de un formulario de acceso no pueda llegar al servidor, la aplicación SHALL mostrar encima del formulario "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."; cuando el servidor responda con un error inesperado, SHALL mostrar "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento.". En ambos casos el formulario SHALL volver a poder enviarse.

#### Scenario: Backend apagado al iniciar sesión

- **WHEN** la persona pulsa "Entrar" con el servidor apagado
- **THEN** ve el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado." y el botón "Entrar" vuelve a estar disponible

#### Scenario: Error interno del servidor al registrarse

- **WHEN** la persona pulsa "Crear cuenta" y el servidor responde con un error 500
- **THEN** ve el aviso "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento."
