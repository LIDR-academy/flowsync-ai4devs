# FlowSync — Arquitectura del MVP

**Fecha:** 2026-09-18
**Producto:** [prd-mvp.md](./prd-mvp.md)
**Registro de decisiones:** [alcance-mvp-jm.md](./alcance-mvp-jm.md)

Diseño técnico de la vertical descrita en el PRD. Se apoya en las convenciones ya fijadas en el repo (ver `CLAUDE.md`): esquema generado desde migraciones, transformers + `serialize()`, cliente único en `lib/api.ts`, guards de rutas.

---

## 1. Punto de partida

Lo que ya existe y se reutiliza:

- **Backend:** AdonisJS 7 + Lucid 22 + SQLite. Auth por access tokens (guard `api`). Tabla `users` (`id`, `full_name`, `email`, `password`, timestamps) y `auth_access_tokens`. Endpoints de signup / login / profile / logout.
- **Frontend:** React 19 + Vite 8 + Tailwind v4 + shadcn/ui + react-router. `AuthProvider` con token en `localStorage`, rutas `/login`, `/register`, `/profile`.

## 2. Modelo de datos

Una tabla nueva. Se apoya en `users`.

```
tasks
├── id             increments, PK
├── title          string(200), NOT NULL
├── status         string, NOT NULL, default 'todo'   -- 'todo' | 'doing' | 'done'
├── assignee_id    integer → users.id, nullable, ON DELETE SET NULL
├── due_date       date, nullable
├── created_by_id  integer → users.id, NOT NULL, ON DELETE CASCADE
├── created_at     timestamp, NOT NULL
└── updated_at     timestamp, NOT NULL
```

Relaciones:

- `Task.assignee` → `belongsTo(User)` vía `assignee_id`
- `Task.createdBy` → `belongsTo(User)` vía `created_by_id`

Decisiones:

| Decisión | Motivo |
|---|---|
| Sin `team_id` | Espacio único compartido (supuesto del PRD). Añadirlo después es una migración + un `where`. |
| Sin tabla de historial | "Qué se ha movido" se resuelve con `updated_at`. Un feed de actividad es andamiaje fuera de alcance. |
| `status` como string con enum en código, no tabla | Tres estados fijos. La validación vive en VineJS y en el tipo TS. |
| `assignee_id` nullable | Concepto de tarea libre. |
| `ON DELETE SET NULL` en assignee | Borrar un usuario no borra su trabajo; la tarea queda libre. |
| Sin paginación | 3–10 personas, volumen pequeño. |

Flujo según convención del repo: migración → `node ace migration:run` (regenera `database/schema.ts` con `TaskSchema`) → `app/models/task.ts` extiende `TaskSchema` y añade solo relaciones y lógica.

## 3. API

Todas bajo `/api/v1`, dentro del grupo protegido con `middleware.auth()`. Respuestas envueltas en `{ data }` vía `serialize()` + transformer.

| Método | Ruta | Controlador | Descripción |
|---|---|---|---|
| GET | `/tasks` | `TasksController.index` | Lista todas. Query opcional `status=todo\|doing\|done`. Orden `updated_at desc`. Precarga `assignee`. |
| POST | `/tasks` | `TasksController.store` | Crea. `title` obligatorio; `status`, `assigneeId`, `dueDate` opcionales. `created_by_id` = usuario autenticado. |
| PATCH | `/tasks/:id` | `TasksController.update` | Actualización parcial de `title`, `status`, `assigneeId`, `dueDate`. |
| DELETE | `/tasks/:id` | `TasksController.destroy` | Borra. |
| GET | `/users` | `UsersController.index` | Lista de usuarios para el selector de responsable. |

### 3.1 Validación (`app/validators/task.ts`)

- `title`: string, trim, 1–200.
- `status`: enum `['todo', 'doing', 'done']`.
- `assigneeId`: number, nullable, `exists({ table: 'users', column: 'id' })`.
- `dueDate`: date `YYYY-MM-DD`, nullable.
- `createTaskValidator` (title obligatorio) y `updateTaskValidator` (todo opcional).

### 3.2 Transformers

- `TaskTransformer`: `id, title, status, dueDate, createdAt, updatedAt, assignee` (anidado con `UserTransformer` reducido: `id, fullName, initials`).
- `UserTransformer` ya existe; para `/users` se reutiliza.

