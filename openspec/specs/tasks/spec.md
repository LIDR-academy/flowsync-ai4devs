# tasks Specification

## Purpose
Una única lista de tareas compartida por todo el equipo, en la que cualquier miembro puede apuntar trabajo escribiendo solo un título y mantener al día en qué anda cambiando el estado desde la propia fila. Existe para responder «quién está en qué» sin tener que preguntar ni abrir nada.
## Requirements
### Requirement: Una sola lista, la misma para todo el equipo

El sistema SHALL mantener una única lista de tareas compartida por todas las cuentas registradas, y SHALL devolver a cualquiera de ellas exactamente el mismo conjunto de tareas. No SHALL existir ninguna tarea privada ni ninguna vista que muestre a una persona un subconjunto distinto del de las demás.

#### Scenario: Dos cuentas distintas ven lo mismo

- **WHEN** dos cuentas distintas consultan la lista sin que nadie modifique nada entre una consulta y otra
- **THEN** ambas reciben el mismo conjunto de tareas, con los mismos títulos, responsables y estados

#### Scenario: Lo que crea otra persona también se ve

- **WHEN** una cuenta crea una tarea, que queda a su propio nombre
- **THEN** esa tarea aparece en la lista que ve cualquier otra cuenta, sin que exista ninguna opción al crearla que permita ocultarla a los demás

#### Scenario: No hay una lista personal aparte

- **WHEN** se recorren las pantallas y direcciones disponibles en la aplicación buscando otra vista de tareas
- **THEN** solo existe la lista del equipo, y no hay ninguna vista «mis tareas» ni ningún modo de pedir la lista reducida a un responsable concreto

#### Scenario: Consultar la lista no modifica nada

- **WHEN** se consulta la lista dos veces seguidas sin ejecutar ninguna otra acción
- **THEN** la segunda consulta devuelve exactamente lo mismo que la primera, sin que ninguna tarea haya cambiado de estado, de responsable ni de título

#### Scenario: La lista exige haber entrado

- **WHEN** se pide la lista sin una sesión válida
- **THEN** la respuesta es `401` y no se devuelve ninguna tarea

#### Scenario: Ver la lista no requiere ningún permiso especial

- **WHEN** cualquier cuenta registrada, sea cual sea, pide la lista
- **THEN** recibe la lista entera, sin que ninguna parte del contenido quede reservada a un rol

### Requirement: Cada tarea dice de un vistazo título, responsable y estado

El sistema SHALL incluir en cada tarea de la lista su título, su responsable y su estado, de modo que se pueda saber en qué anda cada miembro sin abrir ninguna. El responsable SHALL identificarse por su nombre, y el sistema SHALL NOT exponer en la lista el correo ni ningún otro dato de la cuenta del responsable.

#### Scenario: Los tres datos vienen en la propia lista

- **WHEN** se consulta la lista y hay tareas creadas
- **THEN** cada tarea trae su título, su estado y su responsable, sin necesidad de una segunda petición ni de abrir la tarea

#### Scenario: El responsable se identifica por su nombre

- **WHEN** se mira una tarea cuyo responsable es una cuenta con nombre completo `Ada Lovelace`
- **THEN** se lee `Ada Lovelace`, y en ningún lugar de la lista aparece el correo del responsable ni un identificador interno en el sitio donde va su nombre

#### Scenario: Responsable de una cuenta sin nombre

- **WHEN** el responsable de una tarea es una cuenta que se registró sin rellenar el nombre completo
- **THEN** en la pantalla se lee «Sin nombre» en su lugar, y sigue sin mostrarse su correo

#### Scenario: La lista no adelanta el vencimiento

- **WHEN** se mira la lista
- **THEN** no aparece ninguna fecha de vencimiento ni ninguna marca de tarea vencida en ninguna fila

#### Scenario: La lista no dice quién está conectado

- **WHEN** varias personas usan la aplicación a la vez y una de ellas mira la lista
- **THEN** no ve ninguna señal de presencia, ni quién está en línea, ni ninguna actividad atribuida a una persona

### Requirement: Orden de la lista

El sistema SHALL devolver y mostrar las tareas de la más reciente a la más antigua por su momento de creación, con un orden estable entre consultas, de modo que lo que se acaba de apuntar quede en la primera posición.

#### Scenario: Lo recién creado encabeza la lista

- **WHEN** se crea una tarea y a continuación se consulta la lista
- **THEN** esa tarea ocupa la primera posición, por delante de todas las anteriores

#### Scenario: El orden no cambia solo

- **WHEN** se consulta la lista dos veces sin crear nada en medio
- **THEN** las tareas aparecen en el mismo orden en ambas consultas

### Requirement: Crear una tarea escribiendo solo el título

El sistema SHALL permitir crear una tarea aportando únicamente su título, y SHALL NOT exigir ni ofrecer ningún otro dato en el proceso de creación. Crear una tarea SHALL requerir una sesión válida.

#### Scenario: Un título basta

