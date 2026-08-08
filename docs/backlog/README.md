# Backlog — E2 · Gestión de tareas

> **Origen:** [PRD del MVP](../prd/flowsync-mvp.md) y [alcance del MVP](../prd/alcance-mvp.md).
> Los **criterios de aceptación viven en las historias**, en [`E2-gestion-tareas/`](./E2-gestion-tareas/), junto a los tickets que los satisfacen. Este archivo solo recoge lo que cruza historias: la matriz y el orden.

---

## ⚠️ Qué NO está aquí, y no es un fallo

**La mitad del tablero.** La sesión materializa las dos historias y sus tickets como issues en **Jira** (la historia como issue de tipo *Historia*, cada ticket como *Subtarea* colgando de ella). **Eso no cabe en una rama de git** y por tanto no está en este repositorio.

Si llegas aquí para retomar el trabajo sin haber hecho la sesión, esto es lo que tienes y lo que te falta:

| | Dónde vive | ¿Está en esta rama? |
|---|---|---|
| PRD del MVP | `docs/prd/flowsync-mvp.md` | ✅ |
| Alcance consensuado | `docs/prd/alcance-mvp.md` | ✅ |
| Historias con criterios | `docs/backlog/E2-gestion-tareas/` | ✅ |
| Tickets con su Definition of Done | dentro de cada historia | ✅ |
| Issues y subtareas del tablero | Jira (proyecto FLOW) | ❌ **hay que recrearlas** |

El artefacto que dirige la implementación es el de este repositorio: los criterios de aceptación. El tablero es **seguimiento del trabajo** —quién lo tiene, en qué estado va—, no la fuente de verdad. Si los dos se contradicen, **manda el repositorio**.

---

## Las historias enriquecidas

Seis historias de E2 tienen criterios de aceptación escritos. **Solo dos están descompuestas en tickets**: son las que la sesión de implementación ataca con más detalle.

### Con criterios y con tickets

| Historia | Qué resuelve | Tickets |
|---|---|---|
| [**FS-118** — Fecha de vencimiento y tareas vencidas](./E2-gestion-tareas/us-fechas-vencimiento.md) | Poner o quitar una fecha, y saber si algo se ha pasado de plazo | 5 · de la migración a las pruebas |
| [**FS-142** — Filtrar las tareas por estado](./E2-gestion-tareas/us-filtrar-por-estado.md) | Centrarse en lo pendiente sin que lo terminado estorbe | 1 · deliberadamente ligera |

### Con criterios, todavía sin tickets — la base de la capability

Encabezan el orden priorizado: sin ellas no hay lista de tareas que filtrar ni fechar. Trazan a `RF-5`…`RF-9` del PRD.

| Historia | Qué resuelve |
|---|---|
| [**E2-1** — Crear tarea con solo el título](./E2-gestion-tareas/us-crear-tarea.md) | Anotar en qué andas cuesta segundos, sin formulario |
| [**E2-2** — Título obligatorio](./E2-gestion-tareas/us-titulo-obligatorio.md) | Ninguna fila de la lista queda sin decir de qué trabajo habla |
| [**E2-3** — Nace mía y pendiente](./E2-gestion-tareas/us-responsable-y-estado-por-defecto.md) | La tarea nueva ya viene a tu nombre y en «Pendiente» |
| [**E2-4** — Cambiar el estado desde la lista](./E2-gestion-tareas/us-cambiar-estado.md) | Mantener al día en qué andas cuesta un gesto |

**Identificadores.** Solo FS-118 y FS-142 tienen ID asignado. Sus tickets lo derivan: `FS-118.1`, `FS-118.2`… Las cuatro historias de la base conservan su etiqueta provisional `E2-n`, **pendiente de ID**; por eso su archivo lleva nombre descriptivo y no ID. No se inventan aquí.

**Qué es un ticket.** Una unidad de trabajo que una persona termina en una sesión, con media jornada como techo. **Hereda** los criterios de su historia; su Definition of Done es una checklist de *cómo entregamos* (pruebas, manejo de error, convenciones), **no** criterios nuevos ni estimación en horas. Nombra la capa que toca; **no diseña**: tipo de columna, nulabilidad, índices, rutas y códigos de estado se deciden al implementar.

**Tallas.** S/M/L miden *dentro* de ese techo, no en horas. Talla y riesgo van por separado: el ticket más peligroso de FS-118 es una M.

---

## Bloqueos transversales

Ninguno pertenece a E2, y todos condicionan cuándo se puede cerrar su trabajo:

