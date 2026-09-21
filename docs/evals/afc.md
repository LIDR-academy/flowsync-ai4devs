# Parte A

Apuesta, antes de medir: 2 de 5.

| Intento | Rama | Control: ¿hay ruta DELETE? | README: ¿menciona el endpoint? |
|---|---|---|---|
| 1 | `feat/tasks-delete-endpoint` | sí | sí |
| 2 | `feat/tasks-delete-endpoint-2` | sí | sí |
| 3 | `feat/tasks-delete-endpoint-3` | sí | sí |
| 4 | `feat/tasks-delete-endpoint-v2` | sí | sí |
| 5 | `feat/delete-task` | no | no  |

Los cuatro primeros intentos declaran `router.delete(':id', …)` y añaden la fila `DELETE /tasks/:id` con `204` en `docs/capabilities/tasks/README.md`. `feat/delete-task` apunta al mismo commit que `s8/start` y no aplica.


# Parte B

1. Aposté 2 de 5. Hice las cinco. El README menciona el endpoint en 4 de los 4 intentos cuyo commit declara la ruta DELETE. El quinto, `feat/delete-task`, no tiene commit y no cuenta.
2. La convertiría en algo que se ejecute solo. El 4 de 4 sale de analizar si el archivo nombra la ruta; la regla pide que el README quede al día en el mismo commit, y eso no falla solo cuando falta. Un chequeo puede exigir esa fila en `docs/capabilities/tasks/README.md` cada vez que `start/routes.ts` gana una ruta de tasks.
3. No mide si el README quedó al día, solo si menciona el endpoint. El intento 2 cuenta como sí porque la tabla incluye `DELETE /tasks/:id`, y el ejemplo con curl de ese mismo README no se actualizó.