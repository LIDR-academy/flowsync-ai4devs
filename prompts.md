# prompts.md

> Cómo se usó la IA en este repositorio, sesión a sesión: herramientas, modelos, prompts clave, workflows, skills, subagentes, reglas, y los **ajustes humanos**, que son los «no» que se le dijeron al modelo y no dejan rastro en el código.
>
> Reconstruido el 2026-09-13 desde `docs/plans/` (fuera de git), los planes de sesión, los commits y `docs/recorrido-por-modulo.md`. Lo anterior al 2026-09-08 está resumido, no citado literal; desde esa fecha, lo que se cita es lo que se ejecutó. Desde hoy, **se alimenta cada sesión**, no al final: los ajustes humanos son lo que no se recuerda después.

## Herramientas y modelos

| Qué | Cuál | Para qué |
|---|---|---|
| Agente de desarrollo | **Claude Code**, en el escritorio y en terminal | Todo el trabajo interactivo: explorar, planear, escribir, verificar |
| Modelos en sesión | Opus 5 (hasta el 2026-09-13), Fable 5.1 (desde entonces) | Elegidos por el harness, no por prompt. Sin efecto medido entre los dos |
| Revisor en CI | `claude -p` con **Sonnet 5, `--effort medium`, `--max-turns 40`**, `timeout-minutes: 10` | Los valores exactos que pide el Módulo 5. Herramientas `Read`, `Grep`, `Glob`; todo lo que escribe o sale a la red, negado |
| Credencial del revisor | `CLAUDE_CODE_OAUTH_TOKEN` de `claude setup-token` | Gasta cuota de la suscripción, no factura aparte. Rotación en `docs/runbooks.md` §4 |
| Specs | **OpenSpec 1.10.0**, comandos `/opsx:*` | Propose, apply, verify, archive. Fijado en CI |
| Tablero | Jira `LID` por **MCP de Atlassian** (`.mcp.json`) | Leer tickets, comentar, mover estados. Manda el repositorio, no el tablero |
| GitHub | `gh` CLI | PR, runs, secretos, API |
| Navegador | Playwright, y el panel de vista previa de Claude Code | Verificar en pantalla lo que ninguna otra capa ve |
| Contexto de código | `codebase-memory` (MCP) | Buscar símbolos y trazar llamadas antes de leer ficheros enteros |

**Lo que no se usó, y por qué**: la acción oficial `anthropics/claude-code-action` (exige que el PR viva donde está instalada la GitHub App, y el nuestro vive en el repositorio del curso: H-24); Cursor u otros agentes (una sola herramienta, para que `CLAUDE.md` tenga un solo lector); varios modelos en paralelo para auditar (la Sesión 6 lo recomienda para listas largas; aquí las listas nunca pasaron de doce).

## Reglas que gobiernan cada sesión

Viven en [`CLAUDE.md`](CLAUDE.md) y se resumen aquí porque son lo que el modelo lee antes de actuar:

- Rama por unidad de trabajo, nunca en `main` ni `sN/*` (hook `pre-commit`).
- Commit convencional por petición (hook `commit-msg`), al índice por nombre, nunca `--no-verify`.
- Un `fix:` deja una prueba o dice por qué no (`Sin-prueba:`, R-08 en CI).
- Toda comprobación nueva entra en el catálogo de mutaciones y se ve morder (R-14).
- Se verifica por código de salida, no por la última línea (R-06).
- Un solo PR al cerrar la unidad; el revisor adversarial corre en cada push y **no bloquea**.
- El número de pruebas vive en un solo sitio y CI lo contrasta.
- Documentación que no se contrasta con el código no se escribe (ADR-0004).

## Skills, comandos, hooks y subagentes

| Pieza | Dónde | Qué hace |
|---|---|---|
| `/commit` | `.claude/skills/commit/` | Commit convencional desde lo staged. El hook `commit-msg` lo hace obligatorio desde el 2026-09-13 |
| `/priority-ticket` | `.claude/skills/priority-ticket/` | Trae el ticket de Jira de más prioridad, entra en plan mode, mueve el estado al aprobar y al abrir el PR |
| `/opsx:propose`, `apply`, `verify`, `archive`, `explore`, `update`, `sync` | `.claude/commands/opsx/` y `.claude/skills/openspec-*` | El ciclo OpenSpec. El gate humano está entre `propose` y `apply` |
| Hook `PostToolUse` | `.claude/settings.json` | Prettier sobre cada fichero de `frontend/` que el agente edite. Desde hoy, `format:check` en CI lo hace comprobable |
| Subagente `adversarial-reviewer` | `.claude/agents/adversarial-reviewer.md` | Refutar el cambio contra `openspec/specs/`, el contrato y `CLAUDE.md`. Read-only. Lo que cuenta como grave lo decide `REVIEW.md` |
| Revisor en CI | `.github/workflows/revision-adversarial.yml` | El mismo encargo, en cada push con PR abierto. Informe en el resumen del job |

