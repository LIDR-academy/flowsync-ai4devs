# Capability: tareas (`tasks`)

La lista de trabajo del equipo: una sola lista compartida, donde apuntar algo cuesta escribir un título y donde el responsable y el estado de cada tarea se leen sin abrir nada. Cada tarea puede además llevar, opcionalmente, una fecha de vencimiento.

Código real de esta capability:

- Backend: `backend/app/controllers/tasks_controller.ts`, `task_statuses_controller.ts`, `task_due_dates_controller.ts`; `backend/app/models/task.ts`; `backend/app/validators/task.ts`; `backend/app/transformers/task_transformer.ts`, `task_detail_transformer.ts`, `task_assignee_transformer.ts`.
- Rutas: `backend/start/routes.ts`, grupo `tasks`.
- Frontend: `frontend/src/pages/tasks-page.tsx` (lista), `task-page.tsx` (ficha de una tarea), `frontend/src/lib/api.ts` (`listTasks`, `createTask`, `getTask`, `updateTaskStatus`, `setTaskDueDate`).

## Endpoints

Todos bajo `/api/v1/tasks`, todos exigen sesión (cabecera `Authorization: Bearer <token>`, middleware `auth()` en `start/routes.ts`).

| Método | Ruta | Controlador#acción | Qué hace |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | `TasksController#index` | La lista compartida. Sin `?status=`, devuelve pendientes y en curso (`DEFAULT_LIST_STATUSES` en `models/task.ts`); con `?status=pending\|in_progress\|done`, solo ese estado. No lleva fecha de vencimiento ni condición de vencida. |
| `POST` | `/api/v1/tasks` | `TasksController#store` | Crea una tarea a partir de `{"title": "..."}`. Responsable y estado los pone el servidor (quien llama, y `pending`); cualquier otro campo del body se ignora. |
| `GET` | `/api/v1/tasks/:id` | `TasksController#show` | Una tarea suelta, con fecha de vencimiento y condición de vencida ya resueltas. Exige `?today=AAAA-MM-DD`: sin él, `422`. |
| `PATCH` | `/api/v1/tasks/:id/status` | `TaskStatusesController#update` | Cambia el estado con `{"status": "..."}`. Cualquier transición entre los tres estados vale, la haga o no el responsable. |
| `PUT` | `/api/v1/tasks/:id/due-date` | `TaskDueDatesController#update` | Fija, cambia o retira la fecha de vencimiento con `{"today": "AAAA-MM-DD", "dueDate": "AAAA-MM-DD" \| null}`. |

Documento OpenAPI generado a partir de estos mismos controladores (decorados con `@foadonis/openapi`): con el backend levantado, en `http://localhost:3333/api` (interfaz Scalar) o `http://localhost:3333/api.json` / `.yaml`.

## Reglas de negocio

Las reglas de negocio de esta capability —qué title es válido, qué puede hacer cada estado, cómo se resuelve el vencimiento, quién puede ver o tocar qué— **viven en [`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md) y no se repiten aquí**: ese documento es la fuente de verdad ([ADR 0001](../../adr/0001-openspec-como-fuente-de-verdad.md)), escrito en SHALL/SHALL NOT con un scenario WHEN/THEN por caso, y una copia de sus reglas en este README solo podría quedarse desincronizada de él.

Como mapa de qué hay dentro, sin repetir el contenido, los 32 requirements de la spec se agrupan así:

- **Crear una tarea** — qué datos admite la creación y cómo se valida el título.
- **La lista compartida** — a quién ve por defecto, su orden, y qué expone de cada responsable.
- **Estado** — los valores del dominio y quién puede cambiarlos.
- **Fecha de vencimiento** — cómo se fija, cambia y retira, y cómo se decide si una tarea está vencida.
- **Filtro por estado** — el parámetro `status` de la lista y su control en la interfaz.
- **Sesión** — qué exige cada operación y qué pasa sin ella.
- **Interfaz** — las pantallas de lista y de tarea, y sus distintos vacíos.

Para el detalle de cada caso —incluidos los caminos que hoy no tienen test (ver más abajo)— la spec es el único sitio a mirar.

## Cómo se prueba en local

### Backend arriba

```bash
cd backend
npm install
cp .env.example .env && node ace generate:key   # solo la primera vez
node ace migration:run                          # crea tmp/db.sqlite3
npm run dev                                     # http://localhost:3333
```

### Automatizado

```bash
cd backend
npm test                         # toda la suite
node ace test --files=tasks/     # solo los tests de tasks
```

Hoy `backend/tests/functional/tasks/` cubre dos requirements: *«Lo que cada tarea muestra de su responsable»* (`assignee.spec.ts`) y *«Un estado que no existe se rechaza, no se responde vacío»* (`list_status_filter.spec.ts`). El resto de los 32 requirements de la spec no tiene todavía test de integración — si vas a tocar creación, el resto del listado, estado o fecha de vencimiento, no hay red por debajo salvo la que escribas.

### A mano, por HTTP

Todas las rutas de `tasks` piden sesión, así que primero hace falta un token:

```bash
curl -s -X POST http://localhost:3333/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"secreto123","passwordConfirmation":"secreto123"}' \
  | jq -r '.data.token'
```

Con el token (`$TOKEN`):

```bash
# Crear
curl -s -X POST http://localhost:3333/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Revisar el informe"}'

# Listar (vista por defecto: pendientes + en curso)
curl -s http://localhost:3333/api/v1/tasks -H "Authorization: Bearer $TOKEN"

# Listar acotado
curl -s 'http://localhost:3333/api/v1/tasks?status=done' -H "Authorization: Bearer $TOKEN"

# Una tarea suelta (today es obligatorio)
curl -s "http://localhost:3333/api/v1/tasks/1?today=$(date +%F)" -H "Authorization: Bearer $TOKEN"

# Cambiar estado
curl -s -X PATCH http://localhost:3333/api/v1/tasks/1/status \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"in_progress"}'

# Fijar fecha de vencimiento
curl -s -X PUT http://localhost:3333/api/v1/tasks/1/due-date \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"today\":\"$(date +%F)\",\"dueDate\":\"2026-12-31\"}"
```

O, sin escribir `curl`, con la interfaz Scalar en `http://localhost:3333/api`: pulsa «Authorize», pega el token de un `signup`/`login`, y prueba cada operación con su schema y sus respuestas ya documentados.

### Frontend arriba

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173, habla con VITE_API_URL (por defecto http://localhost:3333)
```

No hay runner de tests instalado en `frontend/` (ver `CLAUDE.md`): las pantallas de `tasks-page.tsx` y `task-page.tsx` se verifican a mano, en el navegador.
