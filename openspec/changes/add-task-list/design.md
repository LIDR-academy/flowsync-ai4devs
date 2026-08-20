## Context

Ver `proposal.md` para el porqué y `specs/tasks/spec.md` para el contrato de comportamiento. Aquí solo el estado actual que condiciona el cómo.

**Backend.** AdonisJS 7 con esquema generado: `database/schema.ts` se produce desde las migraciones y los modelos no declaran columnas, extienden la clase generada. Toda respuesta pasa por `ctx.serialize()`, que envuelve bajo `{ data }`, y siempre a través de un transformer de `app/transformers/`. Las rutas referencian controladores por el mapa generado en `.adonisjs/server/controllers.ts`, y `.adonisjs/` está versionado. El guard por defecto es `api` (tokens opacos); `silent_auth_middleware` corre en todas las rutas y la protección real la aplica `.use(middleware.auth())` sobre el grupo, que es lo que produce el 401.

**Frontend.** `src/lib/api.ts` es el único punto de contacto con el backend: envuelve `fetch`, desenvuelve el `{ data }`, adjunta el `Bearer` y traduce los errores de VineJS a `ApiError` con mensaje en castellano y `fieldErrors` por campo. Hoy su función `request` solo admite `GET` y `POST`. Las páginas viven en `src/pages/`, las rutas y los guards en `src/routes/`, y en `src/components/ui/` solo hay cinco componentes de shadcn generados: `alert`, `button`, `card`, `input` y `label`.

**Pruebas.** El proyecto no tiene ni un test. `tests/bootstrap.ts` ya está configurado con `apiClient`, `authApiClient`, `dbAssertions` y el registro tipado de Tuyau, y `adonisrc.ts` declara las suites `unit` y `functional`, pero ninguno de los dos directorios existe. `config/database.ts` define una única conexión SQLite apuntando a `app.tmpPath('db.sqlite3')` sin override por entorno: tal cual está, la suite `functional` escribiría sobre el mismo fichero que el servidor de desarrollo.

## Goals / Non-Goals

**Goals:**

- Un contrato de API que la interfaz pueda consumir sin lógica de negocio propia: la interfaz pinta y envía, el backend decide.
- Que las decisiones cerradas (tres estados, defaults, título obligatorio, responsable existente) se apliquen en un solo sitio y no se dupliquen entre capas.
- Dejar montada una base de pruebas de integración que los changes siguientes puedan usar sin reinventarla, y que no destruya la base de datos de desarrollo al ejecutarse.
- No introducir ningún criterio de ordenación, ni en la consulta, ni en la interfaz, ni en los tests.

**Non-Goals:**

- Cualquier estructura preparada «para cuando llegue» el vencimiento: ni columna, ni campo opcional, ni hueco en el transformer.
- Refresco automático, tiempo real, paginación, filtros y ordenación configurable. Nada de eso se prepara ni se deja a medias.
- Concurrencia: no hay bloqueo optimista ni detección de escritura simultánea (PA-8, y la historia E3-2 aparte).
- Añadir componentes de shadcn nuevos: traer un `select` arrastraría `@radix-ui/react-select`, que es una dependencia nueva.

## Decisions

### 1. Los tres estados viven como cadena en la base de datos y como enum en el validador

Columna `status` de tipo texto, `notNullable()`, con `defaultTo('pendiente')`. La restricción del conjunto cerrado se aplica en el validador con `vine.enum(['pendiente', 'en curso', 'hecho'])`, que compara por igualdad exacta y por tanto rechaza `Pendiente` o `EN CURSO` sin normalizarlos, que es justo lo que pide la especificación.

El array de estados se declara una sola vez en el modelo (`Task.STATUSES`) y de ahí lo consume el validador, de modo que no haya dos listas que puedan divergir.

*Alternativas descartadas:* un `check constraint` en SQLite añadiría una segunda fuente de verdad y un error de base de datos —no de validación— para un caso que el validador ya cubre con el campo atribuido. Una tabla de estados contradice frontalmente «no se pueden añadir, renombrar ni eliminar estados».

