# E2-3 — Nace mía y pendiente

**Identificador:** `E2-3` · etiqueta provisional, **pendiente de ID** (ver [backlog](../README.md))
**Épica:** E2 · Gestión de tareas
**Traza:** RF-7, RF-8 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero que una tarea nueva nazca ya a mi nombre y en «Pendiente», para no tener que elegir responsable ni estado cada vez que apunto algo.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

---

## Criterios de aceptación

### Lo que trae puesto una tarea recién creada

**CA-1 — Nace con mi nombre como responsable**
DADO que creo una tarea indicando únicamente el título
CUANDO la tarea queda creada
ENTONCES aparece con mi nombre como responsable
Y no he seleccionado a nadie en ningún momento.

**CA-2 — Nace en «Pendiente»**
DADO que creo una tarea indicando únicamente el título
CUANDO la tarea queda creada
ENTONCES queda en estado «Pendiente»
Y no he elegido el estado en ningún momento.

### Los estados son fijos

**CA-3 — Solo existen tres estados y no se tocan**
DADO que estoy en cualquier punto del producto
CUANDO busco la forma de añadir, renombrar o eliminar un estado
ENTONCES no existe ninguna
Y los únicos estados disponibles siguen siendo «Pendiente», «En curso» y «Hecho».
