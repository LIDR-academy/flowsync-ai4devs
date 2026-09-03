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

El sistema SHALL devolver en `GET /api/v1/tasks` las tareas del espacio que correspondan al alcance pedido, el mismo conjunto para cualquier cuenta que pida ese mismo alcance, ordenadas de la más reciente a la más antigua por su fecha de creación. Sin acotar, el alcance SHALL ser las tareas pendientes y en curso, dejando fuera las hechas; NO SHALL existir ningún alcance que devuelva las hechas mezcladas con el resto. No SHALL existir ninguna forma de crear una tarea que otras cuentas no puedan ver, ni ninguna colección de tareas distinta de esta.

#### Scenario: Sin filtro no es «todas»

- **WHEN** se solicita `GET /api/v1/tasks` sin acotar, en un espacio con tareas en los tres estados
- **THEN** llegan las pendientes y las que están en curso, y ninguna de las hechas

#### Scenario: El contenido no depende de quién mira

- **WHEN** dos cuentas distintas solicitan `GET /api/v1/tasks` con el mismo alcance y sin que nada haya cambiado entre ambas peticiones
- **THEN** las dos reciben exactamente el mismo conjunto de tareas, en el mismo orden

#### Scenario: Las tareas ajenas también salen

- **WHEN** una cuenta crea una tarea y otra distinta solicita la lista
- **THEN** esa tarea aparece en la lista de la segunda, con su responsable a la vista

#### Scenario: Orden de la lista

- **WHEN** se solicita la lista después de haber creado tres tareas seguidas
- **THEN** llegan con la creada en último lugar la primera y la creada en primer lugar la última

#### Scenario: La lista llega entera

- **WHEN** se solicita la lista de un espacio con muchas tareas
- **THEN** llegan todas las del alcance pedido en una sola respuesta, sin paginar ni recortar el conjunto

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

La interfaz SHALL mostrar la lista compartida como pantalla propia, accesible solo con sesión abierta, en la que cada tarea ocupe una fila que enseñe su título, quién la lleva y en qué estado está, sin necesidad de abrirla. Al entrar SHALL mostrarse la vista por defecto —las pendientes y las que están en curso—, y las hechas SHALL quedar fuera de ella y alcanzables acotando la lista.

#### Scenario: Lista con tareas

- **WHEN** una persona con sesión abierta entra en la lista de un espacio con tareas
- **THEN** ve las tareas pendientes y en curso del equipo, y en cada fila el título, el nombre del responsable y el estado, escrito como "Pendiente", "En curso" o "Hecho"

#### Scenario: Lo hecho no ocupa sitio

- **WHEN** entra en la lista sin tocar ningún filtro, en un espacio que tiene tareas en los tres estados
- **THEN** no ve ninguna de las hechas, y puede verlas acotando la lista por ese estado

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

La interfaz SHALL explicar de qué va la lista y ofrecer crear la primera tarea cuando el espacio no tenga ninguna tarea en ningún estado, en lugar de presentar una lista vacía sin más. Ese mensaje NO SHALL mostrarse cuando la lista se quede sin filas por el filtro aplicado o porque todo lo que hay está hecho: en esos casos hay tareas creadas, y decir lo contrario sería falso.

#### Scenario: Todavía no hay nada

- **WHEN** se entra en la lista de un espacio en el que no se ha creado ninguna tarea
- **THEN** se explica qué es esta lista y se ofrece crear la primera tarea, sin dejar la pantalla en blanco

#### Scenario: La primera tarea llena el espacio

- **WHEN** se crea la primera tarea desde ese estado
- **THEN** la explicación desaparece y en su sitio queda la lista con esa tarea

#### Scenario: Vacío que no es un espacio vacío

- **WHEN** la lista no muestra ninguna fila pero el espacio sí tiene tareas creadas, sea porque están todas hechas o porque el filtro aplicado no encuentra ninguna
- **THEN** no se muestra esta explicación, sino el mensaje que corresponde a ese caso

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

