# Capability: tasks

## Qué hace

Le da al equipo su lista de trabajo: una sola lista compartida con todas las tareas del espacio, donde apuntar algo cuesta escribir un título y donde el responsable y el estado de cada tarea se leen sin abrir nada. Cualquier cuenta con sesión puede crear tareas, verlas todas, cambiarles el estado y fijarles una fecha de vencimiento opcional — no hay tareas privadas, ni permisos por responsable, ni una vista de "mis tareas" separada de la del equipo.

No hay una carpeta `tasks/` única: el backend organiza por tipo, no por feature.

| Capa | Fichero |
|---|---|
| Rutas | `backend/start/routes.ts` (grupo `tasks`, prefijo `/api/v1/tasks`) |
| Controladores | `backend/app/controllers/tasks_controller.ts`, `task_statuses_controller.ts`, `task_due_dates_controller.ts` |
| Validadores | `backend/app/validators/task.ts` |
| Modelo | `backend/app/models/task.ts` |
| Transformers | `backend/app/transformers/task_transformer.ts`, `task_detail_transformer.ts`, `task_assignee_transformer.ts` |
| Migraciones | `backend/database/migrations/1786642030284_create_tasks_table.ts`, `1786644500000_add_due_date_to_tasks_table.ts` |
| Documentación OpenAPI | `backend/app/openapi/task_schemas.ts` (decoradores en los tres controladores) |
| Pantallas | `frontend/src/pages/tasks-page.tsx` (lista, ruta `/tasks`), `task-page.tsx` (detalle, ruta `/tasks/:id`) |
| Componentes | `frontend/src/components/task-item.tsx`, `task-filter.tsx` |
| Cliente API | `frontend/src/lib/api.ts` (`listTasks`, `createTask`, `getTask`, `updateTaskStatus`, `setTaskDueDate`) |
| Spec viva | [`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md) |

## Qué endpoints expone

Todos bajo `/api/v1/tasks`, protegidos por el guard `api` — exigen `Authorization: Bearer <token>` (ver la capability `auth`).

| Método | Ruta | Controlador | Query / body |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | `TasksController.index` | query `status` (opcional) |
| `POST` | `/api/v1/tasks` | `TasksController.store` | body `{ title }` |
| `GET` | `/api/v1/tasks/:id` | `TasksController.show` | query `today` (obligatorio, `AAAA-MM-DD`) |
| `PATCH` | `/api/v1/tasks/:id/status` | `TaskStatusesController.update` | body `{ status }` |
| `PUT` | `/api/v1/tasks/:id/due-date` | `TaskDueDatesController.update` | query `today`, body `{ dueDate }` (`dueDate` admite `null`) |

Para la forma exacta de cada respuesta —campos, nulabilidad, y los códigos `200`/`201`/`401`/`404`/`422` de cada operación— no hay una copia aquí: consulta el documento OpenAPI que sirve el propio backend, ya con esos cinco endpoints decorados:

- Interfaz Scalar: `http://localhost:3333/api`
- JSON: `http://localhost:3333/api.json` (también en YAML, `/api.yaml`)

## Qué reglas de negocio tiene

Las reglas de negocio de esta capability —qué puede tener una tarea, quién puede tocarla, cómo se decide que está vencida, qué hace exactamente el filtro de la lista— viven en un solo sitio, no aquí: **[`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md)**. Es la fuente de verdad viva del proyecto (ver [ADR 0001](../../adr/0001-openspec-como-fuente-de-verdad.md)), escrita en requisitos `SHALL`/`NO SHALL` con sus scenarios `WHEN`/`THEN`, y no se duplica en este README a propósito: copiar una regla aquí crearía un segundo sitio donde esa misma regla puede quedar desactualizada sin que nadie lo note — que es exactamente el problema que ese ADR documenta que ya pasó una vez con esta misma capability.

A modo de mapa, para saber por dónde buscar sin tener que leerla entera, hoy cubre estos temas (por título de requisito, sin repetir su contenido):

- **Crear y titular una tarea** — alta con solo el título, título obligatorio y su límite de longitud.
- **La lista compartida y su filtro por estado** — qué devuelve sin acotar, cómo se acota, y los distintos finales de una lista sin filas.
- **El responsable de una tarea** — qué datos suyos se muestran y cuáles no se exponen nunca.
- **Los tres estados y su cambio** — el catálogo fijo y quién puede moverla entre ellos.
- **La fecha de vencimiento y la condición de vencida** — fijarla, cambiarla, quitarla, y contra qué día se resuelve.
- **Sesión y acceso** — qué exige cada operación.
- **Las pantallas de interfaz** — lista, detalle de tarea, y los distintos vacíos que cada una distingue.

Si el código y la spec parecen contradecirse, la spec no gana por defecto: verifica contra el sistema en marcha (`npm run dev` + una petición real) antes de asumir cuál de los dos está desactualizado.

## Cómo se prueba en local

### Arrancar el backend

Desde `backend/`:

```bash
npm install
cp .env.example .env && node ace generate:key   # solo la primera vez
node ace migration:run                          # crea la tabla tasks y tmp/db.sqlite3
npm run dev                                      # http://localhost:3333
```

### Tests automáticos

```bash
node ace test --files=assignee   # los 3 tests de tasks que existen hoy
node ace test functional         # toda la suite functional (auth + tasks)
```

Hoy solo hay un fichero de test para esta capability: `backend/tests/functional/tasks/assignee.spec.ts`, que cubre el requisito *Lo que cada tarea muestra de su responsable* (tres scenarios: nombre e iniciales visibles, ningún dato de cuenta filtrado, y una cuenta sin nombre que sigue dando iniciales). El resto de requisitos de `tasks` —creación, filtro por estado, cambio de estado, fecha de vencimiento— no tiene test automático: los changes que los implementaron (`openspec/changes/archive/2026-08-13-add-task-list/`, `-add-task-status-filter/`, `-add-task-due-date/`) documentan en su propio `proposal.md` que la verificación fue manual, a propósito.

Si añades tests nuevos, sigue el mismo patrón: vive en `backend/tests/functional/tasks/`, usa `group.each.setup(() => testUtils.db().withGlobalTransaction())` para aislar cada test, y usa un email propio por test — la suite pega contra el mismo `tmp/db.sqlite3` que el servidor de desarrollo, así que un email reutilizado puede colisionar con una cuenta ya persistida.

### Probarlo a mano

```bash
# 1. Crear una cuenta y quedarse con el token
TOKEN=$(curl -s -X POST http://localhost:3333/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"secreto123","passwordConfirmation":"secreto123"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).data.token')

# 2. Crear una tarea
curl -s -X POST http://localhost:3333/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Revisar el informe"}'

# 3. Listar (excluye 'done' por defecto) y acotar por estado
curl -s http://localhost:3333/api/v1/tasks -H "Authorization: Bearer $TOKEN"
curl -s "http://localhost:3333/api/v1/tasks?status=done" -H "Authorization: Bearer $TOKEN"

# 4. Ver el detalle de la tarea 1 ('today' es obligatorio)
curl -s "http://localhost:3333/api/v1/tasks/1?today=2026-09-09" -H "Authorization: Bearer $TOKEN"

# 5. Cambiar el estado
curl -s -X PATCH http://localhost:3333/api/v1/tasks/1/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

# 6. Fijar y luego quitar la fecha de vencimiento
curl -s -X PUT "http://localhost:3333/api/v1/tasks/1/due-date?today=2026-09-09" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"dueDate":"2026-09-30"}'

curl -s -X PUT "http://localhost:3333/api/v1/tasks/1/due-date?today=2026-09-09" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"dueDate":null}'
```

### Por interfaz

Con el backend arriba, arranca el frontend desde `frontend/` (`npm install && npm run dev`, `http://localhost:5173`), inicia sesión y entra en `/tasks`. El detalle de cada tarea, con su fecha de vencimiento, está en `/tasks/:id`.
