# Design

## Context

La motivación y el alcance están en `proposal.md`, y el comportamiento observable en `specs/tasks/spec.md`. Aquí solo va lo que condiciona el cómo.

**Backend.** AdonisJS 7, Lucid 22 y VineJS 4 sobre SQLite.

- Los modelos no declaran columnas: extienden la clase que se genera en `database/schema.ts` al migrar.
- Los controladores se referencian desde `#generated/controllers`, y ese fichero se regenera al arrancar.
- Toda respuesta pasa por `serialize()`, que envuelve el resultado en `{ data }`, con un transformer que elige qué campos salen.
- El bodyparser ya recorta los espacios del principio y del final, y convierte las cadenas vacías en `null`. Por eso un título de solo espacios llega como `null` y falla la regla `required`. Es el valor por defecto (`trimWhitespaces`) y `config/bodyparser.ts` no lo cambia; se comprobó con `curl` contra el registro de cuentas.

**Frontend.** React 19, react-router y Tailwind v4.

- Los únicos componentes de `components/ui/` son `alert`, `button`, `card`, `input` y `label`. No se pueden añadir dependencias.
- Toda llamada a la API pasa por `lib/api.ts`, que hoy solo admite `GET` y `POST` y traduce los errores 400, 401 y 422; cualquier otro código acaba en un mensaje genérico de servidor.
- Los formularios usan `useAuthForm`, que reparte los errores entre los campos y el aviso general, y `FieldError`.
- La protección de rutas la hace `ProtectedRoute`.

## Goals / Non-Goals

**Goals:**

- Seguir las convenciones existentes en cada capa, sin introducir patrones nuevos: migración, modelo sobre el esquema generado, transformer, validador con `vine.create`, rutas de grupo con `middleware.auth()` y llamadas centralizadas en `lib/api.ts`.
- Que el payload de tarea sea mínimo desde el primer día. Un dato expuesto que el cliente empieza a consumir ya no se puede recortar sin romperlo (nota de E3-1).

**Non-Goals:**

- Ordenar la lista en ninguna capa. No hay `orderBy` en la consulta ni `sort` en el cliente (PA-3).
- Paginar. Con el volumen del MVP se devuelve la lista entera.
- Sincronización en vivo o polling (E3-2).
- Un estado global de tareas. La lista vive en el estado local de su página.
- Tests: el change no los incluye por decisión explícita.

## Decisions

### D1. La tabla `tasks` lleva el estado como enum con CHECK

La migración crea estas columnas:

- `id`;
- `title`, `string(255)`, no nulo;
- `status`, con `table.enu('status', ['pending', 'in_progress', 'done'])`, no nulo y con `pending` por defecto;
- `assignee_id`, entero no nulo que referencia `users.id`;
- `created_at` y `updated_at`, por convención del proyecto. Nunca se exponen.

En SQLite, `enu` se traduce en un `CHECK`, así que el conjunto cerrado se protege también en base de datos y no solo en el validador.

- *Alternativa descartada:* una tabla de estados. Se descarta porque RF-8 prohíbe añadir o renombrar estados, y una tabla invita justo a eso.
- *Alternativa descartada:* `ON DELETE CASCADE` en `assignee_id`. Hoy no se borran cuentas, y en cuanto existiera esa operación, la cascada se llevaría por delante trabajo del equipo. Se deja la restricción por defecto.

No hay columna de vencimiento ni de creador. La de creador no hace falta porque el responsable inicial ya es el creador y ningún requisito pide distinguirlos.

### D2. Modelo `Task` con relación `assignee`

`Task` extiende `TaskSchema` y declara una relación `belongsTo` con `User` llamada `assignee`, con `foreignKey: 'assigneeId'`. Los valores de estado se definen una sola vez en un `const` del modelo (`TASK_STATUSES`). De ahí se derivan el tipo `TaskStatus`, el validador y la migración.

### D3. Transformer con allowlist explícita

`TaskTransformer` devuelve `id`, `title`, `status` y `assignee: { id, fullName }`, y este último se construye a mano a partir de la relación precargada. No se reutiliza `UserTransformer`: expondría `email`, `initials` y las fechas, que la lista no usa y que la spec prohíbe. El controlador siempre precarga o carga `assignee` antes de transformar.

### D4. Validadores

- **Creación:** `{ title: vine.string().trim().maxLength(255) }`. El `trim()` repite lo que ya hace el bodyparser, para que el comportamiento de la spec no dependa de su configuración. Las claves no declaradas se descartan, así que no se pueden colar ni `status` ni `assigneeId`.
- **Actualización:**
  - `status: vine.enum(TASK_STATUSES).optional().requiredIfMissing('assigneeId')`;
  - `assigneeId: vine.number().exists({ table: 'users', column: 'id' }).optional()`.

  Si no llega ninguno de los dos campos, la validación falla con `422` en `status`. Las firmas de `exists` y `requiredIfAnyMissing`/`requiredIfMissing` se han comprobado en los `.d.ts` de Lucid y VineJS de la versión instalada.

