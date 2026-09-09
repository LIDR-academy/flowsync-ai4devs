# Módulo de tareas

## Propósito

Gestión de una única lista de tareas compartida por todo el equipo (no hay listas por usuario ni por proyecto). Cada tarea tiene un título, un responsable (`assignee`, asignado automáticamente a quien la crea), un estado (`pending` / `in_progress` / `done`) y, opcionalmente, una fecha de vencimiento.

Reglas de negocio relevantes, tal como están implementadas hoy:

- **Cualquier usuario autenticado puede modificar cualquier tarea** (cambiar estado, mover fecha), no solo el responsable. No hay permisos por rol ni por asignación.
- El **estado y el responsable no se aceptan en la creación**: los pone el sistema (`status: 'pending'`, `assigneeId` = quien crea la tarea). Impide crear una tarea "a nombre de otro".
- El **listado sin filtro no es "todas"**: excluye `done` por defecto (`DEFAULT_LIST_STATUSES = ['pending', 'in_progress']`). Para ver las hechas hay que pedirlas explícitamente con `?status=done`.
- **"Vencida" se decide siempre desde el cliente**, nunca desde el reloj del servidor: todo endpoint que necesita saber si una tarea está vencida exige un parámetro `today` (`AAAA-MM-DD`) y es **obligatorio, sin valor por defecto**. Esto evita que la lectura dependa del huso horario del servidor. La única definición de "vencida" vive en `Task.isOverdueOn()` (`backend/app/models/task.ts`); el frontend nunca la reimplementa.
- Quitar la fecha de vencimiento es fijarla a `null`, un valor legítimo del campo ("sin fecha"), no un borrado.
- El listado (`TaskTransformer`) **no expone** `dueDate` ni `isOverdue` — solo el detalle de una tarea (`TaskDetailTransformer`) lo hace. Es intencional: la forma de la respuesta impide que el listado "se le cuele" el vencimiento.
- El `assignee` de una tarea (en cualquier endpoint) **no expone `email`**: se serializa siempre con `TaskAssigneeTransformer` (`id`, `fullName`, `initials`), nunca con `UserTransformer`.

## Código relevante

El backend organiza por tipo, no por feature — no hay una carpeta `tasks/` única:

| Capa | Fichero |
|---|---|
| Rutas | `backend/start/routes.ts` (grupo `tasks`, prefijo `/api/v1/tasks`) |
| Controladores | `backend/app/controllers/tasks_controller.ts`, `task_statuses_controller.ts`, `task_due_dates_controller.ts` |
| Validadores | `backend/app/validators/task.ts` |
| Modelo | `backend/app/models/task.ts` |
| Transformers | `backend/app/transformers/task_transformer.ts`, `task_detail_transformer.ts`, `task_assignee_transformer.ts` |
| Migraciones | `backend/database/migrations/1786642030284_create_tasks_table.ts`, `1786644500000_add_due_date_to_tasks_table.ts` |
| Spec viva | `openspec/specs/tasks/spec.md` |

## Endpoints

Todos bajo `/api/v1/tasks`, requieren `Authorization: Bearer <token>` (guard `api`, ver módulo de auth).

| Método | Ruta | Controlador | Body / query | Devuelve |
|---|---|---|---|---|
| `GET` | `/api/v1/tasks` | `TasksController.index` | query `status` (opcional) | Lista de tareas (sin `dueDate`/`isOverdue`) |
| `POST` | `/api/v1/tasks` | `TasksController.store` | body `{ title }` | `201` + la tarea creada |
| `GET` | `/api/v1/tasks/:id` | `TasksController.show` | query `today` (obligatorio, `AAAA-MM-DD`) | Detalle de la tarea (con `dueDate`/`isOverdue`) |
| `PATCH` | `/api/v1/tasks/:id/status` | `TaskStatusesController.update` | body `{ status }` (`pending`\|`in_progress`\|`done`) | La tarea actualizada (forma de listado) |
| `PUT` | `/api/v1/tasks/:id/due-date` | `TaskDueDatesController.update` | body `{ today, dueDate }` (`dueDate` puede ser `null`) | Detalle de la tarea actualizada |