La interfaz NO SHALL ofrecer ninguna vista de tareas distinta de la lista compartida —en particular, ninguna vista de «mis tareas»— ni mostrar quién está conectado o qué está haciendo cada persona en tiempo real. Acotar la lista por estado NO SHALL contar como una vista de tareas rival: es una lente sobre la única lista, personal de quien la aplica, y el estado SHALL ser la única dimensión por la que se pueda acotar. La pantalla de una tarea concreta NO SHALL contar como una vista de tareas rival: enseña una sola tarea a la que se llega desde la lista, y no ofrece ningún criterio para reunir varias.

#### Scenario: No hay lista personal

- **WHEN** se recorre la aplicación en busca de otras vistas de tareas
- **THEN** no existe ninguna vista de tareas propias separada de la lista del equipo

#### Scenario: El estado es la única dimensión

- **WHEN** se buscan las formas de acotar lo que muestra la lista
- **THEN** la única disponible es el estado, y no existe ninguna forma de acotar por responsable

#### Scenario: El filtro es una lente mía

- **WHEN** una cuenta aplica o quita un filtro mientras otra tiene la lista abierta
- **THEN** la vista de la segunda no cambia en absoluto: lo compartido es el contenido, no la lente

#### Scenario: Sin señales de presencia

- **WHEN** varias personas del equipo usan la aplicación a la vez
- **THEN** la lista no muestra quién está en línea, ni actividad por persona, ni ninguna otra señal de presencia

#### Scenario: La lista no adelanta el vencimiento

- **WHEN** se mira cualquier fila de la lista
- **THEN** no aparece ninguna fecha de vencimiento ni marca de tarea vencida

#### Scenario: La pantalla de una tarea no reúne tareas

- **WHEN** se abre una tarea y se recorre su pantalla entera
- **THEN** solo se ve esa tarea, y no hay ninguna forma de convertirla en una colección de tareas filtrada por responsable, por fecha ni por ningún otro criterio

### Requirement: Fecha de vencimiento opcional

El sistema SHALL permitir que una tarea tenga una fecha de vencimiento expresada como un día del calendario, sin hora, o que no tenga ninguna. No tener fecha SHALL ser el estado normal de una tarea y NO SHALL tratarse como un dato incompleto ni pendiente de rellenar.

#### Scenario: Una tarea nace sin fecha

- **WHEN** se crea una tarea
- **THEN** queda sin fecha de vencimiento, sin que la creación haya ofrecido ni admitido ninguna

#### Scenario: La creación no acepta fecha ni aunque se envíe

- **WHEN** se envía una creación de tarea que incluye además una fecha de vencimiento en el cuerpo
- **THEN** ese valor se ignora y la tarea se crea igualmente sin fecha

#### Scenario: La fecha es un día, no un instante

- **WHEN** se consulta una tarea con fecha de vencimiento
- **THEN** su fecha llega como un día del calendario en formato `AAAA-MM-DD`, sin hora ni huso horario asociados

#### Scenario: Sin fecha se dice explícitamente

- **WHEN** se consulta una tarea que no tiene fecha de vencimiento
- **THEN** su fecha llega como nula, y no como una fecha inventada, vacía o por defecto

### Requirement: Fijar, cambiar y retirar la fecha de vencimiento

El sistema SHALL permitir establecer la fecha de vencimiento de una tarea existente, cambiarla por otra y retirarla, mediante `PUT /api/v1/tasks/:id/due-date` con `{"dueDate": "AAAA-MM-DD"}` o `{"dueDate": null}`, respondiendo `200` con la tarea ya actualizada. Retirar la fecha SHALL ser una operación admitida y NO SHALL tratarse como un error.

#### Scenario: Poner una fecha a una tarea que no tenía

- **WHEN** se envía `PUT /api/v1/tasks/:id/due-date` con `{"today": "2026-08-26", "dueDate": "2026-09-30"}` sobre una tarea sin fecha
- **THEN** la respuesta es `200` con la tarea ya con esa fecha, y las siguientes consultas la devuelven con ella

