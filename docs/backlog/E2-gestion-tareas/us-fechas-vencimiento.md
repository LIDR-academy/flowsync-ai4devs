# Fecha de vencimiento y tareas vencidas

**Identificador:** FS-118

> **Como** miembro del equipo, **quiero** poner, cambiar o quitar la fecha de vencimiento de una tarea y ver marcadas las que se han pasado de plazo, **para** que un retraso se vea sin tener que avisar a nadie.

## Criterios de aceptación

Leyenda: (RF-n) = sale del PRD · **[PROPUESTO]** = añadido en el refinamiento, pendiente de revisión · [SUPUESTO PRD] = depende de un supuesto del PRD todavía sin confirmar.

"Hoy" y "fecha pasada" se refieren siempre al día en el huso horario del equipo.

### A. Poner, cambiar y quitar la fecha

**CA-01 · Crear sin fecha** (RF-13)
DADO que estoy creando una tarea en mi equipo
CUANDO la guardo sin elegir fecha
ENTONCES la tarea se crea, en la lista no aparece ninguna fecha y nunca se marca como vencida.

**CA-02 · Crear con fecha** (RF-13, RF-27)
DADO que estoy creando una tarea
CUANDO elijo una fecha de vencimiento y la guardo
ENTONCES la tarea aparece en la lista con esa fecha.

**CA-03 · Poner fecha a una tarea que no tenía** (RF-23)
DADO una tarea sin fecha
CUANDO un miembro le pone una fecha
ENTONCES la lista muestra esa fecha en la tarea.

**CA-04 · Cambiar la fecha** (RF-23)
DADO una tarea que vence el 30 de septiembre
CUANDO un miembro la cambia al 3 de octubre
ENTONCES la lista muestra el 3 de octubre y ya no el 30 de septiembre.

**CA-05 · Quitar la fecha** (RF-23, RF-28)
DADO una tarea con fecha, esté vencida o no
CUANDO un miembro le quita la fecha
ENTONCES la tarea deja de mostrar fecha y, si estaba marcada como vencida, deja de estarlo.

**CA-06 · Solo día, sin hora** (RF-23)
DADO que pongo o cambio la fecha de una tarea
CUANDO la elijo
ENTONCES solo se me pide el día (sin hora) y la lista muestra solo el día.

**CA-07 · La fecha va en el huso horario del equipo y lo indica**
DADO un equipo cuyo huso horario es el de Madrid, una tarea que vence el 30 de septiembre y dos miembros, uno en Madrid y otro en Nueva York
CUANDO los dos miran la lista
ENTONCES los dos ven "30 de septiembre" y, junto a la fecha, el huso del equipo (por ejemplo, "hora de Madrid"). El día no se mueve según dónde esté cada uno.

**CA-07b · El huso también se ve al elegir la fecha** **[PROPUESTO]**
DADO que estoy poniendo o cambiando la fecha de una tarea
CUANDO elijo el día
ENTONCES se indica que es un día en el huso horario del equipo, para que quien esté en otro huso sepa cuándo termina el plazo.

**CA-08 · Cualquier miembro puede cambiarla, no solo el responsable** (RF-11, RF-23)
DADO una tarea asignada a Ana
CUANDO Luis, que es miembro del mismo equipo, le cambia la fecha
ENTONCES el cambio se guarda igual que si lo hubiera hecho Ana.

**CA-09 · Quien no es miembro no puede tocarla** (RF-10)
DADO una persona que no es miembro del equipo
CUANDO intenta poner, cambiar o quitar la fecha de una tarea de ese equipo, aunque sea con el enlace directo
ENTONCES no se cambia nada y la persona no llega a saber que la tarea existe.

**CA-10 · Se admite una fecha pasada** **[PROPUESTO]**
DADO que estoy creando o editando una tarea que no está hecha
CUANDO le pongo una fecha que ya ha pasado
ENTONCES se guarda y la tarea aparece como vencida desde ese momento.

**CA-11 · Fecha no válida** **[PROPUESTO]** (RNF-7)
DADO que estoy poniendo la fecha de una tarea
CUANDO escribo una fecha que no existe (por ejemplo, 31 de febrero) o un texto que no es una fecha
ENTONCES no se guarda y aparece un mensaje en castellano junto al campo de la fecha.

**CA-12 · Error al guardar** (RF-26)
DADO que cambio la fecha de una tarea
CUANDO el cambio no se puede guardar (por ejemplo, porque se ha caído la red)
ENTONCES veo un mensaje en castellano y la tarea vuelve a mostrar la fecha que tenía antes, no la que intenté poner.

