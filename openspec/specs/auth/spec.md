# auth Specification

## Purpose
Permite a una persona crear su propia cuenta en FlowSync, identificarse con email y contraseña, y mantener una sesión de API con la que consultar su perfil y cerrarla cuando quiera. Es la puerta de entrada al resto del producto: sin una sesión válida no se accede a ningún recurso protegido.

## Requirements

### Requirement: Registro autónomo de una cuenta
El sistema SHALL permitir que cualquier visitante cree su propia cuenta aportando un email, una contraseña, la confirmación de esa contraseña y, opcionalmente, un nombre completo, sin necesidad de invitación ni de aprobación previa.

#### Scenario: Alta con datos válidos
- **WHEN** un visitante solicita el registro con un email todavía no registrado, una contraseña válida y una confirmación idéntica
- **THEN** el sistema crea la cuenta, devuelve los datos públicos de esa cuenta junto con una credencial de sesión ya activa, y el visitante queda autenticado sin tener que iniciar sesión a continuación

#### Scenario: El nombre completo es opcional
- **WHEN** un visitante solicita el registro sin aportar nombre completo o aportándolo vacío
- **THEN** el sistema crea la cuenta igualmente y la representa con el nombre completo sin valor

#### Scenario: Email ya registrado
- **WHEN** un visitante solicita el registro con un email que ya pertenece a otra cuenta
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo del email y no crea ninguna cuenta

#### Scenario: La confirmación no coincide con la contraseña
- **WHEN** un visitante solicita el registro con una confirmación distinta de la contraseña
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo de la confirmación y no crea ninguna cuenta

### Requirement: Validación de las credenciales aportadas en el registro
El sistema SHALL rechazar el registro cuando el email no tenga forma de dirección de correo o supere los 254 caracteres, o cuando la contraseña o su confirmación tengan menos de 8 o más de 32 caracteres, y SHALL indicar en la respuesta qué campo o campos fallaron.

#### Scenario: Email con formato inválido
- **WHEN** un visitante solicita el registro con un valor que no es una dirección de correo válida
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo del email

#### Scenario: Contraseña demasiado corta
- **WHEN** un visitante solicita el registro con una contraseña de menos de 8 caracteres
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo de la contraseña

#### Scenario: Contraseña demasiado larga
- **WHEN** un visitante solicita el registro con una contraseña de más de 32 caracteres
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo de la contraseña

#### Scenario: Varios campos inválidos a la vez
- **WHEN** un visitante solicita el registro con más de un campo inválido
- **THEN** el sistema devuelve en una sola respuesta un error por cada campo que falló, en lugar de detenerse en el primero

### Requirement: Inicio de sesión con email y contraseña
El sistema SHALL emitir una credencial de sesión a quien demuestre conocer el email y la contraseña de una cuenta existente, y SHALL denegar la emisión en cualquier otro caso.

#### Scenario: Credenciales correctas
- **WHEN** una persona se identifica con el email y la contraseña de su cuenta
- **THEN** el sistema devuelve los datos públicos de esa cuenta junto con una credencial de sesión nueva y activa

#### Scenario: Contraseña incorrecta
- **WHEN** una persona se identifica con un email registrado y una contraseña que no le corresponde
- **THEN** el sistema deniega el acceso con un error de credenciales inválidas y no emite ninguna credencial de sesión

#### Scenario: Email no registrado
- **WHEN** una persona se identifica con un email que no pertenece a ninguna cuenta
- **THEN** el sistema deniega el acceso con el mismo error de credenciales inválidas que devuelve ante una contraseña incorrecta, sin revelar si ese email existe o no

#### Scenario: Faltan datos para identificarse
- **WHEN** una persona intenta identificarse sin email, sin contraseña, o con un email que no tiene forma de dirección de correo
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo correspondiente, antes de comprobar credencial alguna

### Requirement: La contraseña nunca sale del sistema
El sistema SHALL omitir la contraseña, en claro o en cualquier forma derivada, de toda respuesta que describa una cuenta.

#### Scenario: Respuesta de registro o de inicio de sesión
- **WHEN** el sistema devuelve los datos públicos de una cuenta tras un registro o un inicio de sesión
- **THEN** esos datos no contienen la contraseña ni ninguna representación de ella

#### Scenario: Consulta del perfil propio
- **WHEN** una persona autenticada consulta su perfil
- **THEN** la respuesta no contiene la contraseña ni ninguna representación de ella

### Requirement: Credencial de sesión portadora y opaca
El sistema SHALL entregar cada credencial de sesión como un valor opaco que no describe a su titular, SHALL mostrar ese valor completo únicamente en la respuesta que lo emite, y SHALL aceptarlo después como credencial portadora en las peticiones posteriores.

#### Scenario: El valor completo solo se ve una vez
- **WHEN** el sistema emite una credencial de sesión al registrar una cuenta o al iniciar sesión
- **THEN** entrega su valor completo en esa misma respuesta y no vuelve a exponerlo en ninguna consulta posterior

#### Scenario: Uso de la credencial en peticiones posteriores
- **WHEN** una persona presenta como credencial portadora el valor recibido al identificarse
- **THEN** el sistema la reconoce como titular de la cuenta a la que se emitió esa credencial

### Requirement: Sesiones simultáneas independientes
El sistema SHALL emitir una credencial distinta en cada registro o inicio de sesión, SHALL mantener válidas a la vez todas las credenciales vigentes de una misma cuenta, y SHALL mantenerlas válidas indefinidamente hasta que se revoquen de forma explícita.

