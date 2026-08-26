# tasks Specification

## Purpose
El trabajo del equipo como entidad compartida: anotar una tarea en segundos, verla en una lista única e idéntica para todos, y mantener al día en qué anda cada uno sin interrumpir a nadie.

## Requirements

### Requirement: Anotar trabajo escribiendo solo el título

El sistema SHALL permitir crear una tarea indicando únicamente su título, y NO SHALL pedir, ofrecer ni sugerir ningún otro dato durante la creación.

#### Scenario: Un título basta

- **WHEN** una persona con sesión abierta crea una tarea escribiendo solo un título
- **THEN** la tarea queda creada y pasa a formar parte de la lista del espacio
- **AND** no ha hecho falta aportar ningún otro dato

#### Scenario: El flujo no pide nada más

- **WHEN** una persona recorre el flujo de creación completo
- **THEN** el título es lo único que se le pide
- **AND** no se le ofrece ni se le sugiere indicar responsable, estado, fecha ni ningún otro dato

#### Scenario: Lo recién creado se ve sin volver a pedirlo

- **WHEN** una persona termina de crear una tarea
- **THEN** la ve ya en la lista
- **AND** no necesita recargar ni ir a ninguna otra parte

### Requirement: Ninguna tarea existe sin título

El sistema SHALL rechazar la creación de una tarea sin título, y SHALL tratar un título compuesto solo de espacios igual que uno vacío.

#### Scenario: Sin título no se crea

- **WHEN** se intenta crear una tarea sin título
- **THEN** no se crea ninguna tarea
- **AND** se explica el problema señalando el título como campo responsable

#### Scenario: Solo espacios no cuenta como título

- **WHEN** se intenta crear una tarea cuyo título son únicamente espacios
- **THEN** se rechaza igual que si estuviera vacío
- **AND** la lista no gana ninguna fila sin texto

### Requirement: Un título excesivo se avisa, nunca se recorta en silencio

El sistema SHALL rechazar un título que exceda lo admitido, informando de ello, y NO SHALL guardar una versión recortada sin advertirlo.

#### Scenario: Título que se pasa de largo

- **WHEN** se intenta crear una tarea con un título más largo de lo admitido
- **THEN** se avisa de que se pasa de largo
- **AND** no se guarda ninguna versión recortada

> **Pendiente PA-9.** Dónde está la frontera de «demasiado largo» es una decisión de producto sin tomar. Este requisito fija solo la conducta observable: avisar en lugar de recortar. El umbral concreto no se decide aquí.

### Requirement: La tarea nace a nombre de quien la crea y en Pendiente

El sistema SHALL asignar la tarea recién creada a la persona que la crea, y SHALL dejarla en el estado inicial «Pendiente», sin que esa persona haya elegido ninguna de las dos cosas.

#### Scenario: Nace con responsable

- **WHEN** una persona crea una tarea indicando solo el título
- **THEN** la tarea aparece con esa persona como responsable
- **AND** no ha seleccionado a nadie en ningún momento

#### Scenario: Nace pendiente

- **WHEN** una persona crea una tarea indicando solo el título
- **THEN** la tarea queda en «Pendiente»
- **AND** no ha elegido el estado en ningún momento

### Requirement: Tres estados fijos y cerrados

El sistema SHALL admitir exactamente tres estados —«Pendiente», «En curso» y «Hecho»— y NO SHALL ofrecer ninguna forma de añadir, renombrar ni eliminar estados. Cualquier valor de estado ajeno al conjunto SHALL ser rechazado.

#### Scenario: No se pueden configurar estados

- **WHEN** se busca en cualquier punto del producto la forma de añadir, renombrar o eliminar un estado
- **THEN** no existe ninguna
- **AND** los estados disponibles siguen siendo esos tres

#### Scenario: Un estado que no existe se rechaza

- **WHEN** se intenta dejar una tarea en un estado que no es ninguno de los tres
- **THEN** la petición se rechaza indicando cuáles son los estados admitidos
- **AND** la tarea conserva el estado que tuviera

#### Scenario: El identificador del estado no depende del idioma

- **WHEN** un sistema externo consulta o modifica el estado de una tarea
- **THEN** el estado viaja con un identificador estable e independiente del idioma
- **AND** el rótulo en castellano que ve la persona no se usa nunca como identificador

### Requirement: Cambiar el estado desde la lista, sin abrir nada

El sistema SHALL permitir cambiar el estado de una tarea desde la propia lista, sin abrir la tarea, sin diálogo de confirmación y sin rellenar ningún campo. El cambio SHALL reflejarse de inmediato en la vista de quien lo hace.

#### Scenario: Cambio sin salir de la lista

- **WHEN** una persona cambia el estado de una tarea desde la lista
- **THEN** el nuevo estado se refleja de inmediato en su vista
- **AND** no ha abierto la tarea, ni ha confirmado nada, ni ha rellenado ningún campo

#### Scenario: Los tres estados son el único destino

- **WHEN** una persona va a cambiar el estado de una tarea
- **THEN** los únicos destinos ofrecidos son «Pendiente», «En curso» y «Hecho»
- **AND** al terminar la tarea está en exactamente uno de ellos

> **Pendiente PA-7.** Ningún requisito declara qué transiciones son legales ni si se puede volver desde «Hecho». Mientras no se decida, todas las transiciones se admiten, lo que hace muy barato marcar algo como hecho por error.

### Requirement: Actuar sobre una tarea que no existe se rechaza con claridad

