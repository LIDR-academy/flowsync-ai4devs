# Filtrar las tareas por estado

- **Identificador:** FS-142
- **Épica:** E2 «Gestión de tareas»
- **Origen:** RF-19 del [PRD](../../prd/flowsync-mvp.md). En el listado de E2 se llamaba HU-E2-11.

## Historia

**Como** miembro del equipo, **quiero** filtrar la lista de tareas por estado **para** centrarme en lo pendiente o en lo que está libre.

## Criterios de aceptación

Cada criterio indica su origen: *(PRD: …)* si sale del PRD, *(producto)* si lo fijó producto al pedir la historia, y **[PROPUESTO]** si está pendiente de revisión por producto.

> Condición: las cinco opciones de filtro y *Pendientes* como opción por defecto salen de RF-19, pero PA-6 cuestiona si hace falta tanto detalle. Si PA-6 lo reduce, CA-2 a CA-5 se ajustan.

### Camino feliz

**CA-1: Al abrir la lista se ve lo pendiente** *(PRD: RF-19)*
- **DADO** una lista con tareas Libres, En curso y Terminadas
- **CUANDO** un miembro del equipo abre la lista
- **ENTONCES** ve solo las tareas Libres y En curso
- **Y** no ve ninguna Terminada

**CA-2: Filtrar por Libre** *(PRD: RF-19)*
- **DADO** una lista con tareas en los tres estados
- **CUANDO** un miembro del equipo elige el filtro *Libre*
- **ENTONCES** ve solo las tareas sin responsable que no están terminadas

**CA-3: Filtrar por En curso** *(PRD: RF-19)*
- **DADO** una lista con tareas en los tres estados
- **CUANDO** un miembro del equipo elige el filtro *En curso*
- **ENTONCES** ve solo las tareas que tienen responsable y no están terminadas

**CA-4: Filtrar por Terminada** *(PRD: RF-19)*
- **DADO** una lista con tareas en los tres estados
- **CUANDO** un miembro del equipo elige el filtro *Terminada*
- **ENTONCES** ve solo las tareas terminadas

**CA-5: Ver todas** *(PRD: RF-19)*
- **DADO** una lista con tareas en los tres estados
- **CUANDO** un miembro del equipo elige el filtro *Todas*
- **ENTONCES** ve todas las tareas, estén en el estado que estén

**CA-6: Se ve qué filtro está activo** **[PROPUESTO]**
- **DADO** cualquier filtro aplicado, incluido el que viene por defecto
- **CUANDO** un miembro del equipo mira la lista
- **ENTONCES** sabe qué filtro está viendo sin tener que deducirlo de las tareas que aparecen

> Nota: si no se ve el filtro activo, el filtro por defecto *Pendientes* puede hacer creer que las tareas terminadas han desaparecido.

### Estado que no existe

**CA-7: Pedir un estado que no existe da un aviso, no una lista vacía** *(producto)*
- **DADO** un miembro del equipo que pide la lista filtrada por un estado que no existe (por ejemplo, «Bloqueada» o un texto mal escrito)
- **CUANDO** se carga la lista
- **ENTONCES** ve un aviso en castellano que dice que ese estado no existe
- **Y** no se le muestra una lista vacía como si no hubiera tareas en ese estado

> Nota **[PROPUESTO]**: todavía no está decidido cómo se puede llegar a pedir un estado que no existe, porque desde el selector solo se puede elegir entre las opciones válidas. Hay dos posibilidades: un enlace o un marcador que conserve el filtro (mecanismo sin aprobar) o un filtro que se ha conservado (CA-12) y que ha dejado de ser válido porque PA-6 ha reducido las opciones. La regla de este criterio es la misma venga de donde venga.

**CA-8: Tras el aviso, puede seguir trabajando** **[PROPUESTO]**
- **DADO** el aviso de CA-7
- **CUANDO** el miembro del equipo lo lee
- **ENTONCES** ve qué estados son válidos y puede elegir uno sin recargar ni corregir el enlace a mano

