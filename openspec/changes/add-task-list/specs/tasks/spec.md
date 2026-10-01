# Spec Delta

## Purpose

Dar al equipo una única lista compartida de tareas en la que cualquiera puede apuntar trabajo con solo un título y ver o cambiar de un vistazo quién lleva cada tarea y en qué estado está.

## ADDED Requirements

### Requirement: Listar todas las tareas por API

El sistema SHALL responder a `GET /api/v1/tasks`, con un token válido, con `200` y `{ "data": [ <tarea>, ... ] }` con todas las tareas del espacio, sin filtrarlas por quién pide la lista ni por su responsable. Si no hay tareas, `data` SHALL ser una lista vacía. El orden de los elementos no está garantizado.

#### Scenario: Dos personas ven las mismas tareas

- **WHEN** dos cuentas distintas piden `GET /api/v1/tasks` sin que nadie cambie nada entre medias
- **THEN** ambas reciben `200` con el mismo conjunto de tareas

#### Scenario: Una tarea ajena aparece en mi lista

- **WHEN** otra cuenta crea una tarea, que queda a su nombre, y después yo pido la lista
- **THEN** esa tarea está entre las que recibo

#### Scenario: Espacio sin tareas

- **WHEN** se pide la lista y no existe ninguna tarea
- **THEN** la respuesta es `200` con `{ "data": [] }`

#### Scenario: Listar no altera nada

- **WHEN** se pide la lista varias veces seguidas
- **THEN** ninguna tarea cambia de título, estado ni responsable

### Requirement: Representación pública de una tarea

Toda tarea devuelta por la API SHALL tener exactamente `id`, `title`, `status` y `assignee`, siendo `assignee` un objeto con exactamente `id` y `fullName` (texto o `null`) del responsable. La API SHALL NOT exponer el correo ni ningún otro dato de la cuenta del responsable, ni fechas de ningún tipo.

#### Scenario: Forma de una tarea

- **WHEN** se lista o se crea una tarea cuyo responsable es Ada Lovelace
- **THEN** la tarea tiene `id`, `title`, `status` y `assignee: { "id": <id de Ada>, "fullName": "Ada Lovelace" }`, sin más claves

#### Scenario: Responsable sin nombre en la API

- **WHEN** el responsable de una tarea es una cuenta sin nombre
- **THEN** `assignee.fullName` es `null` y la tarea no incluye el correo de esa cuenta

### Requirement: Crear una tarea por API con solo el título

El sistema SHALL aceptar `POST /api/v1/tasks` con `{ "title": <texto> }` y, si el título es válido, SHALL crear la tarea y responder `201` con `{ "data": <tarea> }`. El título SHALL guardarse sin los espacios del principio y del final. Cualquier otra clave del cuerpo SHALL ignorarse.

#### Scenario: Crear con un título

- **WHEN** se envía `{ "title": "Preparar la demo" }` con un token válido
- **THEN** la respuesta es `201` con una tarea de `title: "Preparar la demo"`, y esa tarea aparece después en `GET /api/v1/tasks`

#### Scenario: Espacios alrededor del título

- **WHEN** se envía `{ "title": "  Preparar la demo  " }`
- **THEN** la tarea creada tiene `title: "Preparar la demo"`

### Requirement: Valores por defecto al crear

Toda tarea recién creada SHALL nacer con `status: "pending"` y con la cuenta que la crea como responsable, aunque el cuerpo de la petición traiga otro estado u otro responsable.

#### Scenario: Nace pendiente y mía

- **WHEN** la cuenta de Ada crea una tarea enviando solo el título
- **THEN** la tarea creada tiene `status: "pending"` y `assignee.id` igual al id de Ada

#### Scenario: No se pueden imponer estado ni responsable al crear

- **WHEN** se crea una tarea enviando además `status: "done"` y el `assigneeId` de otra cuenta
- **THEN** la tarea creada tiene igualmente `status: "pending"` y como responsable a quien la crea

### Requirement: Título obligatorio y acotado

El sistema SHALL rechazar con `422` y un error con `field: "title"` toda creación cuyo título falte, esté vacío, contenga solo espacios o supere los 255 caracteres una vez recortado; en ese caso SHALL NOT crear ninguna tarea ni guardar una versión recortada del título.

