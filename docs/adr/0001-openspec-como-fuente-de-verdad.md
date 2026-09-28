# 1. Las delta-specs de OpenSpec son la fuente de verdad viva del proyecto

## Contexto

FlowSync guarda sus requisitos en `openspec/`, con la estructura que impone el `schema: spec-driven`
declarado en [`openspec/config.yaml`](../../openspec/config.yaml) —un fichero que, por lo demás, está
entero en sus valores por defecto: ni contexto de proyecto, ni reglas por artefacto, ni guía por
operación; todo eso sigue comentado.

Dentro hay dos cosas distintas que conviene no confundir:

**La spec viva**, en `openspec/specs/<capability>/spec.md`. Hoy son dos capabilities:
[`auth`](../../openspec/specs/auth/spec.md), con 19 requisitos, y
[`tasks`](../../openspec/specs/tasks/spec.md), con 32 requisitos y 124 scenarios. Cada requisito se
escribe en lenguaje normativo (`SHALL` / `NO SHALL`) y va acompañado de sus scenarios en formato
`WHEN` / `THEN`, redactados a nivel de comportamiento observable y no de implementación.

**Los changes**, en `openspec/changes/<slug>/`, que al terminar se mueven a `changes/archive/`. Hay
tres archivados, los tres con `created: 2026-08-13`:

| Change | Delta sobre `tasks` | Delta sobre `auth` |
|---|---|---|
| `2026-08-13-add-task-list` | 14 ADDED (+ el `## Purpose` de la capability) | 3 MODIFIED, 1 ADDED |
| `2026-08-13-add-task-due-date` | 11 ADDED, 1 MODIFIED | — |
| `2026-08-13-add-task-status-filter` | 7 ADDED, 4 MODIFIED | — |

Cada change lleva cuatro artefactos: `proposal.md` (*Why* / *What Changes* / *Capabilities* /
*Impact*), `design.md` (*Context*, *Goals / Non-Goals*, *Decisions* numeradas, *Risks / Trade-offs*,
*Open Questions*), `tasks.md` (una lista de comprobación, hoy toda marcada) y el delta propiamente
dicho, en `specs/<capability>/spec.md`.

**Cómo se relacionan.** El delta no es un parche textual: declara operaciones sobre requisitos
enteros bajo cabeceras `## ADDED Requirements` y `## MODIFIED Requirements`, y un `MODIFIED`
**reescribe el requisito completo, con todos sus scenarios**, no solo lo que cambia. Al cerrar el
change, ese delta se sincroniza contra la spec viva y la carpeta se archiva. Los dos únicos commits
que tocan `openspec/` enseñan el gesto entero. En `5b5cd0a`, `add-task-list` ya está en `archive/` y
sus 291 líneas de delta ya están volcadas en `openspec/specs/tasks/spec.md`, mientras
`add-task-due-date` sigue en `changes/` sin archivar y sin sincronizar. En `2de0f39`,
`add-task-due-date` se mueve a `archive/` sin que su contenido cambie, `add-task-status-filter` entra
ya archivado, y la spec viva crece 476 líneas de golpe.

Esa relación se sostiene, y se puede comprobar. Aplicando los tres deltas de `tasks` en su orden de
archivado se reconstruye la spec viva **exactamente**: 32 requisitos, mismo orden, texto idéntico
carácter a carácter. Cuatro requisitos han sido reescritos más de una vez, y *Una sola vista de
tareas, sin señales de presencia* tres veces (nace en `add-task-list`, lo reescribe `add-task-due-date`
y lo vuelve a reescribir `add-task-status-filter`).

El proyecto tiene además otros dos sitios donde vive intención, y ninguno de los dos es esto:

- [`docs/prd/`](../prd/) y [`docs/backlog/`](../backlog/), con el PRD del MVP y doce historias con
  sus criterios de aceptación (`CA-n`). Su propio README ya fija que ante una contradicción con Jira
  «manda el repositorio».
- El tablero de Jira, que el mismo README declara **seguimiento del trabajo, no fuente de verdad**.

La distinción que hacía falta escribir es la que va entre el backlog y la spec viva. El backlog dice
qué se quiere; la spec viva dice qué hace el sistema. Que son cosas distintas se ve en el
`proposal.md` de `add-task-status-filter`, que resuelve a favor de `CA-9` una incompatibilidad que la
historia dejaba abierta con `CA-17`, deja fuera `CA-11`, `CA-12` y `CA-14` por no existir lista viva
en el producto, y aparca `PA-3`. Y se ve también en que el backlog contiene historias —editar el
título, borrar una tarea, reasignar el responsable— que no tienen ni un requisito en la spec.

## Decisión

**La spec viva de `openspec/specs/` es la fuente de verdad de qué hace FlowSync.** Cuando el código, el PRD,
una historia del backlog, un comentario o un ticket de Jira digan otra cosa, manda la spec viva; y si
la spec viva es la que se ha quedado atrás, se corrige con un change, no de palabra.

En concreto:

1. **Todo cambio de comportamiento pasa por un change** en `openspec/changes/<slug>/`, con sus cuatro
   artefactos. El delta es parte del trabajo, no documentación posterior opcional.
2. **El delta declara operaciones, no diffs**: `ADDED`, `MODIFIED` o `REMOVED` sobre requisitos
   enteros. Un `MODIFIED` reescribe el requisito completo con todos sus scenarios.