- **WHEN** se envía una petición de creación con solo un título válido
- **THEN** la respuesta confirma la tarea creada, con su identificador, su título, su responsable y su estado, y esa tarea ya aparece en la lista

#### Scenario: El título es lo único que se tiene en cuenta

- **WHEN** una petición de creación acompaña al título con un responsable o un estado
- **THEN** la tarea se crea igualmente pero esos valores se descartan: nace con los valores por defecto, y no hay forma de fijar responsable o estado en el momento de crear

#### Scenario: Crear exige haber entrado

- **WHEN** se intenta crear una tarea sin una sesión válida
- **THEN** la respuesta es `401` y no se crea ninguna tarea

### Requirement: Una tarea nace a nombre de quien la crea y en «Pendiente»

El sistema SHALL asignar toda tarea recién creada a la cuenta que la crea y SHALL dejarla en el estado «Pendiente», sin que quien la crea haya tenido que elegir ninguna de las dos cosas.

#### Scenario: Nace con el nombre de quien la crea

- **WHEN** una cuenta crea una tarea aportando solo el título
- **THEN** el responsable de esa tarea es esa misma cuenta, sin que se le haya pedido seleccionar a nadie

#### Scenario: Nace pendiente

- **WHEN** una cuenta crea una tarea aportando solo el título
- **THEN** la tarea queda en estado «Pendiente», sin que se le haya pedido elegir el estado

### Requirement: Ninguna tarea existe sin título

El sistema SHALL rechazar toda creación cuyo título esté vacío, se componga solo de espacios en blanco o supere los 200 caracteres, SHALL explicar el motivo señalando el campo del título, y SHALL NOT guardar nunca una versión recortada de un título demasiado largo.

#### Scenario: Sin título no se crea nada

- **WHEN** se intenta crear una tarea sin título
- **THEN** la respuesta es `422` con un error asociado al campo del título, no se crea ninguna tarea, y en la pantalla el motivo aparece junto al propio campo en lenguaje corriente

#### Scenario: Solo espacios no cuenta como título

- **WHEN** se intenta crear una tarea cuyo título son únicamente espacios en blanco
- **THEN** se rechaza exactamente igual que si estuviera vacío, y la lista no gana ninguna fila sin texto

#### Scenario: Los espacios de los extremos no forman parte del título

- **WHEN** se crea una tarea con un título que lleva espacios al principio o al final, como `  Revisar el contrato  `
- **THEN** la tarea se crea con el título sin esos espacios, `Revisar el contrato`

#### Scenario: Un título demasiado largo se avisa, no se recorta

- **WHEN** se intenta crear una tarea con un título de más de 200 caracteres
- **THEN** la respuesta es `422` avisando de que se pasa de largo, no se crea ninguna tarea, y no queda guardada ninguna versión acortada del título

#### Scenario: El límite exacto se admite

- **WHEN** se crea una tarea con un título de exactamente 200 caracteres
- **THEN** la tarea se crea con ese título íntegro

### Requirement: Tres estados fijos

Una tarea SHALL estar siempre en exactamente uno de estos tres estados: «Pendiente», «En curso» o «Hecho». El sistema SHALL NOT ofrecer ninguna forma de añadir, renombrar ni eliminar estados, ni de dejar una tarea sin estado.

#### Scenario: No se admite ningún otro estado

- **WHEN** se intenta cambiar una tarea a un estado que no es ninguno de los tres
- **THEN** la respuesta es `422`, y la tarea conserva el estado que tenía

#### Scenario: No hay forma de tocar el catálogo de estados

- **WHEN** se recorre el producto buscando cómo añadir, renombrar o eliminar un estado
- **THEN** no existe ninguna: ni pantalla, ni acción, ni petición que lo permita, y los estados disponibles siguen siendo exactamente esos tres

#### Scenario: Toda tarea tiene estado

- **WHEN** se consulta cualquier tarea de la lista, recién creada o modificada
- **THEN** trae exactamente uno de los tres estados, nunca ninguno ni más de uno

### Requirement: Cambiar el estado de cualquier tarea

El sistema SHALL permitir cambiar el estado de cualquier tarea de la lista, sea de quien sea, a cualquiera de los tres estados, SHALL requerir una sesión válida para hacerlo, y SHALL NOT alterar en ese cambio ni el título ni el responsable de la tarea.

#### Scenario: El cambio se aplica y persiste

- **WHEN** se cambia el estado de una tarea a uno de los tres válidos
- **THEN** la respuesta confirma la tarea con el nuevo estado, y una consulta posterior de la lista la devuelve ya en ese estado

#### Scenario: También sobre tareas de otras personas

- **WHEN** una cuenta cambia el estado de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin exigir ningún permiso especial y sin devolver ninguna advertencia

#### Scenario: Cambiar el estado no cambia nada más

- **WHEN** se cambia el estado de una tarea
- **THEN** su título y su responsable siguen siendo los mismos que antes del cambio

#### Scenario: Tarea que no existe

