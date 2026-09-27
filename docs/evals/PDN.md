Rutas modificadas

| Método y ruta | Entrada | Controlador | Devuelve | owner |
|---|---|---|---|---|
| `GET /tasks` | `status` en query, opcional | [`TasksController.index`](../../../backend/app/controllers/tasks_controller.ts) | `200` · lista de tareas | @l1der |
| `POST /tasks` | `{ "title": "..." }` | [`TasksController.store`](../../../backend/app/controllers/tasks_controller.ts) | `201` · la tarea creada | @l1der |
| `GET /tasks/:id` | `today=AAAA-MM-DD` en query, **obligatorio** | [`TasksController.show`](../../../backend/app/controllers/tasks_controller.ts) | `200` · la tarea con vencimiento | @l1der |
| `DELETE /tasks/:id` |  | [`TasksController.destroy`](../../../backend/app/controllers/tasks_controller.ts) | `204` · sin contenido | @PDN |
| `PATCH /tasks/:id/status` | `{ "status": "pending \| in_progress \| done" }` | [`TaskStatusesController.update`](../../../backend/app/controllers/task_statuses_controller.ts) | `200` · la tarea ya cambiada | @l1der |
| `PUT /tasks/:id/due-date` | `{ "dueDate": "AAAA-MM-DD" \| null, "today": "AAAA-MM-DD" }` | [`TaskDueDatesController.update`](../../../backend/app/controllers/task_due_dates_controller.ts) | `200` · la tarea con vencimiento | @l1der |

PARTE - A

primera pasada (s8/start):
VS Code Copilot
Lista de tareas pendientes actualizada
Voy a revisar exactamente lo que está staged, resumirlo y crear el commit con un mensaje convencional acorde al cambio.
Ran terminal command:  git diff --staged && git status --short
No hay cambios staged: `git diff --staged` está vacío. Solo aparecen dos rutas no trackeadas (`results` y `evals`), así que no las voy a incluir ni modificar sin una indicación explícita.
Read skill `commit`
No se puede crear el commit: no hay cambios staged. `git diff --staged` está vacío; solo existen rutas no trackeadas que no he incluido.

Claude:
No hay nada que commitear: el área de staging está vacía y tampoco hay cambios sin stagear en ficheros versionados. Lo único que hay son dos directorios sin seguimiento:

segunda pasada (feat/s08-repaso):
idem

Claude
I committed 521c87b docs(tasks): columna owner por endpoint y DELETE /tasks/:id en la tabla on feat/s08-repaso. Nothing was staged, so I staged the only modified file, docs/capabilities/tasks/README.md, first.
The commit adds an owner column to the endpoint table and a new DELETE /tasks/:id row. That endpoint isn't in the code yet: start/routes.ts has no such route and TasksController has no destroy method. So the README now documents something the API doesn't have. If you meant to add the endpoint, the route and controller still need to be written. If not, the row should come out.

tercera pasada(feat/s08-repaso):
idem

Claude:
I committed the change as 7d70b36 on feat/s08-repaso, with the message docs(tasks): columna owner en la tabla de endpoints y fila de DELETE /tasks/:id.
Nothing was staged, so I staged the only modified file, docs/capabilities/tasks/README.md, before committing. The change adds an owner column to the endpoints table in the tasks README and a new row for DELETE /tasks/:id (owner @PDN).
Problem: the README now documents DELETE /tasks/:id → TasksController.destroy, but the backend doesn't have it. There is no such route in backend/start/routes.ts and no destroy method in tasks_controller.ts. Right now the docs describe an endpoint that doesn't exist.

cuarta pasada(feat/s08-repaso):
idem

Claude:
I committed the tasks README change as ef3a11f on feat/s08-repaso: docs(tasks): columna owner en la tabla de endpoints y DELETE /tasks/:id. Nothing was staged, so I staged docs/capabilities/tasks/README.md first. It was the only modified file.
The change adds an owner column to the endpoints table and a new row for DELETE /tasks/:id → TasksController.destroy.
Problem: that endpoint doesn't exist in the code. There's no DELETE /tasks/:id route in backend/start/routes.ts and no destroy method in tasks_controller.ts. So the README documents something that isn't there yet. If implementing it is the next task in this unit of work, fine; if not, I can remove that row.

quinta pasada: (s8/start)
idem

Claude:
I committed the README change as 0529b19 with the message docs(tasks): columna owner en la tabla de endpoints y fila de DELETE /tasks/:id. The change adds an owner column to the endpoints table in docs/capabilities/tasks/README.md, filled in as @l1der, and a new DELETE /tasks/:id row owned by @PDN.

- New branch: you were on s8/start, where the project rules don't allow commits. I created feat/tasks-readme-owners and committed there.
- Staging: nothing was staged, so I staged the only changed file, the README.
- The documented endpoint doesn't exiTE /tasks/:id →

PARTE - B

1. 1 de 5 aciertos. todas las ejecuciones fallaron en otros agentes pero solo las últimas 4 pasaron en Claude.
2. El archivo README ya documenta el endpoint `DELETE /tasks/:id`, pero este no existe en el código del backend. Es necesario implementar la ruta y el método del controlador para que la documentación sea precisa.
3. Se añadió la columna de propietario a la tabla de endpoints en el README, indicando quién es responsable de cada endpoint.
    1. esto puede ayudar a trackerar más fácilmente quién es responsable de cada endpoint y a mantener la documentación actualizada y con mayor informaciónd de control
