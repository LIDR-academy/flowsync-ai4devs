# Capability: `tasks`

La lista de trabajo compartida del equipo: una sola lista con todas las tareas del espacio, donde
apuntar algo cuesta escribir un título y donde el responsable y el estado de cada tarea se leen sin
abrir nada.

> **Dónde está la verdad.** Las reglas de esta capability viven en
> **[`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md)** — 32 requisitos, 124
> scenarios— y este README **no las repite**: enlaza a cada una y dice dónde está implementada. Lo que
> sí describe de primera mano es lo que se lee del código: qué rutas existen, qué acepta cada una y
> cómo se arranca y se prueba todo en local. Si algo de aquí y la spec no concuerdan, manda la spec
> (ver [ADR 0001](../../adr/0001-openspec-como-fuente-de-verdad.md)).

## Endpoints

Todos bajo `/api/v1`, declarados en [`backend/start/routes.ts`](../../../backend/start/routes.ts).
Todos exigen `Authorization: Bearer <token>`: el grupo lleva `.use(middleware.auth())`. El token sale
de `POST /api/v1/auth/login` o de `POST /api/v1/auth/signup`.

| Método y ruta | Entrada | Controlador | Devuelve |
|---|---|---|---|
| `GET /tasks` | `status` en query, opcional | [`TasksController.index`](../../../backend/app/controllers/tasks_controller.ts) | `200` · lista de tareas |
| `POST /tasks` | `{ "title": "..." }` | [`TasksController.store`](../../../backend/app/controllers/tasks_controller.ts) | `201` · la tarea creada |
| `GET /tasks/:id` | `today=AAAA-MM-DD` en query, **obligatorio** | [`TasksController.show`](../../../backend/app/controllers/tasks_controller.ts) | `200` · la tarea con vencimiento |
| `PATCH /tasks/:id/status` | `{ "status": "pending \| in_progress \| done" }` | [`TaskStatusesController.update`](../../../backend/app/controllers/task_statuses_controller.ts) | `200` · la tarea ya cambiada |
| `PUT /tasks/:id/due-date` | `{ "dueDate": "AAAA-MM-DD" \| null, "today": "AAAA-MM-DD" }` | [`TaskDueDatesController.update`](../../../backend/app/controllers/task_due_dates_controller.ts) | `200` · la tarea con vencimiento |

Toda respuesta va envuelta en `{ "data": ... }` por el serializer de
[`providers/api_provider.ts`](../../../backend/providers/api_provider.ts).

### Dos formas de tarea, no una

Son objetos distintos a propósito, no el mismo con campos opcionales:

- **Tarea de lista** — [`TaskTransformer`](../../../backend/app/transformers/task_transformer.ts).
  La devuelven `GET /tasks`, `POST /tasks` y `PATCH /tasks/:id/status`. **No lleva vencimiento.**

  ```json
  { "id": 1, "title": "Revisar el informe", "status": "pending",
    "createdAt": "...", "updatedAt": "...",
    "assignee": { "id": 1, "fullName": "Ada Lovelace", "initials": "AL" } }
  ```

- **Tarea suelta** — [`TaskDetailTransformer`](../../../backend/app/transformers/task_detail_transformer.ts).
  La devuelven `GET /tasks/:id` y `PUT /tasks/:id/due-date`. Añade `dueDate` e `isOverdue`, y por eso
  son las dos únicas que exigen `today`.

  ```json
  { "id": 1, "title": "Revisar el informe", "status": "in_progress",
    "dueDate": "2026-08-19", "isOverdue": true,
    "createdAt": "...", "updatedAt": "...",
    "assignee": { "id": 1, "fullName": "Ada Lovelace", "initials": "AL" } }
  ```

El `assignee` sale siempre por
[`TaskAssigneeTransformer`](../../../backend/app/transformers/task_assignee_transformer.ts), que lo
recorta a `id`, `fullName` e `initials` — nunca el email.

### El contrato, servido

Las cinco operaciones están anotadas con los decoradores de `@foadonis/openapi` sobre los propios
controladores, así que el documento servido en **`/api.json`** (y la interfaz en `/api`) lleva el
parámetro `status` con sus tres valores, el `today` obligatorio, los cuerpos de las escrituras y los
códigos `200`/`201`/`401`/`404`/`422`/`500` de cada operación, cada uno con la forma de lo que devuelve.

**Cuatro operaciones de `auth` siguen fuera del documento**: `signup`, `login`, `logout` y `profile` no llevan decoradores, así que `/api.json` las omite. Es H-23, y decorarlas exige esquemas de respuesta que `app/openapi/schemas.ts` todavía no tiene. Un generador escribe fielmente lo que hay y no dice nada de lo que falta: eso lo vigila una comprobación de `scripts/verificar-docs.mjs` con lista cerrada.

Las formas que se repiten viven en
[`backend/app/openapi/schemas.ts`](../../../backend/app/openapi/schemas.ts) y se publican en
`components.schemas`, de manera que se describen una vez y cada respuesta las referencia con `$ref`.
`Task` y `TaskDetail` son dos componentes separados por el mismo motivo por el que hay dos
transformers: así el documento **no puede** enseñar el vencimiento en la lista.

Ese fichero es documentación, no validación: describe lo que los controladores ya hacen. Si cambia un
transformer o un validador, se actualiza en el mismo commit. El documento se construye en cada
petición y no hay fichero que generar; lo que se commitea es el diff de `.adonisjs/`.

## Reglas de negocio: dónde vive cada una

Esta tabla no enuncia las reglas; dice **dónde se cumplen** y **qué requisito las manda**. Para saber
qué exige cada una, se abre el enlace de la derecha.

| Área | Implementada en | Requisito que manda |
|---|---|---|
| Crear con solo el título | `createTaskValidator` · [`validators/task.ts`](../../../backend/app/validators/task.ts) y `TasksController.store` | [Creación de una tarea con solo el título](../../../openspec/specs/tasks/spec.md#requirement-creación-de-una-tarea-con-solo-el-título) |
| Título vacío, en blanco o recortado | `createTaskValidator`, con `trim()` antes de `minLength()` | [Ninguna tarea sin título](../../../openspec/specs/tasks/spec.md#requirement-ninguna-tarea-sin-título) |
| Longitud máxima del título | `createTaskValidator`, `maxLength(200)` sobre el título ya recortado | [Aviso ante un título demasiado largo](../../../openspec/specs/tasks/spec.md#requirement-aviso-ante-un-título-demasiado-largo) |
| Responsable y estado los pone el sistema | `TasksController.store`: el validador no acepta esos campos | [Creación de una tarea con solo el título](../../../openspec/specs/tasks/spec.md#requirement-creación-de-una-tarea-con-solo-el-título) |
| Alcance y orden de la lista | `DEFAULT_LIST_STATUSES` · [`models/task.ts`](../../../backend/app/models/task.ts) y `TasksController.index` | [Una sola lista compartida del espacio](../../../openspec/specs/tasks/spec.md#requirement-una-sola-lista-compartida-del-espacio) |
| Qué se ve del responsable | `TaskAssigneeTransformer` | [Lo que cada tarea muestra de su responsable](../../../openspec/specs/tasks/spec.md#requirement-lo-que-cada-tarea-muestra-de-su-responsable) |
| Los tres estados | `TASK_STATUSES` · `models/task.ts`, y `updateTaskStatusValidator` con `vine.enum` | [Tres estados fijos](../../../openspec/specs/tasks/spec.md#requirement-tres-estados-fijos) |
| Cambiar de estado, sin permisos por responsable | `TaskStatusesController.update` | [Cambio de estado de cualquier tarea](../../../openspec/specs/tasks/spec.md#requirement-cambio-de-estado-de-cualquier-tarea) |
| Sesión obligatoria | `.use(middleware.auth())` sobre el grupo · `start/routes.ts` | [Las tareas exigen sesión](../../../openspec/specs/tasks/spec.md#requirement-las-tareas-exigen-sesión) |
| Fecha de vencimiento opcional | Columna `due_date` nulable · [`database/migrations/`](../../../backend/database/migrations/) | [Fecha de vencimiento opcional](../../../openspec/specs/tasks/spec.md#requirement-fecha-de-vencimiento-opcional) |
| Poner, cambiar y quitar la fecha | `setTaskDueDateValidator` (con `dueDate` nulable) y `TaskDueDatesController.update` | [Fijar, cambiar y retirar la fecha de vencimiento](../../../openspec/specs/tasks/spec.md#requirement-fijar-cambiar-y-retirar-la-fecha-de-vencimiento) |
| Cuándo una tarea está vencida | `Task.isOverdueOn()` · `models/task.ts` — **única definición del sistema** | [Cuándo una tarea está vencida](../../../openspec/specs/tasks/spec.md#requirement-cuándo-una-tarea-está-vencida) |
| El día de referencia lo pone quien mira | `taskReferenceDayValidator`, obligatorio y sin valor por defecto | [El día de referencia lo pone quien mira](../../../openspec/specs/tasks/spec.md#requirement-el-día-de-referencia-lo-pone-quien-mira) |
| La lista no lleva vencimiento | Dos transformers separados, no uno con campos opcionales | [La lista no lleva el vencimiento](../../../openspec/specs/tasks/spec.md#requirement-la-lista-no-lleva-el-vencimiento) |
| Acotar por estado | `listTasksValidator` y la rama de `TasksController.index` | [Acotar la lista por estado](../../../openspec/specs/tasks/spec.md#requirement-acotar-la-lista-por-estado) |
| Filtro válido sin resultados ≠ filtro inválido | **Cumplido desde el 2026-09-02.** `listTasksValidator` declara `vine.enum(TASK_STATUSES).optional()`, así que un estado inventado sale con `422` señalando el campo y nunca como lista vacía. Era H-16, y aquí decía «Sin cumplir hoy» describiendo `vine.string().optional()`, que es lo que había antes de portar el arreglo | [Un estado que no existe se rechaza, no se responde vacío](../../../openspec/specs/tasks/spec.md#requirement-un-estado-que-no-existe-se-rechaza-no-se-responde-vacío) |

En el frontend, la capability vive en [`pages/tasks-page.tsx`](../../../frontend/src/pages/tasks-page.tsx),
[`pages/task-page.tsx`](../../../frontend/src/pages/task-page.tsx),
[`components/task-item.tsx`](../../../frontend/src/components/task-item.tsx) y
[`components/task-filter.tsx`](../../../frontend/src/components/task-filter.tsx); las llamadas, todas
en [`lib/api.ts`](../../../frontend/src/lib/api.ts). Los requisitos de interfaz de la spec son los que
empiezan por «La interfaz SHALL…».

## Cómo se prueba en local

### Preparar el backend

```bash
cd backend
npm install
cp .env.example .env && node ace generate:key   # solo la primera vez
node ace migration:run                          # crea tmp/db.sqlite3
```

### Tests automáticos

```bash
node ace test                                   # todo
node ace test functional                        # solo la suite functional
node ace test --files=assignee                  # un fichero
node ace test --tests="el responsable llega con su nombre y sus iniciales"
```

Los tests de esta capability están en
[`backend/tests/functional/tasks/`](../../../backend/tests/functional/tasks/). **Hoy solo hay uno**,
`assignee.spec.ts`, que cubre 3 de los 124 scenarios de la spec: los del requisito *Lo que cada tarea
muestra de su responsable*. Todo lo demás está sin cubrir, así que el verde de la suite **no** es
señal de que la capability cumpla su spec.

Dos cosas que hay que saber antes de escribir un test aquí:

- La suite functional pega contra **el mismo fichero SQLite que el servidor de desarrollo**:
  [`config/database.ts`](../../../backend/config/database.ts) declara una sola conexión sin override
  por entorno. Aísla siempre con `testUtils.db().withGlobalTransaction()` en un `group.each.setup`,
  como hacen los tests existentes. **No** uses truncate: se llevaría por delante los datos con los que
  estés trabajando.
- Un test por scenario, citando el requisito en la cabecera del fichero. Es lo que permite leer la
  spec y saber qué falta.

### A mano, contra el servidor real

```bash
node ace serve --hmr        # http://localhost:3333
```

En otra terminal, el recorrido completo de la capability:

```bash
# 1. Una cuenta y su token
TOKEN=$(curl -s -X POST http://localhost:3333/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"secreto123","passwordConfirmation":"secreto123"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['token'])")

# 2. Crear una tarea — 201
curl -s -X POST http://localhost:3333/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Revisar el informe"}'

# 3. La lista, sin filtro y acotada
curl -s http://localhost:3333/api/v1/tasks -H "Authorization: Bearer $TOKEN"
curl -s "http://localhost:3333/api/v1/tasks?status=pending" -H "Authorization: Bearer $TOKEN"

# 4. Una tarea suelta — el día de referencia es obligatorio
curl -s "http://localhost:3333/api/v1/tasks/1?today=2026-08-20" -H "Authorization: Bearer $TOKEN"

# 5. Cambiar el estado
curl -s -X PATCH http://localhost:3333/api/v1/tasks/1/status \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"in_progress"}'

# 6. Poner una fecha ya pasada: vuelve con isOverdue true
curl -s -X PUT http://localhost:3333/api/v1/tasks/1/due-date \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"dueDate":"2026-08-19","today":"2026-08-20"}'
```

Ojo: esto **escribe en la base de datos de desarrollo**. Para dejarla como estaba, `node ace
migration:fresh`.

### La interfaz

```bash
cd frontend && npm install && npm run dev       # http://localhost:5173
```

La lista está en `/tasks`, una tarea en `/tasks/:id`, y el filtro viaja en la URL como `?status=`.
**El frontend no tiene runner de tests instalado**, así que los requisitos de interfaz de la spec
—más de la mitad de sus scenarios— solo se pueden comprobar a mano.

### Antes de dar algo por terminado

```bash
cd backend  && npm run lint && npm run typecheck && node ace test
cd frontend && npm run lint && npm run build     # el typecheck del front vive en build
```
