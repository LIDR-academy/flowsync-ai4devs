## ADDED Requirements

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

- **WHEN** se envía `PUT /api/v1/tasks/:id/due-date` con `{"dueDate": "2026-09-30"}` sobre una tarea sin fecha
- **THEN** la respuesta es `200` con la tarea ya con esa fecha, y las siguientes consultas la devuelven con ella

#### Scenario: Cambiar la fecha por otra

- **WHEN** se envía una fecha distinta sobre una tarea que ya tenía una
- **THEN** la nueva sustituye a la anterior, sin conservar rastro de la vieja

#### Scenario: Quitar la fecha

- **WHEN** se envía `{"dueDate": null}` sobre una tarea con fecha
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

## MODIFIED Requirements

### Requirement: Una sola vista de tareas, sin señales de presencia

La interfaz NO SHALL ofrecer ninguna vista de tareas distinta de la lista compartida —en particular, ninguna vista de «mis tareas»— ni mostrar quién está conectado o qué está haciendo cada persona en tiempo real. La pantalla de una tarea concreta NO SHALL contar como una vista de tareas rival: enseña una sola tarea a la que se llega desde la lista, y no ofrece ningún criterio para reunir varias.

#### Scenario: No hay lista personal

- **WHEN** se recorre la aplicación en busca de otras vistas de tareas
- **THEN** no existe ninguna vista de tareas propias separada de la lista del equipo

#### Scenario: Sin señales de presencia

- **WHEN** varias personas del equipo usan la aplicación a la vez
- **THEN** la lista no muestra quién está en línea, ni actividad por persona, ni ninguna otra señal de presencia

#### Scenario: La lista no adelanta el vencimiento

- **WHEN** se mira cualquier fila de la lista
- **THEN** no aparece ninguna fecha de vencimiento ni marca de tarea vencida

#### Scenario: La pantalla de una tarea no reúne tareas

- **WHEN** se abre una tarea y se recorre su pantalla entera
- **THEN** solo se ve esa tarea, y no hay ninguna forma de convertirla en una colección de tareas filtrada por responsable, por fecha ni por ningún otro criterio
