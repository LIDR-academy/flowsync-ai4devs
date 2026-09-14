## MODIFIED Requirements

### Requirement: Cambiar el estado desde la lista, sin abrir nada

El sistema SHALL permitir cambiar el estado de una tarea desde la propia lista, sin abrir la tarea, sin diálogo de confirmación y sin rellenar ningún campo. El cambio SHALL reflejarse de inmediato en la vista de quien lo hace. La representación de la tarea que devuelve una escritura SHALL ser idéntica a la que devuelve la lectura siguiente.

#### Scenario: Cambio sin salir de la lista

- **WHEN** una persona cambia el estado de una tarea desde la lista
- **THEN** el nuevo estado se refleja de inmediato en su vista
- **AND** no ha abierto la tarea, ni ha confirmado nada, ni ha rellenado ningún campo

#### Scenario: Los tres estados son el único destino

- **WHEN** una persona va a cambiar el estado de una tarea
- **THEN** los únicos destinos ofrecidos son «Pendiente», «En curso» y «Hecho»
- **AND** al terminar la tarea está en exactamente uno de ellos

#### Scenario: Lo que devuelve escribir es lo que devuelve leer

- **WHEN** se cambia el estado de una tarea y a continuación se consulta la lista
- **THEN** la tarea que devolvió la escritura y la que aparece en la lista son idénticas campo por campo

#### Scenario: Lo que devuelve crear es lo que devuelve leer

- **WHEN** se crea una tarea y a continuación se consulta la lista
- **THEN** la tarea que devolvió la creación y la que aparece en la lista son idénticas campo por campo