#### Scenario: Cambiar la fecha por otra

- **WHEN** se envía una fecha distinta sobre una tarea que ya tenía una
- **THEN** la nueva sustituye a la anterior, sin conservar rastro de la vieja

#### Scenario: Quitar la fecha

- **WHEN** se envía `{"today": "2026-08-26", "dueDate": null}` sobre una tarea con fecha
- **THEN** la respuesta es `200`, la tarea queda sin fecha y deja de estar vencida si lo estaba

#### Scenario: Una fecha ya pasada se acepta

- **WHEN** se fija una fecha anterior al día de hoy
- **THEN** el sistema la acepta sin rechazarla ni advertir nada, y la tarea pasa a estar vencida

#### Scenario: Una fecha que no existe se rechaza

- **WHEN** se envía una fecha imposible o mal formada, como `"2026-02-31"` o `"30/09/2026"`
- **THEN** la respuesta es `422` con un error sobre el campo de la fecha, y la tarea conserva intacta la fecha que tuviera antes

#### Scenario: Fijar la fecha de una tarea ajena

- **WHEN** una cuenta pone o quita la fecha de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica igual que en una tarea propia, sin exigir permiso adicional ni devolver advertencia alguna

#### Scenario: Tocar la fecha no toca nada más

- **WHEN** se cambia o se retira la fecha de una tarea
- **THEN** su título, su responsable y su estado siguen siendo exactamente los mismos

#### Scenario: Tarea inexistente

- **WHEN** se intenta fijar la fecha de una tarea que no existe
- **THEN** la respuesta es `404`

### Requirement: Cuándo una tarea está vencida

El sistema SHALL considerar vencida una tarea si, y solo si, cumple las tres condiciones a la vez: tiene fecha de vencimiento, esa fecha es **anterior** al día de referencia, y su estado no es `done`. El sistema SHALL comunicar esa condición como un dato propio de la tarea, sin obligar a quien la consulta a compararla con ninguna fecha.

#### Scenario: Fecha del día anterior

- **WHEN** se consulta una tarea no hecha cuya fecha de vencimiento es el día anterior al de referencia
- **THEN** la tarea llega marcada como vencida

#### Scenario: Vencer hoy todavía no es estar vencida

- **WHEN** se consulta una tarea no hecha cuya fecha de vencimiento es exactamente el día de referencia
- **THEN** la tarea NO llega marcada como vencida, porque la regla exige que la fecha sea anterior

#### Scenario: Fecha futura

- **WHEN** se consulta una tarea cuya fecha de vencimiento es posterior al día de referencia
- **THEN** la tarea no llega marcada como vencida

#### Scenario: Sin fecha no se vence nunca

- **WHEN** se consulta una tarea sin fecha de vencimiento, creada hace semanas y todavía pendiente
- **THEN** la tarea no llega marcada como vencida, por antigua que sea

#### Scenario: Darla por hecha la deja de vencer

- **WHEN** una tarea vencida pasa al estado `done`
- **THEN** deja de llegar marcada como vencida, y su fecha de vencimiento sigue siendo la misma que antes del cambio

#### Scenario: Una tarea hecha con la fecha pasada

- **WHEN** se consulta una tarea en estado `done` cuya fecha ya pasó
- **THEN** no llega marcada como vencida

#### Scenario: Aplazar resuelve el vencimiento

- **WHEN** a una tarea vencida se le cambia la fecha por una posterior al día de referencia
- **THEN** deja de llegar marcada como vencida en la misma respuesta de ese cambio

### Requirement: El día de referencia lo pone quien mira

El sistema SHALL resolver el vencimiento en el momento de cada consulta y contra el día que indique quien la hace, en el parámetro `today` con formato `AAAA-MM-DD`. NO SHALL congelar la condición de vencida al guardar la tarea, ni SHALL sustituir el día que falte por el del reloj del servidor: toda petición que deba informar del vencimiento SHALL exigir ese día y responder `422` si no llega o no es una fecha válida.

