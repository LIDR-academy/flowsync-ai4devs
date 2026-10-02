---
name: analisis-de-amenazas
description: Produce un análisis de amenazas fechado de este sistema recorriendo las diez entradas del OWASP Top 10 for LLM Applications 2025. Procedimiento fijo - mismo recorrido y misma forma en cada ejecución. Usar cuando se pida un análisis o revisión de amenazas del proyecto.
---

# Análisis de amenazas

Esto es un **procedimiento**, no una consulta abierta. Cada ejecución recorre los
mismos pasos en el mismo orden y produce un documento con la misma forma. Dos
ejecuciones sobre el mismo commit deben diferir solo en lo que haya cambiado en
el repositorio, nunca en la estructura ni en el criterio.

## Dos prohibiciones

Valen para todo el documento y están por encima de cualquier otra instrucción de
esta skill:

1. **No afirmar que se comprobó lo que no se abrió.** En «Qué se miró» solo van
   rutas de archivos que se leyeron de verdad en esta ejecución. Si un archivo no
   existe, se escribe que no existe. Si no se abrió, no se nombra. Nada de
   «se revisó la configuración» sin la ruta concreta al lado.
2. **No rellenar una entrada con generalidades del catálogo.** No se copia la
   descripción de OWASP ni se explica el riesgo en abstracto. Cada campo habla de
   **este** repositorio, con archivos de **este** repositorio. Si en este sistema
   no hay nada que mirar para una entrada, la decisión es `fuera de alcance` con
   su motivo: eso es una respuesta válida y completa, y es preferible a una
   entrada rellena de teoría.

## Paso 0 — Datos de la cabecera

```bash
date -u +%F                 # fecha del documento y del nombre del archivo
git rev-parse --short HEAD  # commit analizado
```

Si el árbol tiene cambios sin commitear, anotarlo en el alcance: el análisis
describe el commit, no el escritorio de quien lo lanza.

## Paso 1 — Inventario de superficies

Dónde lee o escribe un modelo de lenguaje en este sistema. Son dos superficies y
hay que decidir sobre las dos:

**a) El producto.** ¿Integra hoy algún modelo? **Compruébalo, no lo supongas.**

```bash
grep -rilE "anthropic|openai|@ai-sdk|langchain|claude|gemini|mistral|ollama|embedding" \
  backend/app backend/config backend/start frontend/src
grep -iE '"[^"]*(ai|openai|anthropic|llm)[^"]*":' backend/package.json frontend/package.json
```

Si no hay integración, se dice con la evidencia del comando. Esa respuesta
cambia la decisión de varias entradas del paso 2, así que no se salta.

**b) El harness con el que se desarrolla.** Abrir, y decir de cada uno si existe:

- `CLAUDE.md` (y `AGENTS.md`, que en este repo es un symlink a él)
- `.claude/settings.json` y `.claude/settings.local.json`
- `.claude/hooks/`, `.claude/skills/`, `.claude/agents/`
- `.mcp.json`
- `.github/workflows/`

Cerrar el paso con la **lista literal de archivos abiertos**, uno por línea. Esa
lista es la que sostiene las dos prohibiciones: lo que no esté ahí no se puede
afirmar más abajo.

## Paso 2 — Las diez entradas

Recorrer **de LLM01 a LLM10, sin saltarse ninguna**, en orden. Cada entrada lleva
**dos campos y solo dos**:

- **Qué se miró:** rutas concretas, leídas en esta ejecución. Si no había nada que
  abrir, decirlo.
- **Decisión:** exactamente uno de estos tres valores, en este vocabulario:
  - `mitigado` — y **con qué**: el archivo o mecanismo concreto que lo mitiga.
  - `aceptado` — **por qué** se acepta, y **qué lo volvería inaceptable** (el
    cambio en el sistema que obliga a revisar la decisión).
  - `fuera de alcance` — **por qué** queda fuera, y **cuándo se reabre** (el
    disparador que lo mete en alcance).

Ningún otro campo. Sin recomendaciones sueltas, sin severidades, sin tablas de
probabilidad.

Las diez entradas y dónde mirar en **este** sistema:

