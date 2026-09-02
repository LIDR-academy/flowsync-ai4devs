# Backlog del MVP — E2 · Gestión de tareas y E3 · Actividad del equipo

> **Origen:** [PRD del MVP](../prd/flowsync-mvp.md) y [alcance del MVP](../prd/alcance-mvp.md).
> Los **criterios de aceptación viven en las historias**, en [`E2-gestion-tareas/`](./E2-gestion-tareas/) y [`E3-actividad-equipo/`](./E3-actividad-equipo/). Este archivo solo recoge lo que cruza historias: la matriz y el orden.

---

## ⚠️ Qué NO está aquí, y no es un fallo

**La mitad del tablero.** La sesión de planificación materializa historias y tickets como issues en **Jira** (la historia como issue de tipo *Historia*, cada ticket como *Subtarea* colgando de ella). **Eso no cabe en una rama de git** y por tanto no está en este repositorio.

Si llegas aquí para retomar el trabajo sin haber hecho la sesión, esto es lo que tienes y lo que te falta:

| | Dónde vive | ¿Está en esta rama? |
|---|---|---|
| PRD del MVP | `docs/prd/flowsync-mvp.md` | ✅ |
| Alcance consensuado | `docs/prd/alcance-mvp.md` | ✅ |
| Historias con criterios | `docs/backlog/E2-…/` y `E3-…/` | ✅ |
| Tickets con su Definition of Done | dentro de las historias descompuestas | ✅ |
| Issues y subtareas del tablero | Jira (proyecto FLOW) | ❌ **hay que recrearlas** |

El artefacto que dirige la implementación es el de este repositorio: los criterios de aceptación. El tablero es **seguimiento del trabajo** —quién lo tiene, en qué estado va—, no la fuente de verdad. Si los dos se contradicen, **manda el repositorio**.

---

## Las historias

Doce ficheros cubren las dos épicas, **todos con criterios de aceptación escritos**. Dos están además descompuestos en tickets.

> **Aviso de redacción (2026-08-26).** Tres de esos doce ficheros no describen una historia de usuario sino un criterio de aceptación de otra: `us-titulo-obligatorio.md` y `us-responsable-y-estado-por-defecto.md` son criterios de `us-crear-tarea`, y `us-abrir-tarea.md` es una superficie que no entrega valor por separado (su propia cabecera declara «Traza: ninguna directa»).
>
> No se han borrado, porque este backlog es el registro de lo que se decidió. El journey, el story mapping y la lectura correcta -nueve historias, no doce- están en [`redaccion-de-historias.md`](./redaccion-de-historias.md). Importa para la trazabilidad: la cadena empieza en la historia, y un error ahí se propaga a todo lo que cuelga.

### E2 · Gestión de tareas

| Historia | Qué resuelve | Tickets |
|---|---|---|
| [**E2-1** — Crear tarea con solo el título](./E2-gestion-tareas/us-crear-tarea.md) | Anotar en qué andas cuesta segundos, sin formulario | — |
| [**E2-2** — Título obligatorio](./E2-gestion-tareas/us-titulo-obligatorio.md) | Ninguna fila de la lista queda sin decir de qué trabajo habla | — |
| [**E2-3** — Nace mía y pendiente](./E2-gestion-tareas/us-responsable-y-estado-por-defecto.md) | La tarea nueva ya viene a tu nombre y en «Pendiente» | — |
| [**E2-4** — Cambiar el estado desde la lista](./E2-gestion-tareas/us-cambiar-estado.md) | Mantener al día en qué andas cuesta un gesto | — |
| [**E2-5** — Abrir una tarea](./E2-gestion-tareas/us-abrir-tarea.md) | La superficie donde vive lo que la lista no muestra | — |
| [**E2-6** — Editar el título](./E2-gestion-tareas/us-editar-titulo.md) | Corregir un título que no dice lo que parecía decir | — |
| [**E2-7** — Reasignar responsable](./E2-gestion-tareas/us-reasignar-responsable.md) | Coger una tarea libre sin pedir permiso a nadie | — |
| [**E2-10** — Borrar tarea](./E2-gestion-tareas/us-borrar-tarea.md) | Quitar de en medio lo que ya no se va a hacer | — |
| [**FS-118** — Fecha de vencimiento y tareas vencidas](./E2-gestion-tareas/us-fechas-vencimiento.md) | Poner o quitar una fecha, y saber si algo se ha pasado de plazo | **5** · de la migración a las pruebas |
| [**FS-142** — Filtrar las tareas por estado](./E2-gestion-tareas/us-filtrar-por-estado.md) | Centrarse en lo pendiente sin que lo terminado estorbe | **1** · deliberadamente ligera |

