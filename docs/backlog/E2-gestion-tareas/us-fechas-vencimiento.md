# Fecha de vencimiento y tareas vencidas

- **Identificador:** FS-118
- **Épica:** E2 «Gestión de tareas»
- **Origen:** RF-23 del [PRD](../../prd/flowsync-mvp.md). Consolida lo que en el listado de E2 eran dos historias: HU-E2-12 (poner, cambiar o quitar la fecha) y HU-E2-13 (ver las vencidas).

## Historia

**Como** miembro del equipo, **quiero** poner, cambiar o quitar una fecha de vencimiento opcional en una tarea y ver de un vistazo cuáles se han pasado de plazo sin estar terminadas, **para** saber qué va con retraso sin tener que preguntar.

## Criterios de aceptación

Cada criterio indica de dónde sale: *(PRD: …)* si sale del PRD, o **[PROPUESTO]** si es una propuesta pendiente de revisión por producto.

### Camino feliz

**CA-1: Poner una fecha** *(PRD: RF-23, RNF-3)*
- **DADO** una tarea sin fecha de vencimiento
- **CUANDO** un miembro del equipo le pone una fecha desde la lista
- **ENTONCES** la tarea muestra esa fecha en la lista sin tener que recargar

**CA-2: Cambiar la fecha** *(PRD: RF-23)*
- **DADO** una tarea con fecha de vencimiento
- **CUANDO** un miembro del equipo la cambia por otra desde la lista
- **ENTONCES** la tarea muestra solo la fecha nueva

**CA-3: Quitar la fecha** *(PRD: RF-23)*
- **DADO** una tarea con fecha de vencimiento
- **CUANDO** un miembro del equipo la quita desde la lista
- **ENTONCES** la tarea deja de mostrar fecha
- **Y** nunca aparece como vencida

**CA-4: La fecha no es obligatoria** *(PRD: RNF-2)*
- **DADO** un miembro del equipo que crea una tarea escribiendo solo el título
- **CUANDO** la confirma
- **ENTONCES** la tarea se crea sin fecha y sin que se le pida ninguna

**CA-5: Se ve como vencida** *(PRD: RF-23)*
- **DADO** una tarea En curso cuya fecha de vencimiento ya ha pasado
- **CUANDO** cualquier miembro del equipo abre la lista
- **ENTONCES** la tarea aparece como vencida y se distingue del resto sin tener que abrirla

**CA-6: Los demás ven la fecha** **[PROPUESTO]**
- **DADO** que un miembro del equipo ha puesto o cambiado la fecha de una tarea
- **CUANDO** otro miembro abre o recarga la lista
- **ENTONCES** ve la fecha actualizada

> Nota: RF-17 del PRD enumera los cambios que se guardan (crear, tomar, asignar, soltar, terminar, reabrir) y no incluye la fecha. Si se aprueba este criterio, hay que añadirla a RF-17.

### Límites de «vencida»

**CA-7: El mismo día del vencimiento todavía no está vencida** *(PRD: RF-23 [SUPUESTO])*
- **DADO** una tarea no terminada cuya fecha de vencimiento es hoy
- **CUANDO** un miembro del equipo mira la lista
- **ENTONCES** la tarea no aparece como vencida
- **Y** al día siguiente sí aparece como vencida

**CA-8: Una tarea terminada nunca está vencida** *(PRD: RF-23)*
- **DADO** una tarea Terminada cuya fecha de vencimiento ya ha pasado
- **CUANDO** un miembro del equipo mira la lista
- **ENTONCES** la tarea no aparece como vencida

**CA-9: Una tarea libre también puede estar vencida** *(PRD: RF-23)*
- **DADO** una tarea Libre, sin responsable, cuya fecha ya ha pasado
- **CUANDO** un miembro del equipo mira la lista
- **ENTONCES** la tarea aparece como vencida

**CA-10: Al reabrirla, vuelve a estar vencida** **[PROPUESTO]**
- **DADO** una tarea Terminada cuya fecha ya ha pasado
- **CUANDO** un miembro del equipo la reabre
- **ENTONCES** la tarea vuelve a aparecer como vencida

**CA-11: Al quitar o aplazar la fecha, deja de estar vencida** **[PROPUESTO]**
- **DADO** una tarea que aparece como vencida
- **CUANDO** un miembro del equipo quita su fecha o la cambia por la de hoy o una futura
- **ENTONCES** la tarea deja de aparecer como vencida sin tener que recargar

