# Arquitectura — Diagrama de contenedores (C4)

Este diagrama muestra los contenedores reales del monorepo y cómo se comunican: la SPA de React (`frontend/`) consume la API AdonisJS (`backend/`) por HTTP/JSON usando `fetch` desde `src/lib/api.ts` (no se usa el cliente Tuyau generado, pese a que existe el registro `.adonisjs/client/registry/`), la API valida con VineJS, autentica con access tokens opacos (guard `api`, tabla `auth_access_tokens`) y persiste con Lucid sobre un único fichero SQLite (`tmp/db.sqlite3`). Dentro de la API se distinguen los controladores expuestos en `start/routes.ts`, los transformers que envuelven toda respuesta en `{ data: ... }`, y los modelos `User`/`Task`. Solo se dibuja lo verificado leyendo el código; no hay más contenedores (sin colas, cachés, servicios externos ni otra base de datos) en este repo.

```mermaid
C4Container
    title Diagrama de contenedores — FlowSync

    Person(user, "Usuario", "Miembro de un equipo que gestiona sus tareas")

    System_Boundary(flowsync, "FlowSync") {
        Container(spa, "Frontend SPA", "React 19 + Vite 8 + TypeScript", "Login/registro, perfil y listado/detalle de tareas. Único punto de llamadas a la API: src/lib/api.ts (fetch + Authorization: Bearer)")

        Container_Boundary(api, "Backend API") {
            Component(routes, "Rutas /api/v1", "AdonisJS Router", "start/routes.ts — auth, account, tasks")
            Component(middlewares, "Middleware", "AdonisJS", "silent_auth, auth (guard api), force_json_response")
            Component(controllers, "Controladores", "AdonisJS", "NewAccount, AccessTokens, Profile, Tasks, TaskStatuses, TaskDueDates")
            Component(validators, "Validadores", "VineJS 4", "app/validators/user.ts, app/validators/task.ts")
            Component(transformers, "Transformers", "BaseTransformer", "User/Task/TaskDetail/TaskAssignee — envuelven la respuesta vía ctx.serialize()")
            Component(models, "Modelos", "Lucid 22 (schema generado)", "User (withAuthFinder + DbAccessTokensProvider), Task (belongsTo User)")
        }

        ContainerDb(db, "Base de datos", "SQLite (better-sqlite3)", "tmp/db.sqlite3 — tablas users, tasks, auth_access_tokens")
    }

    Rel(user, spa, "Usa", "HTTPS/Navegador")
    Rel(spa, routes, "Llama a /api/v1/...", "JSON/HTTPS, Bearer token")
    Rel(routes, middlewares, "Pasa por")
    Rel(middlewares, controllers, "Despacha a")
    Rel(controllers, validators, "Valida request con")
    Rel(controllers, transformers, "Serializa respuesta con")
    Rel(controllers, models, "Lee/escribe vía")
    Rel(models, db, "Lucid ORM", "SQL")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Rutas cubiertas (`start/routes.ts`)

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
