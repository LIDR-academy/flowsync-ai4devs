# Análisis de amenazas — FlowSync

- **Fecha (UTC):** 2026-10-02
- **Commit:** fa3601e
- **Alcance:** El harness con el que se desarrolla FlowSync y su CI —el producto no integra ningún modelo—, sobre el commit `fa3601e`, con dos ficheros modificados sin commitear que no forman parte del análisis.

## Superficies donde un modelo lee o escribe

**Producto:** no integra ningún modelo. `grep -rilE "anthropic|openai|@ai-sdk|langchain|claude|gemini|mistral|ollama|embedding"` sobre `backend/app`, `backend/config`, `backend/start` y `frontend/src` no devuelve nada (exit 1). El grep sobre los `package.json` solo devuelve falsos positivos por subcadena: `@tailwindcss/vite`, `tailwind-merge`, `tailwindcss` y el subpath `#mails/*`. No hay SDK de ningún proveedor ni llamada a ninguna API de modelos.

**Harness:** ahí está toda la superficie. Dos sitios donde un modelo lee contenido y escribe resultados:

1. **Claude Code en local**, gobernado por `CLAUDE.md`, dos hooks en `.claude/settings.json`, diez skills en `.claude/skills/`, un subagente en `.claude/agents/` y un servidor MCP en `.mcp.json`.
2. **El revisor de CI** (`.github/workflows/revisor.yml`), que lanza `anthropics/claude-code-action@v1` sobre cada pull request, lee el árbol del PR y publica comentarios en él.

**Archivos abiertos en esta ejecución:**

- `CLAUDE.md`
- `AGENTS.md` (symlink a `CLAUDE.md`)
- `.claude/settings.json`
- `.claude/settings.local.json`
- `.claude/hooks/datos-que-no-salen.sh`
- `.claude/skills/commit/SKILL.md`
- `.claude/skills/priority-ticket/SKILL.md`
- `.claude/skills/analisis-de-amenazas/SKILL.md`
- `.claude/agents/adversarial-reviewer.md`
- `.mcp.json`
- `.github/workflows/revisor.yml`
- `.github/workflows/openapi.yml`
- `REVIEW.md`
- `docs/ci-revisor.md`
- `docs/seguridad/registro-de-bloqueos.md`
- `docs/adr/0001-openspec-como-fuente-de-verdad.md` (solo el título)
- `backend/database/migrations/` (los cuatro ficheros)
- `backend/app/transformers/user_transformer.ts`
- `backend/app/controllers/access_tokens_controller.ts`
- `backend/start/kernel.ts`
- `backend/package.json`, `frontend/package.json`
- `.gitignore`, `backend/.gitignore`, `frontend/.gitignore`
- `backend/.env.example` (nombres de clave, valores enmascarados)

No se abrieron: `backend/.env` en claro, los lockfiles (solo se comprobó que existen y su tamaño), ni el cuerpo de las ocho skills de OpenSpec.

## LLM01:2025 — Prompt Injection

**Qué se miró:** `.github/workflows/revisor.yml` (el bloque `prompt:`, el `if:` de fork y `--allowedTools`); `REVIEW.md`, que ese prompt declara vinculante; `CLAUDE.md`; `.claude/skills/priority-ticket/SKILL.md`; `.mcp.json`; `.claude/agents/adversarial-reviewer.md`.

**Decisión:** `aceptado` — El revisor de CI lee, del árbol del propio PR, dos ficheros que el prompt le manda obedecer (`REVIEW.md` y `CLAUDE.md`). Quien pueda abrir una rama en el repositorio puede modificarlos en el mismo PR que se va a revisar, así que la calibración del revisor es editable por el revisado. No está mitigado: está acotado. Lo acota que los PR desde fork se saltan enteros (`if: github.event.pull_request.head.repo.full_name == github.repository`), que el revisor no tiene herramienta de escritura (`--allowedTools` le da `Read,Grep,Glob`, el comentario en línea y tres subcomandos de `gh`), y que los permisos del trabajo son `contents: read` y `pull-requests: write`. El segundo camino es `priority-ticket`, que mete en contexto el texto de un ticket de Jira vía el MCP de `.mcp.json`: texto de terceros que llega como si fueran instrucciones. Qué lo volvería inaceptable: dar al revisor herramientas de escritura o un `Bash` más ancho, quitar el salto de los fork, o que el repositorio acepte ramas de gente ajena al curso.

