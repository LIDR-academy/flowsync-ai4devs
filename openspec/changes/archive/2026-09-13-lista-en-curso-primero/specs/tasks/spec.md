## MODIFIED Requirements

### Requirement: Una sola lista compartida del espacio

El sistema SHALL devolver en `GET /api/v1/tasks` las tareas del espacio que correspondan al alcance pedido, el mismo conjunto para cualquier cuenta que pida ese mismo alcance. Sin acotar, SHALL devolver primero las tareas en curso y después las pendientes, y dentro de cada uno de esos dos grupos, de la más reciente a la más antigua por su fecha de creación; acotada por un estado, de la más reciente a la más antigua. Sin acotar, el alcance SHALL ser las tareas pendientes y en curso, dejando fuera las hechas; NO SHALL existir ningún alcance que devuelva las hechas mezcladas con el resto. No SHALL existir ninguna forma de crear una tarea que otras cuentas no puedan ver, ni ninguna colección de tareas distinta de esta.

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

- **WHEN** se solicita la lista después de haber creado tres tareas seguidas, todas en el mismo estado
- **THEN** llegan con la creada en último lugar la primera y la creada en primer lugar la última

#### Scenario: Lo que está en curso va primero

- **WHEN** se solicita la lista sin acotar en un espacio con una tarea en curso creada hace días y dos pendientes creadas después
- **THEN** llega primero la que está en curso, y detrás las dos pendientes, la más reciente antes

#### Scenario: Acotada, el orden es la recencia

- **WHEN** se solicita la lista acotada por un estado
- **THEN** llegan las de ese estado de la más reciente a la más antigua

#### Scenario: La lista llega entera

- **WHEN** se solicita la lista de un espacio con muchas tareas
- **THEN** llegan todas las del alcance pedido en una sola respuesta, sin paginar ni recortar el conjunto

#### Scenario: Pedir la lista no cambia nada

- **WHEN** se solicita la lista tantas veces como se quiera
- **THEN** ninguna tarea cambia de estado ni de responsable como consecuencia de haberla mirado

### Requirement: Crear una tarea desde la lista

La interfaz SHALL permitir crear una tarea desde la propia lista escribiendo solo su título, NO SHALL pedir ni sugerir ningún otro dato, y SHALL mostrar la tarea recién creada en la lista sin recargar la página ni navegar a otra pantalla, en el sitio que el orden de la lista le da: la primera de las pendientes.

#### Scenario: Apuntar algo en un gesto

- **WHEN** se escribe un título y se confirma la creación
- **THEN** la tarea aparece en la lista, a nombre de quien la ha creado y como "Pendiente", sin haber salido de la pantalla ni recargado nada

#### Scenario: La nueva no se cuela delante de lo que está en curso

- **WHEN** se crea una tarea en la vista por defecto, con tareas en curso a la vista
- **THEN** la nueva aparece debajo de todas las que están en curso y encima de las pendientes que ya había

#### Scenario: El formulario no pide nada más

- **WHEN** se recorre el flujo de creación entero
- **THEN** el título es el único dato que se pide, y no se ofrece ni se sugiere indicar responsable, estado, fecha ni ningún otro campo

#### Scenario: El campo queda listo para la siguiente

- **WHEN** se termina de crear una tarea
- **THEN** el campo del título queda vacío y disponible para apuntar la siguiente

### Requirement: Cambiar el estado desde la propia fila

La interfaz SHALL permitir cambiar el estado de cualquier tarea desde su fila de la lista, sin abrir la tarea, sin diálogo de confirmación y sin rellenar ningún campo, ofreciendo como únicos destinos los tres estados, y SHALL reflejar el nuevo estado en la vista de inmediato. Mientras siga en la vista, la fila NO SHALL cambiar de posición por el cambio de estado: el orden se recompone la siguiente vez que se carga la lista.

#### Scenario: Cambio sin salir de la lista

- **WHEN** se cambia el estado de una tarea desde su fila
- **THEN** la fila pasa a mostrar el nuevo estado al momento, sin haber abierto la tarea, sin confirmar en ningún diálogo y sin rellenar ningún campo

#### Scenario: La fila no salta

- **WHEN** se pasa a "En curso" una tarea pendiente que está en mitad de la lista
- **THEN** la fila muestra el nuevo estado sin moverse de su sitio, y ocupa el que le corresponde al volver a cargar la lista

#### Scenario: Los únicos destinos posibles

- **WHEN** se despliega a qué estados se puede cambiar una tarea
- **THEN** los únicos ofrecidos son "Pendiente", "En curso" y "Hecho", y al terminar la tarea queda en exactamente uno de ellos

#### Scenario: También en las tareas de otros

- **WHEN** se cambia el estado de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin pedir permiso ni mostrar advertencia alguna

#### Scenario: El cambio no cuela

- **WHEN** el cambio de estado no llega a aplicarse porque el servidor lo rechaza o no responde
- **THEN** la fila vuelve a mostrar el estado que la tarea tiene de verdad y se avisa de que no se ha podido cambiar