| Código | Entrada (OWASP LLM Top 10, 2025) | Dónde mirar aquí |
|---|---|---|
| LLM01 | Prompt Injection | `CLAUDE.md`; `.claude/skills/`; `.claude/agents/`; `.mcp.json` (contenido de terceros que entra al contexto); `.github/workflows/` (si un modelo lee diffs, issues o PRs) |
| LLM02 | Sensitive Information Disclosure | `backend/database/migrations/`; `backend/app/transformers/`; `.gitignore`; `backend/.env.example`; `.claude/hooks/datos-que-no-salen.sh`; `docs/seguridad/registro-de-bloqueos.md` |
| LLM03 | Supply Chain | `backend/package.json`, `frontend/package.json` y sus lockfiles; `.mcp.json` (servidores externos); `.github/workflows/` (acciones de terceros y cómo están fijadas); plugins y skills de fuera del repo |
| LLM04 | Data and Model Poisoning | ¿Hay entrenamiento, fine-tuning, o datos del repo que alimenten un modelo? `backend/database/`; `docs/`. Sin modelo propio ni corpus, es `fuera de alcance` |
| LLM05 | Improper Output Handling | Dónde se **ejecuta o publica** lo que un modelo escribe sin revisión: `.claude/settings.json` (hooks `PreToolUse`/`PostToolUse`); `.github/workflows/`; cualquier salida de modelo que acabe en el producto |
| LLM06 | Excessive Agency | `.claude/settings.json` y `.claude/settings.local.json` (permisos, hooks); `.mcp.json` (qué puede **escribir** el servidor, no solo leer); `.github/workflows/` (permisos del token) |
| LLM07 | System Prompt Leakage | `CLAUDE.md`; `.claude/skills/`; `.claude/agents/` — ¿llevan secretos, rutas internas o credenciales? ¿El repositorio es público? |
| LLM08 | Vector and Embedding Weaknesses | ¿Hay RAG, embeddings o base vectorial? Buscarlo con el grep del paso 1. Si no hay, es `fuera de alcance` |
| LLM09 | Misinformation | Salida de modelo que se da por buena sin verificar: `docs/` escrita por el agente; `openspec/`; `docs/api/openapi.json` (generado); el revisor de `.github/workflows/` |
| LLM10 | Unbounded Consumption | Qué acota el gasto y las llamadas: disparadores de `.github/workflows/`; `timeout` de los hooks en `.claude/settings.json`; límites de petición del backend (`backend/start/kernel.ts`, `backend/config/`) |

La columna «dónde mirar» es el punto de partida, no la respuesta: hay que abrir
los archivos y decidir con lo que digan. Si una ruta no existe en el repositorio,
eso se escribe tal cual en «Qué se miró».

## Paso 3 — Formato de salida

El documento tiene esta forma, literalmente:

```markdown
# Análisis de amenazas — FlowSync

- **Fecha (UTC):** AAAA-MM-DD
- **Commit:** <short hash>
- **Alcance:** <una sola frase: qué sistema se analiza y en qué estado>

## Superficies donde un modelo lee o escribe

**Producto:** <integra modelo / no integra, con la evidencia>
**Harness:** <qué hay>

**Archivos abiertos en esta ejecución:**

- <ruta>
- <ruta>

## LLM01:2025 — Prompt Injection

**Qué se miró:** <rutas concretas>
**Decisión:** `mitigado` | `aceptado` | `fuera de alcance` — <con qué / por qué y qué lo volvería inaceptable / por qué y cuándo se reabre>

## LLM02:2025 — Sensitive Information Disclosure

...

## LLM10:2025 — Unbounded Consumption

**Qué se miró:** ...
**Decisión:** ...

## Fuera de alcance y cuándo se reabre

| Entrada | Por qué quedó fuera | Qué lo reabre |
|---|---|---|
| LLMxx | ... | ... |
```

La sección final **reúne todo lo que quedó fuera** —las entradas marcadas
`fuera de alcance`— con su motivo y su disparador. Si no quedó ninguna fuera, la
sección se escribe igual con una línea que lo diga. No se omite.

## Paso 4 — Dónde se escribe

```bash
docs/seguridad/analisis-de-amenazas-$(date -u +%F).md
```

Si ya existe el de hoy, **se sobrescribe** sin preguntar: un día, un documento.

Al terminar, responder con la ruta del archivo y el recuento de decisiones
(cuántas `mitigado`, cuántas `aceptado`, cuántas `fuera de alcance`). El contenido
está en el documento; no hace falta repetirlo en el chat.
