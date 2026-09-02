# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npm run typecheck                               # tsc --noEmit
```

Tests (Japa). Dos suites declaradas en `adonisrc.ts`: `unit` (`tests/unit/**/*.spec.ts`, timeout 2s) y `functional` (`tests/functional/**/*.spec.ts`, timeout 30s). Hoy hay **52 pruebas functional**: 20 de `auth`, 30 de `tasks` (responsable, vencimiento, filtro, lista compartida y creación) y 2 de aislamiento de la base. **`tests/unit/` no existe.** Qué escenario de la spec cubre cada una, y cuáles siguen sin cubrir, en `docs/trazabilidad.md`.

```bash
node ace test unit                    # una suite
node ace test --files=user            # filtrar por nombre de fichero
node ace test --tests="crea un user"  # filtrar por título de test
node ace test --groups=... --tags=... --failed --watch
node ace make:test --suite=functional # scaffolding de un fichero de test
```

La BD de tests está aislada por construcción (ADR-0001): `config/database.ts` elige el fichero según el entorno, y `bin/test.ts` fuerza `NODE_ENV=test` de forma incondicional, así que la suite no puede escribir sobre `tmp/db.sqlite3`. Se comprobó antes de arreglarlo que sí podía: un fichero de prueba sin hook dejaba filas en la base de desarrollo con la suite en verde.

Los ficheros de prueba siguen declarando `group.each.setup(() => testUtils.db().withGlobalTransaction())`, que es lo que aísla un caso de otro dentro de la misma ejecución. Mantenlo al escribir uno nuevo.

Dos cosas del arnés que ahorran tiempo: el registro tipado de Tuyau tipa solo la respuesta de **éxito** de cada ruta, así que para leer un error o enviar un payload que el validador debe negar están los helpers de `tests/helpers/api.ts` (`errores`, `tarea`, `tareas`, `invalido`); y `assert.hasAllKeys` no existe en este plugin, es `assert.sameMembers` sobre `Object.keys`.

Otros comandos útiles: `node ace list:routes`, `node ace make:controller|model|migration|validator|transformer|service`, `node ace migration:fresh`, `node ace repl`.

### Frontend (`cd frontend`)

```bash
npm install
npm run dev
npm run build     # tsc -b && vite build (aquí se hace el typecheck)
npm run lint      # oxlint (NO eslint)
npm run format    # prettier --write .
```

El frontend **no tiene runner de tests** en esta rama.

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

El contrato completo, con cuerpos y respuestas, en `docs/api/openapi.yaml`. `scripts/verificar-docs.mjs` falla si esa tabla y el contrato dejan de corresponder con `start/routes.ts`.

### Validación

VineJS 4 en `app/validators/`, consumido con `request.validateUsing(validator)`. Nota de API: se usa `vine.create({...})` (no `vine.compile`), y hay reglas como `.sameAs('password')` y `.unique({ table, column })` sobre el schema. Los validadores comparten builders de campo (`email()`, `password()`) en vez de repetir reglas.

### Imports por subpath

`package.json` mapea `#controllers/*`, `#models/*`, `#validators/*`, `#transformers/*`, `#database/*`, `#generated/*`, `#start/*`, `#config/*`, `#tests/*`, etc. Úsalos siempre en lugar de rutas relativas. Nuevas variables de entorno: `node ace env:add` (las añade a `.env`, `.env.example` y al schema de `start/env.ts`, que valida al arrancar).

## Versiones por delante de la documentación conocida

El stack va deliberadamente en versiones muy recientes: **AdonisJS 7, Lucid 22, VineJS 4, Auth 10, TypeScript 6, React 19, Vite 8, oxlint**. Varias APIs difieren de las de versiones anteriores (esquema generado en vez de columnas en el modelo, registro de controladores generado, transformers/serializers, `vine.create`). Antes de asumir una firma por memoria o por docs de v6, comprueba los `.d.ts` reales en `backend/node_modules/@adonisjs/*/build/`.

## Frontend

El typecheck vive dentro de `npm run build`; el lint es **oxlint** (`.oxlintrc.json`), no eslint. El formateo es Prettier (`.prettierrc.json`: `semi: false`, `singleQuote: true`, para respetar el estilo ya existente); un hook `PostToolUse` en `.claude/settings.json` lo corre automáticamente sobre cada fichero de `frontend/` que Claude edite. No hay runner de tests instalado.

Stack: **Tailwind v4** (plugin de Vite, sin `tailwind.config.js`; los tokens viven en `src/index.css`), **shadcn/ui** (`components.json`, componentes generados en `src/components/ui/` — se traen con `npx shadcn@latest add <componente>` y no se editan a mano) y **react-router**. El alias `@/*` → `src/*` está declarado a la vez en `tsconfig.app.json` (sin `baseUrl`, deprecado en TS 6) y en `vite.config.ts`.

Organización de `src/`:

- `lib/api.ts` — único punto de contacto con el backend: envuelve `fetch`, desenvuelve el `{ data }` del serializer, adjunta el `Authorization: Bearer` y traduce los errores de VineJS/auth a `ApiError` con `message` ya en castellano y `fieldErrors` por campo. Toda llamada nueva a la API se añade aquí, no en los componentes.
- `auth/` — `auth-context.ts` (solo el contexto, sin componentes, para no romper `react/only-export-components`), `auth-provider.tsx` (token en `localStorage` bajo `flowsync.token`, rehidratado contra `GET /account/profile` al arrancar), `use-auth.ts` y `use-auth-form.ts`.
- `routes/` — `app-routes.tsx` más los guards `protected-route.tsx` y `public-only-route.tsx`.
- `pages/`, `components/` — pantallas y componentes propios.

La URL de la API sale de `VITE_API_URL` (ver `frontend/.env.example`); por defecto `http://localhost:3333`.

## Reglas de proceso
- Antes de tocar código: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main`/`s1/start`.
- Al cerrar la tarea: usar la skill `/commit`, luego `gh pr create` con una descripción completa de los cambios en el cuerpo del PR.
- Después de abrir el PR: usar el subagente `adversarial-reviewer` sobre él, antes de darlo por terminado.
- No repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR.
- **Cuando un cambio toque rutas, controladores o validadores**: actualizar `docs/api/openapi.yaml` y el README si corresponde, y ejecutar `node scripts/verificar-docs.mjs` antes de cerrar. La documentación de este repo se **contrasta**, no se regenera (ADR-0002), así que el contraste solo sirve si se ejecuta.
- Verificar por **código de salida**, nunca por lo que imprime la última línea. Un `| tail -1` se come el error y deja pasar un lint en rojo como si estuviera limpio.