#### Scenario: Dos husos, dos lecturas, ambas correctas

- **WHEN** dos cuentas consultan a la vez la misma tarea no hecha con fecha `2026-08-12`, una indicando `today=2026-08-13` y la otra `today=2026-08-12`
- **THEN** la primera la recibe marcada como vencida y la segunda no, sin que ninguna de las dos lecturas sea errónea

#### Scenario: Una tarea vence sola al pasar la medianoche

- **WHEN** se consulta una tarea no hecha con fecha `2026-08-13` indicando `today=2026-08-13`, y después se vuelve a consultar sin que nadie la haya modificado, indicando ya `today=2026-08-14`
- **THEN** en la primera consulta no llega vencida y en la segunda sí, sin que ningún dato de la tarea haya cambiado

#### Scenario: Falta el día de referencia

- **WHEN** se consulta una tarea suelta sin indicar `today`
- **THEN** la respuesta es `422` con un error sobre ese parámetro, y el sistema no responde usando su propio día

#### Scenario: Día de referencia que no vale

- **WHEN** se indica un `today` mal formado o imposible
- **THEN** la respuesta es `422` con un error sobre ese parámetro, y no se devuelve ninguna tarea

### Requirement: Una petición mal formada se rechaza antes de buscar nada

El sistema SHALL validar la petición antes de resolver el identificador de la ruta, de modo que una petición mal formada sobre un identificador inexistente SHALL responder `422` y no `404`.

Un `404` afirma que la petición se entendió y que el recurso no está. Esa afirmación NO SHALL hacerse sobre una petición que el sistema no ha podido entender.

#### Scenario: Estado inventado sobre una tarea que no existe

- **WHEN** se envía `PATCH /api/v1/tasks/:id/status` con un estado que no pertenece al dominio y un identificador que no corresponde a ninguna tarea
- **THEN** la respuesta es `422` señalando el campo del estado, y no `404`

#### Scenario: Fecha inválida sobre una tarea que no existe

- **WHEN** se envía `PUT /api/v1/tasks/:id/due-date` con una fecha que no existe en el calendario y un identificador que no corresponde a ninguna tarea
- **THEN** la respuesta es `422` señalando el campo de la fecha, y no `404`

#### Scenario: Petición bien formada sobre una tarea que no existe

- **WHEN** la petición es válida y el identificador no corresponde a ninguna tarea
- **THEN** la respuesta es `404`, porque ahí sí se entendió lo que se pedía

### Requirement: Consulta de una tarea suelta

El sistema SHALL devolver una tarea concreta en `GET /api/v1/tasks/:id`, con su título, su responsable, su estado, su fecha de vencimiento y su condición de vencida, respondiendo `404` si esa tarea no existe. Esta consulta SHALL exigir sesión iniciada, igual que el resto del espacio, y NO SHALL comprobar quién es el responsable de la tarea.

#### Scenario: Tarea existente

- **WHEN** se solicita `GET /api/v1/tasks/:id` de una tarea existente con un token válido y un día de referencia
- **THEN** la respuesta es `200` con esa tarea, incluidos su fecha de vencimiento —o la ausencia de ella— y su condición de vencida

#### Scenario: Tarea que no existe

- **WHEN** se solicita una tarea con un identificador que no corresponde a ninguna
- **THEN** la respuesta es `404`

#### Scenario: Consultar una tarea ajena

- **WHEN** una cuenta consulta una tarea cuyo responsable es otra
- **THEN** la recibe entera igual que si fuera suya

#### Scenario: Consultar sin haber entrado

- **WHEN** se solicita una tarea suelta sin cabecera `Authorization` válida
- **THEN** la respuesta es `401` y no se devuelve ninguna tarea

#### Scenario: Mirar una tarea no la cambia

- **WHEN** se consulta una tarea tantas veces como se quiera
- **THEN** ni su fecha ni su estado ni su responsable cambian como consecuencia de haberla mirado

