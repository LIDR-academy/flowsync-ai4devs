# Cambiar el estado de una tarea desde la lista

**Identificador:** E2-4 (provisional, pendiente de identificador FS)

**Estado:** borrador, criterios pendientes de revisión.

> **Como** miembro del equipo, **quiero** cambiar el estado de una tarea desde la lista en dos clics como máximo, **para** que nadie tenga que preguntarme en qué estoy.

## Criterios de aceptación

Leyenda: (RF-n) = sale del PRD · **[PROPUESTO]** = añadido en el refinamiento, pendiente de revisión · [SUPUESTO PRD] = depende de un supuesto del PRD todavía sin confirmar.

**CA-01 · Camino feliz: empezar una tarea** (RF-20, RNF-2)
DADO una tarea pendiente en la lista del equipo
CUANDO la paso a en curso
ENTONCES lo hago sin salir de la lista y con dos clics como máximo, y la tarea aparece en curso.

**CA-02 · Tres estados fijos** (RF-18)
DADO que voy a cambiar el estado de una tarea
CUANDO veo las opciones
ENTONCES solo están "Pendiente", "En curso" y "Hecho", y no hay forma de añadir, renombrar ni quitar estados.

**CA-03 · Se puede ir de cualquier estado a cualquier otro** (RF-19) [SUPUESTO PRD]
DADO una tarea en cualquier estado
CUANDO la paso a cualquiera de los otros dos (por ejemplo, de pendiente directamente a hecho)
ENTONCES el cambio se guarda sin pasar por ningún estado intermedio.

**CA-04 · Se puede volver atrás** (RF-19) [SUPUESTO PRD]
DADO una tarea hecha
CUANDO un miembro la devuelve a en curso
ENTONCES la tarea aparece en curso.

**CA-05 · Elegir el estado que ya tiene no cambia nada** **[PROPUESTO]**
DADO una tarea en curso
CUANDO elijo "En curso" otra vez
ENTONCES la tarea se queda igual y no aparece ningún error.

**CA-06 · Cambiar el estado no cambia el responsable** **[PROPUESTO]**
DADO una tarea pendiente asignada a Ana
CUANDO Luis la pasa a en curso
ENTONCES la tarea sigue asignada a Ana. Para cogerla, Luis tiene que reasignársela (ver E2-6).

**CA-07 · Cualquier miembro puede cambiarlo** (RF-11)
DADO una tarea asignada a Ana
CUANDO Luis, que es miembro del equipo, le cambia el estado
ENTONCES el cambio se guarda igual que si lo hubiera hecho Ana.

**CA-08 · Quien no es miembro no puede cambiarlo** (RF-10)
DADO una persona que no es miembro del equipo
CUANDO intenta cambiar el estado de una de sus tareas, aunque sea con el enlace directo
ENTONCES no se cambia nada y la persona no llega a saber que la tarea existe.

**CA-09 · Se puede hacer con el teclado** (RNF-9)
DADO que uso solo el teclado
CUANDO llego a una tarea de la lista
ENTONCES puedo cambiar su estado sin usar el ratón.

**CA-10 · El estado no depende solo del color** (RNF-9)
DADO una lista con tareas en los tres estados
CUANDO la miro
ENTONCES cada tarea muestra el nombre de su estado en texto, y se distinguen aunque no se vean los colores.

**CA-11 · Error al guardar** (RF-26)
DADO que cambio el estado de una tarea
CUANDO el cambio no se puede guardar (por ejemplo, porque se ha caído la red)
ENTONCES veo un mensaje en castellano y la tarea vuelve a mostrar el estado que tenía antes.

**CA-12 · Cambios a la vez** (RF-25) [SUPUESTO PRD]
DADO dos miembros que cambian el estado de la misma tarea casi al mismo tiempo, uno a en curso y otro a hecho
CUANDO se guardan los dos cambios
ENTONCES la tarea se queda con el estado que se guardó en último lugar y los dos ven ese estado.

**CA-13 · Cambiar el estado no mueve la tarea en la lista** (RF-34) [SUPUESTO PRD]
DADO una lista sin filtro con varias tareas
CUANDO un miembro cambia el estado de una de ellas
ENTONCES la tarea sigue en la misma posición.

**CA-14 · Todos ven el cambio** (RF-31, RF-33)
DADO dos miembros con la lista del equipo abierta
CUANDO uno cambia el estado de una tarea
ENTONCES quien lo cambia lo ve en cuanto se confirma, y el otro lo ve en menos de 10 segundos sin recargar la página.
