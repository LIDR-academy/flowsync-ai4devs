# Filtrar tareas por estado

**Identificador:** FS-142

**Estado:** borrador, criterios pendientes de revisión.

> **Como** miembro del equipo, **quiero** filtrar la lista de tareas por estado, **para** centrarme en lo pendiente o en lo que está en curso.

## Criterios de aceptación

Leyenda: (RF-n) = sale del PRD · **[PROPUESTO]** = añadido en el refinamiento, pendiente de revisión · [SUPUESTO PRD] = depende de un supuesto del PRD todavía sin confirmar.

**CA-01 · Opciones del filtro** (RF-30)
DADO que estoy en la lista del equipo activo
CUANDO abro el filtro por estado
ENTONCES las opciones son *Todas*, *Pendiente*, *En curso* y *Hecho*, y ninguna más.

**CA-02 · Por defecto se ven todas** (RF-30) [SUPUESTO PRD]
DADO que entro en la lista del equipo
CUANDO todavía no he elegido ningún filtro
ENTONCES el filtro está en *Todas* y veo todas las tareas del equipo.

**CA-03 · Camino feliz: centrarse en lo pendiente** (RF-30, RF-34)
DADO un equipo con tareas pendientes, en curso y hechas
CUANDO filtro por *Pendiente*
ENTONCES solo veo las tareas pendientes, en el mismo orden en que aparecen sin filtro.

**CA-04 · Filtrar por en curso y por hecho** (RF-30)
DADO un equipo con tareas en los tres estados
CUANDO filtro por *En curso* o por *Hecho*
ENTONCES solo veo las tareas de ese estado.

**CA-05 · Volver a verlas todas** (RF-30)
DADO que tengo un filtro por estado aplicado
CUANDO elijo *Todas*
ENTONCES vuelvo a ver todas las tareas del equipo.

**CA-06 · Filtrar no cambia las tareas** **[PROPUESTO]**
DADO que filtro la lista
CUANDO se ocultan las tareas de otros estados
ENTONCES esas tareas no se modifican: siguen existiendo y vuelven a verse al quitar el filtro.

**CA-07 · Se ve qué filtro está activo** (RNF-9)
DADO que he elegido un filtro
CUANDO miro la lista
ENTONCES se ve en texto qué filtro está aplicado, no solo con un color.

**CA-08 · Se puede filtrar con el teclado** (RNF-9)
DADO que uso solo el teclado
CUANDO llego al filtro
ENTONCES puedo cambiarlo sin usar el ratón.

**CA-09 · Ninguna tarea cumple el filtro** (RF-35)
DADO un equipo con tareas, pero ninguna hecha
CUANDO filtro por *Hecho*
ENTONCES veo un mensaje que dice que no hay tareas en ese estado y me ofrece crear una tarea, en lugar de una lista en blanco.

**CA-10 · El equipo no tiene tareas** (RF-35)
DADO un equipo sin ninguna tarea
CUANDO entro en su lista, con cualquier filtro
ENTONCES veo un mensaje que dice que el equipo aún no tiene tareas y me ofrece crear una.

**CA-11 · Se pide un estado que no existe**
DADO que abro la lista con un filtro por un estado que no existe (por ejemplo, desde un enlace con el estado "Bloqueado")
CUANDO se carga la lista
ENTONCES veo un aviso en castellano que dice que ese estado no existe e indica los que sí hay. No se muestra una lista vacía como si no hubiera tareas **[PROPUESTO: y el filtro vuelve a *Todas*]**.

**CA-12 · Los cambios de los demás respetan el filtro** (RF-32)
DADO que tengo la lista filtrada por *En curso*
CUANDO otro miembro pasa una de esas tareas a hecho, o pasa otra tarea a en curso
ENTONCES en menos de 10 segundos y sin recargar, la primera desaparece de mi lista y la segunda aparece.

**CA-13 · Mis cambios también respetan el filtro** **[PROPUESTO]** (RF-32, RF-33)
DADO que tengo la lista filtrada por *Pendiente*
CUANDO paso una tarea a en curso
ENTONCES la tarea sale de mi lista en cuanto se confirma el cambio.

**CA-14 · Crear una tarea que el filtro no muestra** **[PROPUESTO]**
DADO que tengo la lista filtrada por *Hecho*
CUANDO creo una tarea (que empieza pendiente)
ENTONCES la tarea se crea y veo un aviso de que se ha creado pero no se muestra por el filtro activo.

**CA-15 · Las vencidas mantienen su marca** (RF-29)
DADO una tarea pendiente y vencida
CUANDO filtro por *Pendiente*
ENTONCES la tarea aparece con su marca de vencida (ver FS-118, CA-26).

**CA-16 · El filtro solo afecta a mi vista** **[PROPUESTO]**
DADO que filtro la lista por *En curso*
CUANDO otro miembro mira la lista del mismo equipo
ENTONCES él sigue viendo su propio filtro, no el mío.

**CA-17 · Al recargar se conserva el filtro** **[PROPUESTO]**
DADO que tengo la lista filtrada por *Pendiente*
CUANDO recargo la página
ENTONCES la lista sigue filtrada por *Pendiente*.

**CA-18 · Al cambiar de equipo el filtro vuelve a Todas** **[PROPUESTO]** (RF-7)
DADO que tengo la lista del equipo A filtrada por *Hecho*
CUANDO cambio al equipo B
ENTONCES veo la lista del equipo B con el filtro en *Todas*.
