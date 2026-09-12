# auth

## Purpose

Permite que cualquier persona cree una cuenta propia en FlowSync, inicie sesión con email y contraseña y mantenga esa sesión entre visitas. Mientras la sesión está abierta puede consultar los datos de su perfil y cerrarla cuando quiera.

## Requirements

### Requirement: Registro de una cuenta nueva

El sistema SHALL permitir crear una cuenta enviando `POST /api/v1/auth/signup` con email, contraseña y confirmación de la contraseña, y SHALL responder con los datos de la cuenta creada y un token de acceso ya válido, de modo que quien se registra queda autenticado sin tener que iniciar sesión después.

#### Scenario: Alta con datos válidos

- **WHEN** se envía `POST /api/v1/auth/signup` con un email no registrado, una contraseña de entre 8 y 32 caracteres y una confirmación idéntica
- **THEN** la respuesta es 200 con `data.user` (identificador, nombre completo, email, iniciales, fecha de creación y de actualización) y `data.token`, y ese token sirve ya para llamar a los endpoints protegidos

#### Scenario: El nombre completo es opcional

- **WHEN** se envía un alta válida con el nombre completo a `null`
- **THEN** la cuenta se crea igualmente y `data.user.fullName` vale `null`

### Requirement: Rechazo de altas inválidas

El sistema SHALL rechazar el alta con 422 cuando los datos no cumplan las reglas, indicando en la respuesta qué campo falla y por qué, y SHALL no crear ninguna cuenta en ese caso.

#### Scenario: Email ya registrado

- **WHEN** se envía un alta con un email que ya pertenece a otra cuenta
- **THEN** la respuesta es 422 señalando el campo del email como ya existente, y no se crea una segunda cuenta con ese email

#### Scenario: El mismo email con distinta capitalización

- **WHEN** se envía un alta con el email de una cuenta existente escrito con distintas mayúsculas y minúsculas
- **THEN** el alta se acepta y se crea una segunda cuenta: la comprobación de que el email no está repetido es una comparación exacta, sensible a mayúsculas

#### Scenario: Email con formato inválido o demasiado largo

- **WHEN** se envía un alta cuyo email no tiene formato de dirección de correo o supera los 254 caracteres
- **THEN** la respuesta es 422 señalando el campo del email

#### Scenario: Contraseña fuera del rango permitido

- **WHEN** se envía un alta con una contraseña de menos de 8 o más de 32 caracteres
- **THEN** la respuesta es 422 señalando el campo de la contraseña

#### Scenario: La confirmación no coincide

- **WHEN** se envía un alta cuya confirmación de contraseña no es idéntica a la contraseña
- **THEN** la respuesta es 422 señalando el campo de la confirmación

### Requirement: Inicio de sesión con credenciales

El sistema SHALL permitir obtener un token de acceso enviando `POST /api/v1/auth/login` con el email y la contraseña de una cuenta existente, y SHALL negar el acceso cuando las credenciales no sean correctas sin revelar cuál de los dos datos falla.

#### Scenario: Credenciales correctas

- **WHEN** se envía `POST /api/v1/auth/login` con el email y la contraseña de una cuenta existente
- **THEN** la respuesta es 200 con `data.user` y un `data.token` nuevo y válido

#### Scenario: Contraseña incorrecta, contraseña vacía o cuenta inexistente

- **WHEN** se envía un inicio de sesión con una contraseña que no corresponde a ese email, con una contraseña vacía, o con un email que no pertenece a ninguna cuenta
- **THEN** la respuesta es 400 de credenciales inválidas, con el mismo mensaje en los tres casos, sin señalar ningún campo concreto y sin token

#### Scenario: Falta alguno de los dos campos

- **WHEN** se envía un inicio de sesión en el que no viaja el email o no viaja la contraseña, o cuyo email tiene un formato inválido
- **THEN** la respuesta es 422 señalando el campo que falta o falla

### Requirement: Acceso a los datos del perfil

El sistema SHALL devolver los datos de la cuenta autenticada en `GET /api/v1/account/profile` cuando la petición presente un token de acceso válido en la cabecera `Authorization` como `Bearer`.

#### Scenario: Consulta con token válido

- **WHEN** se pide `GET /api/v1/account/profile` con un token válido
- **THEN** la respuesta es 200 con `data` conteniendo identificador, nombre completo, email, iniciales, fecha de creación y fecha de actualización de esa cuenta

#### Scenario: Consulta sin token o con token inválido

- **WHEN** se pide `GET /api/v1/account/profile` sin cabecera de autorización, con un token inexistente o con uno ya revocado
- **THEN** la respuesta es 401 y no se devuelve dato alguno de ninguna cuenta

