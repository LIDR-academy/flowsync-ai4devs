# Memoria del proyecto

Estado del trabajo entre sesiones. Léelo al arrancar; actualízalo al cerrar.

## Documentos

| Qué | Dónde |
|---|---|
| PRD del MVP (producto) | `docs/prd/prd-mvp.md` |
| Arquitectura del MVP (técnico) | `docs/prd/arquitectura-mvp.md` |
| Registro de prompts del usuario | `docs/prd/alcance-mvp-jm.md` — se sigue añadiendo cada prompt como `## Prompt N` conforme el usuario los formula |

## Estado actual (2026-09-18)

- PRD y arquitectura **redactados y aprobados**. Implementación **no empezada**.
- Rama de trabajo: `s2/start`. Antes de tocar código, crear rama `feat/<slug>` (regla de `CLAUDE.md`).
- `backend/database/schema.ts` tiene un diff sin commitear que es solo formato (el generador escribe `$columns` en una línea; prettier lo parte). No es un cambio real.

## Decisiones de producto

- **Problema:** la ronda "¿en qué estás?" de la daily y las interrupciones por chat. Nadie ve el estado del equipo sin preguntar.
- **Usuario:** equipos remotos 3–10 personas, roles planos. El valor lo cobran los pares, no un lead.
- **Qué desaparece:** solo la ronda "¿en qué estás?" de la daily. Los bloqueos siguen; el MVP no los resuelve.
- **Tiempo real = frescura, no presencia.** El estado es de la tarea, no de la persona. Nada de "quién está conectado". Resumen que espera, no aviso que interrumpe.
- **Sustituye al gestor de tareas**, no convive con él. El estado lo teclea la persona; no se deriva de Git/CI/calendario.
- **Una tarea =** título (único obligatorio), estado (`todo`/`doing`/`done`), responsable **opcional** (sin responsable = libre), fecha de vencimiento opcional.
- **Espacio único compartido**, sin entidad "equipo". Es un supuesto, no se construye.
- **Fuera del MVP:** equipos, roles/permisos, presencia, notificaciones push, Slack, integraciones externas, comentarios, adjuntos, prioridades, estimaciones, sprints, épicas, backlog priorizado, analítica/reporting, historial/feed, estado "bloqueada".
- **Riesgo #1:** que la información se quede vieja. Mitigación: actualizar cuesta dos clics, sin obligar.
- **Éxito:** a una semana, el equipo cancela la ronda y nadie pide que vuelva.
- **Construir:** una vertical fina y usable de punta a punta, no andamiaje.

## Decisiones técnicas

- **Polling cada 10 s** (solo con pestaña visible, refresco al volver) en vez de SSE/WebSockets. Sustituible sin tocar modelo ni API.
- **Una tabla nueva `tasks`:** `title`, `status` (string con enum en código), `assignee_id` nullable → users (`ON DELETE SET NULL`), `due_date` (date, sin hora), `created_by_id` → users, timestamps. Sin `team_id`, sin historial, sin paginación.
- **API** bajo `/api/v1` con auth: `GET/POST /tasks`, `PATCH/DELETE /tasks/:id`, `GET /users`. Transformers + `serialize()` según convención del repo.
- **Frontend:** ruta protegida `/tasks` como home tras login; `lib/api.ts` se amplía a PATCH/DELETE; hook propio `useTasks` (sin React Query); filtro por estado en cliente; hechas ocultas por defecto.
- **Tests:** functional en Japa para `/tasks` con `testUtils.db().truncate()`. Sin tests de frontend.

## Siguiente paso

Empezar la implementación siguiendo el plan de `docs/prd/arquitectura-mvp.md` §7 (migración → API + tests → cliente → pantalla → responsable/fecha/filtro → polling).
