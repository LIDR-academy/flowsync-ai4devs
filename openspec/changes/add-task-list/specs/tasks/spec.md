## Purpose

Sostiene la lista compartida de tareas del equipo: una sola lista, idéntica para todos, donde anotar trabajo cuesta escribir un título y donde el responsable y el estado de cada tarea están a la vista para responder «quién está en qué» sin preguntar a nadie ni abrir nada.

## ADDED Requirements

### Requirement: Una sola lista de tareas, idéntica para todo el equipo
El sistema SHALL mantener una única lista de tareas compartida, cuyo contenido no depende de quién la consulta, y SHALL NOT ofrecer ninguna forma de crear una tarea que otras personas no puedan ver ni ninguna vista de tareas restringida a un titular.

#### Scenario: Dos personas distintas consultan la lista
- **WHEN** dos personas autenticadas distintas consultan la lista sin haber hecho ningún cambio entre una consulta y otra
- **THEN** el sistema devuelve a ambas exactamente el mismo conjunto de tareas

#### Scenario: Una tarea creada por otra persona y asignada a sí misma
- **WHEN** una persona crea una tarea y se pone a sí misma como responsable, y a continuación otra persona consulta la lista
- **THEN** esa tarea forma parte de la lista que recibe la segunda persona, en las mismas condiciones que cualquier otra

#### Scenario: No existe una lista propia separada de la del equipo
- **WHEN** una persona autenticada busca obtener sus tareas por separado de las del resto
- **THEN** el sistema no ofrece ninguna operación que devuelva un subconjunto de la lista según quién sea el responsable

#### Scenario: Ver la lista no depende de ningún rol
- **WHEN** cualquier persona autenticada consulta la lista
- **THEN** recibe todas las tareas existentes, sin que ninguna quede reservada a un rol o a un permiso especial

### Requirement: Contenido de cada tarea en la lista
El sistema SHALL entregar, para cada tarea de la lista, su identificador, su título, su estado y su responsable, de modo que quien consulta pueda saber de qué trabajo se trata, quién lo lleva y en qué punto está sin pedir ningún dato adicional por tarea.

#### Scenario: Las tres cosas se saben de la propia lista
- **WHEN** una persona autenticada consulta la lista y hay tareas en ella
- **THEN** cada tarea llega con su título, su estado y su responsable, sin que haga falta una consulta por tarea para completar ninguno de los tres

#### Scenario: Enumerar el trabajo de cada persona
- **WHEN** el equipo tiene tareas repartidas entre varias personas y alguien consulta la lista
- **THEN** la respuesta basta para agrupar por responsable qué lleva cada quien, sin ninguna consulta adicional

### Requirement: El responsable se identifica por su nombre y sin exponer su cuenta
El sistema SHALL representar al responsable de una tarea con su nombre y sus iniciales, además de su identificador, y SHALL NOT incluir en esa representación ningún otro dato de la cuenta, en particular su email, su contraseña en cualquier forma o sus marcas de tiempo.

#### Scenario: Representación del responsable
- **WHEN** el sistema entrega una tarea que tiene responsable
- **THEN** la representación de ese responsable permite mostrarlo por su nombre, sin que quien consume la lista tenga que traducir un identificador interno a una persona

#### Scenario: La lista no filtra datos de cuenta
- **WHEN** el sistema entrega una tarea que tiene responsable
- **THEN** la representación de ese responsable no contiene su email, ni su contraseña ni ninguna representación de ella, ni las fechas de alta o de última actualización de su cuenta

#### Scenario: Tarea sin responsable
- **WHEN** el sistema entrega una tarea cuyo responsable está vacío
- **THEN** lo indica de forma explícita como ausencia de responsable, y no como un responsable desconocido ni como un identificador sin persona detrás

### Requirement: La lista no adelanta información temporal
El sistema SHALL NOT incluir en la lista fechas de vencimiento ni ninguna marca de tarea vencida o próxima a vencer, ni derivar de las marcas de tiempo internas ninguna señal de urgencia.

#### Scenario: Ninguna tarea llega con vencimiento
- **WHEN** una persona autenticada consulta la lista
- **THEN** ninguna tarea trae fecha de vencimiento ni indicador alguno de estar vencida o a punto de vencer