## LLM02:2025 — Sensitive Information Disclosure

**Qué se miró:** `backend/database/migrations/` — `users` guarda `full_name`, `email` y `password`; `auth_access_tokens` guarda `hash` y la FK al usuario; `tasks` guarda `assignee_id`. `backend/app/transformers/user_transformer.ts`, que expone `email` pero no `password`. `.gitignore` (raíz, backend y frontend), que cubre `.env` y `tmp/*`. `backend/.env.example`. `.claude/hooks/datos-que-no-salen.sh` y `docs/seguridad/registro-de-bloqueos.md`.

**Decisión:** `mitigado` — con `.claude/hooks/datos-que-no-salen.sh`, un hook `PreToolUse` sobre `Bash` que ante cualquier comando con `git commit` mira las líneas añadidas y bloquea claves con forma reconocible, correos de dominio no reservado y el fichero `.env`, saliendo con 2 y dejando constancia en `docs/seguridad/registro-de-bloqueos.md`. Las dos líneas de ese registro son la evidencia de que actúa: una de la prueba con la que se montó y otra de un bloqueo real. Lo completa `.gitignore`, que mantiene `.env` y `tmp/db.sqlite3` fuera del repositorio, y el transformer, que no saca el hash de contraseña. El hook filtra las llamadas del agente, no las de una persona en su terminal.

## LLM03:2025 — Supply Chain

**Qué se miró:** `backend/package.json` y `frontend/package.json`; la existencia de `backend/package-lock.json` (262 KB) y `frontend/package-lock.json` (124 KB); los `uses:` de `.github/workflows/openapi.yml` y `.github/workflows/revisor.yml`; `.mcp.json`; `.claude/settings.local.json` y el listado de `.claude/`.

**Decisión:** `aceptado` — Las dependencias npm están fijadas por lockfile en los dos paquetes, y el CI instala con `npm ci`, que respeta el lock. Las cuatro acciones van por etiqueta mayor flotante (`actions/checkout@v7`, `actions/setup-node@v7`, `anthropics/claude-code-action@v1`), no por SHA: se acepta porque las tres vienen de GitHub y de Anthropic, los dos editores que ya hay que confiar para usar esta CI. En `.mcp.json` hay un único servidor, el de Atlassian, por HTTPS a su dominio oficial, y `.claude/settings.local.json` lo habilita explícitamente. No hay plugins ni marketplaces configurados: las diez skills y el único subagente viven en el repositorio y se revisan como código. Qué lo volvería inaceptable: añadir una acción de un publicador no verificado, un servidor MCP de un tercero distinto, o instalar skills o plugins desde fuera del repositorio.

## LLM04:2025 — Data and Model Poisoning

**Qué se miró:** el grep del paso 1 sobre `backend/app`, `backend/config`, `backend/start` y `frontend/src`, sin coincidencias; `backend/database/`, que contiene `migrations/`, `schema.ts` y `schema_rules.ts` y ningún seeder ni factory; los `package.json` de los dos paquetes.

**Decisión:** `fuera de alcance` — No hay modelo propio, ni entrenamiento, ni ajuste fino, ni corpus del repositorio que alimente a ningún modelo. No hay nada que envenenar. Se reabre el día que el producto incorpore un modelo propio o ajustado, o que algún dato del repositorio pase a usarse como material de entrenamiento o de few-shot fijo.

## LLM05:2025 — Improper Output Handling

**Qué se miró:** `.claude/settings.json`, los dos hooks: el `PostToolUse` de Prettier y el `PreToolUse` de `.claude/hooks/datos-que-no-salen.sh`. `.github/workflows/revisor.yml`, el bloque `prompt:` donde se le dice al revisor que publique por comentario y que no edite ficheros. El grep del paso 1, que descarta que salida de modelo llegue al producto.

