# auth

## Purpose

Permitir que una persona cree una cuenta, entre con ella, consulte su propio perfil y cierre sesión. Es el único vertical que FlowSync sabe hacer hoy, y la puerta que protege todo lo que se construya después.

## Requirements

### Requirement: Alta de cuenta

El sistema SHALL permitir crear una cuenta indicando nombre, email y contraseña por duplicado, y SHALL devolver en la misma respuesta la cuenta creada y una credencial de acceso ya utilizable.

#### Scenario: Alta correcta

- **WHEN** se envía un alta con un email que nadie usa, una contraseña válida y su repetición idéntica
- **THEN** la cuenta queda creada
- **AND** la respuesta incluye los datos públicos de la cuenta y una credencial de acceso
- **AND** esa credencial sirve de inmediato, sin necesidad de iniciar sesión aparte

#### Scenario: El nombre puede quedar vacío pero el dato debe viajar

- **WHEN** se envía un alta sin valor de nombre, pero declarando el campo
- **THEN** la cuenta se crea sin nombre
- **AND** el sistema no lo trata como un error

#### Scenario: Omitir el campo del nombre sí es un error

- **WHEN** se envía un alta en la que el campo del nombre no aparece
- **THEN** el alta se rechaza indicando que ese campo debe estar presente

### Requirement: Unicidad del email

El sistema SHALL rechazar un alta cuyo email ya pertenezca a otra cuenta, indicando cuál es el campo en conflicto.

#### Scenario: Email ya registrado

- **WHEN** se intenta crear una cuenta con un email que ya existe
- **THEN** el alta se rechaza
- **AND** el mensaje señala el email como campo responsable
- **AND** no se crea ninguna cuenta

### Requirement: Requisitos de la contraseña en el alta

El sistema SHALL exigir que la contraseña tenga entre 8 y 32 caracteres, y que su repetición coincida exactamente.

#### Scenario: Contraseña demasiado corta

- **WHEN** se envía un alta con una contraseña de menos de 8 caracteres
- **THEN** el alta se rechaza indicando el mínimo exigido

#### Scenario: Contraseña demasiado larga

- **WHEN** se envía un alta con una contraseña de más de 32 caracteres
- **THEN** el alta se rechaza indicando el máximo permitido

#### Scenario: La repetición no coincide

- **WHEN** se envía un alta cuya repetición de contraseña difiere de la contraseña
- **THEN** el alta se rechaza señalando el campo de repetición

### Requirement: Validación acumulada

El sistema SHALL informar de todos los problemas de validación detectados en un mismo envío, no solo del primero, indicando para cada uno el campo afectado.

#### Scenario: Varios campos inválidos a la vez

- **WHEN** se envía un alta con email mal formado y contraseña demasiado corta
- **THEN** la respuesta enumera ambos problemas
- **AND** cada uno identifica su campo

### Requirement: Inicio de sesión

El sistema SHALL entregar una credencial de acceso a quien presente el email y la contraseña de una cuenta existente.

#### Scenario: Credenciales correctas

- **WHEN** se presenta el email y la contraseña de una cuenta existente
- **THEN** la respuesta incluye los datos públicos de la cuenta y una credencial de acceso

### Requirement: Un fallo de acceso no revela si la cuenta existe

El sistema SHALL responder de forma indistinguible tanto si la contraseña es incorrecta como si el email no corresponde a ninguna cuenta.

#### Scenario: Contraseña incorrecta

- **WHEN** se intenta entrar con un email existente y una contraseña equivocada
- **THEN** el acceso se deniega con un mensaje genérico de credenciales inválidas

#### Scenario: Cuenta inexistente

- **WHEN** se intenta entrar con un email que no pertenece a ninguna cuenta
- **THEN** el acceso se deniega con **el mismo** mensaje y **el mismo** resultado que en el caso anterior
- **AND** nada en la respuesta permite deducir si la cuenta existe

### Requirement: Consulta del perfil propio

El sistema SHALL permitir a quien presente una credencial válida consultar los datos públicos de su propia cuenta, y SHALL exponer un conjunto cerrado de campos.

#### Scenario: Consulta con credencial válida

- **WHEN** se consulta el perfil presentando una credencial válida
- **THEN** la respuesta contiene identificador, nombre, email, iniciales y las marcas de creación y última modificación

#### Scenario: La contraseña nunca sale

- **WHEN** se obtiene cualquier representación de una cuenta, tanto al darse de alta como al entrar o al consultar el perfil
- **THEN** la respuesta no incluye la contraseña en ninguna forma

### Requirement: Iniciales derivadas del nombre

El sistema SHALL derivar unas iniciales a partir del nombre de la cuenta, y SHALL derivarlas del email cuando no haya nombre.

#### Scenario: Cuenta con nombre y apellido

- **WHEN** la cuenta tiene un nombre compuesto por al menos dos palabras
- **THEN** las iniciales son la primera letra de las dos primeras palabras, en mayúsculas

#### Scenario: Cuenta sin nombre

- **WHEN** la cuenta no tiene nombre
- **THEN** las iniciales se derivan del email
- **AND** la cuenta sigue siendo utilizable con normalidad

### Requirement: Protección de los recursos privados

El sistema SHALL denegar el acceso a los recursos de cuenta cuando no se presente una credencial, cuando la presentada no sea reconocible, o cuando haya dejado de ser válida.

#### Scenario: Sin credencial