#### Scenario: La interfaz no pinta fechas en la lista
- **WHEN** una persona ve la lista en la interfaz
- **THEN** ninguna fila muestra fechas ni distintivos de urgencia junto al título, el responsable o el estado

### Requirement: La lista vacía se explica en lugar de mostrarse vacía
El sistema SHALL presentar, cuando no existe ninguna tarea, una explicación de para qué sirve la lista junto con la invitación a crear la primera tarea, en lugar de una lista sin filas.

#### Scenario: Primera visita sin tareas creadas
- **WHEN** una persona autenticada abre la lista y todavía no se ha creado ninguna tarea
- **THEN** ve una explicación de qué es esta lista y una forma directa de crear la primera tarea, y no una lista vacía sin más

#### Scenario: La explicación desaparece en cuanto hay una tarea
- **WHEN** se crea la primera tarea del equipo
- **THEN** la lista pasa a mostrar esa tarea y deja de mostrar la explicación del estado vacío

### Requirement: Consultar la lista no cambia nada
El sistema SHALL tratar la consulta de la lista como una operación de solo lectura, y SHALL NOT modificar por ella el título, el estado ni el responsable de ninguna tarea.

#### Scenario: Recorrer la lista deja las tareas como estaban
- **WHEN** una persona autenticada consulta la lista con tareas en estados distintos, y a continuación se vuelve a consultar
- **THEN** cada tarea conserva el mismo título, el mismo estado y el mismo responsable que antes de la primera consulta

### Requirement: La lista no revela presencia ni actividad por persona
El sistema SHALL NOT incluir en la lista ninguna señal de qué personas están conectadas, ni cuándo estuvieron activas por última vez, ni qué están mirando o modificando en este momento.

#### Scenario: Varias personas usando la aplicación a la vez
- **WHEN** varias personas del equipo consultan y modifican tareas simultáneamente y una de ellas mira la lista
- **THEN** la lista no le indica quién está conectado, ni actividad reciente por persona, ni ninguna otra señal de presencia

### Requirement: Toda operación sobre tareas exige sesión iniciada
El sistema SHALL exigir una credencial de sesión válida para consultar la lista, para crear una tarea y para actualizarla, y SHALL responder con un error de acceso no autorizado, sin ejecutar la operación, cuando la credencial falte, no corresponda a ninguna emitida o ya haya sido revocada.

#### Scenario: Consulta de la lista sin credencial
- **WHEN** alguien intenta consultar la lista sin presentar credencial alguna
- **THEN** el sistema deniega el acceso con un error de acceso no autorizado y no devuelve ninguna tarea

#### Scenario: Creación sin credencial
- **WHEN** alguien intenta crear una tarea sin presentar una credencial válida
- **THEN** el sistema deniega la petición con un error de acceso no autorizado y no crea ninguna tarea

#### Scenario: Actualización sin credencial
- **WHEN** alguien intenta actualizar una tarea sin presentar una credencial válida
- **THEN** el sistema deniega la petición con un error de acceso no autorizado y la tarea queda tal y como estaba

#### Scenario: Credencial revocada
- **WHEN** alguien opera sobre las tareas presentando la credencial de una sesión ya cerrada
- **THEN** el sistema deniega la petición con un error de acceso no autorizado

#### Scenario: La interfaz no lleva a la lista sin sesión
- **WHEN** una persona sin sesión iniciada intenta llegar a la pantalla de la lista
- **THEN** la interfaz la lleva a identificarse y no le muestra ninguna tarea

### Requirement: Crear una tarea con solo el título
El sistema SHALL crear una tarea a partir de un único dato obligatorio, el título, y SHALL NOT exigir ningún otro dato para que la tarea exista y pase a formar parte de la lista.

#### Scenario: Alta aportando únicamente el título
- **WHEN** una persona autenticada crea una tarea aportando solo un título con contenido
- **THEN** el sistema la crea, la devuelve ya completa con su estado y su responsable, y esa tarea pasa a formar parte de la lista compartida