**CA-12: Se puede poner una fecha que ya ha pasado** **[PROPUESTO]**
- **DADO** una tarea no terminada
- **CUANDO** un miembro del equipo le pone una fecha anterior a hoy
- **ENTONCES** la fecha se guarda
- **Y** la tarea aparece como vencida desde ese momento

> Nota: si no se permitiera, no se podría registrar una tarea que ya va con retraso. La alternativa es prohibirlo; lo decide producto.

**CA-13: El cambio de día se ve al recargar** **[PROPUESTO]**
- **DADO** un miembro del equipo que tiene la lista abierta cuando pasa la medianoche
- **CUANDO** no recarga
- **ENTONCES** no se exige que las tareas que acaban de vencer aparezcan ya como vencidas
- **Y** al abrir o recargar la lista, sí aparecen como vencidas

> Nota: aplica la misma regla que RF-21 (la lista no se actualiza sola).

### Varios husos horarios

**CA-14: Lo que decide si está vencida es el calendario de quien mira** *(PRD: RF-23 [SUPUESTO]; depende de PA-7)*
- **DADO** una tarea no terminada que vence hoy, y dos miembros del equipo en husos horarios en los que ya es días distintos
- **CUANDO** los dos miran la lista a la vez
- **ENTONCES** la ve vencida quien ya está en el día siguiente, y no la ve vencida quien sigue en el día de la fecha

> Nota: con esto, dos compañeros ven el mismo dato de forma distinta. Si PA-7 se resuelve de otra manera, este criterio cambia.

### Errores y concurrencia

**CA-15: Una fecha no válida no se guarda** **[PROPUESTO]**
- **DADO** una tarea, tenga fecha o no
- **CUANDO** un miembro del equipo introduce una fecha que no existe o está incompleta (por ejemplo, el 31 de febrero)
- **ENTONCES** la fecha no se guarda
- **Y** ve un mensaje en castellano que explica el problema
- **Y** la tarea conserva la fecha que tenía, o sigue sin fecha si no la tenía

**CA-16: Si falla el guardado, no parece guardado** *(PRD: RNF-3, RNF-6)*
- **DADO** un miembro del equipo que pone, cambia o quita una fecha
- **CUANDO** el cambio no se puede guardar
- **ENTONCES** ve un mensaje en castellano
- **Y** la lista sigue mostrando la fecha anterior, sin dar el cambio por guardado

**CA-17: Si dos personas la cambian a la vez, prevalece el último cambio** *(PRD: §4, «Varias personas editando lo mismo a la vez»)*
- **DADO** dos miembros del equipo que cambian la fecha de la misma tarea casi a la vez
- **CUANDO** los dos confirman
- **ENTONCES** se queda la fecha del último cambio confirmado
- **Y** al recargar, los dos ven esa misma fecha

### Relación con el resto de la tarea

**CA-18: Cambiar el estado o el responsable no toca la fecha** **[PROPUESTO]**
- **DADO** una tarea con fecha de vencimiento
- **CUANDO** alguien la toma, la asigna, la suelta, la termina o la reabre
- **ENTONCES** la fecha sigue siendo la misma

**CA-19: Tocar la fecha no mueve la tarea de sitio** **[PROPUESTO]**
- **DADO** una lista ordenada por fecha de creación (RF-22)
- **CUANDO** un miembro del equipo pone, cambia o quita la fecha de una tarea
- **ENTONCES** la tarea sigue en la misma posición de la lista

**CA-20: Las vencidas se ven con cualquier filtro** **[PROPUESTO]**
- **DADO** una tarea vencida
- **CUANDO** la lista está filtrada por *Pendientes*, *Libre*, *En curso* o *Todas*
- **ENTONCES** la tarea aparece marcada como vencida en todos esos filtros
- **Y** no hay un filtro propio para las vencidas (§4 deja fuera los filtros que no son por estado)

**CA-21: La fecha es solo un día, sin hora** **[PROPUESTO]**
- **DADO** una tarea con fecha de vencimiento
- **CUANDO** se muestra en la lista
- **ENTONCES** aparece como un día, con formato de fecha en castellano y sin hora

### Accesibilidad

**CA-22: «Vencida» no se indica solo con color** *(PRD: RNF-7)*
- **DADO** una tarea vencida
- **CUANDO** se muestra en la lista
- **ENTONCES** también se identifica como vencida con texto o con un icono con etiqueta, no solo con el color

**CA-23: Todo se puede hacer con teclado** *(PRD: RNF-7)*
- **DADO** un miembro del equipo que usa solo el teclado
- **CUANDO** pone, cambia o quita una fecha
- **ENTONCES** puede hacerlo sin usar el ratón
