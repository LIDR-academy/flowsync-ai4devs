# Arquitectura de FlowSync

Tres niveles del modelo C4, de fuera hacia dentro: el **contexto** dice con quién habla FlowSync, los **contenedores** qué piezas se ejecutan por separado, y los **componentes** qué hay dentro de la API y de la SPA. Los diagramas son Mermaid dentro de este fichero, así que se versionan y se revisan en el mismo diff que el código que describen.

## Diagrama de contexto

FlowSync en ejecución no depende de ningún sistema externo: ni correo, ni pasarelas, ni almacenamiento ajeno. Lo que sí tiene alrededor es su **ciclo de desarrollo**, y se dibuja aparte porque falla de otra forma: si GitHub o Anthropic no responden, FlowSync sigue funcionando y lo que se para es la verificación.

```mermaid
C4Context
    title Diagrama de contexto de FlowSync

    Person(miembro, "Miembro del equipo", "Apunta tareas y ve en que anda el equipo sin preguntar")
    System(flowsync, "FlowSync", "Lista compartida de tareas con estado responsable y vencimiento")

    Person(dev, "Quien desarrolla", "Escribe specs codigo y pruebas y abre el PR")
    System_Ext(github, "GitHub", "Repositorio fork del curso y Actions con la verificacion en cada push")
    System_Ext(anthropic, "Anthropic", "API de Claude que usa el revisor adversarial desde CI")
    System_Ext(jira, "Jira", "Tablero LID de seguimiento. No es fuente de verdad")

    Rel(miembro, flowsync, "Usa desde el navegador")
    Rel(dev, github, "Empuja ramas y abre PR")
    Rel(github, anthropic, "Pide la revision del diff", "claude -p con CLAUDE_CODE_OAUTH_TOKEN")
    Rel(dev, jira, "Sigue el trabajo")
```

## Diagrama de contenedores

El diagrama muestra las piezas de FlowSync que se ejecutan por separado y cómo hablan entre
sí: la SPA de React que corre en el navegador, la API de AdonisJS que escucha en el puerto
3333, el fichero SQLite donde vive todo el estado, y el `localStorage` del navegador, que es
el único sitio donde persiste la sesión. Es un diagrama de contenedores, así que no entra en
los controladores, modelos ni transformers de dentro de la API: eso queda resumido debajo.
Todo lo dibujado está leído del código —`start/routes.ts`, `config/database.ts`,
`config/auth.ts`, `frontend/src/lib/api.ts` y `frontend/src/routes/app-routes.tsx`—; lo que no
se ha podido verificar leyendo ficheros no aparece.

```mermaid
C4Container
    title Diagrama de contenedores de FlowSync

    Person(miembro, "Miembro del equipo", "Se registra inicia sesion y trabaja sobre la lista compartida de tareas")

    System_Boundary(flowsync, "FlowSync") {
        Container(spa, "SPA de FlowSync", "React 19 + react-router + Vite 8 + Tailwind v4 + shadcn/ui", "Pantallas de login registro perfil lista de tareas y tarea suelta. Los guards ProtectedRoute y PublicOnlyRoute deciden a que se llega con sesion y a que sin ella")
        ContainerDb(storage, "localStorage del navegador", "Web Storage API", "Guarda el token de acceso bajo la clave flowsync.token. Al arrancar la SPA lo revalida contra el perfil antes de darlo por bueno")
        Container(api, "API de FlowSync", "AdonisJS 7 sobre Node escuchando en el puerto 3333", "Expone las rutas bajo /api/v1. Valida con VineJS 4 autentica con access tokens opacos y devuelve toda respuesta envuelta en data por el serializer del ApiProvider")
        ContainerDb(db, "Base de datos de FlowSync", "SQLite mediante better-sqlite3 en backend/tmp/db.sqlite3, y db-test.sqlite3 en pruebas", "Tablas users auth_access_tokens y tasks. El esquema se genera desde las migraciones")
    }

    Rel(miembro, spa, "Usa desde el navegador", "HTTP en el puerto 5173")
    Rel(spa, storage, "Lee guarda y borra el token de sesion", "Web Storage API")
    Rel(spa, api, "Llama a /api/v1 con la cabecera Authorization Bearer", "JSON sobre HTTP con fetch desde src/lib/api.ts")
    Rel(api, db, "Lee y escribe", "SQL a traves de Lucid 22")
```