### E3 · Actividad del equipo

| Historia | Qué resuelve | Tickets |
|---|---|---|
| [**E3-1** — La lista compartida del equipo](./E3-actividad-equipo/us-lista-compartida.md) | Saber en qué anda cada uno sin preguntar | — |
| [**E3-2** — La lista se mantiene fresca sola](./E3-actividad-equipo/us-lista-viva.md) | Lo que miras es la verdad de ahora, no la de hace diez minutos | — |

> **E3-2 es el requisito que el PRD llama «el que distingue a FlowSync de un tablero compartido cualquiera».** No está descompuesta y no la ataca todavía nadie: antes hay que decidir cómo viaja el cambio, y esa decisión no la toma un ticket.

### Por qué solo dos traen tickets

Porque **descomponer es planificación de entrega, no de producto**: se hace cuando el trabajo está próximo. Un ticket escrito con diez historias de antelación caduca antes de que alguien lo abra, y da una falsa sensación de plan.

FS-118 y FS-142 están descompuestas porque son las que se atacan con más detalle. Las demás llegan a la implementación **con sus criterios**, que es lo que hace falta para empezar: la regla de negocio la escribe producto, y el reparto por capas se decide al construir.

**Identificadores.** Solo FS-118 y FS-142 tienen ID asignado. Sus tickets lo derivan: `FS-118.1`, `FS-118.2`… Las demás conservan su etiqueta provisional `E2-n` / `E3-n`, **pendiente de ID**; por eso su archivo lleva nombre descriptivo y no ID. No se inventan aquí.

**Qué es un ticket.** Una unidad de trabajo que una persona termina en una sesión, con media jornada como techo. **Hereda** los criterios de su historia; su Definition of Done es una checklist de *cómo entregamos* (pruebas, manejo de error, convenciones), **no** criterios nuevos ni estimación en horas. Nombra la capa que toca; **no diseña**: tipo de columna, nulabilidad, índices, rutas y códigos de estado se deciden al implementar.

**Tallas.** S/M/L miden *dentro* de ese techo, no en horas. Talla y riesgo van por separado: el ticket más peligroso de FS-118 es una M.

---

## Bloqueos transversales

Condicionan cuándo se puede cerrar el trabajo, y ninguno se resuelve dentro de la historia que lo sufre:

| Bloqueo | Efecto |
|---|---|
| **No hay base de pruebas** (R-7) | No impide escribir código; impide **cerrar** cualquier ticket cuyo DoD pida pruebas |
| **La vista de detalle no está contabilizada** (PA-6) | Prerrequisito de FS-118.4, y la razón por la que E2-5 no se puede descomponer todavía |
| **Contradicción CA-9 / CA-17** (PA abierto en FS-142) | Decisión de producto sin tomar. Bloquea FS-142.1 |
| **Sin regla de orden ni agrupación de la lista** (PA-3) | E3-1 promete enumerar el trabajo de cada persona, y sin orden esa promesa no se sostiene al crecer |
| **Sin decisión sobre el choque de ediciones** (PA-8) | Lo provocan E2-7, E2-10 y E3-2 a la vez; cada implementación lo resolvería distinto |

> **Ya no son bloqueos, son trabajo.** La lista compartida y la lista viva figuraban aquí como ausencias del sustrato. Ahora son **E3-1** y **E3-2**, con criterios y sitio en el orden. Un bloqueo que se puede escribir como historia deja de ser un bloqueo.

**Sobre la base de pruebas:** su coste se paga **una sola vez**. El primer ticket cuyo DoD la exija carga con ella; los siguientes no.

---

## Matriz impacto / complejidad

