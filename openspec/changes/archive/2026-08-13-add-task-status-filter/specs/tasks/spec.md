## ADDED Requirements

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

## MODIFIED Requirements

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