### Requirement: Cierre de sesión revocando el token

El sistema SHALL revocar el token con el que se autentica la petición cuando se envíe `POST /api/v1/account/logout`, dejando ese token inservible para peticiones posteriores.

#### Scenario: Cierre de sesión con token válido

- **WHEN** se envía `POST /api/v1/account/logout` con un token válido
- **THEN** la respuesta es 200 con un mensaje de confirmación del cierre de sesión, entregado sin el envoltorio `data` que llevan las demás respuestas de éxito, y ese mismo token pasa a ser rechazado con 401 en cualquier petición posterior

#### Scenario: Cierre de sesión sin autenticación

- **WHEN** se envía `POST /api/v1/account/logout` sin token o con un token que ya no es válido
- **THEN** la respuesta es 401

### Requirement: Sesiones independientes por token

El sistema SHALL emitir un token distinto en cada registro o inicio de sesión de la misma cuenta, y cada token SHALL poder revocarse por separado sin afectar a los demás.

#### Scenario: Cerrar sesión en un dispositivo no afecta al otro

- **WHEN** una misma cuenta ha iniciado sesión dos veces obteniendo dos tokens distintos y se cierra sesión con el primero
- **THEN** el primer token queda rechazado con 401 y el segundo sigue dando acceso al perfil

### Requirement: La contraseña nunca se expone

El sistema SHALL no incluir la contraseña, ni su forma cifrada, en ninguna respuesta de la API.

#### Scenario: Datos de cuenta en cualquier respuesta

- **WHEN** se obtiene una respuesta de registro, de inicio de sesión o de consulta del perfil
- **THEN** los datos de la cuenta no contienen ningún campo con la contraseña

### Requirement: Iniciales de la cuenta

El sistema SHALL calcular y devolver unas iniciales en mayúsculas para cada cuenta, derivadas del nombre completo cuando exista y del email cuando no.

#### Scenario: Nombre y apellido

- **WHEN** la cuenta tiene un nombre completo formado por al menos dos palabras separadas por un solo espacio
- **THEN** las iniciales son la primera letra de las dos primeras palabras, en mayúsculas

#### Scenario: Una sola palabra o sin nombre

- **WHEN** la cuenta tiene un nombre completo de una sola palabra, o no tiene nombre completo
- **THEN** las iniciales son las dos primeras letras de esa palabra o, sin nombre, las dos primeras letras de la parte del email anterior a la arroba, en mayúsculas

### Requirement: Respuestas siempre en JSON

El sistema SHALL responder en JSON a cualquier petición de la API, incluidos los errores, independientemente de la cabecera `Accept` que envíe el cliente.

#### Scenario: Petición sin cabecera de contenido esperado

- **WHEN** se llama a cualquier endpoint de cuentas y acceso sin indicar que se espera JSON
- **THEN** la respuesta, sea de éxito o de error, viene en JSON

### Requirement: Pantalla de registro

La aplicación SHALL ofrecer una pantalla de registro con campos de nombre completo (marcado como opcional), email, contraseña y repetición de la contraseña, y SHALL indicar junto al campo de contraseña que debe tener entre 8 y 32 caracteres.

#### Scenario: Registro correcto desde la pantalla

- **WHEN** una persona rellena el formulario de registro con datos válidos y pulsa «Crear cuenta»
- **THEN** el botón muestra que está creando la cuenta y queda deshabilitado mientras dura el envío, y al terminar la persona aparece con sesión iniciada en la pantalla de perfil

#### Scenario: Las contraseñas no coinciden

- **WHEN** una persona envía el registro con una repetición de contraseña distinta de la contraseña
- **THEN** se muestra el aviso de que las contraseñas no coinciden bajo el campo de repetición, sin haber enviado nada al servidor

#### Scenario: El registro es rechazado por el servidor

- **WHEN** el servidor rechaza el registro por un dato inválido, por ejemplo un email ya registrado
- **THEN** el motivo se muestra en castellano bajo el campo correspondiente, y si el campo señalado no está en pantalla el mensaje aparece como aviso general en la parte superior del formulario

### Requirement: Pantalla de inicio de sesión

La aplicación SHALL ofrecer una pantalla de inicio de sesión con campos de email y contraseña, y SHALL explicar en castellano el motivo cuando el acceso no se conceda.

#### Scenario: Acceso correcto

- **WHEN** una persona introduce email y contraseña correctos y pulsa «Entrar»
- **THEN** el botón indica que está entrando mientras dura el envío y, al terminar, la persona aparece con sesión iniciada en la pantalla de perfil