El sistema SHALL rechazar cualquier intento de cambiar el estado de una tarea que no existe, y su respuesta NO SHALL exponer detalles internos del sistema como trazas de ejecución, rutas de fichero ni fragmentos de código.

#### Scenario: La tarea no existe

- **WHEN** se intenta cambiar el estado de una tarea que no existe
- **THEN** la petición se rechaza indicando que no se ha encontrado
- **AND** la respuesta tiene la misma forma que el resto de errores del sistema

#### Scenario: El identificador ni siquiera es válido

- **WHEN** se intenta cambiar el estado indicando un identificador que no tiene forma de identificador
- **THEN** la petición se rechaza igual que si la tarea no existiera
- **AND** no se revela nada sobre cómo está construido el sistema por dentro

### Requirement: Cualquiera puede cambiar el estado de cualquier tarea

El sistema SHALL aplicar el cambio de estado de una tarea ajena igual que el de una propia, sin permiso especial ni advertencia.

#### Scenario: Tarea de otra persona

- **WHEN** una persona cambia el estado de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica igual que en una tarea suya
- **AND** no se le pide permiso ni se le muestra advertencia alguna

### Requirement: Una sola lista, la misma para todos

El sistema SHALL mantener una única lista de tareas para todo el espacio, cuyo contenido NO SHALL depender de quién la consulta, y NO SHALL ofrecer ninguna vista separada de tareas propias.

#### Scenario: El contenido no depende de quién mira

- **WHEN** dos personas distintas del espacio consultan la lista sin aplicar nada
- **THEN** ven exactamente el mismo conjunto de tareas

#### Scenario: No hay tareas privadas

- **WHEN** una persona crea una tarea y otra consulta la lista
- **THEN** esa tarea está ahí
- **AND** no existe forma de crear una tarea que otros no puedan ver

#### Scenario: No hay vista «mis tareas»

- **WHEN** se buscan otras vistas de tareas
- **THEN** no existe ninguna vista de tareas propias separada de la del equipo

### Requirement: Cada fila responde quién está en qué

Cada tarea de la lista SHALL mostrar su título, su responsable y su estado, sin necesidad de abrirla. El responsable SHALL identificarse por su nombre, y NO por un identificador interno ni por su correo.

#### Scenario: Las tres cosas a la vista

- **WHEN** una persona mira la lista
- **THEN** cada tarea muestra título, responsable y estado
- **AND** no necesita abrir ninguna para saber esas tres cosas

#### Scenario: El responsable se identifica por su nombre

- **WHEN** una persona lee quién lleva una tarea
- **THEN** ve el nombre de esa persona

#### Scenario: Un responsable sin nombre sigue siendo legible

- **WHEN** el responsable de una tarea es una cuenta que no tiene nombre
- **THEN** la fila sigue indicando de forma legible que esa tarea tiene responsable
- **AND** no se muestra un identificador interno ni el correo en su lugar

### Requirement: El espacio vacío se explica

Cuando no exista ninguna tarea, el sistema SHALL explicar qué es la lista y ofrecer crear la primera, en lugar de mostrar una lista vacía sin más.

#### Scenario: Todavía no hay nada

- **WHEN** una persona abre la lista y el espacio no tiene ninguna tarea
- **THEN** se le explica qué es esto y se le ofrece crear la primera

### Requirement: La lista exige haber entrado

El sistema SHALL denegar el acceso a las tareas a quien no haya iniciado sesión, y NO SHALL reservar ningún contenido de la lista a ningún rol.

#### Scenario: Sin sesión no hay tareas

- **WHEN** se intenta consultar las tareas sin haber iniciado sesión
- **THEN** no se obtiene ninguna tarea

#### Scenario: Ver la lista no requiere permiso especial

- **WHEN** cualquier persona registrada en el espacio consulta la lista
- **THEN** la ve entera, igual que cualquier otro miembro

### Requirement: Consultar no modifica

Consultar la lista NO SHALL alterar el estado, el responsable ni ningún otro dato de ninguna tarea.

#### Scenario: Mirar no cambia nada

- **WHEN** una persona abre la lista y la recorre
- **THEN** ninguna tarea cambia de estado ni de responsable

### Requirement: La lista no muestra presencia

La lista NO SHALL mostrar ninguna señal de quién está conectado ni de actividad por persona.

#### Scenario: Sin señales de presencia

- **WHEN** varias personas del equipo usan la aplicación a la vez
- **THEN** la lista no muestra quién está en línea ni ninguna actividad por persona

### Requirement: La lista no adelanta información que no le corresponde

La lista NO SHALL mostrar fechas de vencimiento ni marcas de vencido.

#### Scenario: Sin fechas en la lista

- **WHEN** una persona mira la lista
- **THEN** no ve ninguna fecha ni ninguna marca de vencimiento en ninguna tarea

> Este requisito es un límite deliberado, no una carencia: la fecha de vencimiento llega en otra historia y el alcance exige que viva fuera de la vista principal.

### Requirement: Un fallo al guardar no deja la vista mintiendo

Cuando un cambio de estado no llegue a aplicarse, el sistema SHALL devolver la vista al estado real de la tarea y SHALL explicar el fallo.

#### Scenario: El cambio de estado falla

- **WHEN** una persona cambia el estado de una tarea y la operación no llega a completarse
- **THEN** la vista vuelve a mostrar el estado que la tarea tiene realmente
- **AND** se le explica que el cambio no se aplicó
