# 1. Usar las delta-specs de OpenSpec como fuente de verdad viva

## Context

`openspec/` existe en este repo y no es un experimento vacío: tiene contenido real que ya se usa para tomar decisiones.

`openspec/config.yaml` declara `schema: spec-driven`. Bajo `openspec/specs/` hay dos capabilities con spec propia — `auth/spec.md` (307 líneas) y `tasks/spec.md` (753 líneas, 32 requirements, 124 scenarios) — cada una con una sección `## Purpose` y una lista de `### Requirement:` en prosa SHALL/SHALL NOT, y cada requirement con uno o más `#### Scenario:` en forma WHEN/THEN. Esa forma es lo que hizo posible, en este mismo proyecto, construir una tabla de trazabilidad completa cruzando `tasks/spec.md` contra `backend/tests/` y encontrar un bug real (el `assignee` de la lista filtraba el email) que luego se corrigió porque la spec decía otra cosa.

Esas specs no se editan a mano. Bajo `openspec/changes/archive/` hay tres changes ya archivados — `2026-08-13-add-task-list`, `2026-08-13-add-task-due-date` y `2026-08-13-add-task-status-filter` —, cada uno con el mismo esqueleto: `.openspec.yaml` (schema y fecha), `proposal.md` (`Why` / `What Changes` / `Capabilities` / `Impact`), `design.md`, `tasks.md`, y un `specs/<capability>/spec.md` que es un **delta**, no la spec completa: usa cabeceras `## ADDED Requirements` y `## MODIFIED Requirements` para decir solo qué cambia. Archivar un change es lo que funde ese delta en la spec viva de `openspec/specs/`.

Dos de esos changes documentan, por escrito, el problema que esta decisión trata de gobernar:

- `add-task-status-filter/proposal.md` existe porque el requirement vivo *«Una sola lista compartida del espacio»* afirmaba que `GET /api/v1/tasks` devuelve «todas las tareas del espacio» — y eso ya era falso: FS-142 había implementado el filtro por estado sin tocar `openspec/`. El change entero es, literalmente, arreglar la spec para que vuelva a describir el sistema real, después de los hechos.
- `add-task-due-date/proposal.md`, escrito antes que el anterior, señala ese mismo requirement como «deriva conocida de la spec viva, ajena a este change» y decide no arreglarlo ahí. La desviación queda anotada en vez de arreglada o ignorada en silencio.

Los tres changes archivados comparten otro rasgo: los tres renuncian explícitamente a tests automatizados («Sin tests», con la lista de lo que queda sin red). La verificación de que el delta describe de verdad lo que hace el código fue manual en los tres casos.

Aguas arriba de `openspec/`, `docs/prd/` y `docs/backlog/E*/us-*.md` ya existen y tienen su propio vocabulario: historias con código `FS-nnn`, «Criterios de aceptación» (`CA-n`) y una sección «Criterios que todavía no se pueden escribir» (preguntas abiertas, `PA-n`). Los proposals de `openspec/changes/` citan esos códigos directamente (`FS-118`, `FS-142`, `CA-19`, `PA-3`...) al traducir esas historias a requirements y scenarios.

Nada de esto está todavía recogido en `CLAUDE.md`: el archivo que lee cada sesión de trabajo en este repo no menciona `openspec/` en ningún punto.

## Decision

`openspec/specs/<capability>/spec.md` es la descripción normativa de lo que hace FlowSync. Cuando entra en conflicto con `docs/prd/`, con `docs/backlog/`, con un comentario en el código o con lo que alguien recuerde, gana la spec viva — salvo que un change archivado haya anotado explícitamente esa discrepancia como deriva conocida y pendiente, en cuyo caso la anotación es la verdad hasta que un change la cierre.

Ningún comportamiento nuevo o modificado se escribe directamente en `openspec/specs/`. Se abre un change en `openspec/changes/<fecha>-<slug>/` con `proposal.md`, `design.md`, `tasks.md` y un `specs/<capability>/spec.md` en forma de delta (`## ADDED Requirements` / `## MODIFIED Requirements` / `## REMOVED Requirements`), y la spec viva solo cambia cuando ese change se archiva. Esto vale igual si el código ya existe y lo que falta es documentarlo — como hicieron `add-task-status-filter` y, en parte, `add-task-due-date` — que si el change precede al código.

Cada requirement se escribe en SHALL/SHALL NOT y lleva al menos un `#### Scenario:` en WHEN/THEN, precisamente para que se pueda contrastar contra tests o contra el sistema corriendo, como ya se hizo una vez en este proyecto.

## Status

Reemplazado por [ADR 0002](0002-tests-como-fuente-de-verdad-ejecutable.md).

~~Aceptado. La práctica ya gobierna las dos capabilities vivas (`auth`, `tasks`) y tiene tres changes archivados detrás; este ADR es la primera vez que se deja escrito.~~

## Consequences

**A favor:**

- Hay un único sitio por capability para responder «¿qué hace el sistema?», en una forma (SHALL + Scenario) que se puede auditar mecánicamente contra los tests o contra las respuestas reales de la API — no solo leer, sino contrastar.
- Todo cambio de comportamiento deja un rastro fechado y explícito (`proposal.md` → `design.md` → `tasks.md` → delta spec) en vez de vivir solo en el mensaje de un commit o la descripción de un PR que se pierde en el historial.
- La deriva entre spec y sistema se puede nombrar y archivar como tal — como hicieron estos dos changes — en vez de quedar como un bug silencioso que alguien descubre por accidente.

**En contra — lo que cuesta:**

- **Doble contabilidad.** Cada cambio de comportamiento real exige el cambio de código *y* un change que lo funda en la spec viva, o «fuente de verdad» deja de ser cierto en silencio. Eso ya pasó una vez: FS-142 se implementó y se desplegó antes de que existiera `add-task-status-filter`, y durante ese tiempo la spec viva mintió sobre lo que hacía `GET /api/v1/tasks`.
- **No hay nada que lo haga cumplir.** Ningún hook, ningún paso de CI y ninguna regla de `CLAUDE.md` comprueba que un PR que toca `backend/app` o `frontend/src` también toque `openspec/`. La disciplina es enteramente manual, y ya falló una vez — por eso existe el change que la corrigió.
- **La spec y los tests son afirmaciones desconectadas.** Los tres changes archivados hasta ahora renuncian explícitamente a tests automatizados. Que un requirement esté escrito en la spec viva no implica que nada lo compruebe en CI; solo lo comprueba quien se toma el trabajo de leerlo y contrastarlo a mano, como se hizo una vez en este proyecto pero que nada obliga a repetir.
- **El coste de leerla crece con la spec.** `tasks/spec.md` ya tiene 753 líneas, 32 requirements y 124 scenarios en un solo fichero Markdown plano, sin índice ni herramienta que lo navegue mejor que abrir el archivo. Auditar la capability entera, como se hizo para construir la tabla de trazabilidad, es trabajo manual que crece con cada change archivado.
- **Duplicidad aguas arriba.** `docs/backlog/E*/us-*.md` ya describe el mismo comportamiento con sus propios «Criterios de aceptación» (`CA-n`), en un vocabulario distinto al de los `Requirement`/`Scenario` de `openspec/`. Mantener ambos en sync es trabajo extra que esta decisión no elimina, solo lo traslada a quien escribe cada `proposal.md`.
- **La decisión no está donde se lee primero.** `CLAUDE.md` es lo que carga cada sesión de trabajo en este repo y hoy no menciona `openspec/` ni esta jerarquía de autoridad; hasta que se añada ahí, esta regla solo vive en este documento.