## Sesión a sesión

### S1 · Priming · 2026-08-19

**Encargo**: LID-3, autenticación en el frontend sobre la API que ya traía el repositorio.

**Workflow**: `/priority-ticket` → plan mode con el plan escrito en `docs/plans/modulo-1-lid-3-auth-frontend.md` → aprobación → implementación → PR #12.

**Prompts clave**: el plan, con las decisiones tomadas antes de escribir: `lib/api.ts` como único punto de contacto con el backend; el token en `localStorage` revalidado contra el perfil al arrancar; errores de VineJS traducidos al castellano por nombre de regla.

**Ajustes humanos**: los hallazgos del PR #12 se arreglaron en el mismo commit y no llegaron a ningún registro, porque el registro no existía. Fue el motivo de crearlo en S2.

### S2 · Spec-Driven Development · 2026-08-24

**Encargo**: PRD, alcance del MVP y backlog de la épica E2 con criterios de aceptación. **Cero código.**

**Prompt clave, y el más rentable del proyecto**: «Antes de escribir nada de producto, audita el repositorio: qué hay en cada capa, qué falta, qué contradice lo que dice de sí mismo. Cada cosa con cómo la verificaste». De ahí salieron H-01 a H-10, ninguno de código propio.

**Workflow**: auditoría → `docs/estado-actual.md` → PRD con requisitos numerados (RF) y puntos abiertos (PA) → historias con criterios, marcando `[PROPUESTO]` los que no derivan del PRD → tickets en Jira con nuestra numeración `FS-10x`.

**Ajustes humanos**: se rechazó que el modelo cerrara los puntos abiertos por su cuenta: PA-1 a PA-6 quedaron escritos como decisiones pendientes, no resueltas. Y se descubrió que E2-5 no tenía requisito propio en el PRD: se registró como PA-6 en vez de inventar el requisito.

### S3 · OpenSpec · 2026-08-25 y 26

**Encargo**: la capability `tasks` entera con OpenSpec, y después la base de pruebas.

**Prompt de la Demo 1** (spec viva de `auth` por ingeniería inversa), seis reglas: leer el código y escribir lo que hace hoy sin proponer nada; solo el vertical de auth; formato exacto de `openspec/specs/`; sin ADDED/MODIFIED/REMOVED; solo comportamiento observable desde fuera; y al terminar, **decir qué no se pudo expresar como requisito y por qué**. El gate: contrastar la spec generada contra H-03, H-04 y H-06, que ya se conocían.

**Prompt de la Demo 2** (`/opsx:propose add-task-list`): las historias del backlog leídas enteras; el stack real; sin design system nuevo ni dependencias; **sin tests en este change**; estados `pending`/`in_progress`/`done` como conjunto cerrado con 422; cada criterio traducido a escenario sin copiarlo; preguntar antes de escribir sobre cualquier cosa que cambie el alcance. Seis restricciones no negociables: sin fecha, exactamente tres operaciones, solo el título al crear, sin refresco, sin filtros, sin reasignar.

**Workflow**: `propose` → **gate humano sobre los cuatro artefactos** (proposal, spec delta, design, tasks) → `apply` en dos tiempos, backend acotado y luego frontend → verificación E2E en navegador → `/verify` → `archive`. Segundo change `add-test-foundation` para H-01 y H-02.

**Ajustes humanos**: la orden de `apply` llevaba «ejecuta SOLO los grupos 1 a 4; para al terminar; no toques el frontend; no crees rama, no hagas commit, no abras PR y no lances el revisor». El modelo tiende a seguir hasta el final si no se le corta. Se rechazó una dependencia nueva que propuso para fechas. Los tres archives se hicieron con verificaciones marcadas sin hacer: es H-18, encontrado en S4.

### S4 · Verificación · 2026-08-26 al 2026-09-02

**Encargo**: trazabilidad de historia a código, documentación que se contrasta con el código, y siete revisiones adversariales.

**Prompt del revisor** (subagente `adversarial-reviewer`): «Tu único objetivo es demostrar que el código está mal. Contrasta contra los escenarios de `openspec/specs/`, el contrato y `CLAUDE.md`. Cada afirmación con `fichero:línea` que hayas leído y el escenario que se rompe. No edites.» Siete pasadas seguidas, cada una sobre lo que la anterior arregló.

**Workflow nuevo**: `scripts/verificar-docs.mjs`, una comprobación por cada afirmación de la documentación que se pueda contrastar. Y la regla que nació aquí: **una comprobación cuenta cuando se la ha visto fallar**. Las siete revisiones encontraron el verificador en verde sobre mutaciones reales, siempre por el mismo motivo: la mutación con la que se probó cada comprobación era la que ya cubría por construcción.

**Ajustes humanos**: al saltar a `s4/start` se dieron por cerrados tres hallazgos sin mirarlos (H-22). La corrección fue de proceso, no de prompt: «al saltar de rama, los hallazgos se comprueban uno a uno». H-19 se bajó de prioridad tres módulos seguidos con el argumento de que en producción no ocurre; se decidió que ese argumento no vale.