#### Scenario: Sin título

- **WHEN** se envía `{}` a `POST /api/v1/tasks`
- **THEN** la respuesta es `422` con un error `rule: "required"` y `field: "title"`, y la lista no cambia

#### Scenario: Título solo con espacios

- **WHEN** se envía `{ "title": "    " }`
- **THEN** la respuesta es `422` con un error `rule: "required"` y `field: "title"`, y no aparece ninguna tarea sin texto

#### Scenario: Título demasiado largo en la API

- **WHEN** se envía un título de 256 caracteres
- **THEN** la respuesta es `422` con un error `rule: "maxLength"`, `field: "title"` y `meta.max: 255`, y no se crea ninguna tarea

#### Scenario: Título en el límite

- **WHEN** se envía un título de exactamente 255 caracteres
- **THEN** la respuesta es `201` y el título se guarda completo

### Requirement: Actualizar una tarea por API

El sistema SHALL aceptar `PATCH /api/v1/tasks/:id` con `status`, `assigneeId` o ambos, SHALL aplicar solo lo enviado y SHALL responder `200` con `{ "data": <tarea> }` ya actualizada. Cualquier cuenta con sesión SHALL poder actualizar cualquier tarea, sea o no su responsable. Cualquier otra clave del cuerpo, incluido `title`, SHALL ignorarse.

#### Scenario: Cambiar el estado de una tarea ajena

- **WHEN** la cuenta de Grace envía `{ "status": "in_progress" }` sobre una tarea cuyo responsable es Ada
- **THEN** la respuesta es `200` con `status: "in_progress"` y el responsable sigue siendo Ada

#### Scenario: Cambiar el responsable

- **WHEN** se envía `{ "assigneeId": <id de Grace> }` sobre una tarea de Ada
- **THEN** la respuesta es `200` con `assignee.id` igual al id de Grace y el estado sin cambios

#### Scenario: El título no se edita por esta vía

- **WHEN** se envía `{ "status": "done", "title": "Otro título" }`
- **THEN** la tarea pasa a `done` y conserva su título original

### Requirement: Tres estados cerrados

El estado de una tarea SHALL ser siempre exactamente uno de `pending`, `in_progress` y `done`. El sistema SHALL rechazar con `422` y un error con `field: "status"` cualquier otro valor, incluidos sus nombres en castellano, y SHALL permitir pasar de cualquiera de los tres estados a cualquier otro, también desde `done`.

#### Scenario: Valor fuera del conjunto

- **WHEN** se envía `{ "status": "Hecho" }` o `{ "status": "archived" }`
- **THEN** la respuesta es `422` con un error `field: "status"` y la tarea conserva su estado

#### Scenario: Volver desde hecho

- **WHEN** una tarea en `done` recibe `{ "status": "pending" }`
- **THEN** la respuesta es `200` y la tarea queda en `pending`

### Requirement: Responsable válido

El sistema SHALL rechazar con `422` y un error con `field: "assigneeId"` una actualización cuyo `assigneeId` no corresponda a ninguna cuenta existente, sin modificar la tarea.

#### Scenario: Responsable inexistente

- **WHEN** se envía `{ "assigneeId": 999999 }` y no existe esa cuenta
- **THEN** la respuesta es `422` con un error `field: "assigneeId"` y la tarea conserva su responsable

### Requirement: Actualizaciones vacías y tareas inexistentes

El sistema SHALL responder `422` a una actualización que no traiga ni `status` ni `assigneeId`, y `404` a una actualización sobre un id que no corresponde a ninguna tarea.

#### Scenario: Cuerpo sin cambios

- **WHEN** se envía `{}` a `PATCH /api/v1/tasks/:id` de una tarea existente
- **THEN** la respuesta es `422` y la tarea no cambia

#### Scenario: Tarea inexistente

- **WHEN** se envía `{ "status": "done" }` a `PATCH /api/v1/tasks/999999` y no existe esa tarea
- **THEN** la respuesta es `404`

### Requirement: Las operaciones de tareas exigen sesión