#### Scenario: El formulario de creación no pide ni sugiere nada más
- **WHEN** una persona recorre el flujo de creación en la interfaz
- **THEN** el único dato que se le pide es el título, y no se le ofrece ni se le sugiere indicar responsable, estado, fecha ni ningún otro dato

#### Scenario: La tarea creada se ve sin volver a pedir la lista
- **WHEN** una persona termina de crear una tarea desde la lista
- **THEN** la ve aparecer entre las demás sin recargar la pantalla, sin navegar a otro sitio y sin tener que volver a pedir la lista a mano

### Requirement: El título es obligatorio y no puede quedarse en blanco
El sistema SHALL exigir un título con al menos un carácter distinto de espacio tanto al crear una tarea como al actualizarla, SHALL rechazar la petición con un error de validación atribuido al campo del título cuando no lo haya, esté vacío o se componga solo de espacios, y SHALL NOT dejar en ese caso ninguna tarea creada ni ningún cambio aplicado.

#### Scenario: Crear sin título
- **WHEN** una persona autenticada intenta crear una tarea sin aportar título
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo del título y no crea ninguna tarea

#### Scenario: Crear con un título compuesto solo de espacios
- **WHEN** una persona autenticada intenta crear una tarea cuyo título es una cadena de espacios
- **THEN** el sistema la rechaza igual que si el campo estuviera vacío, y la lista no gana ninguna fila sin texto

#### Scenario: Actualizar dejando el título vacío o en blanco
- **WHEN** una persona autenticada intenta actualizar una tarea con un título vacío o compuesto solo de espacios
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo del título y la tarea conserva íntegro su título anterior

#### Scenario: El error se puede mostrar junto al campo
- **WHEN** la interfaz recibe el rechazo de un título ausente o en blanco
- **THEN** puede explicar el problema en lenguaje corriente junto al propio campo del título, porque el error viene atribuido a ese campo

### Requirement: Una tarea nueva nace pendiente y a nombre de quien la crea
El sistema SHALL asignar a toda tarea recién creada el estado `pendiente` y como responsable la persona que la crea, cuando la petición no indique otra cosa, y SHALL admitir que la propia petición de creación sobrescriba cualquiera de los dos.

#### Scenario: Creación sin indicar responsable ni estado
- **WHEN** una persona autenticada crea una tarea aportando solo el título
- **THEN** la tarea queda en estado `pendiente` y con esa misma persona como responsable, sin que haya tenido que elegir ninguna de las dos cosas

#### Scenario: Creación indicando otro responsable
- **WHEN** una persona autenticada crea una tarea indicando como responsable a otra persona existente
- **THEN** la tarea queda con esa otra persona como responsable, y no con quien la creó

#### Scenario: Creación indicando otro estado
- **WHEN** una persona autenticada crea una tarea indicando uno de los otros estados admitidos
- **THEN** la tarea queda directamente en ese estado, y no en `pendiente`

#### Scenario: Creación dejando el responsable vacío a propósito
- **WHEN** una persona autenticada crea una tarea indicando de forma explícita que no tiene responsable
- **THEN** la tarea queda sin responsable, y no se le atribuye por defecto a quien la creó

### Requirement: Tres estados fijos, en minúsculas y sin variantes
El sistema SHALL admitir exactamente tres estados de tarea, escritos `pendiente`, `en curso` y `hecho`, SHALL rechazar con un error de validación atribuido al campo del estado cualquier otro valor, incluidos los que solo difieren en la capitalización, y SHALL NOT ofrecer ninguna forma de añadir, renombrar ni eliminar estados.

#### Scenario: Los tres valores admitidos
- **WHEN** una persona autenticada crea o actualiza una tarea con el estado `pendiente`, `en curso` o `hecho`
- **THEN** el sistema acepta la petición y la tarea queda exactamente en ese estado

#### Scenario: Estado desconocido
- **WHEN** una persona autenticada intenta crear o actualizar una tarea con un estado que no es ninguno de los tres
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo del estado, y no crea ni modifica nada

