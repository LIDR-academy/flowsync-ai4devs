# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

Two independent apps, no root package.json / workspace tooling — always `cd` into `backend/` or `frontend/` before running any command:

- `backend/` — AdonisJS 7 API (TypeScript, ESM, SQLite via `better-sqlite3`)
- `frontend/` — React 19 + Vite (TypeScript), currently an unmodified Vite scaffold not yet wired to the backend (`frontend/src/App.tsx` is still the default template)

`main` is a clean course-starter baseline ("FlowSync — AdonisJS 7 API starter + React 19 frontend"). Many other remote branches (`s1/`, `s2/`, `petroecuador-*`, `feat/*`) hold in-progress or reference solutions for a training program — don't assume they reflect `main`'s intended direction unless asked to look at them.

## Commands

### Backend (`backend/`)
- `npm run dev` — `node ace serve --hmr`, dev server on `PORT` (default 3333)
- `npm run build` — `node ace build`
- `npm test` — `node ace test` (Japa runner). Filter to one file with `node ace test --files=tests/functional/<file>.spec.ts`; filter by suite with `node ace test unit` / `node ace test functional`
- `npm run lint` / `npm run format` — ESLint / Prettier (`@adonisjs/eslint-config`, `@adonisjs/prettier-config`)
- `npm run typecheck` — `tsc --noEmit`
- `node ace migration:run` / `node ace migration:rollback` — run/rollback Lucid migrations (also regenerates `database/schema.ts`, see below)
- `node ace generate:key` — generate `APP_KEY` for `.env` (copy from `.env.example` first; `.env.test` overrides `SESSION_DRIVER=memory` for the test env)

### Frontend (`frontend/`)
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — `oxlint` (config: `.oxlintrc.json`; this project does not use ESLint)
- `npm run preview` — preview a production build

## Backend architecture

**Subpath imports.** All internal imports go through the `#alias/*` map defined in `backend/package.json` (`#controllers/*`, `#models/*`, `#validators/*`, `#transformers/*`, `#middleware/*`, `#database/*`, `#generated/*`, etc.) instead of relative paths.

**Generated files — do not hand-edit:**
- `backend/database/schema.ts` is regenerated from migrations by Lucid's schema generator (header says "DO NOT EDIT manually"). It defines `UserSchema`/`AuthAccessTokenSchema` `BaseModel` classes that live models compose (e.g. `app/models/user.ts` does `compose(UserSchema, withAuthFinder(hash))`). Column-level generation rules live in `database/schema_rules.ts` (currently empty).
- `backend/.adonisjs/**` (client registry, server manifest/controllers/events/listeners, `data.d.ts`) is produced by the `@tuyau/core` hooks (`generateRegistry()`, `indexEntities()`) declared in `adonisrc.ts`. It's checked into git and regenerates whenever routes/controllers/events change — expect it to show as modified after adding routes; don't manually patch it. Tests import the generated `Registry` type from `.adonisjs/client/registry/schema.d.ts` to type Japa's `apiClient()`.

**Routing.** All routes are declared in `start/routes.ts` and referenced via the generated `controllers` object (`#generated/controllers`), not by importing controller classes directly. Everything lives under `/api/v1`:
- `auth/*` (signup, login) — unauthenticated
- `account/*` (profile, logout) — behind the named `auth` middleware (`middleware.auth()`, registered in `start/kernel.ts`)

**Auth.** `config/auth.ts` defines two guards: `api` (default — stateless `tokensGuard`/`DbAccessTokensProvider`, used for the JSON API) and `web` (session-based, for browser flows). `User.accessTokens` on the model issues/revokes tokens; `AccessTokensController` handles login/logout, `NewAccountController` handles signup, `ProfileController` returns the authenticated user.

**Response shape.** `providers/api_provider.ts` registers `ctx.serialize()` / `ctx.serialize.withoutWrapping()` on `HttpContext`, backed by a custom `ApiSerializer` that wraps all JSON responses in `{ data: ... }` (and handles Lucid pagination meta). Controllers return `serialize(...)`, not raw objects, for anything beyond the root health-check route.

**Transformers.** `app/transformers/*_transformer.ts` extend `BaseTransformer` and whitelist fields via `this.pick(...)` (e.g. `UserTransformer` exposes `id, fullName, email, createdAt, updatedAt, initials` — `password` is excluded at the model level via `serializeAs: null`, not by the transformer).

**Validation.** VineJS validators live in `app/validators/*.ts` and are invoked with `request.validateUsing(...)` inside controllers.

**Middleware stack** (`start/kernel.ts`): server-level — `force_json_response`, `container_bindings`, CORS; router-level — bodyparser, session, shield, auth-initialize, `silent_auth`. CORS (`config/cors.ts`) allows any origin in dev (`app.inDev`) and an explicit allowlist (empty by default) in production.

**DB.** SQLite file at `backend/tmp/db.sqlite3`; migrations in `database/migrations/`.


## Reglas del proceso
- Antes de tocar código: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main`/`s1/start`.
- Al cerrar la tarea: usar la skill `/commit`, luego `gh pr create` con una descripción completa de los cambios en el cuerpo del PR.
- Después de abrir el PR: usar el subagente `adversarial-reviewer` sobre él, antes de darlo por terminado.
- No repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR.