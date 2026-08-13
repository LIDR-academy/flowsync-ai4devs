# tasks Specification

## Purpose
Da al equipo su lista de trabajo: una sola lista compartida con todas las tareas del espacio, donde apuntar algo cuesta escribir un título y donde el responsable y el estado de cada tarea se leen sin abrir nada. Es la capability que permite responder «¿en qué anda cada uno?» sin preguntar a nadie.
## Requirements
### Requirement: Creación de una tarea con solo el título

El sistema SHALL crear una tarea a partir únicamente de su título cuando se envíe `POST /api/v1/tasks` con `{"title": "..."}`, sin exigir ningún otro dato, y SHALL devolver la tarea ya creada.

#### Scenario: Alta con el título como único dato

- **WHEN** se envía `POST /api/v1/tasks` con `{"title": "Revisar el informe"}` y un token válido
- **THEN** la respuesta es `201` con `{"data": {"id": ..., "title": "Revisar el informe", "status": "pending", "assignee": {...}, "createdAt": ..., "updatedAt": ...}}`

#### Scenario: La tarea nace a nombre de quien la crea

- **WHEN** se crea una tarea con un token cualquiera
- **THEN** el `assignee` de la tarea creada es la cuenta dueña de ese token, sin que la petición haya indicado ningún responsable

#### Scenario: La tarea nace pendiente

- **WHEN** se crea una tarea sin indicar estado
- **THEN** su `status` es `pending`

#### Scenario: No se admite fijar responsable ni estado al crear

- **WHEN** se envía una creación que incluye además `"status"` o un identificador de responsable en el cuerpo
- **THEN** esos valores se ignoran y la tarea se crea igualmente a nombre de quien la envía y en estado `pending`

### Requirement: Ninguna tarea sin título

El sistema SHALL rechazar con `422` toda creación cuyo título esté vacío o se componga solo de espacios, sin crear ninguna tarea, e SHALL ignorar los espacios sobrantes de los extremos del título que sí acepta.

#### Scenario: Título ausente o vacío

- **WHEN** se envía `POST /api/v1/tasks` sin `title` o con `{"title": ""}`
- **THEN** la respuesta es `422` con un error sobre el campo `title` y no se crea ninguna tarea

#### Scenario: Título de solo espacios

- **WHEN** se envía `POST /api/v1/tasks` con `{"title": "   "}`
- **THEN** la respuesta es `422` igual que si el campo viniera vacío, y la lista no gana ninguna fila sin texto

#### Scenario: Espacios en los extremos

- **WHEN** se crea una tarea con `{"title": "  Revisar el informe  "}`
- **THEN** la tarea queda con el título `"Revisar el informe"`

### Requirement: Aviso ante un título demasiado largo

El sistema SHALL aceptar títulos de hasta 200 caracteres y SHALL rechazar con `422` los que superen esa longitud, sin guardar en ningún caso una versión recortada del título recibido.

#### Scenario: Título en el límite

- **WHEN** se crea una tarea con un título de exactamente 200 caracteres
- **THEN** la tarea se crea y conserva el título íntegro

#### Scenario: Título que se pasa de largo

- **WHEN** se envía una creación con un título de 201 caracteres o más
- **THEN** la respuesta es `422` con un error sobre el campo `title`, no se crea ninguna tarea y no se guarda ninguna versión recortada

### Requirement: Una sola lista compartida del espacio

El sistema SHALL devolver en `GET /api/v1/tasks` todas las tareas del espacio, el mismo conjunto para cualquier cuenta que lo pida, ordenadas de la más reciente a la más antigua por su fecha de creación. No SHALL existir ninguna forma de crear una tarea que otras cuentas no puedan ver, ni ninguna colección de tareas distinta de esta.

#### Scenario: El contenido no depende de quién mira

- **WHEN** dos cuentas distintas solicitan `GET /api/v1/tasks` sin que nada haya cambiado entre ambas peticiones
- **THEN** las dos reciben exactamente el mismo conjunto de tareas, en el mismo orden

#### Scenario: Las tareas ajenas también salen

- **WHEN** una cuenta crea una tarea y otra distinta solicita la lista
- **THEN** esa tarea aparece en la lista de la segunda, con su responsable a la vista

#### Scenario: Orden de la lista

- **WHEN** se solicita la lista después de haber creado tres tareas seguidas
- **THEN** llegan con la creada en último lugar la primera y la creada en primer lugar la última

#### Scenario: La lista llega entera

- **WHEN** se solicita la lista de un espacio con muchas tareas
- **THEN** llegan todas en una sola respuesta, sin paginar ni recortar el conjunto

#### Scenario: Pedir la lista no cambia nada

- **WHEN** se solicita la lista tantas veces como se quiera
- **THEN** ninguna tarea cambia de estado ni de responsable como consecuencia de haberla mirado

### Requirement: Lo que cada tarea muestra de su responsable

