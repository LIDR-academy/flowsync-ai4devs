# Guion S1 — El Harness: dominar el copiloto agéntico, no solo chatear con él

> **Sesión 1** · Bloque Fundacional · **Audiencia mixta** · **2h con break de 10 min** · Proyecto **FlowSync** (AdonisJS 7 API + React 19).
> **Ramas**: arranca en `s1/setup` (cockpit listo); solución de referencia en `s1/end`.
> **Cobertura**: Claude Code. (Otro IDE → el mentor adapta el cockpit.)

## 📋 Vista general (120 min)

| Bloque | Min | Acum | Qué pasa |
|---|---|---|---|
| 1 — Intro + el dato que engancha | 10 | 10 | Dónde estás, qué construyes hoy |
| 2 — Calibración | 15 | 25 | Encuesta de stack + comprobación asíncrono |
| 3 — Enlace: harness + hype + loop | 10 | 35 | Marco mental |
| 4 — Demo: cockpit (4.A + 4.B) | 25 | 60 | Loop + memoria (AGENTS.md) |
| — **Break** | 10 | 70 | — |
| 4 — Demo: cockpit (4.C + 4.D) | 35 | 105 | Skill+subagente+hook+MCP · build integrado |
| 5 — Q&A + cierre + preview S2 | 15 | 120 | — |

## 🛠️ Prework del mentor
- Clonar FlowSync, `git checkout s1/setup`. `cd backend && npm i && node ace migration:run`. `cd ../frontend && npm i`.
- Verificar backend arriba: `cd backend && node ace serve` → `GET http://localhost:3333/` responde. Claude Code autenticado.
- Tener a mano la rama `s1/end` (solución) por si falla algo en vivo, y **1 issue pre-creado** en GitHub: *"El perfil debe devolver lastLoginAt, actualizado en cada login"*.
- Prompts exactos en [`prompts.md`](prompts.md) (no improvisar).

## 📌 Notas globales
- La demo es un tour del **harness**, no de Claude Code. Traduce alguna pieza a Cursor/Copilot al menos una vez.
- Audiencia mixta: una frase de "qué es y por qué" al aparecer un comando nuevo, sin frenar a los seniors.
- Al salir un término hype (harness/context/agentic engineering), nómbralo con matiz y aterrízalo en pantalla.
- Si algo falla >90s: cambiar a `s1/end` y seguir. Una frase, sin disculpas.

---

# Bloque 1 — Intro (10 min)

> *"Bienvenidos. Hoy no vais a ver slides dos horas: vamos a construir en vivo el 'cockpit' — el entorno que convierte un modelo en un copiloto que de verdad multiplica. Si algo va rápido, paradme; si va lento para vosotros, aguantad treinta segundos que subo el nivel."*

📌 *Slide — el dato:* **84–90%** de devs ya usan IA; frustración #1 = *"casi correcto, pero no del todo"* (66%); herramienta más querida 2026 = **Claude Code (46%)**.
> *"Casi todos usáis IA. ¿Por qué unos vuelan y otros pelean con código 'casi bueno'? No es el modelo — es el **harness**, lo que rodea al modelo. Ese es el tema de hoy."*

📌 *Slide — el bloque:* `S1 Harness → S2 SDD+PRD → S3 backlog → S4 implementación → S5 verificación+docs`.
> *"Hoy montamos el cockpit sobre FlowSync. Un mismo proyecto crece con vosotros las cinco sesiones. Q&A abierto todo el rato; break a mitad."*

---

# Bloque 2 — Calibración (15 min)

📌 *Poll:* ¿copiloto principal hoy? (Copilot / Cursor / Claude Code / otro / solo ChatGPT). ¿horas/semana con IA?
- Ajuste: si dominan Claude Code, acelera 4.A/4.B; si <10h/semana, dosifica 4.C.

**Comprobación del asíncrono** (2-2.5 min c/u):
- *"¿Cuál es el cuello de botella de la IA en 2026?"* ✅ el modelo NO; la varianza la explican harness, contexto y prompt.
- *"¿Qué es un harness en una frase?"* ✅ todo lo que envuelve al modelo y lo vuelve agente. *Agente = Modelo + Harness*.
- *"¿Qué es context rot?"* ✅ la calidad degrada al crecer el contexto (Chroma, jul-2025). Heurística: vigilar la ventana y compactar/resetear antes de saturar (sin umbral oficial).

