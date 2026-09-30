## Why

Hoy una tarea solo dice qué hay que hacer, quién lo lleva y en qué estado está: no hay forma de decir **para cuándo**, ni de enterarse de que un plazo ya pasó. Quien se compromete con una fecha la guarda en la cabeza o fuera de la herramienta, y descubre tarde que se le ha pasado.

FS-118 añade una fecha de vencimiento opcional y una señal explícita de tarea vencida, con una regla deliberadamente estrecha para no convertir FlowSync en un gestor de plazos: la fecha se pone al abrir la tarea, nunca al crearla, y no asoma en la lista.

## What Changes

- Una tarea pasa a poder tener **fecha de vencimiento, o no tenerla**. No tenerla es el estado normal y no se penaliza de ninguna forma.
- Se puede **poner, cambiar y quitar** esa fecha en cualquier tarea existente, sin ser su responsable y sin paso de guardado.
- El sistema decide si una tarea está **vencida**: tiene fecha, esa fecha es *anterior* al día de quien mira, y no está en `done`. Vencer hoy todavía no es estar vencida.
- El vencimiento se **resuelve en el momento de mirar y contra el día de quien mira**, no se congela al guardar. Dos personas en husos distintos pueden ver lecturas distintas de la misma tarea y las dos son correctas; y una tarea pasa a vencida sola, al cruzar la medianoche, sin que nadie la toque.
- Se estrena una **pantalla de detalle de una tarea** (`/tasks/:id`), a la que se llega desde su fila. Es donde vive la fecha y donde se comunica el vencimiento.
- La **lista sigue exactamente igual**: sin fechas, sin marcas de vencida y sin pedir fecha al crear. Eso no es una omisión, es un requisito.

### Fuera de alcance, y a propósito

- **Sin tests.** No se monta base de pruebas ni se escribe ninguna. Esto incumple a conciencia los puntos de prueba del DoD de FS-118.2 y FS-118.3, y deja **FS-118.5 entero sin hacer**. Es una decisión explícita de quien encarga el trabajo, no un descuido; queda anotada como riesgo abajo.
- **Sin dependencias nuevas.** No se trae ningún componente de calendario: la decisión que FS-118.4 pide tomar antes de empezar se resuelve con el campo de fecha nativo del navegador.
- **CA-18** (reasignar no toca la fecha) no se puede verificar: no existe reasignación de responsable en el producto.
- **CA-11 y CA-12** son requisitos de que *no* pase nada; se especifican, pero no añaden código.
- La vuelta desde `done` con la fecha pasada (pendiente de PA-7) y el conflicto de dos personas editando la misma fecha (PA-8) siguen sin decidir, y este change no los cierra.

## Capabilities

### New Capabilities

Ninguna. La fecha de vencimiento es comportamiento de una tarea, no una capability aparte.

### Modified Capabilities

- `tasks`: gana la fecha de vencimiento y la condición de vencida como parte de lo que una tarea es y de lo que la API devuelve; gana la pantalla de detalle como sitio donde se edita esa fecha; y se aclara que esa pantalla no es una vista de tareas rival de la lista compartida.

## Impact

**Backend.** Migración que añade la columna de vencimiento a `tasks` (nullable, sin tocar las filas existentes) y regeneración del esquema con el comando del proyecto. Regla de vencimiento en el modelo. Endpoint para leer una tarea suelta y endpoint para fijar y retirar su fecha. Transformer y validador nuevos. Los tipos generados del cliente cambian y hay que regenerarlos.

**Frontend.** Pantalla `/tasks/:id` y su ruta protegida; enlace desde cada fila de la lista; las llamadas nuevas al único punto de contacto con la API. La lista no cambia de comportamiento.

**Riesgos.**

- El más grave es el que la propia historia señala: **CA-19 junto a CA-20 obligan a que el vencimiento se resuelva al mirar y contra el día de quien mira**. Si se calcula con el reloj del servidor el fallo no se manifiesta hasta que alguien cruza la medianoche o mira desde otro huso, y para entonces está repartido por varias capas.
- **CA-5 es la trampa del día de más**: vencer hoy no es estar vencida. Un `<=` en lugar de un `<` la incumple sin que nada falle.
- **Sin tests, los dos riesgos anteriores quedan sin red.** Son exactamente los que FS-118.2 pedía cubrir con pruebas de los cuatro bordes y de dos días de referencia distintos. La verificación es manual.
- **CA-4 sigue marcado como PROPUESTO**: la señal propia de tarea vencida se construye antes de estar validada, y puede haber que rehacerla.
- **Deriva conocida de la spec viva**, ajena a este change: `openspec/specs/tasks/spec.md` describe `GET /api/v1/tasks` como «todas las tareas del espacio», que dejó de ser cierto cuando se implementó el filtro por estado (FS-142) sin actualizar `openspec/`. Este change no la arregla —se ciñe a FS-118— pero quien lea esa spec debe saber que ese requisito ya no describe el sistema real.
- La base de desarrollo y la de pruebas son el mismo fichero: migrar toca también el estado local.