**Impacto** = cuánto sirve a la promesa central: *ver en qué anda el equipo y qué hay libre, sin interrumpir a nadie*.
**Complejidad** = esfuerzo relativo de construcción, no riesgo.

> Solo FS-118 y FS-142 están descompuestas y talladas. El resto se valora a nivel de historia, con menos base.

| Historia | Impacto | Complejidad | Notas |
|---|---|---|---|
| **E3-1** La lista compartida | Alto | Media | Es la superficie donde el producto ocurre; sin ella nada de E2 se ve |
| **E2-1** Crear tarea con solo el título | Alto | Alta | Arranca el dominio entero; sin esto no hay nada |
| **E2-2** Título obligatorio | Medio | Baja | Protege que la lista sea legible |
| **E2-3** Nace mía y pendiente | Alto | Baja | Es lo que hace que crear cueste segundos |
| **E2-4** Cambiar el estado desde la lista | Alto | Media | Donde se cobra el intercambio de valor entero |
| **E3-2** La lista se mantiene fresca sola | Alto | Alta | El PRD dice que sin esto el producto pierde su razón de ser |
| **E2-5** Abrir una tarea | Bajo | Media | Impacto propio bajo, pero habilita FS-118 |
| **E2-6** Editar el título | Bajo | Baja | Corrección, no promesa central |
| **E2-7** Reasignar responsable | Alto | Media | Sirve directamente a «elegir lo siguiente sabiendo qué está libre» |
| **FS-118** Fecha de vencimiento | Bajo | Media | El propio PRD lo reconoce: no sirve al eje, entró por decisión explícita |
| **E2-10** Borrar tarea | Bajo | Baja | Higiene |
| **FS-142** Filtrar por estado | Alto | Media | El impacto está sobre todo en que lo hecho salga de la vista |

**Lectura por cuadrantes**

- **Alto impacto / baja complejidad:** E2-3. Lo más rentable del backlog.
- **Alto impacto / complejidad media o alta:** E3-1, E2-1, E2-4, E2-7, E3-2, FS-142. El núcleo del trabajo.
- **Bajo impacto / baja complejidad:** E2-6, E2-10. Relleno útil.
- **Bajo impacto / complejidad media:** E2-5 y FS-118. E2-5 se justifica por lo que habilita, no por sí misma. **FS-118 no**: se construye porque está decidido, no porque el cuadrante lo pida. Está escrito a propósito, para que la decisión no se disfrace de prioridad.

---

## Orden de backlog priorizado

Respeta a la vez prioridad de producto y dependencias. **La dependencia manda sobre la épica**: E3-1 va primero aunque pertenezca a la otra épica, porque es el sustrato sobre el que todo E2 se ve.

| # | Historia | Motivo |
|---|---|---|
| 1 | **E3-1** La lista compartida | Sustrato de todo lo demás: sin lista no hay dónde ver ni tocar nada |
| 2 | **E2-1** Crear tarea | Prerrequisito del resto de E2 |
| 3 | **E2-3** Nace mía y pendiente | Barata y de impacto alto; va pegada a E2-1 |
| 4 | **E2-2** Título obligatorio | Barata, y protege la legibilidad de la que depende el caso fundacional |
| 5 | **E2-4** Cambiar estado desde la lista | El corazón del producto |
| 6 | **FS-142** Filtrar por estado | Alto impacto y un solo ticket |
| 7 | **E2-7** Reasignar responsable | Cierra «elegir lo siguiente sabiendo qué está libre» |
| 8 | **E3-2** La lista se mantiene fresca sola | Alto impacto, pero necesita una decisión técnica antes de descomponerse |
| 9 | **E2-5** Abrir una tarea | Habilitadora de lo que viene detrás; bloqueada por PA-6 |
| 10 | **E2-6** Editar el título | Cae casi sola una vez existe E2-5 |
| 11 | **FS-118** Fecha de vencimiento | Impacto bajo y depende de E2-5 |
| 12 | **E2-10** Borrar tarea | Higiene, sin urgencia |

**Lo más rentable ahora mismo no es un ticket:** es resolver la contradicción **CA-9 / CA-17** de FS-142. Cuesta una conversación y desbloquea la historia de alto impacto más avanzada del backlog.