El sistema SHALL acompañar cada tarea del nombre y las iniciales de su responsable, lo justo para identificarlo en la lista, y NO SHALL exponer junto a la tarea ningún otro dato de esa cuenta, en particular su email.

#### Scenario: Responsable identificable

- **WHEN** se obtiene una tarea cuyo responsable se llama "Ada Lovelace"
- **THEN** su `assignee` trae el nombre "Ada Lovelace" y sus iniciales, y esos datos bastan para saber quién la lleva

#### Scenario: La tarea no filtra datos de cuenta

- **WHEN** se obtiene cualquier tarea, suelta o dentro de la lista
- **THEN** su `assignee` no incluye el email de esa cuenta ni ningún otro dato de acceso

#### Scenario: Responsable sin nombre

- **WHEN** el responsable de una tarea es una cuenta que se registró sin nombre
- **THEN** su nombre llega nulo y sus iniciales siguen llegando, para que la interfaz pueda representarlo sin recurrir a su email

### Requirement: Tres estados fijos

El sistema SHALL mantener toda tarea en exactamente uno de estos tres estados: `pending`, `in_progress` o `done`. NO SHALL ofrecer ninguna forma de añadir, renombrar ni eliminar un estado.

#### Scenario: Un estado que no existe

- **WHEN** se intenta poner una tarea en un estado distinto de esos tres
- **THEN** la respuesta es `422`, la tarea conserva el estado que tenía y el estado inventado no pasa a existir

#### Scenario: El catálogo de estados no se toca

- **WHEN** se recorre la API entera en busca de una operación para crear, renombrar o borrar un estado
- **THEN** no existe ninguna

### Requirement: Cambio de estado de cualquier tarea

El sistema SHALL cambiar el estado de una tarea al recibir `PATCH /api/v1/tasks/:id/status` con el estado de destino, y SHALL permitir cualquier transición entre los tres estados —incluida la vuelta desde `done`— a cualquier cuenta con sesión, sea o no la responsable de esa tarea.

#### Scenario: Cambio de estado correcto

- **WHEN** se envía `PATCH /api/v1/tasks/:id/status` con `{"status": "in_progress"}` sobre una tarea pendiente
- **THEN** la respuesta es `200` con la tarea ya en `in_progress`, y las siguientes consultas de la lista la devuelven en ese estado

#### Scenario: Cambiar una tarea de otra persona

- **WHEN** una cuenta cambia el estado de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica igual que en una tarea propia, sin exigir ningún permiso adicional

#### Scenario: Vuelta atrás desde hecho

- **WHEN** se cambia a `pending` una tarea que estaba en `done`
- **THEN** el cambio se aplica, de modo que marcar algo como hecho por error tiene arreglo

#### Scenario: Cambiar el estado no toca nada más

- **WHEN** se cambia el estado de una tarea
- **THEN** su título y su responsable siguen siendo los mismos

#### Scenario: Tarea inexistente

- **WHEN** se intenta cambiar el estado de una tarea que no existe
- **THEN** la respuesta es `404`

### Requirement: Las tareas exigen sesión

El sistema SHALL exigir un token de acceso válido para listar, crear y cambiar el estado de tareas, respondiendo `401` cuando falte o no sea válido, sin devolver ninguna tarea ni ejecutar la operación.

#### Scenario: Listar sin haber entrado

- **WHEN** se solicita `GET /api/v1/tasks` sin cabecera `Authorization`
- **THEN** la respuesta es `401` y no se devuelve ninguna tarea

#### Scenario: Escribir sin haber entrado

- **WHEN** se intenta crear una tarea o cambiar un estado sin token válido
- **THEN** la respuesta es `401` y nada cambia en el espacio

#### Scenario: Ver la lista no pide nada más que la sesión

- **WHEN** cualquier cuenta registrada solicita la lista
- **THEN** la recibe entera, sin contenido reservado a ningún rol ni permiso especial

### Requirement: Pantalla de la lista del equipo

La interfaz SHALL mostrar la lista compartida como pantalla propia, accesible solo con sesión abierta, en la que cada tarea ocupe una fila que enseñe su título, quién la lleva y en qué estado está, sin necesidad de abrirla.

#### Scenario: Lista con tareas

- **WHEN** una persona con sesión abierta entra en la lista de un espacio con tareas
- **THEN** ve todas las tareas del equipo, y en cada fila el título, el nombre del responsable y el estado, escrito como "Pendiente", "En curso" o "Hecho"

#### Scenario: Saber en qué anda cada uno

- **WHEN** recorre la lista con la vista
- **THEN** puede decir en qué trabaja cada miembro del equipo sin pulsar en ninguna tarea

#### Scenario: Responsable sin nombre

- **WHEN** una fila corresponde a una tarea cuyo responsable no tiene nombre en su cuenta
- **THEN** en su lugar se muestra "Sin nombre" junto a sus iniciales, y en ningún caso su email ni un identificador interno

#### Scenario: Llegar a la lista sin sesión

