# FlowSync

Proyecto de práctica del curso AI4DEVS: gestión de tareas en equipo. Una persona se registra, entra, y trabaja sobre **una sola lista compartida** del espacio: apunta una tarea escribiendo solo el título, la mueve entre Pendiente, En curso y Hecho, le pone fecha de vencimiento y filtra por estado.

El repositorio es también el registro de **cómo** se construyó: specs vivas con OpenSpec, trazabilidad de historia a código, decisiones en ADR, y reglas de proceso bajadas a comprobaciones que corren en CI.

## Qué hace, y cómo se llegó

- Qué puede hacer una persona con FlowSync hoy, historia a historia y con lo que quedó fuera del MVP: [`docs/alcance-funcional.md`](docs/alcance-funcional.md).
- Cómo se llegó hasta aquí, módulo a módulo, con lo que cada sesión encontró: [`docs/recorrido-por-modulo.md`](docs/recorrido-por-modulo.md).
- Cómo rehacerlo desde cero, paso a paso y con los comandos: [`docs/guia-de-replicacion.md`](docs/guia-de-replicacion.md).

## El flujo que se demuestra

La vertical del PRD, de punta a punta: **entro, veo en qué anda el equipo, cambio el estado de lo mío en un gesto, y otra persona lo ve sin preguntarme.**

1. Una persona se registra en `/register` y entra directa a la lista.
2. Apunta una tarea escribiendo solo el título. Nace a su nombre y en Pendiente.
3. La pone en curso desde la propia fila, sin abrirla ni confirmar.
4. Otra persona del equipo, en otro navegador, la ve en curso y a nombre de quien la apuntó.

Lo recorre entero `frontend/e2e/flujo.e2e.ts` en cada push, desde la pantalla de registro y sin atajar por la API; si esa prueba falla, el producto no se puede demostrar. Está en el catálogo de mutaciones: con la lista convertida en privada por cuenta, sale en rojo en el paso 4. Con datos de ejemplo, en [`docs/prd/casos-de-uso.md`](docs/prd/casos-de-uso.md), CU-1 a CU-5.

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
| Docker | opcional | `docker compose up` levanta los dos servidores sin instalar Node ni `make`. Es la salida para Windows sin WSL |

## Instalación

Con `make` (macOS, Linux, WSL):

```bash
git clone https://github.com/LIDR-academy/flowsync-ai4devs.git
cd flowsync-ai4devs
make setup   # instala dependencias, crea los .env, genera APP_KEY y migra
make start   # backend en :3333 y frontend en :5173; Ctrl-C para los dos
```

Con Docker, en cualquier sistema:

