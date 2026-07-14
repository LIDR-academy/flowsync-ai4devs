# docs/ — Material del mentor (FlowSync · Bloque Fundacional)

Fuente única mentor-facing. Cada sesión tiene su carpeta `docs/sN/` con el guion y los prompts. Si encuentras mejoras, **abre un PR** a `main`.

> Cobertura: **Claude Code**. Si impartes con otro IDE (Cursor, Copilot…), adapta el setup del cockpit tú mismo.

## Mapa de ramas (código por sesión)
Los docs viven en `main`. El **código** de cada estado vive en ramas:

| Rama | Estado |
|---|---|
| `main` | Base (scaffolding AdonisJS + React) + estos docs |
| `s1/start` | Punto de partida de S1 (= base) |
| `s1/setup` | + cockpit de Claude (`.claude/`, AGENTS.md, CLAUDE.md) — **el mentor arranca S1 aquí** |
| `s1/end` | + solución de S1 (perfil devuelve `lastLoginAt`) |
| `s2/start` | = `s1/end` |
| `s2/setup` | = `s2/start` (S2 no añade tooling nuevo; usa plan mode + prompts) |
| `s2/end` | + PRD del MVP (`docs/prd/flowsync-mvp.md`) |

Regla: `sN/start = s(N-1)/end` (continuidad).

## Contenido por sesión
- `docs/sN/guion.md` — guion en vivo (qué dice y hace el mentor; setup, timing, marcadores 📌).
- `docs/sN/slides.md` — deck **autocontenido** con la teoría (el "porqué"); pensado para el alumno que NO hizo el asíncrono. Convertible a diapositivas.
- `docs/sN/prompts.md` — los prompts exactos, listos para copiar.

## Artefactos que produce el proyecto (en ramas de sesión, no aquí)
- `docs/prd/flowsync-mvp.md` (S2+), `docs/backlog/` (S3+), `openspec/` (S4+).
