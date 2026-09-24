# Crear una tarea con solo el título

**Identificador:** E2-1 (provisional, pendiente de identificador FS)

**Estado:** borrador, criterios pendientes de revisión.

> **Como** miembro del equipo, **quiero** crear una tarea escribiendo solo su título, asignada a mí por defecto y en estado pendiente, **para** dejar constancia en segundos de lo que voy a hacer.

## Criterios de aceptación

Leyenda: (RF-n) = sale del PRD · **[PROPUESTO]** = añadido en el refinamiento, pendiente de revisión · [SUPUESTO PRD] = depende de un supuesto del PRD todavía sin confirmar.

**CA-01 · Camino feliz: crear escribiendo solo el título** (RF-13, RF-14, RF-17)
DADO que soy miembro de un equipo y lo tengo como equipo activo
CUANDO escribo "Revisar el login" como título y guardo sin tocar nada más
ENTONCES se crea una tarea en el equipo activo con ese título, conmigo como responsable, en estado pendiente y sin fecha, y aparece en la lista del equipo.

**CA-02 · El responsable viene preseleccionado** (RF-14) [SUPUESTO PRD]
DADO que empiezo a crear una tarea
CUANDO se abre el formulario
ENTONCES aparezco yo como responsable, y puedo cambiarlo antes de guardar (ver E2-2).

**CA-03 · Toda tarea nueva empieza pendiente** (RF-17)
DADO que estoy creando una tarea
CUANDO la guardo
ENTONCES la tarea queda en estado pendiente. Al crearla no se puede elegir otro estado.

**CA-04 · No se piden más datos** (RF-13, RNF-2)
DADO que estoy creando una tarea
CUANDO veo el formulario
ENTONCES solo me pide el título, el responsable y, si quiero, la fecha de vencimiento, y solo tengo que escribir el título.

**CA-05 · Título vacío** (RF-15, RNF-7)
DADO que estoy creando una tarea
CUANDO intento guardarla con el título vacío
ENTONCES no se crea y aparece un mensaje en castellano junto al campo del título.

**CA-06 · Título con solo espacios** (RF-15, RNF-7)
DADO que estoy creando una tarea
CUANDO intento guardarla con un título que solo tiene espacios
ENTONCES no se crea y aparece el mismo mensaje que con el título vacío.

**CA-07 · Título demasiado largo** (RF-15) [SUPUESTO PRD]
DADO que estoy creando una tarea
CUANDO escribo un título de más de 200 caracteres e intento guardarla
ENTONCES no se crea y aparece un mensaje en castellano junto al campo que indica el máximo.

**CA-08 · Título en el límite** **[PROPUESTO]** (RF-15)
DADO que estoy creando una tarea
CUANDO escribo un título de exactamente 200 caracteres y la guardo
ENTONCES la tarea se crea con el título completo.

**CA-09 · Se quitan los espacios sobrantes** **[PROPUESTO]**
DADO que estoy creando una tarea
CUANDO escribo "  Revisar el login  ", con espacios al principio y al final, y la guardo
ENTONCES la tarea se guarda con el título "Revisar el login".

**CA-10 · Se admiten títulos repetidos** **[PROPUESTO]**
DADO que el equipo ya tiene una tarea titulada "Revisar el login"
CUANDO creo otra tarea con el mismo título
ENTONCES se crea igualmente. FlowSync no detecta solapes; se ven porque los títulos están en la misma lista.

**CA-11 · La tarea va al equipo activo** (RF-7)
DADO que pertenezco a los equipos A y B y tengo activo el A
CUANDO creo una tarea
ENTONCES aparece en la lista del equipo A y no en la del B.

**CA-12 · Sin equipo no se pueden crear tareas** (RF-9)
DADO que no pertenezco a ningún equipo
CUANDO entro en FlowSync
ENTONCES no puedo crear tareas y veo el estado vacío que me ofrece crear un equipo.

**CA-13 · Quien no es miembro no puede crear tareas en el equipo** (RF-10)
DADO una persona que no es miembro de un equipo
CUANDO intenta crear una tarea en él, aunque sea con el enlace directo
ENTONCES no se crea nada y la persona no llega a saber que el equipo existe.

**CA-14 · Sin sesión no se puede crear** (RF-2)
DADO que no he iniciado sesión
CUANDO intento abrir la pantalla de tareas
ENTONCES voy al login y no veo nada del equipo.

**CA-15 · Error al guardar** (RF-26)
DADO que estoy creando una tarea
CUANDO no se puede guardar (por ejemplo, porque se ha caído la red)
ENTONCES veo un mensaje en castellano, la tarea no aparece en la lista **[PROPUESTO: y lo que había escrito sigue en el formulario para reintentar]**.

**CA-16 · Guardar dos veces seguidas no duplica** **[PROPUESTO]**
DADO que estoy creando una tarea
CUANDO pulso guardar dos veces muy seguidas
ENTONCES se crea una sola tarea.

**CA-17 · La nueva tarea no desordena la lista** (RF-34) [SUPUESTO PRD]
DADO una lista con varias tareas
CUANDO creo una tarea nueva
ENTONCES ocupa el lugar que le toca por orden de creación y las demás tareas no cambian de posición entre sí.

**CA-18 · Todos ven la tarea nueva** (RF-31, RF-33)
DADO dos miembros con la lista del equipo abierta
CUANDO uno crea una tarea
ENTONCES quien la crea la ve en cuanto se confirma, y el otro la ve en menos de 10 segundos sin recargar la página.