**Decisión:** `aceptado` — Lo que un modelo escribe aquí no se ejecuta. El hook de Prettier no corre contenido generado: toma una ruta del propio harness por `jq`, la filtra con un `case` contra `frontend/`, y se la pasa entrecomillada a `prettier --write`. El revisor de CI publica texto en comentarios de PR y tiene prohibido editar ficheros, tanto por el prompt como por no tener herramienta de escritura. El código que el agente escribe en local sí entra en el repositorio, pero pasa por `lint`, `typecheck`, tests y revisión humana en el PR antes de mergear. Qué lo volvería inaceptable: un hook que ejecute lo que el modelo genera (un `eval`, un script escrito al vuelo), o que salida de modelo llegue sin validar a una respuesta del producto.

## LLM06:2025 — Excessive Agency

**Qué se miró:** `.claude/settings.json`, que declara dos hooks y **ningún** bloque `permissions`, de modo que rigen los permisos por defecto del harness. `.claude/settings.local.json`, que habilita el servidor `atlassian`. `.mcp.json`. `.claude/skills/priority-ticket/SKILL.md`, que manda mover el ticket de estado y comentar en él. `.github/workflows/revisor.yml`, bloque `permissions:` y `--allowedTools`. `CLAUDE.md`, reglas de proceso.

**Decisión:** `aceptado` — El agente tiene escritura sobre tres cosas: el árbol de trabajo, el repositorio Git, y Jira/Confluence a través del MCP de Atlassian, que `priority-ticket` usa para transicionar tickets y comentarlos. Se acepta porque ninguna de las tres alcanza producción: no hay credenciales de despliegue, ni acceso a infraestructura, ni base de datos que no sea el SQLite local; el MCP actúa con la sesión del propio usuario y sobre sus propios tickets; y al no haber `permissions` en `settings.json` las acciones siguen pasando por la aprobación interactiva del harness. En CI la agencia es menor todavía: `contents: read`, `pull-requests: write` y sin herramientas de escritura. Qué lo volvería inaceptable: dar al agente credenciales de un entorno desplegado, añadir un MCP con escritura sobre infraestructura o facturación, o fijar un `permissions` permisivo que elimine la aprobación.

## LLM07:2025 — System Prompt Leakage

**Qué se miró:** `CLAUDE.md`; las tres skills propias que se abrieron (`commit`, `priority-ticket`, `analisis-de-amenazas`); `.claude/agents/adversarial-reviewer.md`; el bloque `prompt:` de `.github/workflows/revisor.yml`; `REVIEW.md`; `docs/ci-revisor.md`; `.mcp.json`.

**Decisión:** `mitigado` — con que ninguna de esas instrucciones contiene una credencial. Las dos del revisor se referencian como `${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` y `${{ secrets.GITHUB_TOKEN }}`, y `docs/ci-revisor.md` documenta que el alta del secreto se hace a mano en GitHub y «no se puede commitear». `.mcp.json` lleva solo la URL del servidor, sin token: la credencial de Atlassian vive en el almacén de Claude Code. El contenido de estos ficheros es, por diseño, público para quien tenga el repositorio: son las reglas del proyecto, no un secreto. No se pudo comprobar si el repositorio es público —`gh` no está instalado en esta máquina—, pero la decisión no depende de ello, porque lo que se filtraría ya está pensado para leerse.

## LLM08:2025 — Vector and Embedding Weaknesses

**Qué se miró:** el grep del paso 1, que incluye `embedding` y no devuelve nada sobre `backend/app`, `backend/config`, `backend/start` ni `frontend/src`; `backend/package.json` y `frontend/package.json`, sin ninguna dependencia de base vectorial ni de recuperación; `backend/database/migrations/`, cuyas tres tablas son `users`, `auth_access_tokens` y `tasks`.

**Decisión:** `fuera de alcance` — No hay RAG, ni embeddings, ni almacén vectorial, ni recuperación semántica en ninguna parte del sistema. Se reabre el día que se añada búsqueda semántica, un índice de documentos o cualquier recuperación que alimente el contexto de un modelo.

## LLM09:2025 — Misinformation