```bash
docker compose up   # backend en :3333 y frontend en :5173; la primera vez tarda en instalar
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

La lista completa, con filtros de pruebas y generadores de `ace`, en [`AGENTS.md`](AGENTS.md).

## Flujo de contribución

1. **Una rama por unidad de trabajo.** Desde `main` o una `sN/*`, `git checkout -b feat/<slug>`. Commitear en `main` o en una `sN/*` lo impide el hook `.githooks/pre-commit`.
2. **Si cambia el comportamiento, primero la spec.** Un change de OpenSpec (`/opsx:propose`) se revisa antes de escribir código; al terminar, `/opsx:archive` lo fusiona en `openspec/specs/`. Un arreglo pequeño que no cambia lo que la spec dice no necesita change.
3. **Un bug se reproduce antes de arreglarlo, y deja una prueba.** CI rechaza un commit `fix:` que no toque una prueba, salvo que el mensaje lleve `Sin-prueba: <motivo>`.
4. **Si tocas rutas, controladores, validadores o transformers**, en el mismo commit: `npm run openapi:generate`, el diff de `backend/.adonisjs/` y el README de la capability.
5. **Al índice por nombre** (`git add <fichero>`), commits convencionales (`tipo(ámbito): qué`; el hook `commit-msg` rechaza lo demás) y **nunca `--no-verify`**.
6. **Antes de abrir el PR**, lo mismo que corre en CI: lint, formato, tipos, pruebas de las dos capas, `npm audit` y `openapi:check`. Si añades una prueba, actualiza su número en `AGENTS.md`: CI lo contrasta.
7. **Un solo PR al terminar la unidad**, con la plantilla de `.github/PULL_REQUEST_TEMPLATE.md` rellena, incluida la sección "Lo que este PR NO arregla". El revisor adversarial corre solo en cada push de una rama con PR abierto; su informe queda en el resumen del job.

### Definition of Done

Una unidad de trabajo está terminada cuando todo esto es cierto. Cada punto dice qué lo comprueba; los marcados **criterio** no los ve ninguna máquina.

| Hecho cuando | Lo comprueba |
|---|---|
| Lo que cambia de comportamiento está en `openspec/specs/`, con su change archivado sin casillas mudas | `openspec validate` y el verificador, en CI |
| Cada escenario nuevo de la spec tiene prueba, en la capa más baja que lo vea | **criterio**, con `docs/trazabilidad.md` como lista |
| Lint, formato, tipos, pruebas de las tres capas y `npm audit` en verde | Los jobs Backend, Frontend y Playwright |
| El contrato regenerado si cambió una ruta, y el README de la capability al día | `openapi:check` en CI; el README es **criterio** |
| El número de pruebas actualizado en `AGENTS.md` | `recuento-pruebas.mjs` en CI |
| Toda comprobación nueva tiene entrada en el catálogo y se ha visto morder | `mutaciones.mjs` en CI |
| Cada `fix:` deja una prueba o dice por qué no | R-08 en CI |
| Los hallazgos nuevos están en `docs/hallazgos.md` con sus casillas y su reproducción | **criterio**; la plantilla de PR los pide |
| El PR lleva la plantilla rellena, incluida «lo que NO arregla» | **criterio** |
| El informe del revisor adversarial leído, y cada grave reproducido o refutado por escrito | **criterio**; el revisor informa, no bloquea |

Qué comprueba CI y cómo se lee cuando falla: [`docs/runbooks.md`](docs/runbooks.md). Las reglas completas, con el modo de fallo de cada una: [`AGENTS.md`](AGENTS.md).

## Documentación

| Qué | Dónde |
|---|---|
| Producto: PRD, casos de uso, glosario y backlog | [`docs/prd/flowsync-mvp.md`](docs/prd/flowsync-mvp.md), [`docs/prd/casos-de-uso.md`](docs/prd/casos-de-uso.md), [`docs/prd/glosario.md`](docs/prd/glosario.md), [`docs/backlog/README.md`](docs/backlog/README.md) |
| Specs vivas y changes archivados | [`openspec/specs/`](openspec/specs/), [`openspec/changes/archive/`](openspec/changes/archive/) |
| Trazabilidad ticket, criterio, prueba y código; estrategia de pruebas | [`docs/trazabilidad.md`](docs/trazabilidad.md), [`docs/estrategia-de-pruebas.md`](docs/estrategia-de-pruebas.md) |
| Arquitectura, modelo de datos y decisiones | [`docs/architecture.md`](docs/architecture.md), [`docs/adr/`](docs/adr/) |
| Seguridad: fronteras, supuestos y lo que no se defiende | [`docs/seguridad.md`](docs/seguridad.md) |
| Contrato de la API | [`docs/api/openapi.json`](docs/api/openapi.json), servido también en `/api` |
| Operación, CI e incidentes | [`docs/runbooks.md`](docs/runbooks.md) |
| Hallazgos y su estado | [`docs/hallazgos.md`](docs/hallazgos.md) |
| Revisor automático | [`REVIEW.md`](REVIEW.md), [`docs/ci-revisor.md`](docs/ci-revisor.md) |
| Instrucciones para agentes | [`AGENTS.md`](AGENTS.md), el canónico; [`CLAUDE.md`](CLAUDE.md) lo importa y añade lo propio de Claude Code |
| Cómo se usó la IA, sesión a sesión | [`prompts.md`](prompts.md) |
