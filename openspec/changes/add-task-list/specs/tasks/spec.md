## Purpose

Una sola lista de tareas compartida por todo el equipo, idéntica para quien la mire: cualquier miembro puede apuntar una tarea escribiendo solo su título y cambiar el estado de cualquier tarea desde la propia lista, para saber en qué anda cada uno sin preguntar a nadie.

## ADDED Requirements

### Requirement: Una sola lista compartida de tareas

El sistema SHALL ofrecer en `GET /api/v1/tasks` todas las tareas del espacio, y el conjunto devuelto SHALL ser el mismo con independencia de qué cuenta lo pida. NO SHALL existir ninguna forma de crear una tarea que otras cuentas no puedan ver, ni ninguna consulta que devuelva un subconjunto propio de quien la pide.

#### Scenario: Dos cuentas distintas ven lo mismo

- **WHEN** dos cuentas distintas piden `GET /api/v1/tasks` sin haber modificado nada
- **THEN** ambas reciben exactamente el mismo conjunto de tareas, con los mismos títulos, responsables y estados

#### Scenario: Una tarea creada por otra persona está en la lista

- **WHEN** una cuenta crea una tarea y otra cuenta pide la lista
- **THEN** esa tarea aparece en la respuesta que recibe la segunda cuenta

#### Scenario: Consultar la lista no modifica nada

- **WHEN** se pide `GET /api/v1/tasks` con tareas en distintos estados
- **THEN** ninguna tarea cambia de estado ni de responsable, y una segunda consulta devuelve los mismos datos

### Requirement: Acceso a las tareas solo con sesión

El sistema SHALL exigir un token de acceso válido en las tres operaciones sobre tareas, y SHALL responder 401 sin devolver ni aceptar dato alguno cuando la petición no lo presente o el token no sea válido.

#### Scenario: Petición sin token

- **WHEN** se pide la lista, se crea o se actualiza una tarea sin token o con un token ya revocado
- **THEN** la respuesta es 401 y no se devuelve ninguna tarea ni se crea o modifica ninguna

#### Scenario: Cualquier cuenta con sesión ve la lista entera

- **WHEN** cualquier cuenta con sesión válida pide la lista
- **THEN** recibe todas las tareas del espacio: no hay contenido reservado a ninguna cuenta ni a ningún rol

### Requirement: Crear una tarea con solo el título

El sistema SHALL crear una tarea en `POST /api/v1/tasks` aceptando el título como único dato, y SHALL devolver la tarea creada con su identificador, su título, su estado y su responsable.

#### Scenario: Alta con solo el título

- **WHEN** se envía `POST /api/v1/tasks` con únicamente un título no vacío
- **THEN** la respuesta es 201 con la tarea creada, y esa tarea aparece en la siguiente consulta de la lista

#### Scenario: Datos no aceptados en el alta

- **WHEN** se envía un alta que incluye un estado, un responsable o cualquier otro dato además del título
- **THEN** ese dato se ignora sin error y no tiene efecto: la tarea nace igualmente en `pending` y con quien la crea como responsable, a diferencia de la actualización, que sí rechaza con 422 un estado o un responsable inválidos

### Requirement: La tarea nace pendiente y a nombre de quien la crea

El sistema SHALL asignar a cada tarea recién creada el estado `pending` y, como responsable, la cuenta autenticada que la crea, sin que quien crea haya indicado ni elegido ninguna de las dos cosas.

#### Scenario: Estado y responsable por defecto

- **WHEN** una cuenta crea una tarea indicando únicamente el título
- **THEN** la tarea devuelta tiene estado `pending` y como responsable esa misma cuenta

### Requirement: Título obligatorio y acotado

El sistema SHALL rechazar con 422, sin crear ninguna tarea, el alta cuyo título falte, esté vacío, contenga solo espacios o supere los 200 caracteres, señalando el campo del título. El título SHALL guardarse sin los espacios sobrantes de los extremos.

#### Scenario: Sin título

- **WHEN** se envía un alta en la que el título no viaja o viaja vacío
- **THEN** la respuesta es 422 señalando el campo del título, y no se crea ninguna tarea

#### Scenario: Título de solo espacios

- **WHEN** se envía un alta cuyo título contiene únicamente espacios
- **THEN** se rechaza con 422 igual que si estuviera vacío, y la lista no gana ninguna tarea sin texto

#### Scenario: Título demasiado largo

- **WHEN** se envía un alta con un título de más de 200 caracteres
- **THEN** la respuesta es 422 señalando el campo del título, y en ningún caso se guarda una versión recortada del título