- **WHEN** se solicita un recurso de cuenta sin presentar credencial
- **THEN** el acceso se deniega

#### Scenario: Credencial no reconocible

- **WHEN** se solicita un recurso de cuenta presentando una credencial inventada
- **THEN** el acceso se deniega con el mismo resultado que si no se hubiera presentado ninguna

### Requirement: Cierre de sesión

El sistema SHALL invalidar la credencial presentada al cerrar sesión, de forma que deje de dar acceso.

#### Scenario: La credencial deja de servir

- **WHEN** se cierra sesión presentando una credencial válida
- **AND** después se intenta usar esa misma credencial
- **THEN** el acceso se deniega

### Requirement: Sesiones simultáneas independientes

El sistema SHALL permitir que una misma cuenta tenga varias credenciales válidas a la vez, y cerrar sesión SHALL invalidar únicamente la credencial presentada.

#### Scenario: Dos sesiones abiertas

- **WHEN** una misma cuenta inicia sesión dos veces
- **THEN** ambas credenciales dan acceso

#### Scenario: Cerrar una no cierra la otra

- **WHEN** se cierra sesión con una de las dos credenciales
- **THEN** esa credencial deja de servir
- **AND** la otra sigue dando acceso

### Requirement: Entrada a la aplicación

La aplicación SHALL ofrecer pantallas para crear una cuenta y para entrar, y SHALL permitir navegar entre ambas.

#### Scenario: Ir del acceso al alta y volver

- **WHEN** la persona está en la pantalla de acceso
- **THEN** encuentra un enlace visible hacia la pantalla de alta
- **AND** desde el alta puede volver al acceso del mismo modo

### Requirement: El formulario de alta pide lo que el sistema exige

La pantalla de alta SHALL pedir nombre, email y contraseña por duplicado, SHALL indicar que el nombre es opcional, y SHALL informar del rango de longitud admitido para la contraseña antes de intentar el envío.

#### Scenario: Lo que se ve al llegar

- **WHEN** la persona abre la pantalla de alta
- **THEN** ve los cuatro campos
- **AND** el nombre aparece marcado como opcional
- **AND** se indica el rango de longitud admitido para la contraseña

### Requirement: Los errores se explican en pantalla y en castellano

La aplicación SHALL mostrar en la propia pantalla el motivo del rechazo, en castellano, y SHALL situarlo junto al campo responsable cuando el rechazo apunte a un campo concreto.

#### Scenario: Credenciales incorrectas

- **WHEN** se intenta entrar con credenciales que el sistema rechaza
- **THEN** la pantalla muestra un mensaje en castellano explicando el motivo
- **AND** lo escrito no se pierde

#### Scenario: Email ya registrado

- **WHEN** se intenta crear una cuenta con un email que ya existe
- **THEN** el motivo aparece junto al campo del email

#### Scenario: El servidor no responde

- **WHEN** no se puede contactar con el servidor
- **THEN** la pantalla lo explica como problema de conexión
- **AND** no se muestra un mensaje genérico indistinguible de un error de credenciales

### Requirement: Envío en curso

La aplicación SHALL indicar que un envío está en curso y SHALL impedir reenviarlo mientras tanto.

#### Scenario: Doble envío

- **WHEN** la persona confirma un formulario y vuelve a confirmarlo antes de recibir respuesta
- **THEN** el segundo intento no llega a enviarse

### Requirement: La sesión sobrevive a recargar

La aplicación SHALL conservar la sesión entre recargas de página, y SHALL comprobar contra el sistema que la sesión conservada sigue siendo válida antes de darla por buena.

#### Scenario: Recargar con sesión abierta

- **WHEN** la persona recarga la página teniendo sesión abierta
- **THEN** sigue dentro, sin volver a introducir credenciales

#### Scenario: Sesión revocada mientras tanto

- **WHEN** la sesión conservada ha dejado de ser válida
- **THEN** la aplicación la descarta y lleva a la pantalla de acceso
- **AND** explica por qué se perdió la sesión

#### Scenario: Mientras se comprueba no se expulsa

- **WHEN** la comprobación de la sesión conservada todavía no ha terminado
- **THEN** la aplicación muestra que está cargando
- **AND** no lleva a la pantalla de acceso todavía

### Requirement: Rutas según el estado de la sesión

La aplicación SHALL impedir el acceso a las pantallas privadas sin sesión, y SHALL impedir el acceso a las pantallas de acceso y alta con la sesión abierta.

#### Scenario: Pantalla privada sin sesión

- **WHEN** se intenta abrir una pantalla privada sin sesión
- **THEN** la aplicación lleva a la pantalla de acceso

#### Scenario: Pantalla de acceso con sesión

- **WHEN** se intenta abrir la pantalla de acceso teniendo sesión
- **THEN** la aplicación lleva a la pantalla privada

### Requirement: Salir de la aplicación

La aplicación SHALL ofrecer cerrar sesión desde la pantalla privada, SHALL dejar la sesión cerrada localmente aunque el sistema no confirme la operación, y SHALL llevar a la pantalla de acceso.

#### Scenario: Cierre con confirmación del sistema

- **WHEN** la persona cierra sesión
- **THEN** la sesión queda cerrada
- **AND** llega a la pantalla de acceso

#### Scenario: El sistema no confirma el cierre

- **WHEN** la persona cierra sesión y el sistema no puede confirmarlo
- **THEN** la sesión queda cerrada igualmente en el dispositivo
- **AND** el fallo no se manifiesta como un error sin controlar
