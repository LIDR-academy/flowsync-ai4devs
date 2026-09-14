# CLAUDE.md

@AGENTS.md

Lo de arriba es todo lo que un agente necesita saber del repositorio, en el formato abierto que leen todas las herramientas. Este fichero añade solo lo propio de Claude Code. Los dos juntos caben bajo 200 líneas y CI lo comprueba: si algo no cabe, va a una skill.

## Lo que Claude Code trae configurado

| Pieza | Dónde | Cuándo |
|---|---|---|
| `/commit` | `.claude/skills/commit/` | Al cerrar cada petición. El hook `commit-msg` rechaza lo que no sea convencional |
| `/priority-ticket` | `.claude/skills/priority-ticket/` | Al empezar una tarea: trae el ticket de Jira, plan mode, mueve el estado al aprobar y al abrir el PR |
| `/opsx:propose`, `apply`, `verify`, `archive`, `explore`, `update`, `sync` | `.claude/commands/opsx/` | El ciclo OpenSpec. El gate humano va entre `propose` y `apply`: no se implementa sin aprobar los cuatro artefactos |
| Skill `reglas-de-proceso` | `.claude/skills/reglas-de-proceso/` | Antes de commitear, abrir un PR, saltar de rama o añadir una comprobación. Es la versión larga de la tabla de `AGENTS.md` |
| Subagente `adversarial-reviewer` | `.claude/agents/adversarial-reviewer.md` | Una vez, al cerrar la unidad de trabajo, sobre el PR. Read-only; lo que cuenta como grave lo decide `REVIEW.md` |
| Hook `PostToolUse` | `.claude/settings.json` | Prettier sobre cada fichero de `frontend/` editado. `format:check` en CI lo hace comprobable |
| Permisos pre-aprobados | `.claude/settings.json` | Lint, tipos, pruebas, formato, scripts de `scripts/` y lecturas de git y gh. Lo que escribe fuera del árbol sigue pidiendo permiso |
| MCP | `.mcp.json` | Atlassian, para Jira `LID`. El tablero sigue el trabajo; manda el repositorio |

## Cómo trabajar aquí

- **Explorar y planear antes de escribir.** Para cualquier cambio que toque más de un fichero, plan mode primero; el plan se guarda en `docs/plans/` (fuera de git) y lo que decide se lleva a `prompts.md`.
- **Una orden de `apply` dice dónde parar**: qué grupos de `tasks.md`, si se toca el frontend, si se commitea. El modelo sigue hasta el final si no se le corta.
- **Verificar por código de salida** y enseñar la evidencia: la salida del comando, la ejecución de CI, la captura. «Parece que funciona» no cierra nada.
- **Al compactar la conversación, conservar** la lista de ficheros modificados, los comandos de prueba ejecutados con su resultado, y los «no» que se hayan dicho al modelo en la sesión.
- **Los scripts de ajuste se escriben en fichero, nunca por `stdin` del shell**: el escapado de barras convirtió un `\b` en un carácter invisible dos veces, y el catálogo de mutaciones lo cazó las dos.

## Lo que no se hace

- No se edita `database/schema.ts`, `.adonisjs/` ni `components/ui/`: son generados.
- No se añaden dependencias sin decirlo en el plan: hay paquetes maliciosos que los modelos sugieren de forma recurrente.
- No se cierra un hallazgo del revisor sin reproducirlo; y no se aplica su orden de prioridad sin pasarlo por el criterio de `.github/calibracion-revision.md`.