#### Scenario: Título con espacios en los extremos

- **WHEN** se envía un alta con un título rodeado de espacios y con texto dentro
- **THEN** la tarea se crea y su título es el texto sin los espacios de los extremos

### Requirement: Tres estados como conjunto cerrado

El sistema SHALL admitir exactamente tres estados de tarea, identificados como `pending`, `in_progress` y `done`, y SHALL rechazar con 422 cualquier otro valor. NO SHALL existir ninguna operación para añadir, renombrar o eliminar estados.

#### Scenario: Estado válido

- **WHEN** se actualiza una tarea con `pending`, `in_progress` o `done`
- **THEN** la operación se acepta y la tarea queda en exactamente ese estado

#### Scenario: Estado desconocido

- **WHEN** se actualiza una tarea con cualquier otro valor de estado, incluido uno escrito en castellano o con distinta capitalización
- **THEN** la respuesta es 422 señalando el campo del estado, y la tarea conserva el estado que tenía

#### Scenario: No se puede alterar el catálogo de estados

- **WHEN** se busca en la API una operación para crear, renombrar o borrar estados
- **THEN** no existe ninguna: los estados disponibles siguen siendo esos tres

### Requirement: Actualizar el estado o el responsable de cualquier tarea

El sistema SHALL permitir en `PATCH /api/v1/tasks/:id` cambiar el estado, el responsable o ambos, y SHALL aceptarlo de cualquier cuenta con sesión sobre cualquier tarea, sin requerir ser su responsable ni ningún permiso adicional. El sistema SHALL devolver la tarea ya actualizada.

#### Scenario: Cambio de estado

- **WHEN** se envía una actualización con un estado válido sobre una tarea existente
- **THEN** la respuesta es 200 con la tarea en el nuevo estado, y la siguiente consulta de la lista la muestra así

#### Scenario: Actualizar una tarea de otra persona

- **WHEN** una cuenta actualiza una tarea cuyo responsable es otra cuenta
- **THEN** el cambio se aplica igual que si fuera suya, sin ningún error de permiso

#### Scenario: Cambio de responsable

- **WHEN** se envía una actualización indicando como responsable una cuenta existente
- **THEN** la respuesta es 200 y la tarea pasa a estar a nombre de esa cuenta

#### Scenario: Responsable inexistente

- **WHEN** se envía una actualización indicando como responsable una cuenta que no existe
- **THEN** la respuesta es 422 señalando el campo del responsable, y la tarea no cambia

#### Scenario: Tarea inexistente

- **WHEN** se actualiza una tarea cuyo identificador no corresponde a ninguna
- **THEN** la respuesta es 404 y no se crea ni modifica nada

#### Scenario: Actualización sin ningún dato

- **WHEN** se envía una actualización que no incluye ni estado ni responsable
- **THEN** la tarea conserva sus datos y la respuesta no indica ningún cambio

### Requirement: La API de tareas tiene exactamente tres operaciones

El sistema SHALL exponer sobre las tareas únicamente listarlas todas, crear una y actualizar una. NO SHALL ofrecer lectura individual de una tarea, NO SHALL ofrecer borrado, y NO SHALL ofrecer ninguna operación que enumere las personas del espacio.

#### Scenario: Operaciones ausentes

- **WHEN** se intenta leer una sola tarea por su identificador, borrar una tarea, o pedir el listado de personas del espacio
- **THEN** ninguna de esas operaciones existe en la API

### Requirement: Del responsable solo viaja su nombre

El sistema SHALL exponer en cada tarea, sobre su responsable, únicamente su identificador y su nombre completo —que puede ser nulo—, y NO SHALL incluir su correo ni ningún otro dato de su cuenta.

#### Scenario: Responsable con nombre

- **WHEN** se consulta la lista y una tarea está a nombre de una cuenta con nombre completo
- **THEN** la tarea trae el identificador y el nombre completo de esa cuenta, y ningún otro dato suyo

#### Scenario: Responsable sin nombre puesto

- **WHEN** la cuenta responsable no tiene nombre completo
- **THEN** la tarea trae su identificador y el nombre como nulo, sin sustituirlo por el correo

### Requirement: La tarea no tiene fecha de vencimiento

El sistema NO SHALL almacenar, aceptar ni devolver ninguna fecha de vencimiento en una tarea. Las únicas fechas asociadas a una tarea SHALL ser las de creación y actualización del registro.

#### Scenario: Fecha de vencimiento no aceptada