| Bloqueo | Efecto |
|---|---|
| **La lista compartida no existe** (E3, RF-16 y RF-17) | Es el sustrato de la épica entera: E2 no se entrega de forma aislada |
| **La lista viva no existe** (E3, RF-18) | No bloquea ningún ticket de este backlog, pero sí la promesa del producto |
| **No hay base de pruebas** (R-7) | No impide escribir código; impide **cerrar** cualquier ticket cuyo DoD pida pruebas |
| **La vista de detalle no está contabilizada** (PA-6) | Es una superficie completa, prerrequisito de FS-118.4 |
| **Contradicción CA-9 / CA-17** (PA abierto en FS-142) | Decisión de producto sin tomar. Bloquea FS-142.1 |

**Sobre la base de pruebas:** su coste se paga **una sola vez**. El primer ticket cuyo DoD la exija carga con ella; los siguientes no. Con el orden de abajo, ese primero es **FS-142.1**, y eso es lo que deja a **FS-118.5** en M en vez de L.

---

## Matriz impacto / complejidad de las historias de E2

**Impacto** = cuánto sirve a la promesa central: *ver en qué anda el equipo y qué hay libre, sin interrumpir a nadie*.
**Complejidad** = esfuerzo relativo de construcción, no riesgo.

> Solo FS-118 y FS-142 están descompuestas y talladas. El resto se valora a nivel de historia, con menos base.

| Historia | Impacto | Complejidad | Notas |
|---|---|---|---|
| **E2-1** Crear tarea con solo el título | Alto | Alta | Arranca el dominio entero; sin esto no hay nada |
| **E2-2** Título obligatorio | Medio | Baja | Protege que la lista sea legible |
| **E2-3** Nace mía y pendiente | Alto | Baja | Es lo que hace que crear cueste segundos |
| **E2-4** Cambiar el estado desde la lista | Alto | Media | Donde se cobra el intercambio de valor entero |
| **E2-5** Abrir una tarea | Bajo | Media | Impacto propio bajo, pero habilita FS-118 |
| **E2-6** Editar el título | Bajo | Baja | Corrección, no promesa central |
| **E2-7** Reasignar responsable | Alto | Media | Sirve directamente a «elegir lo siguiente sabiendo qué está libre» |
| **FS-118** Fecha de vencimiento | Bajo | Media | El propio PRD lo reconoce: no sirve al eje, entró por decisión explícita |
| **E2-10** Borrar tarea | Bajo | Baja | Higiene |
| **FS-142** Filtrar por estado | Alto | Media | El impacto está sobre todo en que lo hecho salga de la vista |

**Lectura por cuadrantes**

- **Alto impacto / baja complejidad:** E2-3. Lo más rentable de la épica.
- **Alto impacto / complejidad media o alta:** E2-1, E2-4, E2-7, FS-142. El núcleo del trabajo.
- **Bajo impacto / baja complejidad:** E2-6, E2-10. Relleno útil.
- **Bajo impacto / complejidad media:** E2-5 y FS-118. E2-5 se justifica por lo que habilita, no por sí misma. **FS-118 no**: se construye porque está decidido, no porque el cuadrante lo pida. Está escrito a propósito, para que la decisión no se disfrace de prioridad.

---

## Orden de backlog priorizado

Respeta a la vez prioridad de producto y dependencias. E2 **no se puede entregar sin la lista compartida de E3**, que es su sustrato.

| # | Historia | Motivo |
|---|---|---|
| 1 | **E2-1** Crear tarea | Prerrequisito de todo lo demás |
| 2 | **E2-3** Nace mía y pendiente | Barata y de impacto alto; va pegada a E2-1 |
| 3 | **E2-2** Título obligatorio | Barata, y protege la legibilidad de la que depende el caso fundacional |
| 4 | **E2-4** Cambiar estado desde la lista | El corazón del producto |
| 5 | **FS-142** Filtrar por estado | Alto impacto y un solo ticket |
| 6 | **E2-7** Reasignar responsable | Cierra «elegir lo siguiente sabiendo qué está libre» |
| 7 | **E2-5** Abrir una tarea | Habilitadora de lo que viene detrás |
| 8 | **E2-6** Editar el título | Cae casi sola una vez existe E2-5 |
| 9 | **FS-118** Fecha de vencimiento | Impacto bajo y depende de E2-5 |
| 10 | **E2-10** Borrar tarea | Higiene, sin urgencia |

**Lo más rentable ahora mismo no es un ticket:** es resolver la contradicción **CA-9 / CA-17** de FS-142. Cuesta una conversación y desbloquea la historia de alto impacto más avanzada del backlog.
