# E3-1 — La lista compartida del equipo

**Identificador:** pendiente de asignar (etiqueta provisional `E3-1`)
**Épica:** E3 · Actividad del equipo
**Traza:** RF-16, RF-17 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero ver una sola lista con todas las tareas del espacio y su responsable y estado a la vista, para saber en qué anda cada uno sin preguntar a nadie.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

> **Por qué esta historia va la primera junto a la creación.** Es el sustrato de la épica de gestión de tareas: sin lista no hay dónde cambiar un estado desde la propia fila, ni nada que filtrar, ni nada donde enseñar un vencimiento. El backlog la señalaba como bloqueo transversal antes de existir; ahora es trabajo con criterios, no una nota al pie.

---

## Criterios de aceptación

### Una sola lista, la misma para todos

**CA-1 — El contenido no depende de quién mira**
DADO que dos personas distintas del espacio abren la aplicación
CUANDO las dos miran la lista sin tocar nada
ENTONCES ven exactamente el mismo conjunto de tareas.

**CA-2 — No hay tareas privadas**
DADO que otra persona crea una tarea y se la asigna a sí misma
CUANDO yo miro la lista
ENTONCES esa tarea está ahí
Y no existe ninguna forma de crear una tarea que otros no puedan ver.

**CA-3 — Una sola lista, no una por persona**
DADO que estoy en la aplicación
CUANDO busco otras vistas de tareas
ENTONCES no hay ninguna vista «mis tareas» separada de la lista del equipo.

### Responder «quién está en qué» sin abrir nada

**CA-4 — Cada fila dice título, responsable y estado**
DADO que hay tareas en el espacio
CUANDO miro la lista
ENTONCES cada tarea muestra su título, quién la lleva y en qué estado está
Y no necesito abrir ninguna para saber esas tres cosas.

**CA-5 — Se puede enumerar el trabajo de cada persona**
DADO que el equipo tiene tareas repartidas
CUANDO recorro la lista con la vista
ENTONCES puedo decir en qué trabaja cada miembro sin hacer clic en ninguna tarea.

**CA-6 — El responsable se identifica por su nombre**
DADO que miro una fila de la lista
CUANDO leo quién la lleva
ENTONCES veo el nombre de esa persona, no un identificador interno ni un correo.

**CA-7 — La lista no adelanta el vencimiento**
DADO que hay tareas con fecha de vencimiento, algunas ya pasadas
CUANDO miro la lista
ENTONCES no veo fechas ni ninguna marca de vencida
Y esa información aparece solo al abrir la tarea.

### El espacio vacío

**CA-8 — Todavía no hay nada**
DADO que en el espacio no se ha creado ninguna tarea
CUANDO abro la lista
ENTONCES se me explica qué es esto y se me ofrece crear la primera
Y no se me muestra una lista vacía sin más.

### Límites y criterios negativos

**CA-9 — Ver la lista no requiere permiso especial**
DADO que soy una persona registrada en el espacio
CUANDO abro la lista
ENTONCES la veo entera, igual que cualquier otro miembro
Y no hay contenido reservado a ningún rol.

**CA-10 — La lista exige haber entrado**
DADO que no he iniciado sesión
CUANDO intento llegar a la lista
ENTONCES no veo ninguna tarea.

**CA-11 — Mirar no cambia nada**
DADO que hay tareas en varios estados
CUANDO abro la lista y la recorro
ENTONCES ninguna tarea cambia de estado, de responsable ni de fecha.

**CA-12 — La lista no muestra quién está conectado** · **[PROPUESTO]**
DADO que otras personas del equipo están usando la aplicación a la vez que yo
CUANDO miro la lista
ENTONCES no veo ninguna señal de presencia, ni quién está en línea, ni actividad por persona.

*Motivo de la propuesta: el PRD lo excluye del alcance por decisión explícita, calificándolo de vigilancia, pero lo hace en la tabla de exclusiones y no como requisito. Sin un criterio negativo aquí, «responder quién está en qué» invita justo a construirlo.*

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **En qué orden salen las tareas, y si se agrupan por persona.** Es la ausencia más grave de esta historia: CA-5 promete enumerar el trabajo de cada miembro, y con el volumen que el PRD contempla esa promesa no se sostiene recorriendo una lista sin orden ni agrupación. Pendiente de **PA-3**.
- **Cuántas tareas «En curso» puede acumular una persona.** Si cada miembro tiene cuatro, la lista deja de responder la pregunta para la que existe. Pendiente de **PA-4**.
- **Qué ve alguien cuando la tarea que tiene abierta desaparece o cambia de manos bajo sus pies.** Pendiente de **PA-8**.

---

## Tickets

**Todavía sin descomponer**, como el resto de historias de la base. Encabezan el orden priorizado y se implementan juntas: la descomposición en capas la produce el trabajo de especificación, alimentado por estos criterios.

**Nota para quien la implemente:** el punto delicado es **qué se expone del responsable**. La lista solo necesita un nombre; devolver el registro de usuario entero filtra datos de cuenta a una vista que no los usa, y una vez que el cliente los consume ya no se recortan sin romperlo.

---

> **Lo que esta historia deliberadamente no trae.** Que la lista se refresque sola cuando otro cambia algo es una historia aparte (`E3-2`), no un detalle de esta. Aquí la lista es correcta en el momento en que se pide.