3. **Los requisitos se escriben en comportamiento observable**, no en implementación: rutas, códigos
   de respuesta y datos visibles, nunca clases ni ficheros. Es lo que les permite sobrevivir a un
   refactor.
4. **Los scenarios se escriben `WHEN` / `THEN` para poder leerse como casos de prueba**, y son la
   unidad que se cita al escribir un test.
5. **Al cerrar el change, su delta se sincroniza con la spec viva y la carpeta se archiva**, de modo
   que la spec viva siga siendo reconstruible aplicando los deltas archivados en orden.

## Estado

**Reemplazada** por el [ADR 0002 — Los tests de integración son la única fuente de verdad
ejecutable](./0002-tests-como-fuente-de-verdad-ejecutable.md), el 2027-08-20.

Lo que sigue es el estado con el que se aceptó, y se conserva tal cual:

> Aceptada — 2026-08-20.
>
> Registra una práctica que ya estaba en vigor: los tres changes archivados son del 2026-08-13. Este
> ADR la escribe y le pone límites, no la estrena.

El contexto y la decisión de más arriba no se tocan: describen lo que se creía y lo que se acordó
entonces. Las consecuencias que este ADR anotó como coste son, en buena parte, las razones del 0002.

## Consecuencias

### Lo que ganamos

- **La spec viva es verificable, no una declaración de intenciones.** Que `tasks` se reconstruya al
  carácter desde sus tres deltas no es una promesa del proceso: es una propiedad que se puede
  comprobar cuando haga falta.
- **Las contradicciones se corrigen en voz alta.** Cuando el filtro por estado volvió falso el
  requisito *Una sola lista compartida del espacio* —que afirmaba devolver todas las tareas—, el
  change no añadió una excepción en una esquina: reescribió el requisito entero. La spec no acumula
  mentiras heredadas.
- **Un requisito escrito en comportamiento sobrevive al refactor.** *Lo que cada tarea muestra de su
  responsable* siguió siendo cierto y exigible mientras el código cambiaba de transformer por debajo.
- **El delta da a la revisión una unidad del tamaño adecuado**: se lee lo que cambia del contrato sin
  releer la capability entera.
- **Los scenarios son casos de prueba ya redactados.** Los tests de
  [`backend/tests/functional/tasks/assignee.spec.ts`](../../backend/tests/functional/tasks/assignee.spec.ts)
  citan su requisito en la cabecera y hay uno por scenario; no hubo que inventar qué probar.

### Lo que nos cuesta

- **`MODIFIED` reescribe entero, y nada fusiona por ti.** Quien reescriba un requisito ya tocado tiene
  que arrastrar a mano lo que pusieron los changes anteriores. *Una sola vista de tareas, sin señales
  de presencia* se ha reescrito tres veces; si en la tercera se hubiera olvidado un scenario de la
  segunda, ese scenario habría desaparecido de la spec viva en silencio. Nada lo detecta.
- **El archivo no es una historia completa, y la reconstrucción no es un invariante real.** Vale para
  `tasks`, pero no para `auth`: sus 307 líneas entraron de una pieza en el primer commit, y de sus 19
  requisitos solo 4 los toca algún change archivado. Los otros 15 están en la spec viva sin ningún
  delta que los haya puesto ahí. La propiedad que hace atractiva
  esta decisión hoy se cumple en una capability de dos.
- **Nada la hace cumplir.** No hay CI —el repo no tiene `.github/`—, ningún script de `package.json`
  menciona OpenSpec, y no existe ningún test que compare la spec viva con sus deltas. Todo lo que
  sostiene el invariante es disciplina, más las skills de `.claude/`. La comprobación de este ADR se
  hizo con un script escrito para la ocasión y tirado después.
- **La spec corre más que los tests, y esa distancia es donde se esconden los fallos.** De los 124
  scenarios de `tasks`, hoy hay 3 cubiertos por tests. No es teórico: el requisito *Lo que cada tarea
  muestra de su responsable* prohíbe exponer el email del responsable, y la lista lo estuvo
  publicando hasta que se escribió el test que lo miraba. La spec decía la verdad y el sistema no, y
  el proceso por sí solo no se enteró.
- **Se puede especificar después de construir, y se ha hecho.** El `proposal.md` de
  `add-task-status-filter` lo dice literalmente: «Este change documenta comportamiento que ya está
  implementado y funcionando en el repositorio». Es legítimo para poner al día una spec atrasada,
  pero invierte el orden: la spec deja de dirigir el trabajo y pasa a describirlo. El precio se ve en
  ese mismo documento, que da por fuera de alcance los tests de integración que el DoD del ticket
  pedía.
- **Cuesta volumen y duplica texto.** Una sola capability son 124 scenarios, y el delta de
  `add-task-status-filter` ocupa 272 líneas de las que una parte grande es la reescritura literal de
  cuatro requisitos que ya estaban escritos en otro sitio. Eso es tiempo de revisión y superficie
  para que dos copias se separen.
- **Casi la mitad de la verdad viva no se puede comprobar automáticamente.** 56 de los 124 scenarios
  de `tasks` son de interfaz, y el frontend no tiene runner de tests instalado. Para esos, «fuente de
  verdad» significa hoy «lo que hay que comprobar a mano».
- **La verdad no sale por la API.** El documento OpenAPI servido en `/api.json` describe los endpoints
  de la aplicación con `responses: {}` y sin schemas, así que quien consuma FlowSync desde fuera no
  puede leer el contrato ahí: tiene que venir a leer la spec. La fuente de verdad es única, pero
  también es el único sitio donde está.