- **WHEN** se intenta cambiar el estado de una tarea que no existe
- **THEN** la respuesta es `404` y no se modifica ninguna tarea

#### Scenario: Cambiar el estado exige haber entrado

- **WHEN** se intenta cambiar el estado de una tarea sin una sesión válida
- **THEN** la respuesta es `401` y la tarea conserva su estado

### Requirement: La lista es la pantalla principal de la aplicación

El sistema SHALL mostrar la lista de tareas en `/tasks`, SHALL exigir sesión iniciada para llegar a ella, y SHALL ofrecer desde ella el acceso al perfil de la persona que ha entrado.

#### Scenario: Con sesión se ve la lista entera

- **WHEN** una persona con sesión iniciada abre `/tasks`
- **THEN** ve todas las tareas del equipo, cada una con su título, su responsable y su estado

#### Scenario: Sin sesión no se llega a la lista

- **WHEN** alguien sin sesión abre `/tasks`
- **THEN** acaba en la pantalla de inicio de sesión y no llega a ver ninguna tarea

#### Scenario: Desde la lista se llega al perfil

- **WHEN** una persona está en la lista y busca su cuenta
- **THEN** encuentra en la cabecera un acceso a su perfil, desde donde puede cerrar sesión

### Requirement: El espacio vacío se explica

El sistema SHALL mostrar, cuando todavía no existe ninguna tarea, una explicación de para qué sirve la lista junto a la invitación a crear la primera, en lugar de una lista vacía sin más.

#### Scenario: Todavía no hay ninguna tarea

- **WHEN** una persona abre la lista y el equipo no ha creado ninguna tarea
- **THEN** lee qué es esta lista y se le ofrece crear la primera ahí mismo, sin encontrarse una zona vacía sin ninguna indicación

#### Scenario: El mensaje desaparece en cuanto hay algo

- **WHEN** se crea la primera tarea desde ese estado vacío
- **THEN** la explicación desaparece y en su lugar se ve la lista con esa tarea

### Requirement: Crear una tarea desde la lista

El sistema SHALL ofrecer en la pantalla de la lista un campo para crear una tarea escribiendo solo el título, SHALL mostrar la tarea recién creada en la propia lista sin recargar ni navegar a ninguna otra parte, y SHALL NOT pedir ni sugerir ningún otro dato.

#### Scenario: Crear cuesta un título y un gesto

- **WHEN** se escribe un título en el campo de creación y se confirma
- **THEN** la tarea aparece en la primera posición de la lista sin recargar la página ni salir de la pantalla, y el campo queda vacío listo para la siguiente

#### Scenario: El formulario no pide nada más

- **WHEN** se recorre entero el flujo de creación
- **THEN** el título es lo único que se pide, y no se ofrece ni se sugiere indicar responsable, estado, fecha ni ningún otro dato

#### Scenario: Aviso mientras se crea

- **WHEN** se ha confirmado la creación y la respuesta todavía no ha llegado
- **THEN** la acción de crear queda deshabilitada, de modo que un segundo gesto no crea una tarea duplicada

#### Scenario: Título vacío o en blanco desde la pantalla

- **WHEN** se intenta crear con el campo vacío o con solo espacios
- **THEN** aparece el motivo junto al campo del título y la lista no gana ninguna fila

#### Scenario: Título demasiado largo desde la pantalla

- **WHEN** se intenta crear con un título de más de 200 caracteres
- **THEN** aparece junto al campo el aviso de que se pasa de largo, el texto escrito sigue ahí sin recortar, y no se crea ninguna tarea

### Requirement: Cambiar el estado desde la propia fila

El sistema SHALL permitir cambiar el estado de una tarea desde su fila en la lista, con un solo gesto, sin abrir la tarea, sin diálogo de confirmación y sin rellenar ningún campo, y SHALL reflejar el nuevo estado en la vista de inmediato.

#### Scenario: Un gesto y el estado cambia

- **WHEN** se elige otro estado en la fila de una tarea
- **THEN** la fila pasa a mostrar el nuevo estado de inmediato, sin haber abierto la tarea, sin ningún diálogo de confirmación y sin haber rellenado ningún campo

#### Scenario: Los tres estados están a la vista

- **WHEN** se mira la fila de una tarea
- **THEN** los únicos destinos ofrecidos son «Pendiente», «En curso» y «Hecho», y el estado actual de la tarea se distingue de los otros dos

#### Scenario: Cualquier tarea, no solo la propia

- **WHEN** se cambia desde la fila el estado de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin pedir ningún permiso y sin mostrar ninguna advertencia

#### Scenario: El cambio sobrevive a una recarga

- **WHEN** se cambia el estado de una tarea desde la fila y después se recarga la página
- **THEN** la tarea sigue en el estado nuevo

#### Scenario: El cambio no llega a guardarse

- **WHEN** se cambia el estado de una tarea desde la fila y el servidor rechaza la operación o no responde
- **THEN** la fila vuelve a mostrar el estado que tenía antes y se avisa de que el cambio no se ha guardado

