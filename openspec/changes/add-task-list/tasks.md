## 1. Base de pruebas (backend)

Va primero: sin ella, el resto se implementa a ciegas y correr los tests borraría la base de datos de desarrollo.

- [x] 1.1 Dar de alta `DB_FILENAME` con `node ace env:add` (valor por defecto `db.sqlite3`) y comprobar que queda en `.env`, `.env.example` y en el schema de `start/env.ts`
- [x] 1.2 En `config/database.ts`, cambiar `filename` a `app.tmpPath(env.get('DB_FILENAME', 'db.sqlite3'))` y añadir `DB_FILENAME=db.test.sqlite3` a `.env.test`
- [x] 1.3 En `tests/bootstrap.ts`, migrar la base de pruebas en `runnerHooks.setup` con `testUtils.db().migrate()` y encadenar su limpieza en el teardown
- [x] 1.4 Crear `tests/helpers/index.ts` con una fábrica de usuarios que genere email único por llamada, sin dependencias nuevas
- [x] 1.5 Crear `tests/functional/` con un test de humo que autentique con `.loginAs(user)` contra `GET /api/v1/account/profile`, y verificar con `node ace test functional` que pasa y que `tmp/db.sqlite3` no se ha tocado

## 2. Modelo de datos y API de tareas (backend)

- [x] 2.1 Crear la migración `create_tasks_table`: `id`, `title` (text, not null), `status` (string, not null, default `pendiente`), `assignee_id` (integer, nullable, FK a `users.id`), `created_at`, `updated_at`
- [x] 2.2 Correr `node ace migration:run`, comprobar que `database/schema.ts` incluye `TaskSchema` y pasar `npm run format`
- [x] 2.3 Crear `app/models/task.ts`: extiende `TaskSchema`, exporta `STATUSES` (`pendiente`, `en curso`, `hecho`) y el tipo `TaskStatus`, y declara la relación `belongsTo` con `User` como `assignee`
- [x] 2.4 Crear `app/validators/task.ts` con `createTaskValidator` (título obligatorio con `.trim().minLength(1)` y sin `maxLength`; estado y responsable opcionales) y `updateTaskValidator` (mismo título obligatorio; estado y responsable opcionales), compartiendo los builders de campo. El estado con `vine.enum` sobre `Task.STATUSES`; el responsable con `.exists({ table: 'users', column: 'id' }).nullable().optional()`
- [x] 2.5 Verificar contra los `.d.ts` reales de `@vinejs/vine` que un campo `.nullable().optional()` ausente queda fuera del objeto validado, para poder distinguir «no mencionado» de «vaciado explícitamente». Si la semántica difiere, ajustar el validador antes de seguir
- [x] 2.6 Crear `app/transformers/task_assignee_transformer.ts` exponiendo solo `id`, `fullName` e `initials`
- [x] 2.7 Crear `app/transformers/task_transformer.ts` exponiendo `id`, `title`, `status` y `assignee` (nulo o el transformer anterior), sin marcas de tiempo ni ningún campo de vencimiento
- [x] 2.8 Crear `app/controllers/tasks_controller.ts` con `index` (lista completa con `preload('assignee')` y **sin `orderBy`**), `store` (defaults: estado `pendiente` y responsable = usuario autenticado, ambos sobrescribibles, incluido el responsable nulo explícito) y `update` (título obligatorio; los campos no mencionados conservan su valor; tarea inexistente → 404)
- [x] 2.9 Registrar en `start/routes.ts` el grupo `tasks` bajo `/api/v1` con `.use(middleware.auth())`: `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`
- [x] 2.10 Arrancar el servidor o la suite para regenerar `.adonisjs/server/controllers.ts` y el registro Tuyau, y dejar el diff listo para commitear
- [x] 2.11 Pasar `npm run lint`, `npm run format` y `npm run typecheck` en `backend/`

## 3. Tests de integración de la API (backend)

Ninguno de estos tests afirma en qué posición sale una tarea: solo pertenencia al conjunto.