### Forma de una tarea en el listado (`GET /tasks`)

```json
{
  "id": 1,
  "title": "Escribir el README",
  "status": "pending",
  "createdAt": "2026-09-01T10:00:00.000+00:00",
  "updatedAt": "2026-09-01T10:00:00.000+00:00",
  "assignee": {
    "id": 3,
    "fullName": "Ada Lovelace",
    "initials": "AL"
  }
}
```

### Forma del detalle (`GET /tasks/:id`)

```json
{
  "id": 1,
  "title": "Escribir el README",
  "status": "pending",
  "dueDate": "2026-09-10",
  "createdAt": "...",
  "updatedAt": "...",
  "isOverdue": false,
  "assignee": { "id": 3, "fullName": "Ada Lovelace", "initials": "AL" }
}
```

### Errores de validación (422)

- `POST /tasks` con `title` vacío o de más de 200 caracteres → `field: title`.
- `GET /tasks?status=inventado` → `field: status` (un estado que no existe corta con 422, nunca devuelve una lista vacía).
- `PATCH /tasks/:id/status` con un valor fuera de `pending`/`in_progress`/`done` → `field: status`.
- `GET /tasks/:id` o `PUT /tasks/:id/due-date` sin `today`, o con una fecha con formato/calendario inválido (p. ej. `2026-02-31`) → `field: today` o `field: dueDate`.

## Cómo correrlo

Desde `backend/`:

```bash
npm install
cp .env.example .env && node ace generate:key   # solo la primera vez
node ace migration:run                          # crea la tabla tasks y tmp/db.sqlite3
npm run dev                                     # http://localhost:3333
```

El módulo no tiene pantallas propias documentadas aquí a nivel de frontend; consulta `frontend/src/pages/tasks-page.tsx` y `task-page.tsx`.

## Cómo probarlo

`backend/tests/functional/tasks/assignee.spec.ts` cubre el requisito «Lo que cada tarea muestra de su responsable» de `openspec/specs/tasks/spec.md`; el resto de requisitos de este módulo (creación, filtro por estado, fecha de vencimiento) todavía no tiene tests. Para verificar el comportamiento manualmente:

```bash
# 1. Conseguir un token (ver módulo de auth)
TOKEN=$(curl -s -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"secret123"}' | jq -r '.data.token')

# 2. Crear una tarea
curl -s -X POST http://localhost:3333/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Escribir el README"}' | jq

# 3. Listar (excluye 'done' por defecto)
curl -s http://localhost:3333/api/v1/tasks -H "Authorization: Bearer $TOKEN" | jq
curl -s "http://localhost:3333/api/v1/tasks?status=done" -H "Authorization: Bearer $TOKEN" | jq

# 4. Ver el detalle (today es obligatorio)
curl -s "http://localhost:3333/api/v1/tasks/1?today=2026-09-08" -H "Authorization: Bearer $TOKEN" | jq

# 5. Cambiar el estado
curl -s -X PATCH http://localhost:3333/api/v1/tasks/1/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}' | jq

# 6. Fijar / quitar la fecha de vencimiento
curl -s -X PUT http://localhost:3333/api/v1/tasks/1/due-date \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"today":"2026-09-08","dueDate":"2026-09-10"}' | jq

curl -s -X PUT http://localhost:3333/api/v1/tasks/1/due-date \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"today":"2026-09-08","dueDate":null}' | jq
```

Si se añaden más tests functional de `tasks`, deberían vivir en `backend/tests/functional/tasks/` (mismo patrón que `tests/functional/auth/` y que `assignee.spec.ts`) y usar los hooks de `testUtils.db()` para aislar el estado. Ojo con los fixtures: la suite pega contra el mismo `tmp/db.sqlite3` que el servidor de desarrollo, así que un email hardcodeado puede colisionar con una cuenta real ya persistida — usa un email propio por test, no reutilices los de otros specs.