#### Scenario: Dos inicios de sesión de la misma cuenta
- **WHEN** una persona inicia sesión dos veces con la misma cuenta
- **THEN** el sistema devuelve dos credenciales distintas y ambas siguen sirviendo para acceder a los recursos protegidos

#### Scenario: La credencial no caduca por el paso del tiempo
- **WHEN** una persona presenta una credencial emitida hace tiempo y nunca revocada
- **THEN** el sistema la sigue aceptando como válida

### Requirement: Protección de los recursos de la cuenta
El sistema SHALL exigir una credencial de sesión válida para atender cualquier operación sobre la cuenta, y SHALL responder con un error de acceso no autorizado cuando no la haya o no sea válida.

#### Scenario: Petición sin credencial
- **WHEN** alguien solicita una operación sobre la cuenta sin presentar credencial alguna
- **THEN** el sistema deniega el acceso con un error de acceso no autorizado y no ejecuta la operación

#### Scenario: Credencial inexistente o manipulada
- **WHEN** alguien solicita una operación sobre la cuenta presentando un valor que no corresponde a ninguna credencial emitida, o una credencial alterada
- **THEN** el sistema deniega el acceso con un error de acceso no autorizado y no ejecuta la operación

#### Scenario: Credencial ya revocada
- **WHEN** alguien solicita una operación sobre la cuenta presentando una credencial cuya sesión ya se cerró
- **THEN** el sistema deniega el acceso con un error de acceso no autorizado y no ejecuta la operación

#### Scenario: El registro y el inicio de sesión quedan fuera de la protección
- **WHEN** un visitante sin credencial solicita registrarse o iniciar sesión
- **THEN** el sistema atiende la petición con normalidad y no la trata como acceso no autorizado

### Requirement: Consulta del perfil propio
El sistema SHALL devolver, a quien presente una credencial válida, el perfil de la cuenta titular de esa credencial y de ninguna otra, con su identificador, su nombre completo, su email, sus iniciales, la fecha de alta y la fecha de última actualización.

#### Scenario: Perfil de la cuenta titular de la credencial
- **WHEN** una persona autenticada consulta el perfil
- **THEN** el sistema devuelve el perfil de la cuenta a la que se emitió esa credencial, sin admitir que se pida el de otra cuenta

#### Scenario: Contenido del perfil
- **WHEN** el sistema devuelve un perfil
- **THEN** incluye el identificador de la cuenta, el nombre completo, el email, las iniciales, la fecha de alta y la fecha de última actualización

### Requirement: Iniciales derivadas de la identidad de la cuenta
El sistema SHALL calcular unas iniciales de dos letras mayúsculas para cada cuenta, a partir del nombre completo cuando lo haya y del email cuando no, sin que quien consume el perfil tenga que derivarlas.

#### Scenario: Nombre completo con dos o más palabras
- **WHEN** la cuenta tiene un nombre completo formado por varias palabras
- **THEN** las iniciales son la primera letra de la primera palabra y la primera letra de la segunda, en mayúsculas

#### Scenario: Nombre completo de una sola palabra
- **WHEN** la cuenta tiene un nombre completo de una sola palabra
- **THEN** las iniciales son los dos primeros caracteres de esa palabra, en mayúsculas

#### Scenario: Cuenta sin nombre completo
- **WHEN** la cuenta no tiene nombre completo
- **THEN** las iniciales son la primera letra de la parte del email anterior a la arroba y la primera letra de la parte posterior, en mayúsculas

### Requirement: Cierre de sesión selectivo
El sistema SHALL revocar, al cerrar sesión, únicamente la credencial empleada en esa petición, SHALL dejar intactas las demás credenciales vigentes de la misma cuenta, y SHALL confirmar el cierre.

#### Scenario: Cierre de la sesión en curso
- **WHEN** una persona autenticada cierra la sesión
- **THEN** el sistema confirma el cierre y la credencial empleada deja de servir para acceder a los recursos protegidos

#### Scenario: Las demás sesiones sobreviven
- **WHEN** una persona con varias sesiones abiertas cierra una de ellas
- **THEN** las credenciales de las demás sesiones siguen siendo válidas

#### Scenario: Cierre sin credencial
- **WHEN** alguien intenta cerrar sesión sin presentar una credencial válida
- **THEN** el sistema deniega la petición con un error de acceso no autorizado

### Requirement: Contrato uniforme de las respuestas
El sistema SHALL responder siempre en JSON a las operaciones de cuentas y acceso, cualquiera que sea el formato que pida quien llama, SHALL entregar el resultado útil envuelto bajo una única clave de datos, y SHALL entregar los fallos como una lista de errores con un mensaje por error y, en los de validación, el campo al que se atribuye cada uno.

#### Scenario: Respuesta correcta
- **WHEN** el sistema atiende con éxito un registro, un inicio de sesión o una consulta de perfil
- **THEN** el cuerpo de la respuesta expone el resultado bajo una única clave de datos, de forma homogénea entre las tres operaciones

#### Scenario: Respuesta de error de validación
- **WHEN** el sistema rechaza una petición por datos inválidos
- **THEN** el cuerpo de la respuesta expone una lista de errores en la que cada entrada lleva un mensaje y el campo al que corresponde, de modo que quien llama puede señalar el error junto a su campo

#### Scenario: Formato pedido por quien llama
- **WHEN** alguien pide una de estas operaciones anunciando que espera un formato distinto de JSON
- **THEN** el sistema responde igualmente en JSON, tanto en el caso correcto como en el de error