- *Alternativa descartada:* comprobar el cuerpo vacío a mano en el controlador. Se descarta para no mezclar validación y lógica, y para que el error salga con el mismo formato `{ errors: [...] }` que el resto.

### D5. Controlador `TasksController` con tres acciones y rutas mínimas

Las rutas van bajo `/api/v1/tasks`, en un grupo con `.prefix('tasks').as('tasks').use(middleware.auth())`, siguiendo la convención `.prefix().as()` de los grupos existentes para que los nombres del registro generado sean coherentes:

- `router.get('/', [controllers.Tasks, 'index'])`
- `router.post('/', [controllers.Tasks, 'store'])`
- `router.patch('/:id', [controllers.Tasks, 'update'])`

Las acciones hacen lo siguiente:

- `index`: `Task.query().preload('assignee')`, sin ordenar.
- `store`: crea la tarea con `assigneeId` igual al usuario autenticado y el estado por defecto, carga `assignee` y responde `response.status(201)` y `serialize(...)`.
- `update`: `Task.findOrFail(params.id)`. El `E_ROW_NOT_FOUND` se convierte en `404` en el handler por defecto. Después hace `merge` de lo validado, `save`, `load('assignee')` y `serialize`.

No se declara `show` ni `destroy`, así que esas rutas no existen y responden `404`.

Se usa `201` en la creación, aunque el registro de cuentas responda `200`, porque es lo correcto para un recurso nuevo y no rompe a nadie. Tras arrancar el servidor, se commitean el esquema regenerado y `.adonisjs/`.

### D6. Frontend: página, ruta y enlaces

- Hay una ruta nueva `/tasks` dentro del `ProtectedRoute` existente.
- No se tocan las redirecciones por defecto a `/profile`: cambiar la pantalla de aterrizaje modificaría la capability `auth`.
- El perfil gana un enlace «Ver tareas del equipo» y la lista un enlace «Mi perfil». Los dos son `<Button asChild variant="outline"><Link …/></Button>`, para no anidar `<a>` dentro de `<button>`.

La página `pages/tasks-page.tsx` sigue el marco visual de las pantallas actuales (fondo `bg-muted/40` con `Card`) y tiene estas piezas:

- una cabecera;
- el formulario de creación;
- un `Alert` para los errores de carga o de cambio de estado;
- la lista o el estado vacío.

La página tiene tres fases: `loading`, `error` y `ready`.

- En `loading` se ve un indicador de carga.
- En `error` se ve un `Alert` con el mensaje y, debajo, un `Button` «Reintentar». Es una composición en la página, porque `components/ui` no tiene un `Alert` con acción.
- Solo en `ready` se pintan el formulario de creación y la lista o el estado vacío.

Así no se puede crear una tarea sobre una lista sin cargar, y no hay carrera entre la carga y el añadido local. Los errores de cambio de estado se muestran en un `Alert` aparte, sin «Reintentar», encima de la lista.

Las filas viven en `components/task-row.tsx` y el selector de estado en `components/task-status-toggle.tsx`.

### D7. Selector de estado con tres `Button`

`task-status-toggle` renderiza un `role="group"` con tres `Button`:

- el estado actual usa `variant="default"` y lleva `aria-pressed="true"`;
- los otros dos usan `variant="outline"`.

Las etiquetas «Pendiente», «En curso» y «Hecho» salen de un único mapa `TASK_STATUS_LABELS` en `lib/task-status.ts`. Los identificadores en inglés nunca se pintan.

- *Alternativa descartada:* un `<select>` nativo, por decisión del usuario. Son dos interacciones en vez de una, y oculta los destinos.

### D8. Cambio de estado optimista con reversión

Al pulsar un estado:

1. La fila se actualiza en local de inmediato (CA-1 de E2-4) y sus botones se deshabilitan mientras dura la petición.
2. Se lanza `PATCH`.
3. Si la petición falla, se restaura el estado anterior **solo de esa tarea**: se busca por `id` en el estado actual, no se restaura una copia de la lista entera, para no pisar otras filas con peticiones en vuelo. Después se muestra el `Alert` con el mensaje del `ApiError`, o con uno genérico. Si el fallo es `401`, se llama a `logout()` del contexto de auth y `ProtectedRoute` lleva a `/login`.

Si al terminar la petición la fila sigue en el estado optimista, se sustituye por la tarea que devuelve el servidor.

