# Reasignar una tarea

**Identificador:** E2-6 (provisional, pendiente de identificador FS)

**Estado:** borrador, criterios pendientes de revisión.

> **Como** miembro del equipo, **quiero** reasignar una tarea a otro miembro, **para** que el responsable sea quien de verdad la va a hacer.

## Criterios de aceptación

Leyenda: (RF-n) = sale del PRD · **[PROPUESTO]** = añadido en el refinamiento, pendiente de revisión · [SUPUESTO PRD] = depende de un supuesto del PRD todavía sin confirmar.

**CA-01 · Camino feliz: pasar la tarea a otra persona** (RF-22)
DADO una tarea asignada a Ana
CUANDO un miembro la reasigna a Luis
ENTONCES la lista muestra a Luis como responsable.

**CA-02 · Cogerse una tarea de otro** (RF-11, RF-22)
DADO una tarea pendiente asignada a Ana
CUANDO Luis se la asigna a sí mismo
ENTONCES la lista muestra a Luis como responsable.

**CA-03 · Solo se ofrecen miembros del equipo activo** (RF-12, RF-16)
DADO que voy a reasignar una tarea del equipo A
CUANDO veo las opciones de responsable
ENTONCES aparecen todos los miembros del equipo A y nadie que no lo sea.

**CA-04 · No se puede dejar sin responsable** (RF-22)
DADO una tarea asignada a Ana
CUANDO intento dejarla sin responsable
ENTONCES no hay forma de hacerlo y la tarea sigue asignada a Ana.

**CA-05 · Se rechaza a quien no es miembro** (RF-16)
DADO una tarea del equipo A
CUANDO de algún modo se indica como responsable a alguien que no es miembro del equipo A
ENTONCES no se cambia el responsable y aparece un mensaje en castellano.

**CA-06 · Reasignar no cambia el estado** **[PROPUESTO]**
DADO una tarea en curso asignada a Ana
CUANDO se reasigna a Luis
ENTONCES la tarea sigue en curso. Si Luis aún no ha empezado, tiene que cambiar el estado aparte (ver E2-4).

**CA-07 · Reasignar a la misma persona no cambia nada** **[PROPUESTO]**
DADO una tarea asignada a Ana
CUANDO se elige a Ana otra vez como responsable
ENTONCES la tarea se queda igual y no aparece ningún error.

**CA-08 · Quien no es miembro no puede reasignar** (RF-10)
DADO una persona que no es miembro del equipo
CUANDO intenta reasignar una de sus tareas, aunque sea con el enlace directo
ENTONCES no se cambia nada y la persona no llega a saber que la tarea existe.

**CA-09 · Se puede hacer con el teclado** (RNF-9)
DADO que uso solo el teclado
CUANDO llego a una tarea de la lista
ENTONCES puedo cambiar su responsable sin usar el ratón.

**CA-10 · Reasignar no avisa a nadie** **[PROPUESTO]** (RNF-5)
DADO una tarea asignada a Ana
CUANDO se reasigna a Luis
ENTONCES ni Ana ni Luis reciben emails, avisos ni notificaciones: solo cambia la lista.

**CA-11 · Error al guardar** (RF-26)
DADO que reasigno una tarea
CUANDO el cambio no se puede guardar (por ejemplo, porque se ha caído la red)
ENTONCES veo un mensaje en castellano y la tarea vuelve a mostrar el responsable que tenía antes.

**CA-12 · Cambios a la vez** (RF-25) [SUPUESTO PRD]
DADO dos miembros que reasignan la misma tarea casi al mismo tiempo, uno a Luis y otro a Marta
CUANDO se guardan los dos cambios
ENTONCES la tarea se queda con el responsable que se guardó en último lugar y los dos ven ese responsable.

**CA-13 · Reasignar no mueve la tarea en la lista** (RF-34) [SUPUESTO PRD]
DADO una lista con varias tareas
CUANDO un miembro reasigna una de ellas
ENTONCES la tarea sigue en la misma posición.

**CA-14 · Todos ven el cambio** (RF-31, RF-33)
DADO dos miembros con la lista del equipo abierta
CUANDO uno reasigna una tarea
ENTONCES quien lo cambia lo ve en cuanto se confirma, y el otro lo ve en menos de 10 segundos sin recargar la página.