**El valor del contrato es en minúsculas; la etiqueta que se pinta, no.** La interfaz muestra «Pendiente», «En curso» y «Hecho» con la capitalización que usa el backlog, mediante un mapa de etiquetas local a la vista. El valor que viaja en la API y el que se guarda son siempre las minúsculas.

### 2. `PATCH` parcial, con el título siempre obligatorio

`PATCH /api/v1/tasks/:id` con cuerpo `{ title, status?, assigneeId? }`:

- `title` es obligatorio en toda actualización, según la decisión tomada.
- Un campo ausente conserva su valor actual.
- Vaciar el responsable se pide de forma explícita enviando `assigneeId: null`.

Esto obliga a distinguir «ausente» de «nulo»: en VineJS, `vine.number().exists(...).nullable().optional()` deja el campo fuera del objeto validado cuando no viaja, y a `null` cuando viaja vacío, así que el controlador decide con `'assigneeId' in payload`. **Verificar esta semántica contra los `.d.ts` reales de `@vinejs/vine` antes de darla por buena**, no contra la memoria de versiones anteriores.

*Alternativas descartadas:* un `PUT` de reemplazo total obligaría a que cambiar el estado desde una fila reenviase también el responsable, y una fila que no muestra el identificador del responsable no lo tiene a mano; además convertiría cualquier omisión en un borrado silencioso. Un `PATCH` con `title` también opcional contradice la decisión explícita de que el título es obligatorio al actualizar.

### 3. El responsable se expone con un transformer propio y reducido

`TaskTransformer` devuelve `id`, `title`, `status` y `assignee`; `assignee` es `null` o el resultado de `TaskAssigneeTransformer`, que expone únicamente `id`, `fullName` e `initials`. No se reutiliza `UserTransformer`: ese incluye `email`, `createdAt` y `updatedAt`, y la nota de la historia E3-1 avisa de que en cuanto el cliente consume esos datos ya no se recortan sin romperlo.

`fullName` es nullable en `users`. La interfaz muestra `fullName ?? 'Sin nombre'`, el mismo criterio que ya aplica `profile-page.tsx`. Queda anotado como pregunta abierta en el proposal.

Las marcas de tiempo de la tarea (`createdAt`, `updatedAt`) **no se exponen**: la lista no las usa, no hay vista de detalle, y exponerlas invita a que la interfaz derive de ellas el orden o una señal de urgencia que la especificación prohíbe.

El listado precarga el responsable (`Task.query().preload('assignee')`) para no incurrir en una consulta por fila.

### 4. La consulta no lleva `orderBy`, y nada aguas abajo asume un orden

No hay regla de ordenación decidida (PA-3), así que no se inventa ninguna: la consulta del listado no añade `orderBy`, la especificación no declara orden y **ningún test de integración afirma en qué posición sale una tarea** — se comprueba pertenencia al conjunto, nunca índices.

Esto deja un orden no determinista, que es honesto respecto a la decisión pendiente pero incómodo en pantalla: una fila podría saltar de sitio al recargar. La mitigación es puramente técnica y no fija ninguna regla de producto: **la interfaz conserva el orden en que recibió la lista y sustituye la fila actualizada en su sitio**, en lugar de volver a pedir la lista entera tras cada cambio. Así nada salta durante una sesión, y el día que se decida el criterio se añade el `orderBy` sin tocar nada más.

### 5. El título no lleva longitud máxima

Columna `text`, y en el validador `vine.string().trim().minLength(1)` sin `maxLength`. El umbral de «demasiado largo» es una decisión de producto sin tomar (PA-9) y la propia historia dice que aquí no se invente ninguno. `.trim()` normaliza además el valor guardado, de modo que una cadena de espacios cae en `minLength(1)` y un título con espacios sobrantes se guarda limpio.

Consecuencia asumida y anotada como riesgo: el campo queda sin cota. Es aceptable en un proyecto de práctica y debe resolverse antes de cualquier uso real.

### 6. Estructura de ficheros

**Backend**

