# Cómo se revisa en este repositorio

`CLAUDE.md` dice cómo se escribe el código; esto dice qué se comenta al revisarlo y qué no. Aplica
a la revisión automática de cada PR (`.github/workflows/revisor.yml`) y al subagente
`adversarial-reviewer`. Revisar es leer y comentar: no se editan ficheros.

## 1. Qué es grave, y qué no pasa de sugerencia

Grave es solo esto, y no hay más categorías por encima:

1. **Contradecir un scenario de `openspec/specs/`.** La spec viva es la fuente de verdad; si el
   código y un scenario no dicen lo mismo, es un hallazgo, aunque el código parezca razonable.
2. **Exponer lo que no debe salir.** Datos de una cuenta que no viajan con el recurso —el email, el
   primero—, secretos, o cualquier cosa que un transformer publique sin haberlo decidido.
3. **Romperse con una entrada alcanzable.** Un parámetro, un cuerpo, un id inexistente o un valor
   límite que un cliente puede mandar hoy y que devuelve algo distinto de lo que la spec exige.
4. **Dejar el contrato mintiendo.** Que el cambio toque rutas, controladores, validadores o
   transformers y no actualice en el mismo commit `docs/api/openapi.json` y el README de la
   capability (`docs/capabilities/<nombre>/README.md`).

**Todo lo demás es sugerencia**: nombres, estructura, duplicación, comentarios, oportunidades de
refactor. Una sugerencia se escribe como sugerencia, no como si el PR estuviera roto.

Un hallazgo grave **sin cita** (§4) baja automáticamente a sugerencia. La severidad se gana con
evidencia, no con adjetivos.

## 2. Cuántas sugerencias caben

**Cinco sugerencias menores por revisión, como mucho.** El resto no se calla: se resume contado y
por tipo, en una línea del comentario final — «otras 7 sugerencias menores: 4 de nombres, 2 de
comentarios, 1 de duplicación». Quien quiera esa lista la pide.

Los hallazgos graves **no tienen tope**: si hay ocho, se reportan los ocho.

## 3. Dónde no se reporta

- **Lo que ya vigila otra comprobación del repositorio.** Formato (`prettier`), lint (`eslint` en
  `backend/`, `oxlint` en `frontend/`), tipos (`npm run typecheck`, `npm run build` en el frontend),
  los tests de Japa, y la sincronía del contrato (`npm run openapi:check`, que corre en cada PR
  desde `.github/workflows/openapi.yml`). Si una máquina ya lo caza, el comentario sobra.
- **Código generado.** `backend/.adonisjs/`, `backend/database/schema.ts`, `docs/api/openapi.json` y
  `frontend/src/components/ui/`: se regeneran, no se editan. Lo que se revisa es lo que los genera.
- **Ficheros que el cambio no toca.** Un problema preexistente que el PR no introduce ni empeora no
  es asunto de la revisión; si es grave, se dice en una línea del resumen y se deja ahí.
- **El estilo y las versiones del stack.** El castellano de los comentarios, `semi: false`, AdonisJS
  7, VineJS 4, React 19 y compañía son decisiones tomadas, no descuidos.

## 4. Cita o calla

Para afirmar que algo **se comporta** de una manera hay que haber abierto el fichero y citar
`ruta/fichero.ts:línea`. Deducir el comportamiento del nombre de una función, de su firma o de su
comentario no vale.

Bien: «`backend/app/validators/task.ts:29-31` declara `status: vine.string().optional()`, así que
`GET /api/v1/tasks?status=archivado` responde `200` con lista vacía en vez del `422` que exige el
scenario *Estado inventado* de `openspec/specs/tasks/spec.md`».

Mal: «`listTasksValidator` valida el estado, así que esto está cubierto».

El motivo, con un caso real de aquí: el comentario de `isOverdueOn` promete tres condiciones —hay
fecha, es anterior al día de referencia, y la tarea no está hecha—, pero el código de
`backend/app/models/task.ts:52-56` solo comprueba dos. Quien se fía del comentario da por buena una
regla que no se ejecuta.
