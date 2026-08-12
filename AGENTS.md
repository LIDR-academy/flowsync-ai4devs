# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

FlowSync is a team task-management practice project (LIDR AI4Devs course). It is a two-package repo with no root `package.json`/workspace tooling — `backend/` and `frontend/` are independent npm projects that must be installed and run separately, in separate terminals.

- `backend/` — API on AdonisJS 7, TypeScript, Lucid ORM, SQLite (`better-sqlite3`). Runs on `http://localhost:3333`.
- `frontend/` — React 19 + Vite. Currently just the Vite/React starter template (no routing or data-fetching wired up yet). Runs on `http://localhost:5173`.

## Commands

### Backend (run from `backend/`)

```bash
npm install
cp .env.example .env
node ace generate:key      # populates APP_KEY in .env
node ace migration:run     # applies migrations, regenerates database/schema.ts
npm run dev                # node ace serve --hmr
npm run build               # node ace build
npm run test                 # node ace test (runs both unit + functional suites)
npm run lint                  # eslint .
npm run format               # prettier --write .
npm run typecheck           # tsc --noEmit
```

Run a single test file or suite via Ace directly:

```bash
node ace test tests/unit/example.spec.ts   # single file
node ace test --suite=unit                  # one suite (unit | functional)
```

Common Ace scaffolding commands (AdonisJS CLI): `node ace make:controller`, `make:migration`, `make:validator`, `make:model` — these follow the naming/import conventions described below, so prefer them over hand-writing new files from scratch.

### Frontend (run from `frontend/`, in a second terminal — the backend keeps running in the first)

```bash
npm install
npm run dev       # vite, http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run preview
```

## Backend architecture

### Subpath imports instead of relative paths

`backend/package.json` defines Node subpath imports (`#controllers/*`, `#models/*`, `#validators/*`, `#transformers/*`, `#middleware/*`, `#database/*`, `#start/*`, `#config/*`, `#generated/*`, etc.) all mapped under `app/`, `database/`, `start/`, `config/`, `.adonisjs/server/`. Always import via these `#`-prefixed specifiers (e.g. `import User from '#models/user'`) rather than relative paths — this is how the rest of the codebase does it and how AdonisJS's IoC/HMR (`hot-hook`) boundaries are wired.

### Request flow: routes → controller → validator → model → transformer → serialize

- `start/routes.ts` defines all HTTP routes, grouped under `/api/v1`. Auth-related routes (`auth/signup`, `auth/login`) are public; `account/*` routes are wrapped in `.use(middleware.auth())`.
- Routes reference controllers via the Tuyau-generated `controllers` object (`#generated/controllers`) rather than importing controller classes by hand — this keeps routes and the typed client registry in sync.
- Controllers (`app/controllers/`) are thin: they call `request.validateUsing(someValidator)` (VineJS validators in `app/validators/`), do the Lucid ORM call, and return the result through a Transformer.
- Transformers (`app/transformers/`) extend `BaseTransformer` and whitelist exactly which model fields are exposed in API responses (see `UserTransformer` — picks `id`, `fullName`, `email`, timestamps, `initials`; the `password` column itself is already hidden via `serializeAs: null` in the schema).
- Every controller response is built with `ctx.serialize(...)` (or `serialize.withoutWrapping(...)`), not returned as a plain object. This comes from the custom `ApiSerializer` registered onto `HttpContext` in `providers/api_provider.ts`, which wraps all responses as `{ data: ... }` and normalizes Lucid pagination metadata. New endpoints should follow this same pattern for response consistency.

### Auth

Configured in `config/auth.ts` with two guards: `api` (token-based via `@adonisjs/auth/access_tokens`, this is the **default** guard used for the actual API) and `web` (session-based, configured but not currently used by any route). `User.accessTokens` uses `DbAccessTokensProvider`; tokens are created/destroyed explicitly in `AccessTokensController`. The `auth` named middleware (`start/kernel.ts`) guards protected routes; `silent_auth_middleware` runs globally to attempt auth without failing the request.

### Database schema generation — do not hand-edit `database/schema.ts`

`database/schema.ts` carries a `DO NOT EDIT manually` header — it's regenerated from the actual migrated SQLite schema every time `node ace migration:run` runs. Model base classes (e.g. `UserSchema`) live here and get composed into the real models (`app/models/user.ts` does `compose(UserSchema, withAuthFinder(hash))`). To change columns, add/edit a migration under `database/migrations/` and re-run migrations; use `database/schema_rules.ts` (currently empty) to customize how columns are generated if needed.

### Tuyau generated client (`.adonisjs/`)

`adonisrc.ts` runs `generateRegistry()` (from `@tuyau/core/hooks`) on boot, which regenerates `.adonisjs/client/*` (typed route/controller registry) and `.adonisjs/server/*` (controllers/events/listeners/routes barrel files) from the current routes and controllers. These are generated artifacts, not authored by hand — expect them to show as modified after adding/changing routes or controllers, and don't hand-edit them. The frontend is intended to eventually consume the typed client from `.adonisjs/client`.

## Frontend architecture

The frontend has not been built out yet: `src/App.tsx` is still the unmodified Vite + React starter (counter button, Vite/React boilerplate links). There is no router, API client wiring, or state management in place — when adding real features, this is greenfield within `frontend/src/`.

## Reglas de proceso
- Antes de tocar código: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main`/`s1/start`.
- Al cerrar la tarea: usar la skill `/commit`, luego `gh pr create` con una descripción completa de los cambios en el cuerpo del PR.
- Después de abrir el PR: usar el subagente `adversarial-reviewer` sobre él, antes de darlo por terminado.
- No repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR.