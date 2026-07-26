---
name: priority-ticket
description: Trae el ticket de mayor prioridad asignado al usuario logeado en Jira (vía MCP) y arranca el trabajo sobre él. Usar al empezar una tarea nueva.
---
# Priority ticket
1. Consulta Jira vía MCP: busca los tickets asignados al usuario actual, ordénalos por prioridad y toma el de mayor prioridad.
2. Resume sus criterios de aceptación.
3. Entra en plan mode y propone cómo implementarlo (sigue las convenciones de AGENTS.md/CLAUDE.md si existen).
4. Cuando el usuario apruebe tu plan, mueve la tarea a en curso
5. Al finalizar la tarea mueve la tarea a en revision