- **WHEN** alguien sin sesión abierta intenta llegar a la lista
- **THEN** se le lleva a la pantalla de inicio de sesión y no ve ninguna tarea

### Requirement: El espacio sin tareas

La interfaz SHALL explicar de qué va la lista y ofrecer crear la primera tarea cuando el espacio esté vacío, en lugar de presentar una lista vacía sin más.

#### Scenario: Todavía no hay nada

- **WHEN** se entra en la lista de un espacio en el que no se ha creado ninguna tarea
- **THEN** se explica qué es esta lista y se ofrece crear la primera tarea, sin dejar la pantalla en blanco

#### Scenario: La primera tarea llena el espacio

- **WHEN** se crea la primera tarea desde ese estado
- **THEN** la explicación desaparece y en su sitio queda la lista con esa tarea

### Requirement: Crear una tarea desde la lista

La interfaz SHALL permitir crear una tarea desde la propia lista escribiendo solo su título, NO SHALL pedir ni sugerir ningún otro dato, y SHALL mostrar la tarea recién creada en la lista sin recargar la página ni navegar a otra pantalla.

#### Scenario: Apuntar algo en un gesto

- **WHEN** se escribe un título y se confirma la creación
- **THEN** la tarea aparece en la lista, a nombre de quien la ha creado y como "Pendiente", sin haber salido de la pantalla ni recargado nada

#### Scenario: El formulario no pide nada más

- **WHEN** se recorre el flujo de creación entero
- **THEN** el título es el único dato que se pide, y no se ofrece ni se sugiere indicar responsable, estado, fecha ni ningún otro campo

#### Scenario: El campo queda listo para la siguiente

- **WHEN** se termina de crear una tarea
- **THEN** el campo del título queda vacío y disponible para apuntar la siguiente

### Requirement: Aviso al intentar crear sin un título válido

La interfaz SHALL explicar el problema junto al propio campo del título, en lenguaje corriente, cuando se intente crear una tarea sin título, con solo espacios o con un título más largo del admitido, y NO SHALL crear ninguna tarea en esos casos.

#### Scenario: Intento sin escribir nada

- **WHEN** se intenta crear una tarea con el campo del título vacío
- **THEN** aparece un mensaje junto al campo explicando que hace falta un título, y la lista no cambia

#### Scenario: Solo espacios

- **WHEN** se intenta crear una tarea escribiendo únicamente espacios
- **THEN** se avisa igual que con el campo vacío y no aparece ninguna fila sin texto

#### Scenario: Título demasiado largo

- **WHEN** se intenta crear una tarea con un título de más de 200 caracteres
- **THEN** se avisa junto al campo de que se pasa de largo, se conserva lo escrito y no se guarda ninguna versión recortada

### Requirement: Cambiar el estado desde la propia fila

La interfaz SHALL permitir cambiar el estado de cualquier tarea desde su fila de la lista, sin abrir la tarea, sin diálogo de confirmación y sin rellenar ningún campo, ofreciendo como únicos destinos los tres estados, y SHALL reflejar el nuevo estado en la vista de inmediato.

#### Scenario: Cambio sin salir de la lista

- **WHEN** se cambia el estado de una tarea desde su fila
- **THEN** la fila pasa a mostrar el nuevo estado al momento, sin haber abierto la tarea, sin confirmar en ningún diálogo y sin rellenar ningún campo

#### Scenario: Los únicos destinos posibles

- **WHEN** se despliega a qué estados se puede cambiar una tarea
- **THEN** los únicos ofrecidos son "Pendiente", "En curso" y "Hecho", y al terminar la tarea queda en exactamente uno de ellos

#### Scenario: También en las tareas de otros

- **WHEN** se cambia el estado de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin pedir permiso ni mostrar advertencia alguna

#### Scenario: El cambio no cuela

- **WHEN** el cambio de estado no llega a aplicarse porque el servidor lo rechaza o no responde
- **THEN** la fila vuelve a mostrar el estado que la tarea tiene de verdad y se avisa de que no se ha podido cambiar

### Requirement: Una sola vista de tareas, sin señales de presencia

La interfaz NO SHALL ofrecer ninguna vista de tareas distinta de la lista compartida —en particular, ninguna vista de «mis tareas»— ni mostrar quién está conectado o qué está haciendo cada persona en tiempo real.

#### Scenario: No hay lista personal

- **WHEN** se recorre la aplicación en busca de otras vistas de tareas
- **THEN** no existe ninguna vista de tareas propias separada de la lista del equipo

#### Scenario: Sin señales de presencia

- **WHEN** varias personas del equipo usan la aplicación a la vez
- **THEN** la lista no muestra quién está en línea, ni actividad por persona, ni ninguna otra señal de presencia

#### Scenario: La lista no adelanta el vencimiento

- **WHEN** se mira cualquier fila de la lista
- **THEN** no aparece ninguna fecha de vencimiento ni marca de tarea vencida