#### Scenario: El mismo estado con otra capitalización
- **WHEN** una persona autenticada intenta usar un estado que coincide con uno admitido salvo en mayúsculas o minúsculas, como `Pendiente` o `EN CURSO`
- **THEN** el sistema lo rechaza igual que a cualquier otro valor desconocido, sin normalizarlo ni aceptarlo en silencio

#### Scenario: El catálogo de estados no se puede tocar
- **WHEN** alguien busca en el producto la forma de dar de alta un estado nuevo, cambiarle el nombre a uno existente o retirarlo
- **THEN** no existe ninguna, y los estados disponibles siguen siendo esos tres

#### Scenario: Los únicos destinos ofrecidos en la interfaz
- **WHEN** una persona ve en la lista a qué puede cambiar el estado de una tarea
- **THEN** los únicos destinos ofrecidos son esos tres, y al terminar la tarea está en exactamente uno de ellos

### Requirement: Cambio de estado libre entre los tres estados
El sistema SHALL permitir pasar una tarea de cualquiera de los tres estados a cualquier otro, sin exigir ningún orden y admitiendo también el retroceso, y SHALL NOT rechazar una transición por el estado del que parte.

#### Scenario: Avance a lo largo de los tres estados
- **WHEN** una tarea en `pendiente` se pasa a `en curso` y después a `hecho`
- **THEN** el sistema aplica ambos cambios y la tarea queda en el último estado indicado

#### Scenario: Retroceso desde `hecho`
- **WHEN** una tarea en `hecho` se pasa a `en curso` o a `pendiente`
- **THEN** el sistema aplica el cambio sin advertencia ni impedimento, y la tarea queda en el estado indicado

#### Scenario: Salto de estado
- **WHEN** una tarea en `pendiente` se pasa directamente a `hecho`
- **THEN** el sistema aplica el cambio sin exigir haber pasado antes por `en curso`

#### Scenario: Cambio al estado que ya tiene
- **WHEN** una tarea se actualiza al mismo estado en el que ya está
- **THEN** el sistema acepta la petición y la tarea sigue en ese estado

### Requirement: Cambiar el estado desde la propia lista y en cualquier tarea
El sistema SHALL permitir cambiar el estado de una tarea desde la propia lista, sin abrirla, sin diálogo de confirmación y sin rellenar ningún campo, SHALL reflejar el nuevo estado en la vista de inmediato, y SHALL aplicar el cambio por igual sea quien sea el responsable de esa tarea.

#### Scenario: Cambio sin salir de la lista
- **WHEN** una persona cambia el estado de una tarea desde su fila en la lista
- **THEN** el nuevo estado queda guardado y se refleja en la vista de inmediato, sin haber abierto la tarea, sin haber confirmado en ningún diálogo y sin haber rellenado ningún campo

#### Scenario: Cambio sobre una tarea de otra persona
- **WHEN** una persona autenticada cambia desde la lista el estado de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin pedir ningún permiso especial ni mostrar ninguna advertencia

#### Scenario: Cambio sobre una tarea sin responsable
- **WHEN** una persona autenticada cambia desde la lista el estado de una tarea que no tiene responsable
- **THEN** el cambio se aplica igual, sin exigir asignarle antes un responsable

#### Scenario: Actualización de una tarea que no existe
- **WHEN** alguien autenticado intenta actualizar una tarea con un identificador que no corresponde a ninguna
- **THEN** el sistema responde con un error de recurso no encontrado y no crea ni modifica nada

### Requirement: El responsable es opcional y reasignable, y ha de ser alguien real
El sistema SHALL admitir que una tarea no tenga responsable, SHALL permitir a cualquier persona autenticada asignar, cambiar o vaciar el responsable de cualquier tarea sin permisos especiales, y SHALL rechazar con un error de validación atribuido al campo del responsable cualquier valor que no corresponda a una cuenta existente.

#### Scenario: Reasignación a otra persona
- **WHEN** una persona autenticada cambia el responsable de una tarea por otra cuenta existente
- **THEN** el sistema aplica el cambio y la lista pasa a mostrar a la nueva persona como responsable de esa tarea

#### Scenario: Vaciar el responsable de una tarea asignada
- **WHEN** una persona autenticada indica de forma explícita que una tarea deja de tener responsable
- **THEN** el sistema la deja sin responsable y la tarea sigue existiendo en la lista con normalidad

