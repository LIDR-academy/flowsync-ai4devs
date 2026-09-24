# Editar el título de una tarea

**Identificador:** E2-5 (provisional, pendiente de identificador FS)

**Estado:** borrador, criterios pendientes de revisión.

> **Como** miembro del equipo, **quiero** editar el título de una tarea, **para** corregirlo o aclararlo y que se vea si se solapa con otra.

## Criterios de aceptación

Leyenda: (RF-n) = sale del PRD · **[PROPUESTO]** = añadido en el refinamiento, pendiente de revisión · [SUPUESTO PRD] = depende de un supuesto del PRD todavía sin confirmar.

**CA-01 · Camino feliz: corregir el título** (RF-21)
DADO una tarea titulada "Revisar el logn"
CUANDO un miembro cambia el título a "Revisar el login" y lo guarda
ENTONCES la lista muestra "Revisar el login".

**CA-02 · Título vacío o con solo espacios** (RF-15, RF-21, RNF-7)
DADO una tarea titulada "Revisar el login"
CUANDO intento guardar el título vacío o con solo espacios
ENTONCES no se guarda, aparece un mensaje en castellano junto al campo y la tarea conserva "Revisar el login".

**CA-03 · Título demasiado largo** (RF-15, RF-21) [SUPUESTO PRD]
DADO una tarea cualquiera
CUANDO intento guardar un título de más de 200 caracteres
ENTONCES no se guarda, aparece un mensaje en castellano junto al campo que indica el máximo y la tarea conserva su título anterior.

**CA-04 · Se quitan los espacios sobrantes** **[PROPUESTO]**
DADO una tarea cualquiera
CUANDO guardo un título con espacios al principio o al final
ENTONCES se guarda sin esos espacios, igual que al crear la tarea.

**CA-05 · Cancelar la edición** **[PROPUESTO]**
DADO que estoy editando el título de una tarea
CUANDO cancelo sin guardar (por ejemplo, con la tecla Escape)
ENTONCES la tarea conserva su título anterior.

**CA-06 · Guardar sin cambios no hace nada** **[PROPUESTO]**
DADO que estoy editando el título de una tarea
CUANDO lo guardo sin haberlo cambiado
ENTONCES la tarea se queda igual y no aparece ningún error.

**CA-07 · Editar el título no toca lo demás** **[PROPUESTO]**
DADO una tarea en curso, asignada a Ana y con fecha
CUANDO un miembro le cambia el título
ENTONCES el estado, el responsable y la fecha siguen siendo los mismos.

**CA-08 · Cualquier miembro puede editarlo** (RF-11)
DADO una tarea asignada a Ana
CUANDO Luis, que es miembro del equipo, le cambia el título
ENTONCES el cambio se guarda igual que si lo hubiera hecho Ana.

**CA-09 · Quien no es miembro no puede editarlo** (RF-10)
DADO una persona que no es miembro del equipo
CUANDO intenta cambiar el título de una de sus tareas, aunque sea con el enlace directo
ENTONCES no se cambia nada y la persona no llega a saber que la tarea existe.

**CA-10 · Se puede hacer con el teclado** (RNF-9)
DADO que uso solo el teclado
CUANDO llego a una tarea de la lista
ENTONCES puedo editar su título y guardarlo sin usar el ratón.

**CA-11 · Error al guardar** (RF-26)
DADO que cambio el título de una tarea
CUANDO el cambio no se puede guardar (por ejemplo, porque se ha caído la red)
ENTONCES veo un mensaje en castellano y la tarea vuelve a mostrar el título que tenía antes.

**CA-12 · Cambios a la vez** (RF-25) [SUPUESTO PRD]
DADO dos miembros que cambian el título de la misma tarea casi al mismo tiempo
CUANDO se guardan los dos cambios
ENTONCES la tarea se queda con el título que se guardó en último lugar y los dos ven ese título.

**CA-13 · Editar el título no mueve la tarea en la lista** (RF-34) [SUPUESTO PRD]
DADO una lista con varias tareas
CUANDO un miembro cambia el título de una de ellas
ENTONCES la tarea sigue en la misma posición.

**CA-14 · Todos ven el cambio** (RF-31, RF-33)
DADO dos miembros con la lista del equipo abierta
CUANDO uno cambia el título de una tarea
ENTONCES quien lo cambia lo ve en cuanto se confirma, y el otro lo ve en menos de 10 segundos sin recargar la página.
