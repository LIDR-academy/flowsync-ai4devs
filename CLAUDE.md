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

Tests (Japa). Dos suites declaradas en `adonisrc.ts`: `unit` (`tests/unit/**/*.spec.ts`, timeout 2s) y `functional` (`tests/functional/**/*.spec.ts`, timeout 30s). Hoy hay **75 pruebas functional**: 26 de `auth`, 41 de `tasks`, 6 de errores y 2 de aislamiento de la base. **`tests/unit/` no existe.** Qué escenario cubre cada una en `docs/trazabilidad.md`.

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
```

El frontend corre **Vitest** (`npm test`): 28 pruebas sobre `src/lib/api.test.ts`, que es el único punto de contacto con el backend. No hay runner de **navegador**, así que los requisitos que solo se observan en pantalla siguen sin cubrir.

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

Las tres últimas las sirve `@foadonis/openapi` desde los decoradores de los controladores, y son de esta rama: el Módulo 4 nuestro había decidido lo contrario -contrato escrito a mano y contrastado- por los motivos que quedaron en un ADR. Las dos aproximaciones conviven hoy en el repositorio y **eso hay que resolverlo**, no dejarlo.

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

## Reglas de proceso

> Cada regla lleva su **modo de fallo**, porque es lo que decide dónde tiene que vivir.
> Lo que falla ruidoso puede quedarse escrito aquí: se nota solo. Lo que falla en silencio hay que bajarlo a algo que lo ejecute, o se cumplirá lo justo para que dejes de comprobarlo. Y lo que no se puede comprobar se dice, en vez de fingir que se cumple.
>
> **El modo de fallo es una propiedad de la regla y se declara aquí. Si la regla se cumple o no es otra cosa, es empírico, y va en [`docs/auditoria-reglas-de-proceso.md`](docs/auditoria-reglas-de-proceso.md).**

### Ciclo de trabajo

- La rama es por unidad de trabajo, no por petición. Antes de tocar código, mira en qué rama estás: si ya es una rama de trabajo —cualquiera que no sea `main` ni una `sN/*`—, sigue en ella en vez de crear otra. Solo desde `main` o desde una `sN/*` se crea una nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main` ni en una `sN/*`.
- El commit sí es por petición: al cerrar cada una, usar la skill `/commit`.
- Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día. El documento se construye en cada petición y no hay fichero que generar, así que lo que se commitea es el diff regenerado de `.adonisjs/`; el README es `docs/capabilities/<nombre>/README.md`.
- `gh pr create` (con una descripción completa de los cambios en el cuerpo del PR) y el pase del subagente `adversarial-reviewer` sobre ese PR van **una sola vez, al terminar la unidad de trabajo**, no al cerrar cada petición. El review adversarial es lo último, antes de dar la unidad por terminada.
- Cuando abras el PR, no repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR.

### Calidad del cambio

Siete reglas, y ninguna viene del curso. Las **seis primeras** son las que renelo aplica en sus proyectos, y viven en `~/.claude/CLAUDE.md` y `~/OPINIONS.md`, heredadas por todos ellos sin que ninguno las declare: se copian aquí para poder **contrastarlas contra un repositorio de verdad**, que es el ejercicio del Módulo 5. La **séptima** no viene de ningún fichero: sale de la cicatriz de este repositorio.

- **Un bug no se cierra sin reproducirlo.** · *Fallo silencioso.*
  Primero se reproduce en un entorno E2E lo más parecido posible a como lo vive el usuario final, y se confirma que el arreglo ataca el problema real y no el síntoma.
  Todo bug arreglado deja detrás una prueba que lo reproduce.
  Nadie nota que no se reprodujo: el bug se cierra igual y el commit se ve idéntico.

- **Al índice se va por nombre.** · *Fallo silencioso, pero auditable.*
  `git add <fichero>`, nunca `git add -A` ni `git add .`. Lo que entra en un commit se decide, no se barre.
  El commit lo registra para siempre, aunque nadie lo mire.

- **Los hooks no se saltan.** · *Fallo ruidoso.*
  Nada de `--no-verify`. Si un hook falla, se investiga la causa.
  Saltarlo convierte la comprobación en decorado, y es un acto deliberado que hay que teclear.

- **Todo atajo tomado por velocidad se escribe como deuda técnica.** · *Fallo silencioso, y el que más decae.*
  Explícito, con su motivo, en el sitio donde alguien lo vaya a leer. Un atajo sin registrar deja de ser una decisión y pasa a ser cómo funciona el sistema.

- **Un lint en rojo, un test que falla o uno flaky se arreglan aunque no los hayas causado.** · *Fallo silencioso.*
  Es la más fácil de contrastar contra un repositorio en vivo, y la que más rápido se erosiona: cada excepción hace la siguiente más barata.

- **La documentación desactualizada es peor que no tenerla.** · *No se puede comprobar automáticamente.*
  Se documenta cuando aporta valor -ADR, integraciones, variables de entorno, supuestos de seguridad, modos de fallo- y nunca como ritual.
  Ninguna comprobación sabe si un documento sigue siendo útil. Solo sabe si sigue coincidiendo con el código, que es otra cosa y es lo que hace `scripts/verificar-docs.mjs`.

- **Una comprobación cuenta cuando se la ha visto fallar.** · *Fallo peor que silencioso: da una garantía que no existe.*
  Toda comprobación que se añada -al verificador, a CI, a la suite- se demuestra **mutando el código a propósito** y viendo que se pone en rojo. Si no se ha visto fallar, no cuenta como comprobación: cuenta como una segunda regla escrita, y encima con la apariencia de estar ejecutada.
  No es una precaución teórica. Siete revisiones adversariales seguidas encontraron el verificador en verde sobre mutaciones reales, siempre por el mismo motivo: la mutación con la que se había probado cada comprobación era la que esa comprobación ya cubría por construcción.
  Viene de [ADR-0004](docs/adr/0004-la-documentacion-se-verifica-no-se-regenera.md), donde estaba escrita como consecuencia de una decisión y no como regla de proceso. Se sube aquí porque es lo que sostiene la columna «Qué la ejecutaría» de la auditoría: sin ella, esa columna es una lista de comprobaciones que nadie sabe si muerden.
