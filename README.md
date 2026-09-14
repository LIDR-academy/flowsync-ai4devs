# FlowSync

Proyecto de práctica del curso AI4DEVS: gestión de tareas en equipo. Una persona se registra, entra, y trabaja sobre **una sola lista compartida** del espacio: apunta una tarea escribiendo solo el título, la mueve entre Pendiente, En curso y Hecho, le pone fecha de vencimiento y filtra por estado.

El repositorio es también el registro de **cómo** se construyó: specs vivas con OpenSpec, trazabilidad de historia a código, decisiones en ADR, y reglas de proceso bajadas a comprobaciones que corren en CI.

## Qué hace, y cómo se llegó

- Qué puede hacer una persona con FlowSync hoy, historia a historia y con lo que quedó fuera del MVP: [`docs/alcance-funcional.md`](docs/alcance-funcional.md).
- Cómo se llegó hasta aquí, módulo a módulo, con lo que cada sesión encontró: [`docs/recorrido-por-modulo.md`](docs/recorrido-por-modulo.md).
- Cómo rehacerlo desde cero, paso a paso y con los comandos: [`docs/guia-de-replicacion.md`](docs/guia-de-replicacion.md).

## Arquitectura mínima

```
navegador ──► SPA React 19 + Vite (:5173) ──fetch /api/v1──► API AdonisJS 7 (:3333) ──Lucid──► SQLite
                  │ token en localStorage                          │ contrato OpenAPI en /api
```

| Pieza | Dónde | Qué hace |
|---|---|---|
| API | [`backend/`](backend/README.md) | Rutas bajo `/api/v1`, validación con VineJS 4, access tokens opacos, toda respuesta envuelta en `{ data }` |
| SPA | [`frontend/`](frontend/README.md) | Pantallas de acceso, perfil, lista y tarea suelta. Un solo punto de contacto con la API: `src/lib/api.ts` |
| Base de datos | `backend/tmp/` | SQLite. `db.sqlite3` en desarrollo y `db-test.sqlite3` en pruebas, sin forma de cruzarlos ([ADR-0003](docs/adr/0003-aislamiento-de-la-base-de-datos-en-pruebas.md)) |

Diagramas C4 y el detalle por capas: [`docs/architecture.md`](docs/architecture.md). Lo que el sistema debe hacer, en [`openspec/specs/`](openspec/specs/), y por capability en [`docs/capabilities/`](docs/capabilities/).

## Requisitos

| | Versión | Nota |
|---|---|---|
| Node.js | **24** | La que usa CI; `.nvmrc` la fija y `engine-strict` rechaza otra al instalar. Trae npm |
| Git | cualquiera reciente | `npm install` activa el hook de `.githooks/` |
| GNU Make | opcional | Solo para los atajos. **Windows sin WSL no está soportado por el `Makefile`**; ahí se arranca a mano |
| Chromium de Playwright | opcional | Solo para las pruebas de navegador: `npx playwright install chromium` en `frontend/` |

## Instalación

Con `make` (macOS, Linux, WSL):

```bash
git clone https://github.com/LIDR-academy/flowsync-ai4devs.git
cd flowsync-ai4devs
make setup   # instala dependencias, crea los .env, genera APP_KEY y migra
make start   # backend en :3333 y frontend en :5173; Ctrl-C para los dos
```

A mano, en cualquier sistema:

```bash
cd backend
npm install
cp .env.example .env && node ace generate:key
node ace migration:run
npm run dev                      # http://localhost:3333

# en otra terminal
cd frontend
npm install
cp .env.example .env             # VITE_API_URL apunta al backend
npm run dev                      # http://localhost:5173
```

> Si el `clone` falla, avisa a tu TA. La rama de partida de cada módulo te la indica el prework.

## Comandos

No hay `package.json` en la raíz: **todo se ejecuta desde `backend/` o desde `frontend/`**.

| Qué | `backend/` | `frontend/` |
|---|---|---|
| Arrancar en desarrollo | `npm run dev` | `npm run dev` |
| Pruebas | `npm test` | `npm test` (Vitest) y `npm run test:e2e` (Playwright) |
| Lint | `npm run lint` (eslint) | `npm run lint` (oxlint) |
| Tipos | `npm run typecheck` | dentro de `npm run build` |
| Formato | `npm run format` y `npm run format:check` | `npm run format` y `npm run format:check` |
| Dependencias vulnerables | `npm audit --audit-level=high` | `npm audit --audit-level=high` |
| Contrato OpenAPI | `npm run openapi:generate` y `npm run openapi:check` | - |

Desde la raíz, dos scripts de CI que también sirven en local:

```bash
node scripts/verificar-docs.mjs   # la documentación corresponde con el código
node scripts/mutaciones.mjs       # cada comprobación se pone en rojo con el defecto que dice cubrir
```

La lista completa, con filtros de pruebas y generadores de `ace`, en [`CLAUDE.md`](CLAUDE.md).

## Flujo de contribución

1. **Una rama por unidad de trabajo.** Desde `main` o una `sN/*`, `git checkout -b feat/<slug>`. Commitear en `main` o en una `sN/*` lo impide el hook `.githooks/pre-commit`.
2. **Si cambia el comportamiento, primero la spec.** Un change de OpenSpec (`/opsx:propose`) se revisa antes de escribir código; al terminar, `/opsx:archive` lo fusiona en `openspec/specs/`. Un arreglo pequeño que no cambia lo que la spec dice no necesita change.
3. **Un bug se reproduce antes de arreglarlo, y deja una prueba.** CI rechaza un commit `fix:` que no toque una prueba, salvo que el mensaje lleve `Sin-prueba: <motivo>`.
4. **Si tocas rutas, controladores, validadores o transformers**, en el mismo commit: `npm run openapi:generate`, el diff de `backend/.adonisjs/` y el README de la capability.
5. **Al índice por nombre** (`git add <fichero>`), commits convencionales (`tipo(ámbito): qué`; el hook `commit-msg` rechaza lo demás) y **nunca `--no-verify`**.
6. **Antes de abrir el PR**, lo mismo que corre en CI: lint, formato, tipos, pruebas de las dos capas, `npm audit` y `openapi:check`. Si añades una prueba, actualiza su número en `CLAUDE.md`: CI lo contrasta.
7. **Un solo PR al terminar la unidad**, con la plantilla de `.github/PULL_REQUEST_TEMPLATE.md` rellena, incluida la sección "Lo que este PR NO arregla". El revisor adversarial corre solo en cada push de una rama con PR abierto; su informe queda en el resumen del job.

Qué comprueba CI y cómo se lee cuando falla: [`docs/runbooks.md`](docs/runbooks.md). Las reglas completas, con el modo de fallo de cada una: [`CLAUDE.md`](CLAUDE.md).

## Documentación

| Qué | Dónde |
|---|---|
| Producto: PRD, casos de uso y backlog | [`docs/prd/flowsync-mvp.md`](docs/prd/flowsync-mvp.md), [`docs/prd/casos-de-uso.md`](docs/prd/casos-de-uso.md), [`docs/backlog/README.md`](docs/backlog/README.md) |
| Specs vivas y changes archivados | [`openspec/specs/`](openspec/specs/), [`openspec/changes/archive/`](openspec/changes/archive/) |
| Trazabilidad ticket, criterio, prueba y código | [`docs/trazabilidad.md`](docs/trazabilidad.md) |
| Arquitectura y decisiones | [`docs/architecture.md`](docs/architecture.md), [`docs/adr/`](docs/adr/) |
| Contrato de la API | [`docs/api/openapi.json`](docs/api/openapi.json), servido también en `/api` |
| Operación, CI e incidentes | [`docs/runbooks.md`](docs/runbooks.md) |
| Hallazgos y su estado | [`docs/hallazgos.md`](docs/hallazgos.md) |
| Revisor automático | [`REVIEW.md`](REVIEW.md), [`docs/ci-revisor.md`](docs/ci-revisor.md) |
| Instrucciones para agentes | [`CLAUDE.md`](CLAUDE.md) (y [`AGENTS.md`](AGENTS.md), que apunta a él) |