## Diagramas de componentes

### Dentro de la API

El camino de una petición, de la ruta a la base y de vuelta. Las flechas son dependencias leídas de los imports, no llamadas en tiempo de ejecución.

```mermaid
C4Component
    title Componentes de la API de FlowSync

    Container_Ext(spa, "SPA de FlowSync", "React 19")
    ContainerDb_Ext(db, "Base de datos", "SQLite")

    Container_Boundary(api, "API de FlowSync") {
        Component(routes, "Rutas", "start/routes.ts", "Todo bajo /api/v1 y el documento OpenAPI en /api")
        Component(kernel, "Middleware", "start/kernel.ts", "silent_auth en todas y auth en account y tasks. Fuerza JSON")
        Component(controllers, "Controladores", "app/controllers", "Uno por recurso. Validan antes de resolver el id")
        Component(validators, "Validadores", "VineJS 4 en app/validators", "Enum cerrado de estados y dia de referencia obligatorio")
        Component(models, "Modelos", "Lucid 22 en app/models", "User y Task sobre database/schema.ts generado. isOverdueOn es la unica regla de vencida")
        Component(transformers, "Transformers", "app/transformers", "Deciden que sale. Lista y tarea suelta son objetos distintos")
        Component(serializer, "Serializer", "providers/api_provider.ts", "Envuelve toda respuesta de exito en data")
        Component(handler, "Manejador de errores", "app/exceptions/handler.ts", "Forma unica de error y sin traza ni SQL")
        Component(openapi, "Documento OpenAPI", "app/openapi", "Construido desde los decoradores una vez por proceso")
    }

    Rel(spa, routes, "JSON sobre HTTP con Bearer")
    Rel(routes, kernel, "pasa por")
    Rel(routes, controllers, "despacha a")
    Rel(routes, openapi, "sirve")
    Rel(controllers, validators, "valida con")
    Rel(controllers, models, "lee y escribe con")
    Rel(controllers, transformers, "da forma con")
    Rel(controllers, serializer, "responde con")
    Rel(controllers, handler, "delega los errores en")
    Rel(models, db, "SQL")
```

### Dentro de la SPA

```mermaid
C4Component
    title Componentes de la SPA de FlowSync

    Person(miembro, "Miembro del equipo")
    Container_Ext(api, "API de FlowSync", "AdonisJS 7")
    ContainerDb_Ext(storage, "localStorage", "Web Storage API")

    Container_Boundary(spa, "SPA de FlowSync") {
        Component(approutes, "Rutas y guards", "src/routes", "ProtectedRoute y PublicOnlyRoute. Lo desconocido va a /tasks")
        Component(pages, "Pantallas", "src/pages", "Login registro perfil lista y tarea suelta")
        Component(components, "Componentes", "src/components", "Fila de tarea y filtro. ui es generado por shadcn")
        Component(auth, "Sesion", "src/auth", "Guarda el token y lo revalida al arrancar. Un solo dueno del cierre por 401")
        Component(apiclient, "Cliente de la API", "src/lib/api.ts", "Unico punto de contacto. Desenvuelve data y traduce errores al castellano")
        Component(lista, "Colocacion en la lista", "src/lib/lista.ts", "Donde entra una tarea recien creada")
    }

    Rel(miembro, approutes, "navega")
    Rel(approutes, auth, "consulta el estado de")
    Rel(approutes, pages, "muestra")
    Rel(pages, components, "compone con")
    Rel(pages, apiclient, "llama a")
    Rel(pages, lista, "coloca con")
    Rel(auth, apiclient, "revalida y se suscribe al 401 de")
    Rel(auth, storage, "lee y guarda el token en")
    Rel(apiclient, api, "fetch a /api/v1")
```

## Modelo de datos

Leído de `backend/database/migrations/`, que es la única forma de cambiarlo; `database/schema.ts` se genera de ahí. Tres tablas, dos de ellas del starter de autenticación.