> Nota: otra opción es mostrar la lista con *Pendientes* junto al aviso. Es más cómoda, pero puede disimular el error. Lo decide producto.

**CA-9: Un filtro válido sin tareas no es un error** **[PROPUESTO]**
- **DADO** que no hay ninguna tarea Libre
- **CUANDO** un miembro del equipo elige el filtro *Libre*
- **ENTONCES** ve un mensaje que dice que no hay tareas libres
- **Y** ese mensaje se distingue claramente del aviso de CA-7

### Cambios con un filtro activo

**CA-10: Si cambio una tarea y deja de cumplir el filtro, sale de la vista** **[PROPUESTO]**
- **DADO** un miembro del equipo que tiene el filtro *Libre*
- **CUANDO** toma una de esas tareas y pasa a En curso
- **ENTONCES** la tarea deja de aparecer en esa vista sin recargar
- **Y** el miembro del equipo recibe confirmación de que la ha tomado, para que no parezca que ha desaparecido

**CA-11: Crear una tarea que no cumple el filtro activo** **[PROPUESTO]**
- **DADO** un miembro del equipo que tiene el filtro *En curso* o *Terminada*
- **CUANDO** crea una tarea nueva, que nace Libre
- **ENTONCES** recibe confirmación de que se ha creado
- **Y** se le indica que no la ve porque el filtro activo la oculta

> Nota: sin esto, la persona puede creer que la tarea no se ha guardado y volver a crearla, con lo que aparecen duplicados.

**CA-12: El filtro se mantiene al recargar** **[PROPUESTO]**
- **DADO** un miembro del equipo que tiene un filtro distinto de *Pendientes*
- **CUANDO** recarga la lista para ver los cambios de los demás
- **ENTONCES** sigue viendo el mismo filtro

> Nota: recargar es la forma de ver los cambios de los demás (RF-21). Si al recargar se pierde el filtro, se penaliza justo lo que el producto necesita que la gente haga. La alternativa es volver siempre a *Pendientes*.

**CA-13: Los cambios de otros se ven al recargar** *(PRD: RF-21)*
- **DADO** un miembro del equipo que tiene el filtro *Libre* mientras otra persona toma una de esas tareas
- **CUANDO** recarga la lista
- **ENTONCES** esa tarea ya no aparece en *Libre*
- **Y** mientras no recarga, la sigue viendo como estaba

**CA-14: El filtro es personal** **[PROPUESTO]**
- **DADO** un miembro del equipo que aplica un filtro
- **CUANDO** otro miembro abre la lista
- **ENTONCES** la ve con su propio filtro, no con el del primero

### Relación con el resto de la lista

**CA-15: Filtrar no cambia el orden** **[PROPUESTO]**
- **DADO** una lista ordenada por fecha de creación (RF-22)
- **CUANDO** un miembro del equipo cambia de filtro
- **ENTONCES** las tareas que quedan a la vista conservan su orden

**CA-16: Solo se filtra por estado** *(PRD: §4, «Búsqueda y otros filtros»)*
- **DADO** la lista de tareas
- **CUANDO** un miembro del equipo quiere acotarla
- **ENTONCES** solo puede filtrar por estado
- **Y** no puede filtrar por responsable, fecha o texto, ni combinar filtros

### Accesibilidad

**CA-17: Se puede filtrar con teclado** *(PRD: RNF-7)*
- **DADO** un miembro del equipo que usa solo el teclado
- **CUANDO** quiere cambiar de filtro
- **ENTONCES** puede elegir cualquiera de los cinco sin usar el ratón

**CA-18: El filtro activo no se indica solo con color** **[PROPUESTO]** *(extiende RNF-7, que solo lo exige para el estado de la tarea)*
- **DADO** un filtro aplicado
- **CUANDO** se muestra cuál está activo
- **ENTONCES** se indica también con texto o con un icono con etiqueta, no solo con el color
