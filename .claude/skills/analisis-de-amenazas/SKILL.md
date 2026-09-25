---
name: analisis-de-amenazas
description: Produce el análisis de amenazas fechado de FlowSync contra el OWASP Top 10 for LLM Applications 2025, en docs/seguridad/analisis-de-amenazas-AAAA-MM-DD.md. Procedimiento fijo; usar cuando se pida el análisis de amenazas o /analisis-de-amenazas.
---
# Análisis de amenazas (OWASP Top 10 for LLM Applications 2025)

Es un procedimiento, no un consejo: cada ejecución recorre los mismos pasos, en este orden, y sale
con la misma forma. No te saltes pasos ni reordenes secciones.

## Prohibiciones

- **No afirmes que se comprobó lo que no se abrió.** Todo archivo que cites en «Qué se miró» lo has
  abierto (o buscado dentro) en esta ejecución. Si no lo abriste, no lo cites ni razones sobre su
  contenido.
- **No rellenes una entrada con generalidades del catálogo.** Nada de describir qué es la amenaza en
  abstracto ni de listar mitigaciones genéricas. Cada frase habla de un archivo, una configuración o
  un flujo concreto de este repositorio.
- Si en este sistema no hay nada que mirar para una entrada, la decisión es `fuera de alcance`, con
  su motivo y su disparador. Es una respuesta válida, no un hueco que haya que tapar.

## 1. Inventario de superficies

Dos superficies donde un modelo de lenguaje lee o escribe:

1. **El producto** (`backend/`, `frontend/`). ¿Integra hoy algún modelo? Compruébalo en el código,
   no lo supongas: busca dependencias y llamadas (`package.json` de cada lado; `anthropic`,
   `openai`, `@ai-sdk`, `langchain`, `llm`, `embedding`, `completion`, `fetch` a APIs de modelos)
   en `backend/app/`, `backend/start/`, `backend/config/`, `frontend/src/`.
2. **El harness con el que se desarrolla**: `CLAUDE.md` (y a qué apunta `AGENTS.md`), todo
   `.claude/` (`settings.json`, `settings.local.json` si existe, `hooks/`, `skills/`, `agents/`,
   `commands/`), `.mcp.json` y `.github/workflows/`.

Anota la lista de archivos que abriste. Va en el documento.

## 2. Las diez entradas, de LLM01 a LLM10

Recórrelas todas, en este orden, sin saltarte ninguna:

| Código | Entrada |
|---|---|
| LLM01 | Prompt Injection |
| LLM02 | Sensitive Information Disclosure |
| LLM03 | Supply Chain |
| LLM04 | Data and Model Poisoning |
| LLM05 | Improper Output Handling |
| LLM06 | Excessive Agency |
| LLM07 | System Prompt Leakage |
| LLM08 | Vector and Embedding Weaknesses |
| LLM09 | Misinformation |
| LLM10 | Unbounded Consumption |

Para cada una, contra las dos superficies del paso 1, dos campos y **solo dos**:

- **Qué se miró**: archivos concretos, con ruta relativa a la raíz del repositorio.
- **Decisión**: exactamente uno de estos tres valores:
  - `mitigado`: con qué (el archivo, el hook, la regla o la configuración que lo mitiga).
  - `aceptado`: por qué, y qué lo volvería inaceptable.
  - `fuera de alcance`: por qué, y cuándo se reabre (un disparador observable, p. ej. «cuando el
    backend añada una dependencia de un SDK de modelo»).

## 3. Formato del documento

Exactamente esta forma:

```markdown
# Análisis de amenazas — FlowSync — AAAA-MM-DD

- **Fecha:** AAAA-MM-DD (UTC)
- **Commit:** <salida de `git rev-parse --short HEAD`>
- **Alcance:** <una frase>

## Superficies

### Producto
<si integra o no un modelo, y en qué se basa>

### Harness
<qué hay>

### Archivos abiertos
- `ruta/uno`
- `ruta/dos`

## LLM01 — Prompt Injection
**Qué se miró:** `ruta`, `ruta`
**Decisión:** `mitigado` | `aceptado` | `fuera de alcance` — <con qué / por qué y qué lo volvería inaceptable / por qué y cuándo se reabre>

… (una sección igual por entrada, hasta LLM10)

## Fuera de alcance y cuándo se reabre
| Entrada | Motivo | Disparador para reabrir |
|---|---|---|
```

La sección final reúne **todas** las entradas con decisión `fuera de alcance`, con su motivo y su
disparador. Si no hay ninguna, lo dice en una línea.

## 4. El archivo

- Fecha: `date -u +%F`. Commit: `git rev-parse --short HEAD`.
- Ruta: `docs/seguridad/analisis-de-amenazas-<fecha>.md`. Si ya existe uno de hoy, se sobrescribe.
- Antes de darlo por terminado, comprueba: están las diez secciones LLM01–LLM10, cada una con sus
  dos campos y nada más; cada decisión es uno de los tres valores; toda ruta citada en «Qué se miró»
  aparece en «Archivos abiertos».