```mermaid
erDiagram
    users {
        int id PK
        string full_name "nulable, no opcional (H-04)"
        string email "254 max, unico sin distinguir mayusculas (H-11)"
        string password "hash scrypt"
        timestamp created_at
        timestamp updated_at
    }
    auth_access_tokens {
        int id PK
        int tokenable_id FK "users.id, on delete cascade"
        string type
        string name
        string hash "el token opaco nunca se guarda en claro"
        text abilities
        timestamp created_at
        timestamp updated_at
        timestamp last_used_at
        timestamp expires_at "siempre null: no caducan"
    }
    tasks {
        int id PK
        string title "200 max"
        string status "pending in_progress done, por defecto pending"
        int assignee_id FK "users.id, on delete cascade"
        date due_date "nulable"
        timestamp created_at
        timestamp updated_at
    }
    users ||--o{ auth_access_tokens : "abre sesiones"
    users ||--o{ tasks : "es responsable de"
```

Lo que el esquema **no** impone y decide la aplicación: que `status` sea uno de tres (lo impone el validador con `vine.enum`, no un `CHECK`); que el email se guarde en minúsculas (lo normaliza el validador, y una migración lo hizo con lo ya guardado); y qué es «vencida», que no se almacena: se calcula al mirar. La política de migraciones, con qué se puede deshacer y qué no, en [`backend/README.md`](../backend/README.md#cambiar-el-modelo-de-datos).

## Qué hay dentro de cada contenedor

**API de FlowSync** — las cuatro capas que atraviesa cada petición, en orden:

- **Rutas** ([`backend/start/routes.ts`](../backend/start/routes.ts)), todas bajo `/api/v1`.
  Referencian a los controladores por el mapa generado en `.adonisjs/server/controllers.ts`,
  no con imports perezosos. `silent_auth_middleware` corre en todas; la protección real es
  `middleware.auth()` sobre los grupos `account` y `tasks`.

  | Método | Ruta | Controlador | Auth |
  |---|---|---|---|
  | POST | `/api/v1/auth/signup` | `NewAccountController.store` | no |
  | POST | `/api/v1/auth/login` | `AccessTokensController.store` | no |
  | GET | `/api/v1/account/profile` | `ProfileController.show` | sí |
  | POST | `/api/v1/account/logout` | `AccessTokensController.destroy` | sí |
  | GET | `/api/v1/tasks` | `TasksController.index` | sí |
  | POST | `/api/v1/tasks` | `TasksController.store` | sí |
  | GET | `/api/v1/tasks/:id` | `TasksController.show` | sí |
  | PATCH | `/api/v1/tasks/:id/status` | `TaskStatusesController.update` | sí |
  | PUT | `/api/v1/tasks/:id/due-date` | `TaskDueDatesController.update` | sí |
  | GET | `/api`, `/api.json`, `/api.yaml` | documento OpenAPI de `@foadonis/openapi` | no |

  El documento lo construye [`app/openapi/document.ts`](../backend/app/openapi/document.ts) desde
  los decoradores de los controladores, una sola vez por proceso (H-26 y H-35), y su copia
  versionada vive en [`docs/api/openapi.json`](api/openapi.json) ([ADR-0007](adr/0007-el-contrato-se-genera-se-versiona-y-se-vigila-la-deriva.md)).

- **Validadores** ([`backend/app/validators/`](../backend/app/validators/)) — VineJS 4 con
  `vine.create()`, consumidos con `request.validateUsing(...)`. `user.ts` cubre registro y
  login; `task.ts` cubre la creación, el filtro por estado, el cambio de estado, el día de
  referencia y la fecha de vencimiento.

- **Modelos** ([`backend/app/models/`](../backend/app/models/)) — `User` y `Task`. No declaran
  columnas: extienden las clases de `database/schema.ts`, que está autogenerado desde las
  migraciones. `Task` aporta la relación `belongsTo` con su responsable y la única definición
  de «vencida» del sistema (`isOverdueOn`); `User` aporta el mixin de auth, el proveedor de
  access tokens y el getter `initials`.

- **Transformers** ([`backend/app/transformers/`](../backend/app/transformers/)) — deciden qué
  sale por el cable. `UserTransformer` para la cuenta propia; `TaskTransformer` para la lista;
  `TaskDetailTransformer` para la tarea suelta, que es la única que lleva fecha de vencimiento
  y condición de vencida; y `TaskAssigneeTransformer`, que recorta el responsable a lo justo
  para identificarlo. El envoltorio `{ data: ... }` lo pone
  [`providers/api_provider.ts`](../backend/providers/api_provider.ts), que inyecta
  `ctx.serialize()` en cada `HttpContext`.

- **Errores** ([`backend/app/exceptions/handler.ts`](../backend/app/exceptions/handler.ts)) —
  toda respuesta de error sale con la forma del proyecto y sin traza, rutas ni SQL, salvo que
  se encienda el volcado de depuración a propósito (H-19, [ADR-0005](adr/0005-el-volcado-de-depuracion-va-apagado.md)).

**Base de datos** — una conexión SQLite declarada en
[`backend/config/database.ts`](../backend/config/database.ts), que **elige el fichero según el
entorno**: `tmp/db.sqlite3` en desarrollo y `tmp/db-test.sqlite3` en pruebas, con `bin/test.ts`
forzando `NODE_ENV=test` ([ADR-0003](adr/0003-aislamiento-de-la-base-de-datos-en-pruebas.md)).
Tres tablas creadas por las migraciones de [`backend/database/migrations/`](../backend/database/migrations/):
`users`, `auth_access_tokens` y `tasks`, esta última con `assignee_id` apuntando a `users` con
`onDelete CASCADE` y una `due_date` nulable. Dos migraciones más normalizan el email existente a
minúsculas y lo hacen único sin distinguir mayúsculas (H-11).

**SPA de FlowSync** — [`frontend/src/lib/api.ts`](../frontend/src/lib/api.ts) es el único punto
de contacto con el backend: envuelve `fetch`, desenvuelve el `{ data }`, adjunta el `Bearer` y
traduce los errores de VineJS a `ApiError` con mensajes en castellano y `fieldErrors` por
campo. También es quien calcula el día de referencia local que exigen las lecturas con
vencimiento. La sesión vive en [`frontend/src/auth/`](../frontend/src/auth/) y las pantallas en
[`frontend/src/pages/`](../frontend/src/pages/), enrutadas por
[`app-routes.tsx`](../frontend/src/routes/app-routes.tsx): `/login`, `/register`, `/tasks`,
`/tasks/:id`, `/profile`, y cualquier otra cosa redirige a `/tasks`.

## Lo que no está dibujado, y por qué

- **No hay sistemas externos en ejecución.** No se ha encontrado en el código ninguna integración
  con correo, pasarelas, colas ni almacenamiento externo. Los tres sistemas externos del diagrama
  de contexto -GitHub, Anthropic y Jira- son del ciclo de desarrollo, no de FlowSync corriendo.
- **El registro Tuyau de `.adonisjs/client/registry/` no es una dependencia de la SPA.** Está
  pensado para consumo tipado desde el frontend, pero hoy `frontend/src/` no lo referencia en
  ningún sitio: quien lo usa es `backend/tests/bootstrap.ts`, para tipar el `apiClient` de Japa.
  Dibujarlo como un enlace entre SPA y API sería dibujar una intención, no el código.
- **El guard `web` de sesión no se dibuja.** Está configurado en `config/auth.ts` junto al
  guard `api`, pero ninguna ruta lo usa; el `default` es `api` y toda la autenticación real va
  por access tokens opacos.
- **Los tests no son un contenedor.** Las suites de `backend/tests/`, Vitest y Playwright no se
  ejecutan en producción. Escriben en `tmp/db-test.sqlite3`, nunca en la base de desarrollo:
  lo decide `config/database.ts` por entorno y lo fija `aislamiento.spec.ts`
  ([ADR-0003](adr/0003-aislamiento-de-la-base-de-datos-en-pruebas.md)). Hasta el 2026-09-02 este
  párrafo decía lo contrario, y era cierto en la rama del curso: es H-01.