- *Alternativa descartada:* esperar a la respuesta para pintar. Es más simple, pero añade latencia visible justo en el gesto que la historia quiere abaratar.

### D9. Creación: validación local y añadido sin recargar

El formulario reutiliza `useAuthForm(FIELDS)`, con `const FIELDS = ['title'] as const` a nivel de módulo, como hacen las pantallas de login y registro. Así el array no se recrea en cada render ni invalida el `submit` memorizado. Aunque el nombre del hook diga «auth», es genérico, y renombrarlo queda fuera del alcance.

Si la creación responde `401`, la acción que se pasa a `submit` llama a `logout()` antes de relanzar el error, igual que en D8, para que nadie quede atascado en `/tasks` con un aviso de sesión caducada que no puede resolver.

Antes de llamar al servidor:

- si el título recortado queda vacío, `failWith('title', 'Falta rellenar el título.')`;
- si supera los 255 caracteres, `failWith('title', ...)` con el mismo texto que produciría la traducción del `maxLength`.

El servidor sigue siendo la validación de verdad. El `Input` no lleva el atributo `maxLength`, porque recortaría en silencio lo que se pega (CA-3 de E2-2).

Si la creación va bien, la tarea devuelta se **añade al final** del array local y el campo se vacía. Añadirla al final no es una regla de orden: es lo mínimo para que aparezca sin recargar sin aplicar ningún criterio de ordenación.

### D10. `lib/api.ts`

- `RequestOptions.method` admite también `'PATCH'`.
- Se añaden `listTasks(token)`, `createTask(token, { title })` y `updateTask(token, id, { status?, assigneeId? })`. El cliente solo envía `status`, porque no hay gesto de reasignación.
- `FIELD_LABELS` incorpora `title: 'el título'`, `status: 'el estado'` y `assigneeId: 'el responsable'`.
- El `404` no se traduce de forma global en `toApiError`, porque un 404 de otra llamada (o una URL de API mal configurada) daría un texto engañoso. Lo traduce solo `updateTask`, como «Esa tarea ya no existe. Recarga la lista.».
- `lib/types.ts` gana los tipos `Task`, `TaskStatus` y `TaskAssignee`.

## Risks / Trade-offs

- **[Riesgo] Sin orden definido, la lista puede salir en cualquier orden entre cargas.** CA-5 de E3-1 («enumerar el trabajo de cada persona») queda debilitado. → Mitigación: se declara como punto abierto PA-3 en el proposal y en la spec («el orden no está garantizado»). En la práctica, SQLite devuelve el orden de inserción, pero no se depende de ello.
- **[Riesgo] La tarea recién creada aparece al final en local y puede cambiar de sitio al recargar.** → Mitigación: aceptado mientras PA-3 siga abierto. Lo resuelve cualquier regla de orden futura.
- **[Riesgo] Dos personas cambian el estado de la misma tarea a la vez y gana la última escritura**, sin aviso (PA-8). → Mitigación: aceptado. La lista es correcta en el momento de cargarla, y el refresco en vivo es E3-2.
- **[Riesgo] La API permite reasignar, pero ninguna pantalla lo hace.** Es superficie sin consumidor. → Mitigación: es una restricción explícita del usuario, está acotada por `exists` y la cubre la spec.
- **[Riesgo] Con `exists`, una cuenta autenticada puede averiguar qué ids de cuenta existen**, porque responde `422` o `200` según el caso. → Mitigación: aceptado. Los ids son secuenciales y la reasignación libre es una decisión explícita; no expone ningún dato de la cuenta.
- **[Trade-off] El límite de 255 caracteres es técnico, no de producto (PA-9).** → Mitigación: está centralizado en el validador, la migración y el check del cliente, y se puede cambiar con una migración.
- **[Trade-off] Reutilizar `useAuthForm` para un formulario que no es de auth.** → Mitigación: el hook no tiene ninguna dependencia de auth. El nombre se puede corregir en un refactor aparte.
- **[Riesgo] `requiredIfMissing` produce el error del cuerpo vacío en el campo `status`**, aunque el problema sea de los dos campos. → Mitigación: la spec solo exige `422` en ese caso, y el cliente nunca envía un cuerpo vacío.

## Migration Plan

1. Ejecutar `node ace migration:run`. Crea la tabla `tasks` y regenera `database/schema.ts`.
2. Arrancar el servidor para regenerar `.adonisjs/`.
3. Commitear todo junto.

**Rollback:** `node ace migration:rollback`, que borra la tabla `tasks`; no hay datos previos que preservar, así que se pueden revertir los commits sin más. No hay cambios incompatibles en las rutas existentes.
