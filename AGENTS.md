# AGENTS.md

Instrucciones para cualquier agente que trabaje en este repositorio, humano o modelo, en el [formato abierto](https://agents.md/). `CLAUDE.md` importa este fichero y añade solo lo propio de Claude Code. **Cabe en una pantalla larga a propósito**: bajo 200 líneas, y CI lo comprueba. Lo que necesita más espacio vive en una skill o en `docs/`, y desde aquí se enlaza.

## Qué es este repo

FlowSync: proyecto de práctica del curso (gestión de tareas en equipo). Monorepo sin workspaces ni `package.json` raíz — **todos los comandos se ejecutan desde `backend/` o desde `frontend/`**.

- `backend/` — API AdonisJS 7 + Lucid 22 + SQLite, escucha en `http://localhost:3333`
- `frontend/` — React 19 + Vite 8, escucha en `http://localhost:5173`

La rama `s1/start` es el punto de partida de los alumnos; `main` es la base del repo cliente.

## Comandos

### Backend (`cd backend`)

```bash
npm install
cp .env.example .env && node ace generate:key   # solo la primera vez
node ace migration:run                          # crea tmp/db.sqlite3 y regenera database/schema.ts
npm run dev                                     # node ace serve --hmr
npm test                                        # node ace test
npm run lint                                    # eslint
npm run format                                  # prettier --write
npm run format:check                            # lo que corre CI: sale 1 si algo no está formateado
npm run typecheck                               # tsc --noEmit
```

Tests (Japa). Dos suites declaradas en `adonisrc.ts`: `unit` (`tests/unit/**/*.spec.ts`, timeout 2s, sin base ni HTTP) y `functional` (`tests/functional/**/*.spec.ts`, timeout 30s, contra la API real). Hoy hay **92 pruebas**: 7 unit y 85 functional. Las 85 functional: 26 de `auth`, 44 de `tasks`, 6 de errores, 2 de aislamiento de la base, 6 que fijan los nombres de regla que el frontend traduce (H-05) y 1 sobre el documento OpenAPI servido (H-35). Las 7 unit son las reglas puras de los modelos: 4 de `isOverdueOn` y 3 de `initials`. Qué escenario cubre cada una en `docs/trazabilidad.md`; qué capa cubre qué, en `docs/estrategia-de-pruebas.md`. **Este es el único sitio que da el número**, y CI lo contrasta con lo que ejecuta Japa (`scripts/recuento-pruebas.mjs`): al añadir una prueba, se actualiza aquí, total y desglose.

Los ficheros de prueba declaran `group.each.setup(() => testUtils.db().withGlobalTransaction())`, que aísla un caso de otro dentro de la misma ejecución. Mantenlo al escribir uno nuevo.

Dos cosas del arnés que ahorran tiempo: el registro tipado de Tuyau tipa solo la respuesta de **éxito** de cada ruta, así que para leer un error o enviar un payload que el validador debe negar están los helpers de `tests/helpers/api.ts` (`errores`, `tarea`, `tareas`, `invalido`, `cuerpo`); y `assert.hasAllKeys` no existe en este plugin, es `assert.sameMembers` sobre `Object.keys`.

```bash
node ace test unit                    # una suite
node ace test --files=user            # filtrar por nombre de fichero
node ace test --tests="crea un user"  # filtrar por título de test
node ace test --groups=... --tags=... --failed --watch
node ace make:test --suite=functional # scaffolding de un fichero de test
```

La BD de tests está aislada **por construcción** ([ADR-0003](docs/adr/0003-aislamiento-de-la-base-de-datos-en-pruebas.md)): `config/database.ts` elige el fichero según el entorno y `bin/test.ts` fuerza `NODE_ENV=test` de forma incondicional, así que la suite no puede escribir sobre `tmp/db.sqlite3`.

Esto es lo que decía aquí hasta el 2026-09-02, y describía el estado real de esta rama: «define una única conexión SQLite apuntando a `db.sqlite3` sin override por entorno, así que las suites functional pegan contra el mismo fichero que el servidor de desarrollo». Era H-01, cerrado en el Módulo 3 y vuelto a abrir al saltar de rama. Lo detectó una prueba al fallar, no una lectura.

Otros comandos útiles: `node ace list:routes`, `node ace make:controller|model|migration|validator|transformer|service`, `node ace migration:fresh`, `node ace repl`.

### Frontend (`cd frontend`)

```bash
npm install
npm run dev
npm run build     # tsc -b && vite build (aquí se hace el typecheck)
npm run lint      # oxlint (NO eslint)
npm run format    # prettier --write .
npm run format:check  # lo que corre CI
npm run test:e2e  # Playwright; la primera vez: npx playwright install chromium
```

El frontend corre **Vitest** (`npm test`): 33 pruebas, 28 sobre `src/lib/api.test.ts`, que es el único punto de contacto con el backend, y 5 sobre `src/lib/lista.test.ts`, dónde entra en pantalla una tarea recién creada. El número lo contrasta CI igual que el del backend.

Las **pruebas de navegador** son Playwright, en `frontend/e2e/*.e2e.ts`, desde el 2026-09-13. Levantan el backend con `NODE_ENV=test` -escribe en la base de pruebas, nunca en la de desarrollo- en el puerto 3334 y el frontend en el 5174, y al terminar deshacen las tablas. Por eso **no se lanzan a la vez que `npm test` del backend**: chocan en el puerto y fallan, que es lo que se busca. Preparan el estado por la API y comprueban en pantalla, salvo `flujo.e2e.ts`, que recorre el flujo principal entero desde la pantalla de registro. Cubren pocos casos a propósito -los que ninguna otra prueba veía-, así que la mayoría de los requisitos de pantalla siguen sin prueba; cuáles, en `docs/trazabilidad.md`.

## Arquitectura del backend

### El esquema se genera, no se escribe

`database/schema.ts` está **autogenerado** desde las migraciones (`schemaGeneration.enabled` en `config/database.ts`) y no debe editarse. Los modelos **no declaran columnas**: extienden la clase generada.

```ts
// app/models/user.ts
export default class User extends compose(UserSchema, withAuthFinder(hash)) { ... }
```

Flujo para cambiar el modelo de datos: crear migración → `node ace migration:run` (regenera `database/schema.ts`) → añadir al modelo solo relaciones, mixins, getters y lógica. Reglas de generación personalizadas en `database/schema_rules.ts`.

### Código generado versionado en `.adonisjs/`

`backend/.adonisjs/` está **commiteado** (no ignorado) para que un clon limpio compile antes de arrancar nada. Lo regeneran los hooks `indexEntities()` + `generateRegistry()` de `adonisrc.ts` al bootear:

- `.adonisjs/server/controllers.ts` — mapa de controladores. `start/routes.ts` los referencia vía `import { controllers } from '#generated/controllers'` y `[controllers.Profile, 'show']`, **no** con lazy imports de rutas.
- `.adonisjs/client/registry/` — registro Tuyau (rutas + tipos de request/response) pensado para consumo tipado desde el frontend. `tests/bootstrap.ts` lo engancha al `apiClient` de Japa, así que en tests functional las rutas y sus payloads están tipados.

Si tocas controladores o rutas y los tipos generados quedan obsoletos, arranca el dev server o corre los tests para regenerarlos, y commitea el diff.

### Toda respuesta pasa por `serialize()`

`providers/api_provider.ts` inyecta `ctx.serialize()` en cada `HttpContext` con un serializer que envuelve el payload en `{ data: ... }`. Convención en controladores:

```ts
async show({ auth, serialize }: HttpContext) {
  return serialize(UserTransformer.transform(auth.getUserOrFail()))
}
```

Usa siempre un transformer de `app/transformers/` (clases `BaseTransformer` con `toObject()` + `this.pick(...)`) en vez de devolver modelos crudos. Para respuestas sin envoltorio: `serialize.withoutWrapping(...)`.

### Auth

Dos guards en `config/auth.ts`; el **default es `api`** (access tokens opacos vía `DbAccessTokensProvider`), `web` (sesión) está configurado pero sin uso. En `start/kernel.ts` el `silent_auth_middleware` corre en todas las rutas; la protección real se aplica con `.use(middleware.auth())` sobre el grupo. `force_json_response_middleware` fuerza JSON en todo.

Rutas actuales (`start/routes.ts`), todas bajo `/api/v1`:

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
| GET | `/api` | documento OpenAPI navegable | no |
| GET | `/api.json` | el mismo documento, en JSON | no |
| GET | `/api.yaml` | el mismo documento, en YAML | no |

Las tres últimas las sirve `@foadonis/openapi` desde los decoradores de los controladores. El Módulo 4 nuestro había decidido lo contrario -contrato escrito a mano y contrastado-, y las dos aproximaciones convivieron hasta el 2026-09-08. **Resuelto en [ADR-0007](docs/adr/0007-el-contrato-se-genera-se-versiona-y-se-vigila-la-deriva.md)**: el contrato se genera, se versiona en `docs/api/openapi.json`, y lo que corre en CI es la comprobación de que los dos coinciden.

```bash
npm run openapi:generate   # escribe docs/api/openapi.json desde el código
npm run openapi:check      # sale 1 si el fichero ya no es el contrato generado
```

`openapi:check` **no arregla nada**: nombra las rutas JSON que difieren y deja el arreglo en manos de quien hizo el cambio. Se le ha visto fallar renombrando `profile` a `perfil`, con código de salida 1.

### Validación

VineJS 4 en `app/validators/`, consumido con `request.validateUsing(validator)`. Nota de API: se usa `vine.create({...})` (no `vine.compile`), y hay reglas como `.sameAs('password')` y `.unique({ table, column })` sobre el schema. Los validadores comparten builders de campo (`email()`, `password()`) en vez de repetir reglas.

### Imports por subpath

`package.json` mapea `#controllers/*`, `#models/*`, `#validators/*`, `#transformers/*`, `#database/*`, `#generated/*`, `#start/*`, `#config/*`, `#tests/*`, etc. Úsalos siempre en lugar de rutas relativas. Nuevas variables de entorno: `node ace env:add` (las añade a `.env`, `.env.example` y al schema de `start/env.ts`, que valida al arrancar).

## Versiones por delante de la documentación conocida

El stack va deliberadamente en versiones muy recientes: **AdonisJS 7, Lucid 22, VineJS 4, Auth 10, TypeScript 6, React 19, Vite 8, oxlint**. Varias APIs difieren de las de versiones anteriores (esquema generado en vez de columnas en el modelo, registro de controladores generado, transformers/serializers, `vine.create`). Antes de asumir una firma por memoria o por docs de v6, comprueba los `.d.ts` reales en `backend/node_modules/@adonisjs/*/build/`.

## Frontend

El typecheck vive dentro de `npm run build`; el lint es **oxlint** (`.oxlintrc.json`), no eslint. El formateo es Prettier (`.prettierrc.json`: `semi: false`, `singleQuote: true`, para respetar el estilo ya existente); un hook `PostToolUse` en `.claude/settings.json` lo corre automáticamente sobre cada fichero de `frontend/` que Claude edite. Las pruebas son **Vitest** (`npm test`).

Stack: **Tailwind v4** (plugin de Vite, sin `tailwind.config.js`; los tokens viven en `src/index.css`), **shadcn/ui** (`components.json`, componentes generados en `src/components/ui/` — se traen con `npx shadcn@latest add <componente>` y no se editan a mano) y **react-router**. El alias `@/*` → `src/*` está declarado a la vez en `tsconfig.app.json` (sin `baseUrl`, deprecado en TS 6) y en `vite.config.ts`.

Organización de `src/`:

- `lib/api.ts` — único punto de contacto con el backend: envuelve `fetch`, desenvuelve el `{ data }` del serializer, adjunta el `Authorization: Bearer` y traduce los errores de VineJS/auth a `ApiError` con `message` ya en castellano y `fieldErrors` por campo. Toda llamada nueva a la API se añade aquí, no en los componentes.
- `auth/` — `auth-context.ts` (solo el contexto, sin componentes, para no romper `react/only-export-components`), `auth-provider.tsx` (token en `localStorage` bajo `flowsync.token`, rehidratado contra `GET /account/profile` al arrancar), `use-auth.ts` y `use-auth-form.ts`.
- `routes/` — `app-routes.tsx` más los guards `protected-route.tsx` y `public-only-route.tsx`.
- `pages/`, `components/` — pantallas y componentes propios.

La URL de la API sale de `VITE_API_URL` (ver `frontend/.env.example`); por defecto `http://localhost:3333`.

## Documentación de código

TSDoc (`/** ... */`) va donde el lector no puede deducirlo del código, y en ningún otro sitio:

- **Lo exportado que otros consumen**: cada función de `frontend/src/lib/api.ts`, con los `@throws` de `ApiError` que puede devolver; los hooks y el proveedor de `src/auth/`; y lo que exportan los modelos (`TASK_STATUSES`, `isOverdueOn`, `initials`).
- **Una regla de negocio o una decisión que no se ve en la línea**: por qué la lista por defecto deja fuera lo hecho, por qué los tokens no caducan, por qué el día de referencia se construye en local y no con `toISOString()`. Si cita un hallazgo o un ADR, mejor.
- **Los controladores no llevan TSDoc**: los documentan sus decoradores de `@foadonis/openapi` (`@ApiOperation`, `@ApiResponse`), que además acaban en el contrato. Duplicarlo en un comentario es un segundo sitio que se desincroniza.
- **Nada en lo trivial ni en lo generado**: un transformer de cinco campos, `main.tsx`, `components/ui/`, `database/schema.ts`, `.adonisjs/`.

Un comentario que afirma algo que el código no hace es un defecto grave para el revisor (`REVIEW.md`), así que al cambiar el comportamiento se cambia el comentario en el mismo commit.

## Reglas de proceso

Cada regla declara su **modo de fallo**, porque decide dónde vive: lo ruidoso puede quedarse escrito; lo silencioso se baja a un hook o a CI; lo que no se puede comprobar se dice. La versión larga, con la historia de cada una y lo que costó no tenerla, en la skill `reglas-de-proceso` (`.claude/skills/reglas-de-proceso/SKILL.md`). Si se cumplen o no es empírico y va en `docs/auditoria-reglas-de-proceso.md`.

| Regla | Modo de fallo | Qué la ejecuta |
|---|---|---|
| Rama por unidad de trabajo, nunca commitear en `main` ni en `sN/*` (R-01) | Silencioso | `.githooks/pre-commit`, probado en CI |
| Commit convencional por petición, `tipo(ámbito): qué`, con la skill `/commit` | Silencioso | `.githooks/commit-msg`, probado en CI |
| Al índice por nombre: `git add <fichero>`, nunca `-A` ni `.` | Silencioso, auditable | Criterio; el commit lo registra |
| Los hooks no se saltan: nada de `--no-verify` | Ruidoso | Es un acto deliberado que hay que teclear |
| Un cambio en rutas, controladores, validadores o transformers cierra con el contrato regenerado (`openapi:generate`), el diff de `.adonisjs/` y el README de la capability | Silencioso | `openapi:check` en CI (ADR-0007) |
| Un bug se reproduce antes de arreglarse y deja una prueba; si no puede, el commit lleva `Sin-prueba: <motivo>` (R-08) | Silencioso | `scripts/fix-con-prueba.mjs` en CI. Reproducirlo antes sigue siendo criterio (H-36) |
| Se verifica por código de salida, nunca por la última línea (R-06) | Silencioso | El verificador exige `pipefail` en todo `run:` con tubería |
| Una comprobación cuenta cuando se la ha visto fallar por su motivo (R-14). Toda comprobación nueva entra en el catálogo | Peor que silencioso: garantía falsa | `scripts/mutaciones.mjs` en CI |
| Al saltar de rama, los hallazgos cruzan y se comprueban uno a uno (R-07) | Silencioso: costó nueve defectos | `mutaciones.mjs` para lo catalogado; a mano el resto, procedimiento al final de `docs/hallazgos.md` |
| Un lint en rojo, un test que falla o uno flaky se arreglan aunque no los hayas causado | Silencioso | Criterio |
| Todo atajo por velocidad se escribe como deuda, con motivo, donde se vaya a leer | Silencioso, el que más decae | Criterio; `docs/hallazgos.md` es el sitio |
| La documentación desactualizada es peor que no tenerla: se escribe cuando aporta y se contrasta | No computable | `scripts/verificar-docs.mjs` sabe si coincide con el código, no si sirve |
| Un solo PR al cerrar la unidad, con la plantilla rellena; el revisor adversarial corre en cada push y **no bloquea** | Silencioso | `revision-adversarial.yml`; lo determinista bloquea, el revisor informa |
| El número de pruebas vive en este fichero y en ningún otro sitio | Silencioso | `scripts/recuento-pruebas.mjs` en CI |

## Hacia dónde vamos

Lo que este fichero describe es la arquitectura **actual**, y coincide con la objetivo: no hay migración pendiente ni capa que se quiera sustituir. Lo que sí está decidido y no construido, para que nadie lo dé por olvidado ni lo empiece sin leer su historia:

- **No construido por alcance**, con criterios escritos en `docs/backlog/`: reasignar (E2-7), editar título (E2-6), borrar (E2-10) y la lista que se actualiza sola (E3-2). Antes de tocarlos, PA-8 en el PRD.
- **No desplegado.** `config/cors.ts` no admite ningún origen en producción; lo que exigiría desplegar está en `docs/runbooks.md` §7.
- **Deuda aceptada**, no olvidada: el token en `localStorage` (H-06), `fullName` nulable (H-04), la fragilidad del cierre por 401 vigilada por una prueba (H-37).