El sistema SHALL responder `401` a `GET /api/v1/tasks`, `POST /api/v1/tasks` y `PATCH /api/v1/tasks/:id` cuando la petición no traiga un token válido, sin devolver ni modificar ninguna tarea.

#### Scenario: Listar sin sesión

- **WHEN** se pide `GET /api/v1/tasks` sin cabecera `Authorization`
- **THEN** la respuesta es `401` y no incluye ninguna tarea

#### Scenario: Crear sin sesión

- **WHEN** se envía `POST /api/v1/tasks` con un título válido y un token revocado
- **THEN** la respuesta es `401` y no se crea ninguna tarea

### Requirement: Sin otras operaciones sobre tareas

La API de tareas SHALL ofrecer solo listar, crear y actualizar: no SHALL existir lectura de una tarea individual, borrado ni operaciones de equipo o de miembros.

#### Scenario: Leer una tarea suelta

- **WHEN** se pide `GET /api/v1/tasks/:id` de una tarea existente con un token válido
- **THEN** la respuesta es `404` y no contiene la tarea

#### Scenario: Borrar una tarea

- **WHEN** se envía `DELETE /api/v1/tasks/:id` de una tarea existente con un token válido
- **THEN** la respuesta es `404` y la tarea sigue apareciendo en la lista

### Requirement: Pantalla de lista solo con sesión

La aplicación web SHALL ofrecer la lista de tareas en `/tasks` solo a quien tiene sesión, redirigiendo a `/login` a quien no la tiene, y SHALL cargarla del servidor cada vez que se abre la pantalla. La pantalla de perfil SHALL enlazar a la lista y la lista SHALL enlazar al perfil.

#### Scenario: Sin sesión

- **WHEN** una persona sin sesión abre `/tasks`
- **THEN** se la lleva a la pantalla de inicio de sesión sin ver ninguna tarea

#### Scenario: Llegar desde el perfil

- **WHEN** una persona con sesión pulsa el enlace a la lista en su perfil
- **THEN** ve la lista de tareas del equipo

#### Scenario: No hay vista «mis tareas»

- **WHEN** alguien busca en la aplicación otra vista, ruta o filtro de tareas
- **THEN** no existe ninguna vista de «mis tareas» ni ninguna lista por persona: la de `/tasks` es la única

#### Scenario: Sin contenido reservado

- **WHEN** dos cuentas cualesquiera abren `/tasks`
- **THEN** ambas ven las mismas tareas y los mismos controles, sin nada reservado a ningún rol

### Requirement: Cada fila dice título, responsable y estado

Cada tarea de la lista SHALL mostrar, sin abrirla, su título, el nombre de su responsable y su estado como «Pendiente», «En curso» o «Hecho». Si el responsable no tiene nombre, SHALL mostrarse «Sin nombre». La lista SHALL NOT mostrar correos, identificadores, fechas, marcas de vencida ni señales de presencia o actividad de nadie.

#### Scenario: Fila con responsable con nombre

- **WHEN** la lista incluye «Preparar la demo», a cargo de Ada Lovelace y en `in_progress`
- **THEN** su fila muestra «Preparar la demo», «Ada Lovelace» y «En curso» como estado actual

#### Scenario: Responsable sin nombre en pantalla

- **WHEN** el responsable de una tarea es una cuenta sin nombre
- **THEN** la fila muestra «Sin nombre» y en ningún sitio su correo ni su id

#### Scenario: Nada de fechas ni presencia

- **WHEN** se mira la lista con otras personas usando la aplicación a la vez
- **THEN** ninguna fila muestra fechas ni indicadores de quién está conectado

### Requirement: Estado vacío de la lista

Cuando no exista ninguna tarea, la pantalla de lista SHALL explicar qué es esta lista e invitar a crear la primera tarea, en lugar de mostrar una lista vacía sin más.

#### Scenario: Primera visita a un espacio vacío

- **WHEN** alguien abre la lista y no hay ninguna tarea
- **THEN** ve un texto que explica que aquí está el trabajo de todo el equipo y le invita a crear la primera tarea con el formulario

### Requirement: Crear una tarea desde la lista

