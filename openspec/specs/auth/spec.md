# auth

## Purpose

Permitir que una persona cree su cuenta en FlowSync, entre con email y contraseña y mantenga la sesión abierta entre visitas, para que el resto del producto pueda saber quién está trabajando. Cubre el registro, el inicio y el cierre de sesión, la persistencia de la sesión en el navegador y la consulta del propio perfil.
## Requirements
### Requirement: Alta de una cuenta nueva

El sistema SHALL permitir crear una cuenta con email y contraseña mediante `POST /api/v1/auth/signup`, y SHALL responder `200` con los datos públicos de la cuenta y un token de acceso ya utilizable, de forma que registrarse deje a la persona dentro sin un paso extra de inicio de sesión.

#### Scenario: Registro con datos válidos

- **WHEN** se envía `POST /api/v1/auth/signup` con `email` no registrado, `password` de entre 8 y 32 caracteres, `passwordConfirmation` idéntica y `fullName`
- **THEN** la respuesta es `200` con `data.user` (los datos públicos de la cuenta recién creada) y `data.token` (una cadena que sirve como credencial para las peticiones autenticadas)

#### Scenario: El nombre completo es opcional

- **WHEN** se envía un registro válido con `fullName` a `null`
- **THEN** la cuenta se crea igualmente, la respuesta es `200` y `data.user.fullName` vale `null`

#### Scenario: El email ya está registrado

- **WHEN** se envía un registro cuyo `email` ya pertenece a otra cuenta
- **THEN** la respuesta es `422`, incluye un error asociado al campo `email` con regla `database.unique`, y no se crea ninguna cuenta ni se emite ningún token

#### Scenario: La confirmación no coincide con la contraseña

- **WHEN** se envía un registro en el que `passwordConfirmation` es distinta de `password`
- **THEN** la respuesta es `422` con un error asociado al campo `passwordConfirmation` con regla `sameAs`, y no se crea la cuenta

#### Scenario: La contraseña no cumple la longitud exigida

- **WHEN** se envía un registro con una `password` de menos de 8 o de más de 32 caracteres
- **THEN** la respuesta es `422` con un error asociado al campo `password` que indica el límite incumplido (`minLength` o `maxLength`), y no se crea la cuenta

#### Scenario: El email no tiene forma de email

- **WHEN** se envía un registro con un `email` mal formado o de más de 254 caracteres
- **THEN** la respuesta es `422` con un error asociado al campo `email`, y no se crea la cuenta

### Requirement: Inicio de sesión con credenciales

El sistema SHALL emitir un token de acceso a través de `POST /api/v1/auth/login` cuando el email y la contraseña correspondan a una cuenta existente, y SHALL rechazar cualquier otra combinación sin revelar si el email existe.

#### Scenario: Credenciales correctas

- **WHEN** se envía `POST /api/v1/auth/login` con el `email` y la `password` de una cuenta existente
- **THEN** la respuesta es `200` con `data.user` y un `data.token` nuevo, distinto de los emitidos anteriormente y válido en paralelo con ellos

#### Scenario: Contraseña incorrecta o cuenta inexistente

- **WHEN** se envía un inicio de sesión con un `email` con forma válida cuya contraseña no coincide, o que no corresponde a ninguna cuenta
- **THEN** la respuesta es un error `400` idéntico en ambos casos, sin ningún error asociado a un campo concreto y sin token

#### Scenario: El email enviado no tiene forma de email

- **WHEN** se envía un inicio de sesión con un `email` mal formado
- **THEN** la respuesta es `422` con un error asociado al campo `email`, sin llegar a comprobar ninguna contraseña

#### Scenario: La contraseña no se valida por longitud al entrar

- **WHEN** se envía un inicio de sesión con una `password` más corta que el mínimo exigido en el registro
- **THEN** la respuesta es el mismo error `400` de credenciales incorrectas, y no un error de validación

### Requirement: Acceso autenticado mediante token portador

El sistema SHALL exigir un token de acceso válido en la cabecera `Authorization: Bearer <token>` para los recursos bajo `/api/v1/account`, y SHALL responder `401` cuando falte, sea desconocido o haya sido revocado.

#### Scenario: Consulta del propio perfil con token válido

- **WHEN** se envía `GET /api/v1/account/profile` con `Authorization: Bearer <token>` de una sesión activa
- **THEN** la respuesta es `200` con `data` conteniendo los datos públicos de la cuenta dueña de ese token

#### Scenario: Petición sin credencial

- **WHEN** se envía una petición a un recurso bajo `/api/v1/account` sin cabecera `Authorization`
- **THEN** la respuesta es `401` y no se devuelve ningún dato de ninguna cuenta

#### Scenario: Petición con token desconocido o ya revocado

- **WHEN** se envía una petición a un recurso bajo `/api/v1/account` con un token inventado o con uno que ya fue revocado al cerrar sesión
- **THEN** la respuesta es `401` y no se devuelve ningún dato de ninguna cuenta

#### Scenario: El registro y el inicio de sesión son públicos

- **WHEN** se envía `POST /api/v1/auth/signup` o `POST /api/v1/auth/login` sin cabecera `Authorization`
- **THEN** la petición se atiende con normalidad y no se responde `401`

### Requirement: Cierre de sesión que revoca solo la sesión en uso

El sistema SHALL revocar, mediante `POST /api/v1/account/logout`, únicamente el token con el que se realiza la petición, dejando activas las demás sesiones abiertas de la misma cuenta.

#### Scenario: Cierre de sesión con token válido