#### Scenario: Responsable inexistente
- **WHEN** una persona autenticada intenta crear o actualizar una tarea con un responsable que no corresponde a ninguna cuenta
- **THEN** el sistema rechaza la petición con un error de validación atribuido al campo del responsable, y no crea ni modifica nada

#### Scenario: Reasignar la tarea de otra persona
- **WHEN** una persona autenticada cambia el responsable de una tarea que lleva otra persona
- **THEN** el cambio se aplica sin pedir permiso a nadie ni mostrar advertencia alguna

### Requirement: La actualización solo toca lo que se le indica
El sistema SHALL exigir el título en toda actualización y SHALL conservar sin cambios los campos que la petición no mencione, de modo que cambiar el estado no altere el responsable y cambiar el responsable no altere el estado.

#### Scenario: Cambio de estado sin tocar el responsable
- **WHEN** una persona autenticada actualiza una tarea indicando su título y un estado nuevo, sin mencionar el responsable
- **THEN** la tarea queda en el estado nuevo y conserva el responsable que tenía, incluido el caso de no tener ninguno

#### Scenario: Cambio de responsable sin tocar el estado
- **WHEN** una persona autenticada actualiza una tarea indicando su título y un responsable nuevo, sin mencionar el estado
- **THEN** la tarea queda con el responsable nuevo y conserva el estado que tenía

#### Scenario: Cambio de título sin tocar lo demás
- **WHEN** una persona autenticada actualiza una tarea indicando solo un título nuevo
- **THEN** la tarea queda con el título nuevo y conserva estado y responsable

### Requirement: Operaciones disponibles sobre las tareas
El sistema SHALL ofrecer exactamente tres operaciones sobre las tareas —consultar la lista completa, crear una tarea y actualizar una tarea existente— y SHALL NOT ofrecer la consulta individual de una tarea, su borrado, ni ninguna operación sobre equipos o miembros.

#### Scenario: No hay consulta individual
- **WHEN** alguien autenticado busca obtener una única tarea por su identificador
- **THEN** el sistema no ofrece ninguna operación para ello, y la única forma de leer una tarea es a través de la lista

#### Scenario: No hay borrado
- **WHEN** alguien autenticado busca eliminar una tarea
- **THEN** el sistema no ofrece ninguna operación de borrado, ni desde la interfaz ni por ninguna otra vía

#### Scenario: No hay operaciones de equipo
- **WHEN** alguien autenticado busca enumerar los miembros del equipo o gestionarlos
- **THEN** el sistema no ofrece ninguna operación de ese tipo dentro de esta capability

### Requirement: Contrato uniforme de las respuestas de tareas
El sistema SHALL responder siempre en JSON a las operaciones sobre tareas, cualquiera que sea el formato que pida quien llama, SHALL entregar el resultado útil bajo la misma clave de datos que el resto de la API, y SHALL entregar los fallos de validación como una lista de errores en la que cada entrada lleva su mensaje y el campo al que se atribuye.

#### Scenario: Respuesta correcta
- **WHEN** el sistema atiende con éxito una consulta de la lista, una creación o una actualización
- **THEN** el cuerpo de la respuesta expone el resultado bajo la misma clave de datos que emplean las operaciones de cuenta y acceso

#### Scenario: Respuesta de error de validación
- **WHEN** el sistema rechaza una creación o una actualización por datos inválidos
- **THEN** el cuerpo expone una lista de errores en la que cada entrada lleva un mensaje y el campo al que corresponde, de modo que la interfaz puede colocar cada aviso junto a su campo

#### Scenario: Varios campos inválidos a la vez
- **WHEN** una petición de creación o de actualización tiene más de un campo inválido
- **THEN** el sistema devuelve en una sola respuesta un error por cada campo que falló, en lugar de detenerse en el primero

#### Scenario: Formato pedido por quien llama
- **WHEN** alguien pide una de estas operaciones anunciando que espera un formato distinto de JSON
- **THEN** el sistema responde igualmente en JSON, tanto en el caso correcto como en el de error
