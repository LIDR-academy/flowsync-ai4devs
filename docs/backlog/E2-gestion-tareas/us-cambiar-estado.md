# E2-4 — Cambiar el estado desde la lista

**Identificador:** `E2-4` · etiqueta provisional, **pendiente de ID** (ver [backlog](../README.md))
**Épica:** E2 · Gestión de tareas
**Traza:** RF-8, RF-9 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero cambiar el estado de una tarea desde la propia lista, para que mantener al día en qué ando cueste un gesto y no deje de hacerse.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

---

## Criterios de aceptación

### Camino feliz

**CA-1 — El cambio se hace sin salir de la lista**
DADO que veo una tarea en la lista
CUANDO cambio su estado desde ahí mismo
ENTONCES el nuevo estado se refleja en la vista de inmediato
Y no he abierto la tarea, ni he confirmado en ningún diálogo, ni he rellenado ningún campo.

**CA-2 — Cualquier tarea, no solo la mía**
DADO una tarea cuyo responsable es otra persona
CUANDO cambio su estado desde la lista
ENTONCES el cambio se aplica igual que en una tarea mía
Y no se me pide ningún permiso especial ni se me muestra ninguna advertencia.

### Los tres estados como único destino

**CA-3 — Solo se puede ir a «Pendiente», «En curso» o «Hecho»**
DADO que voy a cambiar el estado de una tarea desde la lista
CUANDO veo a qué puedo cambiarla
ENTONCES los únicos destinos ofrecidos son esos tres
Y al terminar la tarea está en exactamente uno de ellos.

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **Qué transiciones son legales, y si se puede volver atrás desde «Hecho».** CA-3 dice a qué estados se puede llegar, pero no desde cuáles: ningún requisito declara el grafo de transiciones. Pendiente de **PA-7**, que además señala el riesgo real: esta historia hace muy barato marcar algo como hecho por error.
- **El coste del gesto.** El requisito de origen fija «2 interacciones o menos» sin definir qué cuenta como interacción, así que no hay umbral que se pueda suspender. Pendiente de **PA-9**.