### Requirement: La lista no lleva el vencimiento

El sistema NO SHALL incluir la fecha de vencimiento ni la condición de vencida en las tareas que devuelve `GET /api/v1/tasks`, de modo que ninguna vista construida sobre la lista pueda mostrarlas. La lista SHALL seguir devolviendo exactamente los mismos datos por tarea que antes de existir el vencimiento.

#### Scenario: La lista calla sobre el vencimiento

- **WHEN** se solicita `GET /api/v1/tasks` en un espacio con tareas con fecha, algunas de ellas vencidas
- **THEN** ninguna de las tareas devueltas trae fecha de vencimiento ni condición de vencida

#### Scenario: La lista no pide día de referencia

- **WHEN** se solicita la lista sin indicar ningún día de referencia
- **THEN** la respuesta es correcta, porque la lista no informa del vencimiento y por tanto no lo necesita

### Requirement: Pantalla de una tarea

La interfaz SHALL ofrecer una pantalla propia por tarea, a la que se llegue desde su fila en la lista y desde la que se pueda volver a ella, accesible solo con sesión abierta, en la que se vean su título, su responsable, su estado y su fecha de vencimiento.

#### Scenario: Abrir una tarea desde la lista

- **WHEN** se abre una tarea desde su fila
- **THEN** se llega a una pantalla dedicada a esa tarea, con su título, quién la lleva, en qué estado está y qué fecha de vencimiento tiene

#### Scenario: Volver a la lista

- **WHEN** se está en la pantalla de una tarea
- **THEN** hay una forma visible de volver a la lista del equipo

#### Scenario: Abrir una tarea sin sesión

- **WHEN** alguien sin sesión abierta intenta llegar a la pantalla de una tarea
- **THEN** se le lleva a la pantalla de inicio de sesión y no ve ningún dato de la tarea

#### Scenario: Abrir una tarea que no existe

- **WHEN** se intenta abrir una tarea que no existe
- **THEN** se explica que no se ha encontrado y se ofrece volver a la lista, en lugar de dejar la pantalla vacía o en carga

### Requirement: Poner y quitar la fecha desde la pantalla de la tarea

La interfaz SHALL permitir indicar, cambiar y quitar la fecha de vencimiento desde la pantalla de la tarea, SHALL reflejar el cambio al instante sin recargar ni volver a abrirla, y SHALL guardarlo sin ningún paso adicional. Quitar la fecha NO SHALL abrir ningún diálogo de confirmación.

#### Scenario: Indicar una fecha

- **WHEN** se indica una fecha de vencimiento en una tarea que no tenía
- **THEN** la pantalla pasa a mostrar esa fecha al momento, sin recargar ni volver a abrir la tarea

#### Scenario: El cambio ya está guardado

- **WHEN** se pone o se quita la fecha y se sale de la pantalla de la tarea
- **THEN** el cambio ya está guardado, sin que haya hecho falta confirmar ni pulsar ningún botón de guardado

#### Scenario: Quitar la fecha en un gesto

- **WHEN** se quita la fecha de una tarea que la tenía
- **THEN** el cambio se aplica directamente, sin diálogo de confirmación, y la tarea pasa a mostrarse sin fecha

#### Scenario: La fecha de una tarea de otra persona

- **WHEN** se cambia la fecha de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin advertencia ni permiso especial

#### Scenario: El cambio no cuela

- **WHEN** el cambio de fecha no llega a aplicarse porque el servidor lo rechaza o no responde
- **THEN** la pantalla vuelve a mostrar la fecha que la tarea tiene de verdad y se avisa de que no se ha podido cambiar

### Requirement: Aviso ante una fecha que no vale

La interfaz SHALL explicar el problema junto al propio campo de la fecha, en lenguaje corriente, cuando se intente indicar una fecha inexistente o incompleta, y la tarea SHALL conservar la fecha que tuviera antes.

#### Scenario: Fecha imposible o incompleta