- **WHEN** se envía una fecha de vencimiento al crear o al actualizar una tarea
- **THEN** esa fecha no se guarda y no aparece en ninguna respuesta

### Requirement: El orden de la lista no forma parte del contrato

El sistema NO SHALL aplicar ni prometer ningún criterio de ordenación sobre la lista de tareas, y la interfaz NO SHALL anunciar ni ofrecer un orden. Quien consuma la lista no puede asumir ningún orden concreto.

#### Scenario: Dos consultas de la misma lista

- **WHEN** se pide la lista dos veces sin cambios de por medio
- **THEN** el conjunto de tareas es el mismo, pero el orden en que llegan no está garantizado ni documentado

#### Scenario: La pantalla no ofrece ordenar

- **WHEN** una persona mira la lista
- **THEN** no ve ninguna opción de orden ni ninguna agrupación por persona o por estado

#### Scenario: Enumerar el trabajo de cada persona con la lista llena

- **WHEN** la lista acumula un volumen alto de tareas repartidas entre varios miembros
- **THEN** cada fila sigue diciendo de quién es, pero nada las ordena ni las agrupa por persona, así que decir en qué trabaja cada miembro obliga a recorrer la lista entera: ese uso **no está garantizado** a volumen mientras no se decida el orden

### Requirement: La lista es la pantalla principal de la aplicación

La aplicación SHALL mostrar la lista compartida en su propia dirección protegida por sesión, SHALL llevar allí a quien acaba de iniciar sesión o de registrarse, y SHALL llevar allí también cualquier dirección desconocida. El perfil SHALL seguir existiendo y ser alcanzable desde la lista.

#### Scenario: Destino tras iniciar sesión

- **WHEN** una persona inicia sesión o crea su cuenta
- **THEN** aterriza en la lista compartida de tareas

#### Scenario: Dirección desconocida

- **WHEN** alguien abre una dirección de la aplicación que no existe
- **THEN** es llevado a la lista si tiene sesión, y a la pantalla de inicio de sesión si no la tiene

#### Scenario: Intento de ver la lista sin sesión

- **WHEN** alguien sin sesión abre la dirección de la lista
- **THEN** acaba en la pantalla de inicio de sesión sin ver ninguna tarea

#### Scenario: El perfil sigue accesible

- **WHEN** una persona con sesión está en la lista
- **THEN** puede llegar a su perfil, que sigue mostrando sus datos y el cierre de sesión

### Requirement: Cada fila dice título, responsable y estado

La aplicación SHALL mostrar en cada fila de la lista el título de la tarea, el nombre de su responsable y su estado, de modo que se pueda decir en qué trabaja cada miembro sin abrir ninguna tarea. El estado SHALL rotularse en castellano como «Pendiente», «En curso» o «Hecho».

#### Scenario: Lectura de una fila

- **WHEN** una persona mira la lista con tareas repartidas entre varios miembros
- **THEN** de cada fila lee su título, quién la lleva y en qué estado está, sin abrir nada

#### Scenario: Rótulos de los estados

- **WHEN** la lista contiene tareas en los tres estados
- **THEN** se ven rotuladas como «Pendiente», «En curso» y «Hecho», nunca con sus identificadores internos

### Requirement: El responsable se identifica por su nombre

La aplicación SHALL identificar al responsable de cada tarea por su nombre, SHALL mostrar «Sin nombre» cuando esa persona no tenga nombre puesto, y NO SHALL mostrar nunca su correo ni su identificador.

#### Scenario: Responsable con nombre

- **WHEN** la tarea está a nombre de una persona con nombre puesto
- **THEN** la fila muestra ese nombre

#### Scenario: Responsable sin nombre

- **WHEN** la tarea está a nombre de una persona sin nombre puesto
- **THEN** la fila muestra «Sin nombre», y en ningún caso su correo o su identificador

### Requirement: La lista no muestra fechas ni vencimientos

La aplicación NO SHALL mostrar en la lista ninguna fecha ni ninguna marca de tarea vencida, retrasada o próxima a vencer.

#### Scenario: Recorrido de la lista

- **WHEN** una persona recorre la lista entera
- **THEN** no ve ninguna fecha ni ningún aviso de vencimiento en ninguna fila

### Requirement: Crear una tarea desde la lista pidiendo solo el título

La aplicación SHALL permitir crear una tarea desde la propia lista escribiendo únicamente su título, y NO SHALL ofrecer ni sugerir responsable, estado, fecha ni ningún otro dato en ese flujo. La tarea creada SHALL aparecer en la lista sin recargar la página ni navegar a otra pantalla.