Cierre: *"¿Algo del asíncrono que no os cuadre?"* (si nadie habla, preguntar directo a alguien por nombre).

---

# Bloque 3 — Enlace: harness, hype y loop (10 min)

**3.1 Anatomía del harness (4 min).** 📌 *Agente = Modelo + Harness*: memoria (CLAUDE.md/AGENTS.md) · skills · subagentes · hooks · MCP · plan mode.
> *"El modelo es el motor; el harness es el coche entero. Hoy lo montamos pieza a pieza sobre FlowSync."*

**3.2 Desmitificar el hype (3 min).** 📌 `prompt eng (2020) → context eng (jun-2025) → harness eng (2026)`; y `vibe coding (feb-2025, sin revisar) → agentic engineering (2026, orquestar revisando)`.
> *"Os aterrizo los términos sin humo. Y os digo lo que otros no: los términos de 2026 tienen meses de vida y su 'autoría' está en disputa. Nos quedamos con lo que se ve en pantalla."*

**3.3 El loop agéntico (3 min).** 📌 `EXPLORAR → PLANIFICAR → CODIFICAR → VERIFICAR/COMMIT`.
> *"Este ciclo lo veréis hoy en vivo y volverá en S4 con OpenSpec."*

---

# Bloque 4 — Demo: construir el cockpit (60 min + break)

> 📌 *Transición:* montamos el cockpit sobre FlowSync y enviamos una feature real. `4.A loop → 4.B memoria → 4.C ampliar → 4.D build`.

## 🎬 4.A — El loop (chat vs agente) (12 min)
Rama `s1/start`. **Sin `.claude/` ni AGENTS.md** todavía (a propósito).

1. **Chat pelado (3 min):** en el chat del editor, prompt: *"Añade un endpoint GET /api/v1/health que devuelva { status: 'ok' }."* → da un bloque para pegar, con convenciones inventadas.
> *"Esto es lo que la mayoría llama 'usar IA'. Un bloque para pegar; no ha leído el proyecto."*

2. **Agente con loop + plan mode (6 min):** en terminal `claude`, mismo prompt. **`Shift+Tab` → plan mode** ANTES de que toque nada.
> *"Plan mode: puede leer y planificar, pero no escribir hasta que apruebe. Es 'planificar antes de codificar' hecho control."*
- Dejar que **explore** (`start/routes.ts`, controllers) y proponga un **plan**. Aprobar → codifica el diff. **No** aplicar aún.
> *"Mejor que el chat, pero aún inventa dónde va cada cosa. ¿Por qué? No le he dado la memoria del proyecto. Eso es lo siguiente."*

3. **Cierre (3 min):** cancelar el diff. 📌 completion vs chat vs **agentic (loop + plan mode)**.

## 🎬 4.B — La memoria: AGENTS.md (13 min)
1. **Crear AGENTS.md (4 min)** en la raíz (pre-armado, <30 líneas): stack + convenciones **reales** del starter —
> *"Fijaos en lo clave de este proyecto: es opinado. **`database/schema.ts` está AUTOGENERADO** — nunca se toca a mano; para cambiar el modelo, migración y `node ace migration:run`. Las respuestas se dan forma con **transformers**, no a mano. Validación con **VineJS**. Esto es lo que un dev nuevo necesita para no inventar. Menos de 30 líneas, alta señal — si metéis de todo, provocáis context rot."*
- Enlazar para Claude Code: `ln -s AGENTS.md CLAUDE.md` (o `@AGENTS.md`).

2. **Mismo prompt, con memoria (6 min):** relanzar `claude`. Pedir algo del dominio real: *"Añade un campo displayName-like… "* → mejor: repetir el health o un pequeño cambio y ver que respeta convenciones (usa transformer, no toca schema.ts).
> *"No le dije 'lee AGENTS.md'. Lo carga solo. Antes inventaba; ahora respeta el patrón — transformers, migración-primero. No cambié modelo, herramienta ni prompt. Cambié el contexto. Eso es 'el harness explica más varianza que el modelo'."*

