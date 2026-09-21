# La tarea

## Parte A · la medición

**1er intento** (Sí y Sí)
※ recap: Goal: add DELETE /api/v1/tasks/:id to tasks capability. Done: controller, route, docs, tests all green. Next: run /commit to commit the change. (disable recaps in /config)

**2do intento** (Sí y Sí)
※ recap: Goal: add `DELETE /api/v1/tasks/:id` (204, no body) to tasks. It's implemented, tested, documented and committed on `feat/delete-task`. Next: decide whether more work belongs in this unit, otherwise open the PR and run the adversarial review. (disable recaps in /config)

**3er intento** (Sí y Sí)
※ recap: Goal: add DELETE /api/v1/tasks/:id (204, no body) to the tasks capability. It's implemented, tested and committed on feat/delete-task-endpoint. Next: confirm whether the work unit is done so I can open the PR and run adversarial-reviewer.

**4to intento** (Sí y Sí)
※ recap: Objetivo: añadir DELETE /api/v1/tasks/:id (204 sin cuerpo) a tasks. Está hecho y commiteado en local en feat/tasks-delete, con tests y docs. Falta decidir dónde abrir el PR, y no hay push todavía.

**5to intento** (Sí y Sí)
※ recap: Goal: add `DELETE /api/v1/tasks/:id` (204, no body) to the tasks capability. It's implemented, tested and committed as `bf12187` on `feat/tasks-destroy`. Next: decide whether the unit of work is done, then open the PR and run the adversarial review. (disable recaps in /config)

## Parte B · las tres líneas

1. Completé las cinco ejecuciones.
2. Convertirla en algo que se ejecute solo porque en sí el proceso de agregar una nueva ruta es inconsistente. Sí, aparte del cambio, los documentos requeridos se modifican automáticamente, desafortunadamente, al finalizar el cambio vimos los siguiente:
    - Cambios sin commit.
    - Cambios guardados en su rama nueva.
    - Cambios guardados en su rama nueva.
    - Cambios guardados en su rama nueva y se nos preguntó donde queríamos el PR.
    - Cambios guardados en su rama nueva y esta vez no se nos preguntó donde queríamos el PR.
3. En este caso, veo que hay inconsistencias cada vez que se pidió este cambio.