- **WHEN** se intenta indicar una fecha que no existe o que está a medias
- **THEN** aparece un mensaje junto al campo explicando el problema en castellano, y la tarea mantiene la fecha que tuviera

#### Scenario: El aviso no es un callejón sin salida

- **WHEN** después de ese aviso se indica una fecha válida
- **THEN** el mensaje desaparece y la fecha se guarda con normalidad

### Requirement: La señal de tarea vencida

La interfaz SHALL indicar explícitamente que una tarea está vencida al abrirla, con una señal propia y no solo mostrando su fecha, de modo que no haga falta compararla con el día de hoy. Esa señal NO SHALL depender únicamente del color, y SHALL cumplir el contraste y la operabilidad por teclado exigidos al resto de la interfaz.

#### Scenario: Una tarea vencida se anuncia

- **WHEN** se abre una tarea con fecha anterior a hoy que no está hecha
- **THEN** se indica explícitamente que está vencida, sin que haya que comparar su fecha con la de hoy

#### Scenario: La señal no es solo un color

- **WHEN** se percibe esa señal sin distinguir colores
- **THEN** sigue siendo posible saber que la tarea está vencida, porque la señal incluye texto además de color

#### Scenario: Vencer hoy no se anuncia

- **WHEN** se abre una tarea cuya fecha es la de hoy y no está hecha
- **THEN** no se muestra ninguna señal de vencida

#### Scenario: Una tarea hecha no se anuncia vencida

- **WHEN** se abre una tarea en estado "Hecho" cuya fecha ya pasó
- **THEN** no se muestra ninguna señal de vencida

### Requirement: No tener fecha no se penaliza

La interfaz NO SHALL mostrar aviso, recordatorio, marca ni indicación alguna de que a una tarea le falte la fecha de vencimiento, ni en la lista ni al abrirla.

#### Scenario: Una tarea sin fecha en la lista

- **WHEN** se mira en la lista una tarea sin fecha de vencimiento
- **THEN** su fila no se distingue en nada de las demás por no tenerla

#### Scenario: Una tarea sin fecha abierta

- **WHEN** se abre una tarea sin fecha de vencimiento
- **THEN** se ve que no tiene fecha y se puede ponerle una, sin ningún aviso, recordatorio ni señal de que le falte algo

### Requirement: Acotar la lista por estado

El sistema SHALL admitir en `GET /api/v1/tasks` un parámetro `status` con exactamente uno de los tres estados del dominio, y SHALL devolver entonces únicamente las tareas que estén en ese estado, con los mismos datos por tarea y el mismo orden que la lista sin acotar. El parámetro SHALL ser opcional, y su ausencia SHALL significar la vista por defecto —pendientes y en curso— y no «todas». Acotar la lista SHALL ser una operación de solo lectura y SHALL exigir sesión iniciada igual que el resto del espacio.

#### Scenario: Filtrar por un estado concreto

- **WHEN** se solicita `GET /api/v1/tasks?status=pending` en un espacio con tareas en los tres estados
- **THEN** la respuesta es `200` y contiene únicamente las pendientes, sin ninguna en curso ni hecha

#### Scenario: Lo hecho sigue siendo consultable

- **WHEN** se solicita `GET /api/v1/tasks?status=done`
- **THEN** llegan todas las tareas hechas, que son justo las que la vista por defecto deja fuera

#### Scenario: Un solo estado por petición

- **WHEN** se recorre el contrato de la lista buscando la forma de pedir dos estados a la vez
- **THEN** no existe ninguna: el parámetro admite un único estado, y pedir otro sustituye al anterior en lugar de sumarse

#### Scenario: Acotar no cambia nada

- **WHEN** se solicita la lista acotada por cada uno de los estados, tantas veces como se quiera
- **THEN** ninguna tarea cambia de estado, de responsable ni de fecha como consecuencia de haberla consultado

#### Scenario: Acotar sin haber entrado

- **WHEN** se solicita `GET /api/v1/tasks?status=done` sin cabecera `Authorization` válida
- **THEN** la respuesta es `401` y no se devuelve ninguna tarea