- [x] 3.1 `tests/functional/tasks_list.spec.ts` — misma lista para dos personas distintas; tarea creada y autoasignada por otra persona visible para el resto; cada tarea llega con título, estado y responsable; la lista vacía devuelve una colección vacía; consultar dos veces no altera ninguna tarea
- [x] 3.2 En el mismo fichero, los criterios negativos: el responsable no incluye `email`, `password` ni marcas de tiempo de la cuenta; ninguna tarea trae fechas ni campo de vencimiento; sin credencial la lista responde 401 y no devuelve tareas
- [x] 3.3 `tests/functional/tasks_create.spec.ts` — alta con solo el título; estado `pendiente` y responsable = quien crea por defecto; sobrescritura de estado; sobrescritura de responsable por otra persona existente; responsable nulo explícito
- [x] 3.4 En el mismo fichero, los rechazos: sin título, título vacío, título de solo espacios, responsable inexistente, estado desconocido, estado con otra capitalización (`Pendiente`, `EN CURSO`), varios campos inválidos devolviendo un error por campo, y 401 sin credencial. En cada rechazo, comprobar que no queda ninguna tarea creada y que el error viene atribuido a su campo
- [x] 3.5 `tests/functional/tasks_update.spec.ts` — transiciones en los dos sentidos y con salto (`pendiente`→`hecho`, `hecho`→`pendiente`), cambio al estado que ya tiene, cambio sobre tarea de otra persona y sobre tarea sin responsable
- [x] 3.6 En el mismo fichero, el resto: reasignación a otra persona, vaciado explícito del responsable, título vacío o de solo espacios rechazado dejando intacto el anterior, campos no mencionados conservados (estado sin tocar responsable y al revés), tarea inexistente → 404, y 401 sin credencial
- [x] 3.7 Correr `node ace test functional` con todo en verde y confirmar que dos ejecuciones seguidas dan el mismo resultado (el truncado entre tests funciona)

## 4. Capa de acceso a la API (frontend)

- [x] 4.1 En `src/lib/types.ts`, añadir `TaskStatus`, `TaskAssignee`, `Task`, `CreateTaskPayload` y `UpdateTaskPayload`, como espejo de los transformers del backend
- [x] 4.2 En `src/lib/api.ts`, admitir `PATCH` en el tipo de método de `request`
- [x] 4.3 En `src/lib/api.ts`, ampliar `FIELD_LABELS` con `title`, `status` y `assigneeId`, y `translate` con las reglas `enum` y `database.exists`, con mensajes en castellano
- [x] 4.4 En `src/lib/api.ts`, añadir un caso 404 en `toApiError` (hoy cae en el mensaje genérico de servidor)
- [x] 4.5 En `src/lib/api.ts`, añadir `listTasks(token)`, `createTask(payload, token)` y `updateTask(id, payload, token)`, desenvolviendo el `{ data }` como el resto

## 5. Interfaz de la lista (frontend)

- [x] 5.1 Crear `src/components/task-status-control.tsx`: los tres destinos como `Button`, el actual marcado por variante, etiquetas «Pendiente», «En curso» y «Hecho» sobre valores en minúsculas, y los tres deshabilitados mientras hay una petición en vuelo
- [x] 5.2 Crear `src/components/task-row.tsx`: título, responsable por su nombre (`fullName ?? 'Sin nombre'`, y el texto correspondiente cuando no hay responsable) y el control de estado. Sin fechas ni distintivos de urgencia
- [x] 5.3 Crear `src/components/new-task-form.tsx`: un único `Input` para el título más el botón de crear. No ofrece ni sugiere responsable, estado ni fecha. Error del título bajo el propio campo con `FieldError`
- [x] 5.4 Crear `src/components/tasks-empty-state.tsx`: explica para qué sirve la lista y ofrece crear la primera tarea
- [x] 5.5 Crear `src/pages/tasks-page.tsx`: carga la lista al montar, muestra carga y error con los componentes existentes, alterna entre estado vacío y lista, e incluye enlace al perfil en la cabecera
- [x] 5.6 En `tasks-page.tsx`, insertar la tarea recién creada en el estado local con la respuesta del `POST`, sin volver a pedir la lista ni navegar
- [x] 5.7 En `tasks-page.tsx`, implementar el cambio de estado optimista: aplicar en local, lanzar el `PATCH` enviando también el título actual de la fila, y revertir mostrando el error si falla. **Sustituir la fila en su sitio, sin reordenar ni recargar la lista**
- [x] 5.8 En `src/routes/app-routes.tsx`, añadir `/tasks` dentro de `ProtectedRoute` y llevar el comodín `*` a `/tasks`
- [ ] 5.9 Comprobar que tras iniciar sesión se aterriza en la lista y que sin sesión `/tasks` redirige a login
- [x] 5.10 Pasar `npm run lint` (oxlint), `npm run format` y `npm run build` en `frontend/`

## 6. Verificación de punta a punta

- [ ] 6.1 Con backend y frontend arrancados: crear la primera tarea desde el estado vacío y verificar que aparece sin recargar, en `pendiente` y a nombre de quien la creó
- [ ] 6.2 Con dos cuentas distintas, comprobar que ambas ven la misma lista y que una puede cambiar el estado de una tarea de la otra sin aviso ni permiso
- [ ] 6.3 Recorrer los tres estados en ambos sentidos desde la fila, y comprobar que el título vacío o de solo espacios se rechaza con el aviso junto al campo
- [x] 6.4 Revisar que nada de lo entregado menciona vencimiento, orden, borrado, lectura individual ni endpoints de equipo, ni deja hueco preparado para ellos
- [x] 6.5 Confirmar que el diff incluye `database/schema.ts` y `.adonisjs/` regenerados, y que un clon limpio compila tras `migration:run`