### 3.3 Formato de respuesta

```json
{
  "data": [
    {
      "id": 1,
      "title": "Migrar el módulo de pagos",
      "status": "doing",
      "dueDate": "2026-09-25",
      "assignee": { "id": 2, "fullName": "Ana López", "initials": "AL" },
      "createdAt": "2026-09-18T09:12:00.000Z",
      "updatedAt": "2026-09-18T11:40:00.000Z"
    }
  ]
}
```

### 3.4 Errores

Se mantiene el contrato actual: 422 con `{ errors: [{ message, rule, field }] }` para validación, 401 sin token, 404 si la tarea no existe.

## 4. Frontend

### 4.1 Rutas

- Nueva ruta protegida **`/tasks`**. La redirección `*` pasa de `/profile` a `/tasks`. `/profile` se mantiene.

### 4.2 Estructura

```
src/
├── lib/
│   ├── api.ts          + listTasks, createTask, updateTask, deleteTask, listUsers
│   │                   + soporte de PATCH y DELETE en request()
│   └── types.ts        + Task, TaskStatus, TaskPayload, TeamMember
├── tasks/
│   ├── use-tasks.ts    estado de la lista, mutaciones optimistas, polling
│   └── task-status.ts  ciclo de estados y etiquetas en castellano
├── pages/
│   └── tasks-page.tsx
└── components/
    ├── task-list.tsx
    ├── task-row.tsx
    ├── task-create-input.tsx
    ├── task-status-chip.tsx
    ├── task-status-filter.tsx
    └── assignee-select.tsx
```

Componentes shadcn a añadir: `select`, `badge`, `popover` + `calendar` (fecha), `dropdown-menu` (acciones de fila).

### 4.3 Polling

- `GET /tasks` cada **10 s** solo si `document.visibilityState === 'visible'`.
- Al volver a la pestaña (`visibilitychange`), refresco inmediato.
- Las mutaciones (crear, cambiar estado, editar, borrar) aplican el cambio en local de forma optimista y luego refrescan la lista.
- El filtro por estado se aplica en cliente sobre la lista completa; el query `status` del backend queda disponible pero no es necesario con este volumen.

### 4.4 Etiquetas

| Valor | Etiqueta |
|---|---|
| `todo` | Pendiente |
| `doing` | En curso |
| `done` | Hecha |
| sin `assignee` | Libre |

"Vencida" = `dueDate < hoy && status !== 'done'`.

## 5. Decisiones técnicas

| Decisión | Elegido | Descartado | Motivo |
|---|---|---|---|
| Frescura | Polling 10 s | SSE (`@adonisjs/transmit`) / WebSockets | Encaja con "resumen que espera"; cero infraestructura; sustituible sin tocar modelo ni API. |
| Filtro | En cliente | Solo en servidor | Volumen pequeño; evita un round-trip por cada cambio de filtro. El backend lo soporta igualmente. |
| Estado de lista | Hook propio (`useTasks`) | React Query / SWR | Una sola lista y un intervalo; no justifica una dependencia. |
| Fecha | Solo día (`date`), sin hora | `timestamp` | "Qué se ha pasado de plazo" es a nivel de día. Evita líos de huso horario entre 3 zonas. |

## 6. Tests

- **Functional (Japa, `tests/functional/tasks.spec.ts`):** CRUD completo, filtro por `status`, 401 sin token, 422 por validación, 404 en `:id` inexistente, orden por `updated_at`.
- Aislamiento de BD con `testUtils.db().truncate()` (ver aviso en `CLAUDE.md`: la suite pega contra el mismo SQLite que el dev server).
- Frontend: sin runner instalado; no se añaden tests en el MVP.

## 7. Plan de implementación

1. Migración `tasks` + `migration:run` + modelo `Task` con relaciones.
2. Validador, transformer, `TasksController`, `UsersController`, rutas. Tests functional.
3. `lib/api.ts` (PATCH/DELETE + funciones) y `lib/types.ts`.
4. `tasks-page` con lista, creación inline y chip de estado.
5. Responsable (select), fecha (calendar), vencida, filtro.
6. Polling con visibilidad.