### Requirement: Un filtro válido sin resultados es una lista vacía legítima

El sistema SHALL responder `200` con una lista vacía cuando se acote por un estado válido en el que ahora mismo no hay ninguna tarea. Esa respuesta NO SHALL ser un error ni distinguirse en forma de una lista con contenido.

#### Scenario: Nadie tiene nada en curso

- **WHEN** se solicita `GET /api/v1/tasks?status=in_progress` y no hay ninguna tarea en ese estado
- **THEN** la respuesta es `200` con una lista vacía, con la misma forma que cualquier otra respuesta de la lista

#### Scenario: El espacio entero está vacío

- **WHEN** se solicita la lista, acotada o sin acotar, en un espacio en el que no se ha creado ninguna tarea
- **THEN** la respuesta es `200` con una lista vacía, y no un `404` ni ningún otro error

### Requirement: Un estado que no existe se rechaza, no se responde vacío

El sistema SHALL rechazar con `422` toda petición de la lista que pida acotarse por un valor que no sea ninguno de los tres estados del dominio, señalando el campo `status` en el mismo formato de error que el resto de la API. NO SHALL responder a esa petición con una lista vacía ni ignorando el parámetro: pedir algo que no existe y no encontrar nada SHALL ser distinguible desde fuera.

#### Scenario: Estado inventado

- **WHEN** se solicita `GET /api/v1/tasks?status=archivado`
- **THEN** la respuesta es `422` con un error sobre el campo `status`, y no una lista de tareas

#### Scenario: El error no se confunde con la ausencia

- **WHEN** se comparan la respuesta a un estado inventado y la respuesta a un estado válido sin tareas
- **THEN** son distinguibles sin ambigüedad —una es un `422` sobre el campo y la otra un `200` con lista vacía—, de modo que quien las consume puede decir cuál de las dos cosas ha pasado

#### Scenario: El estado inventado no pasa a existir

- **WHEN** se pide la lista acotada por un valor que no es ninguno de los tres estados
- **THEN** ninguna tarea cambia, y ese valor no queda registrado como un estado nuevo en ninguna parte

### Requirement: El control para acotar la lista

La interfaz SHALL ofrecer en la pantalla de la lista un control para acotarla por estado, con una opción por cada uno de los tres estados más la vista por defecto. Esa primera opción SHALL nombrarse por lo que enseña y NO SHALL presentarse como un «Todas», porque una vista que mezcle lo hecho con el resto no existe. El control SHALL admitir un solo estado a la vez, SHALL indicar cuál está aplicado, y SHALL ser operable enteramente con el teclado.

#### Scenario: Las opciones disponibles

- **WHEN** se mira el control de la lista
- **THEN** se ofrecen «Pendientes y en curso», «Pendiente», «En curso» y «Hecho», y ninguna opción que devuelva todas las tareas juntas

#### Scenario: Elegir un estado sustituye al anterior

- **WHEN** se está acotando por «Pendiente» y se elige «En curso»
- **THEN** la lista pasa a mostrar solo las que están en curso, sin sumar los dos estados

#### Scenario: Quitar el filtro devuelve a la vista por defecto

- **WHEN** se elige la primera opción estando acotada la lista por cualquier estado
- **THEN** vuelven a verse las pendientes y las que están en curso, y las hechas quedan fuera

#### Scenario: Sin ratón

- **WHEN** se recorre y se acciona el control usando únicamente el teclado
- **THEN** se puede aplicar y quitar el filtro igual que con el ratón, y se percibe cuál es la opción aplicada

#### Scenario: Un estado que no es ninguno de los tres

- **WHEN** se llega a la lista pidiendo un estado que no existe
- **THEN** el control no marca ninguna opción como aplicada, porque lo que se está mostrando no es ninguna de ellas

### Requirement: El filtro se pide en la dirección de la lista

