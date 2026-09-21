# E2-7 — Reasignar el responsable de una tarea

**Identificador:** pendiente de asignar (etiqueta provisional `E2-7`)
**Épica:** E2 · Gestión de tareas
**Traza:** RF-10 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero cambiar quién lleva una tarea, incluida una que lleva otra persona, para poder cogerla yo sin pedir permiso ni interrumpir a nadie.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

> **Por qué esta historia sirve directamente a la promesa del producto.** La mitad del valor que el PRD promete es *elegir lo siguiente sabiendo qué está libre*. Sin poder coger una tarea, el equipo sabe quién está en qué pero no puede actuar en consecuencia.

---

## Criterios de aceptación

### Camino feliz

**CA-1 — Asignar a otra persona**
DADO que estoy sobre una tarea
CUANDO cambio su responsable a otra persona registrada
ENTONCES la tarea pasa a estar a nombre de esa persona.

**CA-2 — Cogerme una tarea ajena**
DADO que la tarea la lleva otra persona
CUANDO me la asigno a mí
ENTONCES se aplica sin pedir permiso, sin confirmación y sin advertencia.

**CA-3 — El cambio es para todo el equipo**
DADO que he cambiado el responsable de una tarea
CUANDO otra persona mira la lista
ENTONCES ve el responsable nuevo.

**CA-4 — Se ve en la lista sin abrir nada**
DADO que se ha reasignado una tarea
CUANDO miro la lista
ENTONCES la fila muestra al responsable nuevo, sin que yo abra la tarea.

**CA-5 — Cualquier persona registrada puede ser responsable**
DADO que estoy eligiendo responsable
CUANDO miro entre quién puedo elegir
ENTONCES están todas las personas registradas en el espacio, sin excepción.

### Límites y criterios negativos

**CA-6 — Toda tarea tiene siempre responsable** · **[PROPUESTO]**
DADO que estoy cambiando el responsable de una tarea
CUANDO busco la manera de dejarla sin nadie
ENTONCES no existe
Y ninguna tarea puede quedar sin responsable.

*Motivo de la propuesta: el PRD garantiza que toda tarea nace con responsable, pero no dice si puede quedarse sin él después. Se propone que no: una lista que responde «quién está en qué» pierde sentido en cuanto admite filas sin nadie, y aparecería la papelera de tareas huérfanas que el producto no quiere.*

**CA-7 — Reasignar no toca nada más**
DADO que cambio el responsable de una tarea
CUANDO miro la tarea después
ENTONCES su título, su estado y su fecha son los mismos que antes.

**CA-8 — Reasignar no avisa a nadie**
DADO que asigno una tarea a otra persona
CUANDO se aplica el cambio
ENTONCES esa persona no recibe notificación por ningún canal externo
Y se entera al mirar la lista, como todo lo demás.

**CA-9 — No hay jerarquía que lo limite**
DADO que soy una persona registrada cualquiera
CUANDO reasigno una tarea
ENTONCES no se me pide ningún rol ni permiso especial.

**CA-10 — Reasignar exige haber entrado**
DADO que no he iniciado sesión
CUANDO intento cambiar el responsable de una tarea
ENTONCES no se aplica ningún cambio.

**CA-11 — Asignarla a quien ya la lleva no rompe nada** · **[PROPUESTO]**
DADO que una tarea ya está a nombre de una persona
CUANDO la asigno a esa misma persona
ENTONCES la tarea sigue igual y no se produce ningún error.

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **Qué ve alguien a quien le quitan de las manos la tarea que tiene abierta.** Este es el caso que **PA-8** nombra de forma literal, y esta historia es la que lo provoca. Pendiente de esa decisión.
- **Si el trasiego de responsables deja rastro.** El PRD excluye el histórico, así que no lo deja. Consecuencia aceptada, no hueco.
- **Si tiene sentido limitar cuántas tareas «En curso» acumula la persona a la que se le asignan.** Reasignar es la vía más rápida de acumularlas. Pendiente de **PA-4**.

---

## Tickets

**Todavía sin descomponer.** Se descompone cuando entre en la sesión de trabajo que la implemente, no antes.