#### Scenario: Credenciales incorrectas

- **WHEN** una persona intenta entrar con credenciales que el servidor no acepta
- **THEN** permanece en la pantalla de inicio de sesión y ve un aviso de que el email o la contraseña no son correctos

#### Scenario: El servidor no responde

- **WHEN** una persona intenta entrar y no se puede contactar con el servidor
- **THEN** ve un aviso que le indica que no se ha podido conectar, y puede volver a intentarlo

### Requirement: Navegación entre registro e inicio de sesión

La aplicación SHALL ofrecer, desde cada una de las dos pantallas de acceso, un enlace visible a la otra.

#### Scenario: Desde el inicio de sesión al registro

- **WHEN** una persona sin cuenta está en la pantalla de inicio de sesión
- **THEN** ve un enlace para crear una cuenta que la lleva a la pantalla de registro, y desde el registro ve el enlace inverso para iniciar sesión

### Requirement: Pantalla de perfil

La aplicación SHALL mostrar, a quien tiene sesión iniciada, una pantalla de perfil con sus iniciales, su nombre completo, su email y la fecha desde la que es miembro en formato largo en castellano.

#### Scenario: Perfil de una cuenta con nombre

- **WHEN** una persona con sesión iniciada abre su perfil
- **THEN** ve sus iniciales, su nombre completo, su email y la fecha de alta de la cuenta escrita en castellano

#### Scenario: Perfil de una cuenta sin nombre

- **WHEN** la cuenta se creó sin nombre completo
- **THEN** el perfil muestra «Sin nombre» en el lugar del nombre, junto con el email y el resto de datos

### Requirement: Cierre de sesión desde el perfil

La aplicación SHALL ofrecer en el perfil una acción para cerrar sesión que SHALL dejar a la persona sin sesión aunque el servidor no llegue a confirmar la revocación.

#### Scenario: Cierre de sesión correcto

- **WHEN** una persona pulsa «Cerrar sesión» en su perfil
- **THEN** el botón indica que está cerrando la sesión, la sesión termina y la persona acaba en la pantalla de inicio de sesión

#### Scenario: El servidor falla al cerrar sesión

- **WHEN** una persona pulsa «Cerrar sesión» y la llamada al servidor falla
- **THEN** la sesión se cierra igualmente en la aplicación y la persona acaba en la pantalla de inicio de sesión

### Requirement: Protección de las pantallas según la sesión

La aplicación SHALL impedir el acceso al perfil a quien no tenga sesión, redirigiéndole al inicio de sesión, y SHALL impedir el acceso a las pantallas de registro e inicio de sesión a quien ya la tenga, redirigiéndole al perfil.

#### Scenario: Intento de ver el perfil sin sesión

- **WHEN** alguien sin sesión abre la dirección del perfil
- **THEN** acaba en la pantalla de inicio de sesión

#### Scenario: Intento de iniciar sesión teniéndola ya

- **WHEN** alguien con sesión iniciada abre la dirección de inicio de sesión o la de registro
- **THEN** acaba en la pantalla de perfil

#### Scenario: Dirección desconocida

- **WHEN** alguien abre cualquier otra dirección de la aplicación
- **THEN** es llevado al perfil, y desde ahí se le aplica la protección anterior según tenga sesión o no

### Requirement: Persistencia de la sesión entre recargas

La aplicación SHALL recordar la sesión iniciada de forma que sobreviva a recargas de la página y a cierres del navegador, y SHALL comprobarla contra el servidor al arrancar antes de darla por buena.

#### Scenario: Recarga con sesión todavía válida

- **WHEN** una persona con sesión iniciada recarga la página
- **THEN** mientras se comprueba la sesión ve un indicador de carga sin ser expulsada, y a continuación continúa con su sesión iniciada

#### Scenario: Recarga con una sesión ya caducada

- **WHEN** una persona recarga la página y el servidor ya no reconoce su sesión
- **THEN** acaba en la pantalla de inicio de sesión con el aviso de que su sesión ha caducado y debe volver a iniciarla

#### Scenario: Recarga sin poder contactar con el servidor

- **WHEN** una persona recarga la página y no se puede contactar con el servidor o este falla
- **THEN** acaba en la pantalla de inicio de sesión con un aviso que explica el motivo, y su sesión guardada no se descarta: al volver el servidor, una recarga la restaura

#### Scenario: Primera visita sin sesión previa

- **WHEN** alguien abre la aplicación sin ninguna sesión guardada
- **THEN** llega directamente a la pantalla de inicio de sesión, sin pasar por un indicador de carga y sin ningún aviso de error