3. **Context rot (3 min):** `/context` (~5-10%).
> *"Vigilad la ventana; en un refactor real llegáis a dos tercios en media hora → `/compact`. Por eso existen los subagentes."*

📌 *Cierre 4.B:* AGENTS.md = estándar cross-tool · mínimo y alta señal · cambia el output sin tocar modelo/herramienta/prompt.
> 💥 *"Si esta semana hacéis UNA cosa: cread un AGENTS.md en vuestro repo."*

**➡️ BREAK 10 min.**

## 🎬 4.C — Ampliar el harness (20 min)
El cockpit es un artefacto que se construye y **se versiona** (rama `s1/setup`). Cuatro piezas (si vais justos: solo skill + hook):
- **Skill `/commit`** (`.claude/skills/commit/SKILL.md`): commit convencional desde el diff staged. *"En Claude Code los slash commands se fusionaron con las skills."*
- **Subagente `code-reviewer`** (`.claude/agents/code-reviewer.md`, read-only, tools Read/Grep/Glob): *"su propio contexto y permisos; no puede tocar código. Embrión de la revisión adversarial de S5."*
- **Hook Prettier** (`.claude/settings.json`, PostToolUse `Edit|Write` → `format.mjs`): *"determinista; cada edición se formatea con Prettier. No depende de que el modelo se acuerde. Este starter usa ESLint+Prettier, no Biome."*
- **MCP de GitHub** (`claude mcp add`): *"USB-C de la IA; enchufo GitHub para leer los issues del repo."* Demostrar: listar issues → aparece el issue pre-creado.

📌 *Cierre 4.C:* cockpit = memoria + skills + subagentes + hooks + MCP, **versionado en `.claude/` y `AGENTS.md`**.

## 🎬 4.D — El cockpit implementa un issue (15 min)
Con todo el cockpit activo: *"Lee el issue #1 e impleméntalo siguiendo AGENTS.md. Entra en plan mode primero."*
- El agente: lee el issue (MCP) → explora → **plan** → aprobar → **codifica**:
  1. migración `add_last_login_at_to_users`; `node ace migration:run` **regenera** `schema.ts`.
  2. `AccessTokensController.store` setea `user.lastLoginAt = DateTime.now()` en login.
  3. `UserTransformer` expone `lastLoginAt`.
- El **hook Prettier** formatea cada edición; el **subagente code-reviewer** audita; verificar con curl (signup → login → `GET /api/v1/account/profile` devuelve `lastLoginAt`); cerrar con `/commit`.
> *"Todo junto: leyó el ticket solo, planificó, el hook formateó sin pedirlo, el revisor buscó bugs, y cerramos con un commit convencional. Esto no es un chat: es un sistema. (Referencia: rama `s1/end`.)"*

📌 *"La misma clase de tarea que en 4.A hacía un chat 'regular', el cockpit la hace bien, revisada y trazable. Eso es el harness."*

---

# Bloque 5 — Q&A + cierre + preview S2 (15 min)

**Q&A** (sembrar si hace falta): *"¿qué pieza del cockpit montáis mañana?"*, *"¿quién ya usa AGENTS.md?"*.

| Pregunta | Respuesta corta |
|---|---|
| ¿Funciona en Cursor/Copilot? | Sí: leen `AGENTS.md`, tienen MCP y hooks; los subagentes son de Claude, en otros IDEs hay alternativas. |
| ¿Skill vs subagente? | Skill = procedimiento reutilizable (cómo). Subagente = trabajador con su propio contexto/permisos. |
| ¿Por qué migración-primero? | Es la convención del starter: `schema.ts` es generado. Tocarlo a mano se pierde en el próximo `migration:run`. |

📌 *Preview S2 — SDD + PRD del MVP:* *"El cockpit de hoy estará activo toda la sesión. Iremos de una idea difusa a un PRD de FlowSync con la IA cuestionando decisiones, no solo redactando."* Antes de S2: crea un AGENTS.md en un repo tuyo.

📌 *Lo que te llevas de S1:* Agente = Modelo + Harness · el loop · un cockpit real versionado · criterio anti-hype.

> **Entregable**: rama `s1/end` — cockpit configurado + perfil devuelve `lastLoginAt`. Base para S2.