**Qué se miró:** `.github/workflows/openapi.yml`, que ejecuta `npm run openapi:check` en cada PR y en cada push a `main`; `REVIEW.md`, en particular la regla de citar `fichero:línea` y el tope de cinco sugerencias; `docs/adr/0001-openspec-como-fuente-de-verdad.md`; `openspec/specs/`, con `auth` y `tasks`; `CLAUDE.md`, que manda cerrar cada cambio de capability con el OpenAPI y el README al día.

**Decisión:** `aceptado` — Lo que puede comprobarse a máquina, se comprueba: `openapi:check` compara el documento versionado con el que se regenera del código y falla si difieren, así que una descripción de API inventada por un agente no sobrevive al CI. Y al revisor se le prohíbe en `REVIEW.md` deducir comportamiento del nombre de las cosas: tiene que citar `fichero:línea`. Lo que no tiene comprobación automática es la prosa: los `docs/capabilities/<nombre>/README.md` y los scenarios de `openspec/specs/`, que según el ADR 0001 son la fuente de verdad del proyecto y sin embargo los escribe en buena parte un agente. Se acepta porque hoy los lee una persona en el PR antes de mergear. Qué lo volvería inaceptable: que esa documentación se genere y se mergee sin que nadie la lea, o que la spec deje de revisarse y se siga tratando como fuente de verdad.

## LLM10:2025 — Unbounded Consumption

**Qué se miró:** `.github/workflows/revisor.yml`: `timeout-minutes: 10`, `--max-turns 40`, el `if:` que salta los PR de fork, y los cuatro tipos de evento que lo disparan (`opened`, `synchronize`, `reopened`, `ready_for_review`). `.github/workflows/openapi.yml`, que sí declara `concurrency` con `cancel-in-progress: true`. `.claude/settings.json`, con `timeout` de 30 s en el hook de Prettier y 15 s en el de datos. `docs/ci-revisor.md`, el apartado de en qué se va el dinero. `backend/start/kernel.ts` y `backend/config/`, sin limitador de peticiones.

**Decisión:** `aceptado` — El revisor tiene tres topes por ejecución: diez minutos de reloj, cuarenta turnos, y el salto de los PR de fork, que es además lo que impide que un desconocido dispare gasto. Pero `revisor.yml` **no declara `concurrency`**, cosa que `openapi.yml` sí hace: como `synchronize` está entre sus disparadores, varios push seguidos a un mismo PR lanzan revisiones en paralelo y ninguna cancela a la anterior, con lo que el gasto crece con la prisa de quien empuja. Se acepta mientras esto sea un repositorio de curso, con un autor y poco tráfico. Qué lo volvería inaceptable: que el repositorio reciba PR de varias personas, o que alguien adopte un ritmo de push frecuente sobre un PR abierto; ahí el grupo de `concurrency` deja de ser un detalle. El backend no tiene limitador de peticiones, pero eso no es consumo de modelo: no hay modelo detrás de ninguna ruta.

## Fuera de alcance y cuándo se reabre

| Entrada | Por qué quedó fuera | Qué lo reabre |
|---|---|---|
| LLM04:2025 — Data and Model Poisoning | El producto no integra ningún modelo: no hay modelo propio, entrenamiento, ajuste fino ni corpus que alimente a uno. No existe el objeto que se envenenaría. | Que el producto incorpore un modelo propio o ajustado, o que datos del repositorio pasen a usarse como material de entrenamiento o de few-shot fijo. |
| LLM08:2025 — Vector and Embedding Weaknesses | El producto no integra ningún modelo, y en consecuencia no hay embeddings, almacén vectorial ni recuperación semántica en ninguna parte. | Que se añada búsqueda semántica, un índice de documentos o cualquier recuperación que alimente el contexto de un modelo. |

Las dos salen por lo mismo y se reabren con el mismo disparador: **no son riesgos mitigados, son riesgos que todavía no existen aquí**. Ambas describen ataques contra las tripas de un modelo —sus datos de entrenamiento, su índice de recuperación— y este sistema no tiene ninguna de las dos cosas: el modelo está en el harness que escribe el código, no dentro del producto. El día que FlowSync llame a un modelo, las dos entran a la vez.