### S5 · Controles y guardarraíles · 2026-09-02 al 13

**Encargo**: auditar las reglas de proceso contra 61 commits, bajar a código las que fallan en silencio, el contrato generado y vigilado, y el revisor en CI.

**Prompt de la auditoría de reglas**: «Para cada regla de `CLAUDE.md`, di si falla ruidoso, silencioso o no computable, y cuenta contra el historial si se cumplió: casos, no impresiones». Resultado: R-01 incumplida 45 veces sin que nadie lo notara; R-05, la única que decía cumplirse, era falsa (H-24).

**Prompt del revisor en CI** (`revision-adversarial.yml`): el del subagente más `REVIEW.md` inyectado, con el diff ya escrito en un fichero para que no necesite shell. Lo que cambió de la calibración larga a `REVIEW.md` de una pantalla: «ciento veintiocho líneas de razonamiento delante de siete categorías hacen que el modelo lea razonamiento».

**Workflow**: reglas → hook o CI según su modo de fallo → catálogo de mutaciones para cada comprobación → revisor en CI → Playwright para lo que solo se ve en pantalla.

**Ajustes humanos, los que más pesan del proyecto**:
- **No** a la cascada de tres revisores del directo: con dos graves reales y ningún grave falso, no hay falsos positivos que filtrar. Aplazado con datos, no rechazado.
- **No** a subir `--max-turns` cuando el revisor agotaba los 40 (H-30): se partió la unidad de trabajo.
- **No** a que el revisor bloquee: lo determinista bloquea, el revisor informa.
- **No** a arreglar H-37 como pedía el revisor dos veces: la decisión de H-13 (un solo dueño del cierre por 401) se mantuvo, y lo que se añadió fue una prueba que lo vigila.
- **Sí** a probar la credencial rota del revisor después de haber decidido no hacerlo esa misma mañana. Salió en rojo como debía y destapó H-39.
- Al modelo se le corrigió la primera medida de H-24: había contado veinte filas de `gh run list` por defecto y eran 56.

### S6 · Auditar sistemas legacy · aplicado el 2026-09-13

**No hubo rebanada nueva que auditar en FlowSync**; lo que se aplicó fue el criterio.

**Lo que cambió por la sesión**: las entradas de `hallazgos.md` llevan daño, radio contado, reversibilidad y precedencia en vez de «severidad»; `REVIEW.md` pide las cuatro casillas por grave, en blanco si no se confirman leyendo; el orden lo pone el criterio escrito en `calibracion-revision.md` (precedencia topológica, daño entre radio, negocio como desempate, contención antes que arreglo); y los dos números por corrida (devueltos, comprobados a mano) tienen sitio fijo.

**Prompt que se usará el día que haya rebanada** (del curso, adaptado): «Audita la rebanada X: todo lo que la toque en rutas, base, backend y frontend. Para cada hallazgo, título, `fichero:línea` y una frase. No ordenes por criticidad: rellena DAÑO, RADIO contado y listado, REVERSIBILIDAD y PRECEDENCIA nombrando el otro hallazgo. Deja en blanco lo que no puedas confirmar leyendo. No arregles nada.» Y después: «Escribe `docs/auditoria/<rebanada>.md` con una fila por hallazgo, ordenada por precedencia y luego daño ÷ radio; parte en fila de contención y fila de arreglo; lo que no se pueda medir va fuera de la tabla.»

### Cierre · 2026-09-13

**Encargo**: dejar el repositorio en cumplimiento con el lineamiento de artefactos (README, runbooks, casos de uso, C4, TSDoc, formato y `audit` en CI, evidencia en el resumen del job, `prompts.md`, unitarias, flujo principal en navegador, hooks de mensaje, Dependabot, plantilla de PR).

**Workflow**: lista de 46 artefactos con estado → plan de nueve pasos → cada paso con su comprobación vista en verde y en rojo → un commit por paso.

**Ajustes humanos**: se rechazó reescribir los 39 hallazgos al formato nuevo (solo los tres vivos, como muestra); se decidió **no desplegar** en FlowSync porque exige decidir el origen de CORS y un sitio donde alojarlo, y eso es del Proyecto Final; y se corrigió al modelo tres veces por el escapado de barras en scripts pasados por el shell, el mismo error que el catálogo de mutaciones ya había cazado el 2026-09-12. Los scripts de ajuste se escriben en fichero, no por `stdin`.

## Lo que este fichero enseña, en una línea por sesión

- S1: lo que se arregla sin registrar no existe.
- S2: mirar antes de tocar encuentra más que construir.
- S3: el gate humano va entre el plan y el código, y la orden al modelo lleva dónde parar.
- S4: una comprobación cuenta cuando se la ha visto fallar.
- S5: lo que falla en silencio se baja a un hook; lo que no se puede comprobar se dice.
- S6: se delega el diagnóstico, nunca el criterio.
