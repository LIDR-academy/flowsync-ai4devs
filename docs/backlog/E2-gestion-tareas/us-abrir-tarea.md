# E2-5 — Abrir una tarea

**Identificador:** pendiente de asignar (etiqueta provisional `E2-5`)
**Épica:** E2 · Gestión de tareas
**Traza:** **ninguna directa.** Se deriva de RF-13 y RF-15 del [PRD](../../prd/flowsync-mvp.md), que la presuponen sin declararla.

## Historia

> Como miembro del equipo, quiero abrir una tarea de la lista, para ver y tocar lo que la lista deliberadamente no muestra.

> ⚠️ **Esta historia no tiene requisito propio en el PRD, y eso es un hallazgo, no un descuido de quien la escribe.** El punto abierto **PA-6** ya lo señala: *la vista de detalle no está contabilizada*. Pero dos requisitos la dan por hecha: RF-13 dice que la fecha *«se consulta y se establece únicamente al abrir la tarea»*, y RF-15 que el vencimiento *«debe ser visible al abrir la tarea, y no en la vista principal de la lista»*. Sin superficie donde abrir, ninguno de los dos se puede cumplir.
>
> Los criterios de abajo se **derivan** de esos dos requisitos: dicen lo que hace falta para que RF-13 y RF-15 sean posibles, y **nada más**. Lo que esta pantalla deba mostrar por su cuenta no se inventa aquí: es lo que PA-6 tiene que decidir.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto se deriva de los requisitos citados arriba.

---

## Criterios de aceptación

### Llegar y volver

**CA-1 — Se abre desde la lista**
DADO que estoy en la lista y veo una tarea
CUANDO la abro
ENTONCES llego a una vista de esa tarea concreta.

**CA-2 — Se vuelve a la lista**
DADO que tengo una tarea abierta
CUANDO la cierro
ENTONCES vuelvo a la lista.

**CA-3 — Se abre sin ratón**
DADO que estoy en la lista
CUANDO uso únicamente el teclado
ENTONCES puedo abrir una tarea y volver, igual que con el ratón.

### Lo que la lista no muestra, aquí sí

**CA-4 — Aquí se consulta la fecha de vencimiento**
DADO que abro una tarea que tiene fecha de vencimiento
CUANDO la miro
ENTONCES veo esa fecha
Y esa es la única superficie del producto donde se consulta.

**CA-5 — Una tarea sin fecha se ve como algo normal**
DADO que abro una tarea que no tiene fecha
CUANDO la miro
ENTONCES no se me avisa de nada ni se me marca la ausencia como un problema.

**CA-6 — Aquí es evidente si está vencida**
DADO que abro una tarea vencida
CUANDO la miro
ENTONCES su condición de vencida se entiende sin ponerme a calcular con el calendario.

### Límites y criterios negativos

**CA-7 — Abrir no cambia nada**
DADO que abro una tarea y la cierro sin tocar nada
CUANDO vuelvo a la lista
ENTONCES esa tarea no ha cambiado de estado, de responsable ni de fecha.

**CA-8 — Se puede abrir cualquier tarea, sea de quien sea**
DADO que la tarea la lleva otra persona
CUANDO la abro
ENTONCES la veo igual que si fuera mía, sin advertencia ni permiso especial.

**CA-9 — Abrir exige haber entrado**
DADO que no he iniciado sesión
CUANDO intento llegar a la vista de una tarea
ENTONCES no veo su contenido.

**CA-10 — Una tarea que ya no existe no se inventa** · **[PROPUESTO]**
DADO que intento abrir una tarea que se ha borrado
CUANDO se resuelve la petición
ENTONCES se me dice que ya no existe
Y no se me muestra una vista vacía como si estuviera ahí.

*Motivo de la propuesta: con roles planos y borrado sin papelera, que alguien borre una tarea mientras otro la tiene a la vista no es un caso raro, es lo normal. Ningún requisito dice qué pasa entonces.*

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **Qué muestra esta pantalla además de lo que exigen RF-13 y RF-15.** Es la ausencia principal de la historia. Pendiente de **PA-6**, que es quien tiene que contabilizar esta superficie: mientras no lo haga, lo de arriba es el mínimo para que las fechas sean posibles, no el diseño de la vista.
- **Qué ve alguien cuya tarea abierta cambia o desaparece bajo sus manos.** Pendiente de **PA-8**.

---

## Tickets

**Todavía sin descomponer.** Se descompone cuando entre en la sesión de trabajo que la implemente, no antes.

**⚠️ No se descompone antes de resolver PA-6.** Descomponerla ahora obligaría a decidir por la vía de los hechos qué contiene esta pantalla, que es justo la decisión de producto que está abierta.
