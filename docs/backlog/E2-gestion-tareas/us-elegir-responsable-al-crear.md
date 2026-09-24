# Elegir el responsable al crear una tarea

**Identificador:** E2-2 (provisional, pendiente de identificador FS)

**Estado:** borrador, criterios pendientes de revisión.

> **Como** miembro del equipo, **quiero** elegir a otro miembro como responsable al crear una tarea, **para** repartir trabajo que no voy a hacer yo.

## Criterios de aceptación

Leyenda: (RF-n) = sale del PRD · **[PROPUESTO]** = añadido en el refinamiento, pendiente de revisión · [SUPUESTO PRD] = depende de un supuesto del PRD todavía sin confirmar.

**CA-01 · Camino feliz: asignar a otra persona** (RF-13, RF-14)
DADO que estoy creando una tarea y aparezco yo como responsable
CUANDO elijo a Ana, que es miembro del equipo activo, y guardo
ENTONCES la tarea se crea con Ana como responsable y así aparece en la lista.

**CA-02 · Solo se ofrecen miembros del equipo activo** (RF-12, RF-16)
DADO que pertenezco a los equipos A y B, tengo activo el A y Carlos solo es miembro del B
CUANDO abro la lista de posibles responsables
ENTONCES aparecen todos los miembros del equipo A, incluido yo, y Carlos no aparece.

**CA-03 · Cada miembro se reconoce** (RF-12) [SUPUESTO PRD]
DADO que estoy eligiendo responsable
CUANDO veo las opciones
ENTONCES cada miembro aparece con su nombre o su email.

**CA-04 · No se puede dejar sin responsable** (RF-13)
DADO que estoy creando una tarea
CUANDO intento guardarla sin responsable
ENTONCES no se crea y aparece un mensaje en castellano junto al campo del responsable.

**CA-05 · Se rechaza a quien no es miembro** (RF-16)
DADO que estoy creando una tarea
CUANDO de algún modo se indica como responsable a alguien que no es miembro del equipo activo
ENTONCES la tarea no se crea y aparece un mensaje en castellano.

**CA-06 · Equipo de una sola persona** **[PROPUESTO]**
DADO un equipo en el que solo estoy yo
CUANDO creo una tarea
ENTONCES la única opción de responsable soy yo, y la tarea se crea conmigo.

**CA-07 · Un miembro recién añadido ya se puede elegir** **[PROPUESTO]** (RF-4)
DADO que el creador acaba de añadir a Marta al equipo
CUANDO abro de nuevo el formulario de crear tarea
ENTONCES Marta aparece entre los posibles responsables.

**CA-08 · Asignar no avisa a nadie** **[PROPUESTO]** (RNF-5)
DADO que creo una tarea con Ana como responsable
CUANDO se guarda
ENTONCES Ana no recibe emails, avisos ni notificaciones: la tarea solo aparece en la lista.
