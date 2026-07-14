# Prompts — Sesión 1 (copiar/pegar)

## 4.A — Loop (tarea trivial, sin dominio)
Chat pelado y luego agente con plan mode (`Shift+Tab`):
```
Añade un endpoint GET /api/v1/health que devuelva { status: "ok" }.
```

## 4.B — AGENTS.md
Contenido de `AGENTS.md` a pegar: ver el archivo `AGENTS.md` de la rama `s1/setup` (convenciones reales: migración-primero, transformers, serialize, VineJS, controllers generados). Enlazar para Claude Code:
```
ln -s AGENTS.md CLAUDE.md
```

## 4.C — Ampliar el harness
- Skill: crear `.claude/skills/commit/SKILL.md` (ver `s1/setup`).
- Subagente: crear `.claude/agents/code-reviewer.md` (ver `s1/setup`).
- Hook: `.claude/settings.json` + `.claude/hooks/format.mjs` (ver `s1/setup`).
- MCP GitHub:
```
claude mcp add
```
Demostración: `Lista los issues abiertos de este repo.`

## 4.D — Build integrado desde el issue
```
Lee el issue #1 de GitHub e impleméntalo siguiendo AGENTS.md. Entra en plan mode
primero, muéstrame el plan y espera mi aprobación antes de escribir código.

Recuerda la convención migración-primero: para el campo nuevo, crea una migración
y ejecuta `node ace migration:run` (no edites database/schema.ts a mano), actualiza
el flujo de login para setear lastLoginAt, y expón el campo en el UserTransformer.
```
Revisión con el subagente:
```
Usa el subagente code-reviewer para revisar el último diff.
```
Verificación (curl):
```
# signup
curl -s -X POST http://localhost:3333/api/v1/auth/signup -H "Content-Type: application/json" \
  -d '{"fullName":"Ada","email":"ada@example.com","password":"password123","passwordConfirmation":"password123"}'
# login (setea lastLoginAt) -> copiar el token oat_...
curl -s -X POST http://localhost:3333/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"password123"}'
# profile -> debe incluir lastLoginAt
curl -s http://localhost:3333/api/v1/account/profile -H "Authorization: Bearer <TOKEN>"
```
Cierre:
```
/commit
```
