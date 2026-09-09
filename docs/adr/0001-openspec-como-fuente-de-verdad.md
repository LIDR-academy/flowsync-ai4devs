# 1. Las delta-specs de OpenSpec como fuente de verdad viva del proyecto

## Contexto

FlowSync usa [OpenSpec](https://github.com/Fission-AI/OpenSpec) (`openspec/config.yaml`, `schema: spec-driven`) para separar dos cosas que normalmente se mezclan: **qué hace el sistema hoy** y **por qué se decidió que hiciera eso**.

Lo primero vive en `openspec/specs/<capability>/spec.md` — hoy hay dos, `auth` y `tasks` — como una lista de `Requirement`s en `SHALL`/`NO SHALL`, cada uno con sus `Scenario` en `WHEN`/`THEN`. Es prosa verificable, no un diagrama ni una lista de tickets: cualquiera de sus frases se puede convertir en una petición HTTP o en una prueba de interfaz sin tener que interpretar nada. A esto lo llamamos la **spec viva**.

Lo segundo vive en `openspec/changes/`. Un *change* propone una diferencia sobre la spec viva y se archiva una vez implementado: hoy hay tres, los tres bajo `changes/archive/` (`2026-08-13-add-task-list`, `2026-08-13-add-task-status-filter`, `2026-08-13-add-task-due-date`) y ninguno activo. Cada uno empaqueta:

- `proposal.md` — por qué, qué cambia, qué capabilities toca y qué queda fuera a propósito.
- `design.md` — las decisiones de diseño y sus alternativas, en pasado, como quedaron tomadas.
- `tasks.md` — la lista de trabajo, marcada.
- `specs/<capability>/spec.md` — el **delta**: bloques `## ADDED Requirements`, `## MODIFIED Requirements` (y, cuando aplica, `## REMOVED`) que se fusionan contra la spec viva de esa capability al archivar el change.

Archivar no es solo mover una carpeta: es el momento en que el delta dejó de ser una propuesta y pasó a describir lo que el sistema hace, reescrito dentro de `openspec/specs/`.

Esto ya falló una vez, y el fallo está documentado en el propio historial. `add-task-status-filter` se implementó en el código (`app/validators/task.ts`, `app/controllers/tasks_controller.ts`, `task-filter.tsx`) por delegación directa, con la instrucción explícita de no tocar `openspec/`. El resultado: la spec viva de `tasks` siguió afirmando que `GET /api/v1/tasks` «SHALL devolver todas las tareas del espacio» y que la interfaz «ve todas las tareas del equipo», cuando el código ya dejaba fuera las tareas hechas por defecto. El commit `2de0f39` lo describe así:

> FS-142 se había implementado por delegación directa, y el prompt de aquella demo decía explícitamente "no toques openspec/". Resultado: el código filtraba y el contrato no se enteraba. Peor, lo contradecía en dos sitios [...]. El Módulo 4 documenta y verifica CONTRA esta spec, así que habría heredado un contrato que miente.

Se corrigió escribiendo el change retroactivamente y archivándolo: 7 requisitos nuevos y 4 `MODIFIED`, dos de ellos los que mentían. El mismo commit deja constancia de que el arreglo fue parcial: la sección `## Purpose` de `tasks/spec.md` sigue mencionando «todas las tareas del espacio», porque un bloque `MODIFIED Requirements` opera sobre requisitos, no sobre el `Purpose`, y esa frase quedó sin quien la tocara.

Este incidente es la evidencia que tenemos, no una hipótesis: la spec viva puede mentir si el código cambia por fuera del proceso, y el propio proceso —escribir el change que faltaba y archivarlo— fue lo que lo detectó y lo corrigió antes de que otro trabajo (el propio commit cita «el Módulo 4», que iba a documentar y verificar contra esta spec) heredara un contrato falso.

## Decisión

Adoptamos `openspec/specs/*/spec.md` como la fuente de verdad sobre el comportamiento **actual** del sistema, por encima de cualquier otro documento — PRD, backlog, comentarios de código o memoria de quien lo escribió — cuando entren en conflicto.

En consecuencia:

- Todo cambio de comportamiento observable (una ruta, una regla de validación, un estado de interfaz) se acompaña de un delta-spec — `ADDED`, `MODIFIED` o `REMOVED` — sobre la capability que toca, como parte de esa misma unidad de trabajo, no como una tarea de documentación aparte para después.
- Un change se da por cerrado cuando se archiva, es decir, cuando su delta ya se fusionó en `openspec/specs/`. Implementar sin archivar dentro de la misma unidad de trabajo deja la spec viva mintiendo, tal y como pasó con FS-142.
- `openspec/changes/archive/` se lee como bitácora — qué se decidió, qué alternativas se descartaron, qué quedó fuera a propósito — no como el lugar donde preguntar qué hace el sistema hoy. Esa pregunta la responde siempre `openspec/specs/`.
- Cuando código y spec viva discrepen y no se sepa cuál es correcta, se verifica contra el sistema en marcha (como se hizo para contrastar `openspec/specs/tasks/spec.md` contra el documento servido en `/api.json`) antes de asumir que la spec tiene razón.

## Estado

Reemplazada por [ADR 0002 — Los tests de integración como única fuente de verdad ejecutable](0002-tests-como-fuente-de-verdad-ejecutable.md).

Se deja constancia tal cual, sin reescribirla: cuando se aceptó, esta decisión formalizaba una práctica que el proyecto ya seguía desde los tres changes archivados hasta entonces, incluida la corrección documentada en `2de0f39`. El contexto y la decisión de arriba describen lo que se creía correcto en ese momento, no el estado actual del proyecto.

## Consecuencias

**A favor:**

- Hay un único sitio donde preguntar «¿qué hace `tasks` hoy?» en prosa verificable, sin releer código ni reconstruirlo de memoria — y ya sirvió de base directa para auditar el documento OpenAPI generado (`/api.json`) frase por frase.
- Las decisiones de diseño y sus porqués quedan fuera de la spec viva, en los changes archivados: `specs/` no se hincha con justificaciones que ya cumplieron su función, y sigue siendo corta y legible.
- El propio incidente de FS-142 demuestra que el proceso puede detectar y corregir su propia deriva, no solo prevenirla en teoría.

**En contra — lo que cuesta:**

- **Nada impide técnicamente saltárselo.** `openspec validate --all --strict` (mencionado en el propio historial de commits) valida que un delta tenga la forma correcta, no que el código y la spec sigan alineados. La única razón de que FS-142 se detectara es que alguien lo notó a tiempo; no hay ningún gate automático que lo hubiera bloqueado, y podría volver a pasar.
- **Mantenimiento por duplicado.** Todo comportamiento vive descrito en dos sitios — el código y la spec viva — y cambiar uno sin el otro dentro de la misma unidad de trabajo es exactamente el fallo ya documentado. Un `MODIFIED Requirement` obliga además a reescribir el requisito completo, no solo la frase que cambió: se ve en el propio repo, donde el requisito «Una sola lista compartida del espacio» se reescribió entero para un cambio de alcance por defecto de una frase.
- **Hay zonas que un delta no puede tocar.** La sección `## Purpose` de cada spec queda fuera del mecanismo `ADDED`/`MODIFIED`/`REMOVED`, que opera sobre requisitos. La imprecisión que dejó FS-142 en el `Purpose` de `tasks/spec.md` («todas las tareas del espacio») sigue ahí hoy, documentada y sin corregir, como recordatorio de que archivar un change no garantiza que la spec quede perfectamente consistente.
- **La spec viva mezcla backend y frontend en el mismo documento** (requisitos «El sistema SHALL» junto a «La interfaz SHALL» en el mismo `spec.md`), así que mantenerla al día exige revisar ambas capas ante cualquier cambio, no solo la que se tocó.
- **Ninguno de los tres changes archivados trae tests** — lo dicen sus propios `proposal.md` («Sin tests», «la verificación de este comportamiento ha sido manual»). Confiar en la spec viva como fuente de verdad depende hoy de que quien archivó cada change verificara bien a mano, no de una suite que lo repita automáticamente en cada cambio futuro.
- **Coste de puesta al día cuando se rompe el proceso.** Corregir la deriva de FS-142 no fue gratis: hizo falta un commit aparte, solo de documentación, para escribir el change que debió haberse escrito junto al código. Saltarse el proceso una vez no se resuelve solo — alguien tiene que pagar después el trabajo de reconstruir el delta que faltó.