La interfaz SHALL llevar el estado por el que se acota en la propia dirección de la lista, de modo que la vista acotada se pueda compartir por enlace y que el botón «atrás» del navegador deshaga el filtro. El filtro NO SHALL guardarse en ninguna otra parte: entrar en la lista sin pedir ningún estado SHALL dar siempre la vista por defecto, sin recuperar el último filtro usado.

#### Scenario: La vista acotada se comparte

- **WHEN** se copia la dirección de la lista acotada por «Hecho» y se abre en otra sesión con acceso al espacio
- **THEN** se ve exactamente esa vista acotada, sin tener que aplicar el filtro a mano

#### Scenario: Atrás deshace el filtro

- **WHEN** se aplica un filtro y se usa el botón «atrás» del navegador
- **THEN** se vuelve a la vista anterior, sin que el filtro se quede aplicado

#### Scenario: El filtro no se guarda

- **WHEN** se acota la lista por «Hecho» y más tarde se entra en la lista sin pedir ningún estado
- **THEN** aparece la vista por defecto, y no el filtro que se dejó puesto

### Requirement: Una lista sin filas no significa siempre lo mismo

La interfaz SHALL distinguir por qué la lista no muestra ninguna fila, con un mensaje propio para cada caso: que el estado pedido no existe, que el estado pedido es válido pero ahora mismo no hay nada en él, y que no queda nada abierto pero el equipo sí tiene tareas hechas. Ninguno de esos mensajes SHALL usarse en lugar de otro, y solo el primero SHALL presentarse como error.

#### Scenario: Se ha pedido un estado que no existe

- **WHEN** se llega a la lista pidiendo un estado que no es ninguno de los tres
- **THEN** se avisa de que el filtro pedido no es válido, se explica que por eso no se ve ninguna tarea y no porque el equipo no tenga trabajo en ese estado, y se ofrece volver a la vista por defecto

#### Scenario: Filtro válido sin resultados

- **WHEN** se acota por «En curso» y no hay ninguna tarea en ese estado
- **THEN** se dice explícitamente que no hay ninguna tarea en ese estado, sin presentarlo como un error ni como un fallo de carga

#### Scenario: No queda nada abierto, pero sí hay tareas hechas

- **WHEN** se mira la vista por defecto en un espacio donde todas las tareas están hechas
- **THEN** se dice que no queda nada pendiente ni en curso, se indica cuántas tareas terminadas hay y se ofrece verlas, y NO se muestra el mensaje de espacio sin tareas, que le contaría al equipo que no ha hecho nada

#### Scenario: El vacío del filtro no se lee como vacío del espacio

- **WHEN** la lista no muestra ninguna fila por culpa del filtro aplicado
- **THEN** no se ofrece el mensaje de bienvenida del espacio vacío, que daría a entender que no hay nada creado cuando lo que hay es trabajo escondido detrás de un filtro

### Requirement: Lo que sale de la vista no se pierde

La interfaz SHALL sacar de la vista al instante toda tarea que deje de cumplir el filtro aplicado por una acción propia, y SHALL decir adónde ha ido, de modo que desaparecer nunca se confunda con perderse. Esa tarea SHALL seguir siendo alcanzable acotando la lista por su nuevo estado.

#### Scenario: Marcar como hecho saca la tarea de la vista por defecto

- **WHEN** se marca una tarea como «Hecho» desde su fila estando en la vista por defecto
- **THEN** la fila desaparece de la vista al momento y se avisa de que ha pasado a «Hecho» y ya no aparece aquí

#### Scenario: La tarea sigue estando

- **WHEN** después de eso se acota la lista por «Hecho»
- **THEN** la tarea aparece, con el estado que se le acaba de poner

#### Scenario: Crear con un filtro puesto

- **WHEN** se crea una tarea estando la lista acotada por un estado distinto de «Pendiente»
- **THEN** la tarea se crea igualmente y se avisa de que ha nacido pendiente y por eso no aparece en esta vista, en lugar de dejar la impresión de que el formulario no ha hecho nada