La pantalla de lista SHALL ofrecer un formulario cuyo único campo es el título, sin ofrecer ni sugerir responsable, estado ni fecha. Al crear con éxito, la tarea SHALL aparecer en la lista sin recargar ni navegar, como «Pendiente» y con el nombre de quien la crea, y el campo SHALL quedar vacío.

#### Scenario: Crear con solo el título

- **WHEN** Ada escribe «Preparar la demo» y pulsa «Crear tarea»
- **THEN** sin recargar la página aparece una fila «Preparar la demo» con «Ada Lovelace» y «Pendiente», y el campo queda vacío

#### Scenario: El formulario no pide nada más

- **WHEN** alguien recorre el formulario de creación
- **THEN** el título es el único campo, y no hay controles ni textos para elegir responsable, estado ni fecha

#### Scenario: Desde el estado vacío

- **WHEN** alguien crea una tarea desde la lista vacía
- **THEN** el texto del estado vacío desaparece y se ve la nueva tarea

### Requirement: Errores del título en pantalla

Si el título está vacío, solo tiene espacios o supera los 255 caracteres, la pantalla SHALL mostrar junto al campo un mensaje en castellano y SHALL NOT crear la tarea ni recortar el texto escrito.

#### Scenario: Título vacío o en blanco

- **WHEN** alguien pulsa «Crear tarea» con el campo vacío o solo con espacios
- **THEN** ve bajo el campo «Falta rellenar el título.» y la lista no gana ninguna fila

#### Scenario: Título demasiado largo en pantalla

- **WHEN** alguien pega un título de 300 caracteres y pulsa «Crear tarea»
- **THEN** ve bajo el campo un aviso de que el título no puede superar los 255 caracteres, y el campo conserva los 300 caracteres que escribió

### Requirement: Cambiar el estado desde la fila

Cada fila SHALL ofrecer los tres estados como un grupo de botones «Pendiente», «En curso» y «Hecho», con el actual marcado. Pulsar otro SHALL cambiar el estado de la tarea, sea de quien sea, reflejándolo de inmediato, sin abrir la tarea, sin confirmación y sin pedir ningún otro dato.

#### Scenario: Un clic cambia el estado

- **WHEN** alguien pulsa «En curso» en una fila que está en «Pendiente»
- **THEN** la fila pasa a marcar «En curso» sin abrir nada ni mostrar ningún diálogo, y al recargar sigue en «En curso»

#### Scenario: Tarea de otra persona

- **WHEN** Grace cambia a «Hecho» una tarea cuyo responsable es Ada
- **THEN** el cambio se aplica igual que en una tarea propia, sin avisos ni permisos extra

#### Scenario: Solo tres destinos

- **WHEN** alguien mira cómo cambiar el estado de una fila
- **THEN** los únicos destinos ofrecidos son «Pendiente», «En curso» y «Hecho»

#### Scenario: El cambio falla

- **WHEN** alguien cambia el estado de una tarea y el servidor rechaza el cambio o no responde
- **THEN** esa fila, y solo esa, vuelve a marcar su estado anterior y se muestra un aviso explicando que no se pudo guardar

### Requirement: Fallo al cargar la lista

Si la lista no se puede cargar, la pantalla SHALL mostrar un aviso en castellano y una forma de reintentar, en lugar de una lista vacía, y SHALL NOT ofrecer el formulario de creación hasta que la lista se haya cargado. Si el servidor rechaza la sesión al cargar, crear o cambiar un estado, la aplicación SHALL cerrarla y llevar a la persona a la pantalla de inicio de sesión.

#### Scenario: Servidor caído

- **WHEN** alguien abre la lista con el servidor apagado
- **THEN** ve el aviso «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.» y un botón «Reintentar», y no ve ni el estado vacío ni el formulario de creación

#### Scenario: Sesión revocada al cargar

- **WHEN** alguien abre la lista con una sesión que el servidor ya no reconoce
- **THEN** pasa a la pantalla de inicio de sesión

#### Scenario: Sesión revocada al crear o cambiar un estado

- **WHEN** con la lista ya abierta, la sesión deja de ser válida y la persona crea una tarea o cambia un estado
- **THEN** no se crea ni se cambia nada y pasa a la pantalla de inicio de sesión