| Fichero | Contenido |
|---|---|
| `database/migrations/<ts>_create_tasks_table.ts` | `id`, `title` (text, not null), `status` (string, not null, default `pendiente`), `assignee_id` (integer, nullable, FK a `users.id`), `created_at`, `updated_at` |
| `app/models/task.ts` | Extiende `TaskSchema`, declara `STATUSES`, el tipo `TaskStatus` y la relación `belongsTo` con `User` |
| `app/validators/task.ts` | `createTaskValidator` y `updateTaskValidator`, con los builders de campo compartidos como ya hace `validators/user.ts` |
| `app/transformers/task_transformer.ts` | Tarea completa, con el responsable anidado |
| `app/transformers/task_assignee_transformer.ts` | Responsable reducido |
| `app/controllers/tasks_controller.ts` | `index`, `store`, `update` |
| `start/routes.ts` | Grupo `tasks` bajo `/api/v1`, con `.use(middleware.auth())` |

Tras la migración hay que correr `node ace migration:run` (regenera `database/schema.ts`) y `npm run format`, y arrancar el servidor o los tests para regenerar `.adonisjs/server/controllers.ts` y el registro Tuyau. Los tres diffs se commitean.

**Frontend**

| Fichero | Contenido |
|---|---|
| `src/lib/types.ts` | `TaskStatus`, `TaskAssignee`, `Task`, `CreateTaskPayload`, `UpdateTaskPayload` |
| `src/lib/api.ts` | `PATCH` admitido en `request`, `listTasks`, `createTask`, `updateTask`, etiquetas y traducciones de los campos nuevos |
| `src/pages/tasks-page.tsx` | Carga la lista, sostiene su estado y compone las piezas de abajo |
| `src/components/task-row.tsx` | Título, responsable por nombre y control de estado |
| `src/components/task-status-control.tsx` | Los tres destinos como botones |
| `src/components/new-task-form.tsx` | Un solo campo: el título |
| `src/components/tasks-empty-state.tsx` | Explicación y llamada a crear la primera |
| `src/routes/app-routes.tsx` | Ruta `/tasks` dentro de `ProtectedRoute` y destino por defecto |

### 7. El control de estado son tres botones, no un desplegable

Un botón por estado, con el actual marcado por variante (`default` frente a `outline`). Cumple los tres criterios a la vez: el cambio es un solo clic desde la fila, no hay diálogo ni campo que rellenar, y los únicos destinos ofrecidos están literalmente a la vista, que es lo que pide E2-4 CA-3. Y no requiere ninguna dependencia nueva: `Button` ya está en `components/ui/`.

*Alternativa descartada:* un `Select` de shadcn arrastraría `@radix-ui/react-select`, prohibido por el encargo, y además escondería los destinos tras una interacción previa.

### 8. El cambio de estado se pinta antes de confirmarse, y se revierte si falla

La especificación exige que el nuevo estado se refleje «de inmediato». La fila aplica el cambio en el estado local, lanza el `PATCH` y, si la respuesta falla, restaura el estado anterior y muestra el error con el `Alert` que ya existe. Mientras la petición está en vuelo los tres botones de esa fila quedan deshabilitados, para no encadenar cambios sobre una respuesta que aún no llegó.

### 9. `/tasks` pasa a ser el destino por defecto de la aplicación

Hoy el comodín `*` lleva a `/profile`. Las historias describen la lista como lo que se ve al abrir la aplicación, así que el comodín y el destino tras iniciar sesión pasan a `/tasks`, y `/profile` sigue accesible desde un enlace en la cabecera de la lista. `PublicOnlyRoute` y `ProtectedRoute` no cambian.

### 10. Base de pruebas: fichero de base de datos propio para la suite

`config/database.ts` pasa a leer el nombre del fichero de una variable de entorno con valor por defecto:

```
filename: app.tmpPath(env.get('DB_FILENAME', 'db.sqlite3'))
```

La variable se da de alta con `node ace env:add` (la añade a `.env`, `.env.example` y al schema de `start/env.ts`), y `.env.test` la fija a `db.test.sqlite3`. Es la única modificación de un fichero de configuración existente, y es la que evita que correr la suite borre la base de datos con la que se está desarrollando.

Sobre esa base:

