# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

FlowSync is a course practice project (team task management app). It's a monorepo with two independent apps that are not yet wired together end-to-end:

- `backend/` — AdonisJS 7 API (TypeScript, ESM, SQLite via `better-sqlite3`)
- `frontend/` — React 19 + Vite (currently the unmodified Vite starter template; no app UI has been built yet)

The backend and frontend are developed and run as separate npm projects (separate `package.json`, `node_modules`, lockfiles) — there is no root-level package.json or workspace tooling.

## Common commands

Run all commands from within `backend/` or `frontend/` respectively (not the repo root).

### Backend (`backend/`)

```bash
npm install
cp .env.example .env
node ace generate:key      # populates APP_KEY in .env
node ace migration:run
npm run dev                # serves with HMR at http://localhost:3333
```

- `npm run test` — runs Japa test suites via `node ace test`
- `npm run lint` — ESLint (`@adonisjs/eslint-config`)
- `npm run format` — Prettier (`@adonisjs/prettier-config`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — `node ace build`
- To run a single test file: `node ace test --files "tests/functional/some_file.spec.ts"` (see AdonisJS/Japa docs for more filters, e.g. `--tests`, `--tags`)

Test suites are defined in `backend/adonisrc.ts` under `tests.suites`: `unit` (`tests/unit/**/*.spec.ts`) and `functional` (`tests/functional/**/*.spec.ts`, boots a real HTTP server via `testUtils.httpServer()`).

### Frontend (`frontend/`)

```bash
npm install
npm run dev        # http://localhost:5173
```

- `npm run build` — `tsc -b && vite build`
- `npm run lint` — oxlint
- `npm run preview` — preview the production build

Run the backend in one terminal and the frontend in another; both must be up for the app to work end-to-end.

## Architecture (backend)

AdonisJS 7 app using ESM subpath imports defined in `backend/package.json` (`#controllers/*`, `#models/*`, `#services/*`, `#validators/*`, `#database/*`, etc.) — always import via these aliases, not relative paths across top-level folders.

**Request flow**: `start/routes.ts` → named middleware from `start/kernel.ts` → controllers in `app/controllers/`. Controllers stay thin: validate input with a Vine validator from `app/validators/`, call model/query logic, return data through `ctx.serialize(...)`.

**API response shape**: `providers/api_provider.ts` registers a custom `ApiSerializer` (wrap key `'data'`) on `HttpContext` as `ctx.serialize()`/`ctx.serialize.withoutWrapping()`. All controller responses should go through `serialize()` so API responses consistently look like `{ data: ... }`. Combine with per-model transformers in `app/transformers/` (extending `BaseTransformer`, using `this.pick(...)`) to control exactly which fields get serialized (e.g. `user_transformer.ts` excludes `password` and exposes the computed `initials` getter).

**Auth**: `@adonisjs/auth` is configured in `config/auth.ts` with two guards — `api` (opaque access tokens via `tokensGuard`/`DbAccessTokensProvider`, default guard for stateless API auth) and `web` (session-based, remember-me disabled). The `User` model (`app/models/user.ts`) composes `withAuthFinder` for credential verification and exposes `User.accessTokens` for token issuance/deletion. Protect routes with the named `auth` middleware (`middleware.auth()` from `start/kernel.ts`), which internally calls `ctx.auth.authenticateUsing(options.guards)`. Current auth endpoints: `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `GET /api/v1/account/profile` (protected), `POST /api/v1/account/logout` (protected).

**Data layer / schema generation**: Lucid models are backed by `database/schema.ts`, which is **auto-generated** — do not hand-edit it. Regenerate it by running `node ace migration:run` after adding/editing a migration in `database/migrations/`. Model classes (e.g. `User`) extend the generated `*Schema` base class via `compose()`, adding mixins/methods on top rather than redeclaring columns. Custom schema-generation rules go in `database/schema_rules.ts`. Default DB connection is SQLite at `tmp/db.sqlite3` (see `config/database.ts`); Postgres/MySQL/MSSQL/libSQL connection blocks are present but commented out and require installing the relevant driver package to enable.

**Routes/API type sharing (Tuyau)**: `@tuyau/core` generates a typed API registry (`.adonisjs/client/registry/`) from the routes/controllers via a hook in `adonisrc.ts` (`generateRegistry()`) — this is what a typed frontend client would consume, and also backs the Japa `apiClient()` test plugin's `RoutesRegistry`. The `.adonisjs/` directory is generated; don't hand-edit files under it.

**Middleware stack** (`start/kernel.ts`): server-level middleware (`force_json_response_middleware`, `container_bindings_middleware`, CORS) runs on every request; router-level middleware (bodyparser, session, shield, auth-initialize, `silent_auth_middleware`) runs only on matched routes. `silent_auth_middleware` attempts auth without failing the request — use the named `auth` middleware on a route/group when you need to actually require authentication.

## Architecture (frontend)

Vanilla Vite + React 19 + TypeScript starter — no router, state management, or API client has been added yet. `src/App.tsx` is still the default Vite/React template content; treat it as a placeholder to replace, not existing app structure to preserve. Linting uses oxlint (`frontend/.oxlintrc.json`), not ESLint.

## Reglas de proceso
- Antes de tocar código: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main`/`s1/start`.
- Al cerrar la tarea: usar la skill `/commit`, luego `gh pr create` con una descripción completa de los cambios en el cuerpo del PR.
- Después de abrir el PR: usar el subagente `adversarial-reviewer` sobre él, antes de darlo por terminado.
- No repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR.