- **WHEN** se envía `POST /api/v1/account/logout` con `Authorization: Bearer <token>` de una sesión activa
- **THEN** la respuesta es `200` con un cuerpo que confirma el cierre (`{ "message": "Logged out successfully" }`) y cualquier petición posterior con ese mismo token recibe `401`

#### Scenario: Las demás sesiones sobreviven

- **WHEN** una cuenta tiene dos tokens activos obtenidos en dos inicios de sesión distintos y se cierra la sesión con uno de ellos
- **THEN** el token cerrado deja de valer y el otro token sigue devolviendo `200` en los recursos bajo `/api/v1/account`

#### Scenario: Cierre de sesión sin credencial

- **WHEN** se envía `POST /api/v1/account/logout` sin cabecera `Authorization` o con un token que ya no vale
- **THEN** la respuesta es `401` y no se revoca ningún token

### Requirement: Representación pública de una cuenta

El sistema SHALL devolver siempre la misma representación de una cuenta —identificador, nombre completo, email, iniciales y fechas de alta y de última modificación— y SHALL NOT incluir la contraseña ni ningún dato derivado de ella en ninguna respuesta.

#### Scenario: Campos que se devuelven

- **WHEN** una respuesta de registro, de inicio de sesión o de perfil incluye los datos de la cuenta
- **THEN** contiene exactamente `id`, `fullName`, `email`, `initials`, `createdAt` y `updatedAt`, y no contiene `password`, `passwordConfirmation` ni ningún hash

#### Scenario: Iniciales a partir del nombre completo

- **WHEN** la cuenta tiene un nombre completo de dos o más palabras, como `Ada Lovelace`
- **THEN** `initials` es la primera letra de las dos primeras palabras en mayúsculas, `AL`

#### Scenario: Iniciales cuando el nombre es de una sola palabra

- **WHEN** la cuenta tiene un nombre completo de una sola palabra, como `Ada`
- **THEN** `initials` son sus dos primeras letras en mayúsculas, `AD`

#### Scenario: Iniciales cuando no hay nombre

- **WHEN** la cuenta no tiene nombre completo y su email es `ada@flowsync.dev`
- **THEN** `initials` se derivan del email, tomando la primera letra de la parte local y la primera del dominio en mayúsculas, `AF`

### Requirement: Errores de la API legibles por máquina

El sistema SHALL responder los errores en JSON, y en los errores de validación (`422`) SHALL incluir una lista `errors` en la que cada entrada identifique el campo afectado y la regla incumplida, para que el cliente pueda situar cada mensaje bajo su campo.

#### Scenario: Estructura de un error de validación

- **WHEN** una petición de registro o de inicio de sesión falla la validación
- **THEN** el cuerpo es JSON con un array `errors` cuyas entradas traen al menos `message`, `field` y `rule`, y las reglas de longitud añaden en `meta` el límite incumplido (`min` o `max`)

#### Scenario: Errores no atribuibles a un campo

- **WHEN** la petición falla por credenciales incorrectas (`400`) o por falta de autenticación (`401`)
- **THEN** el cuerpo es JSON y ninguna entrada de error señala un campo del formulario

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

### Requirement: Continuidad de la sesión entre visitas

El sistema SHALL recordar la sesión en el navegador y recuperarla al volver a abrir la aplicación, comprobando antes contra el servidor que sigue siendo válida, y SHALL mostrar un indicador de carga mientras dura esa comprobación en lugar de sacar a la persona a la pantalla de inicio de sesión.

#### Scenario: Recarga con la sesión todavía válida

- **WHEN** una persona con sesión iniciada recarga la página o vuelve a abrir la aplicación
- **THEN** ve brevemente un indicador de carga y a continuación sigue dentro, en la pantalla que había pedido, sin volver a escribir sus credenciales

#### Scenario: La sesión guardada ya no es válida

- **WHEN** se vuelve a abrir la aplicación con una sesión que el servidor ya no reconoce, por ejemplo porque se cerró desde otro sitio
- **THEN** la persona acaba en la pantalla de inicio de sesión con el aviso «Tu sesión ha caducado. Vuelve a iniciar sesión.», y una recarga posterior la lleva ya directamente al inicio de sesión sin volver a intentarlo

#### Scenario: El servidor no está disponible al recuperar la sesión

- **WHEN** se vuelve a abrir la aplicación mientras el servidor está caído o devuelve un error
- **THEN** la persona acaba en la pantalla de inicio de sesión con el aviso que explica el fallo, y cuando el servidor vuelve a estar disponible basta con recargar para seguir dentro sin escribir de nuevo las credenciales

#### Scenario: El error del intento actual tiene prioridad

- **WHEN** se llega a la pantalla de inicio de sesión con un aviso de sesión perdida y se falla un intento de entrada
- **THEN** el aviso pasa a describir el fallo del intento actual, en lugar del motivo por el que se perdió la sesión anterior

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

### Requirement: Pantalla de perfil

El sistema SHALL mostrar en `/profile` los datos de la cuenta con la que se ha entrado: nombre, email, iniciales y fecha de alta.

#### Scenario: Datos de una cuenta con nombre

- **WHEN** una persona con nombre completo y sesión iniciada abre su perfil
- **THEN** ve su nombre completo, su email, un distintivo circular con sus iniciales y la fecha en la que se dio de alta bajo la etiqueta «Miembro desde»

#### Scenario: Cuenta sin nombre completo

- **WHEN** la cuenta se creó sin rellenar el nombre completo
- **THEN** en el lugar del nombre se lee «Sin nombre», y el email y las iniciales se muestran igualmente

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