- `tests/bootstrap.ts`: `runnerHooks.setup` migra la base de pruebas antes de la tanda (`testUtils.db().migrate()`), y devuelve el `teardown` que la deshace.
- Cada grupo de tests trunca las tablas entre tests (`testUtils.db().truncate()` en `group.each.setup`), de modo que ningún test dependa de lo que dejó el anterior — importante porque la lista es global y compartida.
- `tests/helpers/index.ts`: fábrica de usuarios con datos únicos por llamada. La autenticación se resuelve con `.loginAs(user)` del `authApiClient` que ya está enchufado en el bootstrap, sin fabricar tokens a mano.
- Las peticiones se hacen con el `apiClient` de Japa, que está tipado contra el registro Tuyau: si una ruta o un payload cambian, el test deja de compilar.

*Alternativa descartada:* transacción global por test (`testUtils.db().withGlobalTransaction()`). SQLite con `better-sqlite3` y una sola conexión lo tolera, pero el truncado es más predecible y no interfiere con el servidor HTTP que la suite `functional` levanta.

**Cobertura de la suite** — un fichero por área, todos en `tests/functional/`:

| Fichero | Cubre |
|---|---|
| `tasks_list.spec.ts` | Lista idéntica para dos personas, tarea ajena visible, contenido de cada tarea, responsable reducido sin datos de cuenta, ausencia de fechas y de vencimiento, lista vacía, 401 sin credencial |
| `tasks_create.spec.ts` | Alta con solo el título, defaults de estado y responsable, sobrescritura de ambos, responsable vacío explícito, título ausente / vacío / solo espacios, responsable inexistente, estado inválido y estado con otra capitalización, varios campos inválidos a la vez, 401 |
| `tasks_update.spec.ts` | Cambio de estado en ambos sentidos y con salto, cambio sobre tarea ajena y sobre tarea sin responsable, reasignación y vaciado del responsable, título obligatorio también al actualizar, campos no mencionados intactos, tarea inexistente, 401 |

Un test de unidad no aporta aquí: todo lo que la especificación describe es comportamiento observable de la API.

## Risks / Trade-offs

- **La lista sale sin orden determinista** → Es el precio de no inventar PA-3. Se contiene con la sustitución en sitio del punto 4, y ningún test ni ninguna vista asume posición, así que la decisión posterior es aditiva.
- **El título no tiene cota de longitud** → Anotado como pregunta abierta (PA-9). Nada del código lo da por acotado, de modo que añadir el límite el día que se decida es cambiar una línea del validador.
- **Cualquiera puede cambiar cualquier tarea, y marcar «hecho» cuesta un clic sin confirmación** → Es exactamente lo decidido, y PA-7 ya señala el riesgo. Sin borrado ni historial, un cambio equivocado se deshace con otro clic, que es el único camino de vuelta que este change ofrece.
- **Dos personas editando la misma tarea a la vez: gana la última** → Sin bloqueo optimista ni aviso. Consciente y fuera de alcance (PA-8, E3-2).
- **La actualización optimista puede mostrar un estado que no llegó a guardarse** → Mitigado con la reversión y el aviso del punto 8; el estado local nunca queda por delante de una respuesta de error.
- **Tocar `config/database.ts` afecta a todo el proyecto, no solo a las pruebas** → El valor por defecto de `DB_FILENAME` es el nombre actual, así que un `.env` que no la declare se comporta exactamente como hoy. Aun así, hay que actualizar `.env.example` y documentar la variable.
- **`.adonisjs/` versionado puede quedar desincronizado** → Si el registro no se regenera, los tests dejan de compilar contra rutas que sí existen. Parte de la definición de terminado: arrancar el servidor o la suite y commitear el diff generado.
- **La suite `functional` levanta el servidor HTTP y comparte proceso** → Con truncado entre tests y datos únicos por usuario creado, no hay colisión de emails entre ficheros.

## Migration Plan

No hay datos previos que migrar: la tabla `tasks` nace vacía. La migración es aditiva y `down()` la elimina, de modo que revertir es `node ace migration:rollback`. El único cambio en configuración existente (`DB_FILENAME`) es retrocompatible por su valor por defecto.

Orden de despliegue en local: migración → regenerar esquema y código generado → backend → frontend. La interfaz no funciona sin la API, así que no hay ventana en la que una versión hable con la otra.