#### Scenario: Alta correcta desde la pantalla

- **WHEN** una persona escribe un título en la lista y confirma la creación
- **THEN** la tarea aparece en la lista a su nombre y en «Pendiente», sin que haya recargado ni navegado a ninguna parte

#### Scenario: El flujo no pide nada más

- **WHEN** una persona recorre el flujo de creación entero
- **THEN** el título es lo único que se le pide, y no ve ningún campo, selector ni sugerencia de responsable, estado o fecha

#### Scenario: Envío mientras se crea

- **WHEN** una persona confirma la creación y la petición está en curso
- **THEN** la acción queda deshabilitada mientras dura, y al terminar el campo del título vuelve a estar vacío y listo para otra tarea

### Requirement: El problema del título se explica junto al campo

La aplicación SHALL explicar junto al propio campo del título, en lenguaje corriente y en castellano, por qué no se ha podido crear la tarea, y NO SHALL crear ninguna fila sin texto.

#### Scenario: Intento sin título

- **WHEN** una persona intenta crear una tarea con el campo del título vacío o con solo espacios
- **THEN** ve junto al campo la explicación de que hace falta un título, y no se añade ninguna fila a la lista

#### Scenario: Título demasiado largo

- **WHEN** una persona intenta crear una tarea con un título más largo del admitido
- **THEN** ve junto al campo el aviso de que se pasa de largo, y no se guarda ninguna versión recortada

### Requirement: Cambiar el estado desde la propia fila

La aplicación SHALL permitir cambiar el estado de cualquier tarea desde su fila en la lista, sin abrir la tarea, sin diálogo de confirmación y sin rellenar ningún campo, y el nuevo estado SHALL quedar reflejado en la vista de inmediato. Los únicos destinos ofrecidos SHALL ser los tres estados.

#### Scenario: Cambio de estado en la lista

- **WHEN** una persona cambia el estado de una tarea desde su fila
- **THEN** la fila muestra el nuevo estado de inmediato, sin haber abierto la tarea, confirmado nada ni rellenado ningún campo

#### Scenario: Cambio sobre la tarea de otra persona

- **WHEN** una persona cambia el estado de una tarea cuyo responsable es otro miembro
- **THEN** el cambio se aplica igual que en una tarea propia, sin pedirle permiso ni mostrarle ninguna advertencia

#### Scenario: Destinos ofrecidos

- **WHEN** una persona va a cambiar el estado de una tarea
- **THEN** los únicos destinos que se le ofrecen son «Pendiente», «En curso» y «Hecho», y al terminar la tarea está en exactamente uno de ellos

#### Scenario: El cambio no se puede aplicar

- **WHEN** el cambio de estado falla porque el servidor no responde o lo rechaza
- **THEN** la fila vuelve a mostrar el estado que tenía y se explica en castellano que no se ha podido aplicar

### Requirement: El espacio vacío se explica

La aplicación SHALL explicar, cuando no hay ninguna tarea en el espacio, qué es esta lista y SHALL ofrecer crear la primera tarea, en lugar de mostrar una lista vacía sin más.

#### Scenario: Primera visita a un espacio sin tareas

- **WHEN** una persona abre la lista y no hay ninguna tarea creada
- **THEN** lee una explicación de para qué sirve la lista y encuentra la forma de crear la primera tarea

### Requirement: Una sola vista de tareas, sin señales de presencia

La aplicación NO SHALL ofrecer ninguna vista de tareas distinta de la lista compartida —en particular ninguna vista de «mis tareas»— ni ninguna forma de crear tareas privadas. NO SHALL mostrar quién está conectado, ni ninguna señal de presencia o de actividad por persona.

#### Scenario: Búsqueda de otras vistas

- **WHEN** una persona busca otras vistas de tareas en la aplicación
- **THEN** solo existe la lista compartida del equipo, sin ninguna vista propia ni tareas privadas

#### Scenario: Otras personas usando la aplicación a la vez

- **WHEN** otros miembros están usando la aplicación al mismo tiempo
- **THEN** la lista no muestra ninguna señal de quién está en línea ni de la actividad de nadie

### Requirement: Mirar la lista no cambia nada

La aplicación NO SHALL modificar ninguna tarea como efecto de abrir o recorrer la lista: el estado y el responsable solo cambian por un gesto explícito.

#### Scenario: Recorrido de la lista

- **WHEN** una persona abre la lista y la recorre entera sin accionar nada
- **THEN** ninguna tarea cambia de estado ni de responsable
