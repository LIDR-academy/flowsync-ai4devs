# E2-10 — Borrar una tarea

**Identificador:** pendiente de asignar (etiqueta provisional `E2-10`)
**Épica:** E2 · Gestión de tareas
**Traza:** RF-12 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero borrar una tarea que ya no tiene sentido, para que la lista no se llene de ruido que nadie va a hacer.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

> **Por qué esta historia se escribe con más cuidado del que su tamaño sugiere.** Era la única acción irreversible del producto: los roles son planos, así que cualquiera puede borrar el trabajo de cualquiera. **Desde el 2026-10-02 lo borrado va a una papelera** (PA-2 resuelto, RF-12 enmendado), y los criterios de abajo se han reescrito para eso. Siguen siendo casi todos guardarraíles, y esa proporción es deliberada.

---

## Criterios de aceptación

### Camino feliz

**CA-1 — Borrar una tarea**
DADO que estoy sobre una tarea existente
CUANDO la borro y confirmo
ENTONCES desaparece de la lista.

**CA-2 — Desaparece para todo el equipo**
DADO que he borrado una tarea
CUANDO otra persona mira la lista
ENTONCES esa tarea tampoco está para ella.

**CA-3 — Se puede borrar una tarea ajena**
DADO que la tarea la creó y la lleva otra persona
CUANDO la borro y confirmo
ENTONCES se borra, sin permiso especial.

### El guardarraíl de lo irreversible

**CA-4 — Siempre pide confirmación explícita**
DADO que pido borrar una tarea
CUANDO se me responde
ENTONCES se me pide confirmar de forma explícita antes de borrar nada.

**CA-5 — La confirmación dice adónde va**
DADO que se me está pidiendo confirmar un borrado
CUANDO leo lo que se me pregunta
ENTONCES entiendo que la tarea va a la papelera y que se puede restaurar desde allí.

**CA-6 — Echarse atrás no borra nada**
DADO que se me está pidiendo confirmar un borrado
CUANDO cancelo
ENTONCES la tarea sigue exactamente igual que antes.

**CA-7 — Borrar no es una acción de dos clics** · **[PROPUESTO]**
DADO que estoy en la lista
CUANDO comparo lo que cuesta borrar una tarea con lo que cuesta cambiarle el estado
ENTONCES borrar cuesta más, y nunca se puede completar por accidente en el mismo gesto.

*Motivo de la propuesta: el producto exige que cambiar de estado se haga en dos interacciones o menos, sin confirmación. Si borrar viviera al lado con un peso parecido, el gesto barato y el irreversible acabarían confundiéndose. El requisito pide confirmación, pero no dice nada de la distancia entre ambas acciones.*

### Límites y criterios negativos

**CA-8 — Lo borrado está en la papelera**
DADO que he borrado una tarea
CUANDO consulto la papelera
ENTONCES la tarea está ahí, con quién la llevaba y cuándo se borró.

**CA-8b — Restaurar la devuelve tal cual**
DADO que una tarea está en la papelera
CUANDO la restauro
ENTONCES vuelve a la lista con su título, estado, responsable y fecha de vencimiento intactos
Y desaparece de la papelera.

**CA-8c — Lo borrado no sale por ningún otro camino**
DADO que una tarea está en la papelera
CUANDO alguien la busca por la lista, por cualquier filtro o abriéndola por su identificador
ENTONCES no la encuentra
Y no se le puede cambiar el estado ni la fecha.

**CA-9 — Borrar no es «marcar como hecha»**
DADO que quiero quitar de la vista una tarea terminada
CUANDO uso el estado «Hecho»
ENTONCES sale de la vista por defecto pero sigue siendo consultable
Y eso es un camino distinto del borrado, que la manda a la papelera.

**CA-10 — Borrar exige haber entrado**
DADO que no he iniciado sesión
CUANDO intento borrar una tarea
ENTONCES no se borra nada.

**CA-11 — Borrar dos veces no es un error nuevo** · **[PROPUESTO]**
DADO que otra persona ha borrado ya una tarea que yo tenía a la vista
CUANDO intento borrarla
ENTONCES se me dice que ya no existe
Y no se me presenta como un fallo del sistema.

*Motivo de la propuesta: con la lista actualizándose sola y roles planos, dos personas borrando lo mismo a la vez es un caso corriente, y ningún requisito dice qué debe ocurrir.*

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **Qué ve alguien cuya tarea abierta borra otra persona.** Es el caso literal que nombra **PA-8**, y esta historia es una de las dos que lo provocan.
- **Si borrar debería estar limitado de alguna forma.** Los roles planos son un supuesto declarado del PRD, no un descuido, así que hoy la respuesta es que no. Se anota porque es la primera cosa que cambiará si el producto crece más allá del caso de estudio.

---

## Tickets

**Todavía sin descomponer.** Se descompone cuando entre en la sesión de trabajo que la implemente, no antes.

**Nota para quien la descomponga:** la confirmación de CA-4 es un criterio de producto, no un detalle de interfaz. Un ticket que solo entregue el borrado por la API deja el guardarraíl sin construir, y es precisamente el guardarraíl lo que esta historia entrega.
