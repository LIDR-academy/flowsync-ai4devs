# ADR-0004 · La petición se valida antes de resolver el identificador

## Estado

Aceptada · 2026-09-02

Cierra **H-21**. No reemplaza a ninguna decisión anterior.

## Contexto

Tres rutas resuelven un identificador que viene de la URL, y las tres hacían dos cosas en orden distinto:

```ts
// GET /tasks/:id          validaba primero
await request.validateUsing(taskReferenceDayValidator)
await Task.findOrFail(params.id)

// PATCH /tasks/:id/status  resolvía primero
// PUT   /tasks/:id/due-date
await Task.findOrFail(params.id)
await request.validateUsing(updateTaskStatusValidator)
```

El efecto se ve cuando **las dos cosas fallan a la vez**: una petición mal formada sobre un identificador que no existe. Con la lectura salía `422`; con las dos escrituras, `404`. La misma clase de petición, dos respuestas, según a cuál llegaras.

Ninguna de las dos órdenes incumple la spec, porque **la spec no decía nada**. Eso es lo que lo convertía en algo que había que decidir y no en un bug: no había contra qué contrastarlo.

Se detectó en la cuarta revisión adversarial del Módulo 4 y se dejó abierto a propósito, con la nota de que convenía fijarlo antes de que alguien construyera encima.

## Decisión

**Se valida la petición, y solo después se resuelve el identificador.** Una petición mal formada sobre un recurso inexistente responde `422`, no `404`.

El motivo es lo que cada código afirma. Un `404` dice **«te entendí, y ese recurso no está»**. Esa es una afirmación sobre el mundo, y no se puede hacer honestamente sobre una petición que el sistema no ha conseguido entender. El `422` dice lo que de verdad ha pasado: arregla la petición y vuelve a preguntar.

Cuando la petición **sí** se entiende y el recurso no existe, el `404` vuelve a ser la respuesta correcta. La decisión es sobre el orden, no sobre eliminar el `404`.

## Alternativas consideradas

**Resolver primero, y que gane el `404`.** Es defendible y era la orden mayoritaria: dos rutas de tres. El argumento es que el identificador de la ruta manda, y que si el recurso no existe da igual lo que traiga el cuerpo.

Se descarta por el motivo de arriba, y porque el otro argumento que suele acompañarla **aquí no vale**: se dice que resolver primero evita filtrar si un recurso existe. En este producto la lista de tareas es del espacio entero y compartida, así que la existencia de una tarea no es secreto para nadie con sesión. Si algún día hubiera listas por persona, esta decisión habría que revisarla, y entonces sí correspondería un ADR nuevo.

**Dejar cada ruta como estaba y documentarlo.** Es la peor: convierte una incoherencia en contrato y obliga a quien integra a recordar dos comportamientos donde debería haber uno.

## Consecuencias

Se valida el cuerpo de una petición dirigida a un recurso que quizá no existe. Es trabajo desperdiciado en ese caso, y es despreciable: la validación no toca la base de datos.

A cambio hay **una sola forma de escribir una acción**, con `validateUsing` en la primera línea. Eso no es solo estético: es lo que hace la regla comprobable.

Queda atado por dos cosas. `tests/functional/tasks/orden_de_validacion.spec.ts` prueba los dos lados -que la petición mal formada da `422` y que la bien formada sigue dando `404`-, e invertir el orden en una sola acción la tumba. Y una comprobación de `scripts/verificar-docs.mjs` recorre **cada acción de cada controlador**, no cada fichero: mira dónde aparece `validateUsing` respecto a `findOrFail` y falla nombrando la acción concreta. Comprobado mutando una de las tres.

La spec lo recoge ahora como requisito con tres escenarios, que es lo que lo convierte de convención en contrato. Sin eso seguiría siendo una costumbre, y las costumbres es lo que este módulo entero enseña a no dar por garantizadas.