**CA-13 · Cambiar la fecha no mueve la tarea en la lista** (RF-34) [SUPUESTO PRD]
DADO una lista con varias tareas
CUANDO un miembro cambia la fecha de una de ellas
ENTONCES la tarea sigue en la misma posición de la lista.

**CA-14 · Cambios a la vez** (RF-25) [SUPUESTO PRD]
DADO dos miembros que cambian la fecha de la misma tarea casi al mismo tiempo
CUANDO se guardan los dos cambios
ENTONCES la tarea se queda con la fecha que se guardó en último lugar y los dos ven esa fecha.

**CA-15 · Los demás ven el cambio solos** (RF-31, RF-33)
DADO dos miembros con la lista del equipo abierta
CUANDO uno pone, cambia o quita una fecha
ENTONCES quien la cambia lo ve nada más confirmarse, y el otro lo ve en menos de 10 segundos sin recargar la página, con la marca de vencida ya ajustada.

**CA-16 · Los demás cambios no tocan la fecha** **[PROPUESTO]**
DADO una tarea con fecha
CUANDO un miembro le cambia el título, el estado o el responsable
ENTONCES la fecha sigue siendo la misma.

### B. Tareas vencidas

**CA-17 · Camino feliz: se marca la vencida** (RF-28, RF-29)
DADO que hoy es 24 de septiembre y una tarea en curso vencía el 23
CUANDO miro la lista
ENTONCES la tarea aparece con la marca "Vencida".

**CA-18 · Si vence hoy, todavía no está vencida** (RF-28)
DADO que hoy es 24 de septiembre y una tarea pendiente vence el 24
CUANDO miro la lista
ENTONCES la tarea no aparece como vencida.

**CA-19 · Una tarea hecha nunca está vencida** (RF-28)
DADO una tarea hecha cuya fecha ya ha pasado
CUANDO miro la lista
ENTONCES la tarea no aparece como vencida.

**CA-20 · Al terminarla deja de estar vencida** (RF-28, RF-33)
DADO una tarea vencida
CUANDO un miembro la pasa a hecho
ENTONCES la marca de vencida desaparece en cuanto se confirma el cambio.

**CA-21 · Si se reabre, vuelve a estar vencida** (RF-19, RF-28)
DADO una tarea hecha cuya fecha ya ha pasado
CUANDO un miembro la devuelve a en curso o a pendiente
ENTONCES la tarea vuelve a aparecer como vencida.

**CA-22 · Si se aplaza, deja de estar vencida** (RF-23, RF-28)
DADO una tarea vencida
CUANDO un miembro cambia su fecha a hoy o a un día futuro
ENTONCES la tarea deja de estar marcada como vencida.

**CA-23 · La marca no depende solo del color** (RF-29, RNF-9)
DADO una tarea vencida
CUANDO se muestra en la lista
ENTONCES lleva el texto "Vencida" (o un icono con esa etiqueta), que se entiende aunque no se distingan los colores **[PROPUESTO: y que un lector de pantalla anuncia como "Vencida"]**.

**CA-24 · El plazo termina a medianoche del equipo** **[PROPUESTO]** (cambia RF-28)
DADO un equipo con huso de Madrid, una tarea en curso que vence el 24 de septiembre y un miembro en Nueva York
CUANDO en Madrid son las 00:30 del 25 (en Nueva York, las 18:30 del 24)
ENTONCES todos los miembros ven la tarea como vencida, estén donde estén.

**CA-25 · Se marca al cambiar de día sin recargar** (RF-36)
DADO que tengo la lista abierta con una tarea en curso que vence hoy
CUANDO pasa la medianoche en el huso del equipo
ENTONCES la tarea pasa a mostrarse como vencida sin que tenga que recargar la página, aunque en mi zona horaria todavía no sea medianoche.

**CA-26 · La marca respeta el filtro** **[PROPUESTO]** (RF-30, RF-32)
DADO una tarea pendiente y vencida
CUANDO filtro la lista por *Pendiente*
ENTONCES la tarea aparece y lleva la marca de vencida. Si filtro por *Hecho* o *En curso*, no aparece.

**CA-27 · La marca es igual para todo el equipo** **[PROPUESTO]**
DADO una tarea vencida asignada a Ana
CUANDO cualquier miembro mira la lista
ENTONCES todos ven la marca de vencida, no solo Ana.

**CA-28 · Que venza una tarea no avisa a nadie** **[PROPUESTO]** (RNF-5)
DADO una tarea que acaba de vencer
CUANDO pasa su fecha
ENTONCES nadie recibe emails, avisos ni notificaciones: la marca en la lista es lo único que cambia.
