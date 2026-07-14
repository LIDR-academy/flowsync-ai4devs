# Slides — Sesión 1: El Harness

> Deck **autocontenido**: asume que el alumno NO hizo el asíncrono. Cada slide lleva la teoría del "porqué". Formato: título · contenido · *(bloque)*. Separador `---` = cambio de slide.

---

## 1 · El modelo no es el cuello de botella
- El **84–90%** de los desarrolladores ya usa IA a diario (Stack Overflow, JetBrains, DORA 2025).
- Pero la frustración #1 es *"casi correcto, pero no del todo"* (**66%**).
- Casi todos tocáis modelos parecidos. La diferencia entre volar y pelear con "código casi bueno" **no es el modelo**.

> *(Bloque 1)* Gancho. La pregunta que abre el curso: si el modelo no es el problema, ¿qué lo es?

---

## 2 · Agente = Modelo + Harness
- **Harness** = todo lo que envuelve al modelo y lo convierte en agente: el bucle de herramientas, el contexto/memoria, los guardarraíles.
- El modelo es el motor; el harness es el coche entero (volante, frenos, GPS).
- En 2026, el **harness** —no el modelo— es el principal diferenciador entre herramientas.

> *(Bloque 3)* Definición central. Anótala: la repetiremos toda la sesión.

---

## 3 · Los 3 pilares (marco rápido)
- **Herramienta** · **Contexto** · **Prompt**. Los tres explican la calidad del resultado.
- El prompt es el que la gente sobreestima; contexto y herramienta suelen pesar más.
- Hoy los veréis actuar sobre la MISMA tarea, uno a uno.

> *(Bloque 3)* Marco condensado, no una clase. El "efecto de cada pilar" se ve en la demo.

---

## 4 · Desmitificar el hype (genealogía)
- **Prompt engineering** (2020): escribir buenas instrucciones. No murió, se quedó pequeño.
- **Context engineering** (jun-2025): curar qué entra en la ventana de contexto.
- **Harness engineering** (2026): tratar todo lo que rodea al modelo como ingeniería.
- Eje de práctica: **vibe coding** (feb-2025, aceptar sin revisar) → **agentic engineering** (2026, orquestar *revisando*).

> *(Bloque 3)* Honestidad: los términos de 2026 tienen meses de vida y su autoría está en disputa. Nos quedamos con lo que se ve en pantalla.

---

## 5 · El loop agéntico
- El ciclo canónico del trabajo serio con agentes:
- **EXPLORAR → PLANIFICAR → CODIFICAR → VERIFICAR/COMMIT**
- Lo usan todos los cursos y herramientas de referencia. Volverá en S4 con OpenSpec.

> *(Bloque 3)* Grabáoslo. Hoy lo veréis en vivo; en S4 se formaliza.

---

## 6 · Tres modos de usar la IA
| Modo | Iniciativa | Control humano | Para qué |
|---|---|---|---|
| Completion | reactivo | aceptar línea a línea | una función |
| Chat | pasivo | copy-paste manual | explorar ideas |
| **Agentic** | proactivo | aprobar plan/diff | multi-archivo, tools |
- La pregunta no es "¿qué herramienta?", sino "¿qué **modo** y con qué **harness**?".

> *(Bloque 4.A)* Se muestra tras comparar chat vs agente en vivo. Plan mode = el control del modo agentic.

---

## 7 · Contexto persistente: AGENTS.md
- Un archivo que el agente lee al inicio de cada sesión y respeta como convención del proyecto.
- **Estándar cross-tool** (lo leen Cursor, Copilot, Codex…). Claude Code usa `CLAUDE.md` o un symlink.
- Regla de oro: **mínimo y de alta señal** (<30 líneas). Solo convenciones y "gotchas", no todo el repo.

> *(Bloque 4.B)* El multiplicador más barato: cambia el output sin tocar modelo, herramienta ni prompt.

---

## 8 · Este starter es OPINADO (convenciones reales)
- **Migración-primero**: `database/schema.ts` está **autogenerado**; nunca se edita a mano. Cambias el modelo con una migración + `node ace migration:run`.
- **Transformers**: las respuestas se dan forma en `app/transformers/`, no a mano en el controller.
- **Validación** con VineJS; **controllers generados**; auth por access tokens.

> *(Bloque 4.B)* Esto es lo que va en AGENTS.md. Sin ello, la IA inventa convenciones plausibles pero equivocadas.

---

## 9 · Context rot
- La calidad del LLM **se degrada al crecer el contexto**, antes de llenarlo (Chroma, jul-2025).
- No hay umbral oficial. Heurística de trabajo: vigilar la ventana y **compactar/resetear antes de saturar**.
- Por eso existen los **subagentes**: aíslan subtareas caras en contexto en su propia ventana.

> *(Bloque 4.B)* Justifica la gestión de contexto y la existencia de los subagentes (siguiente pieza).

---

## 10 · El cockpit se construye (y se versiona)
- **Skill** (`/commit`): procedimiento reutilizable. *En Claude Code, slash commands = skills.*
- **Subagente** (`code-reviewer`): trabajador con su **propio contexto y permisos** (read-only).
- **Hook** (Prettier): automatización **determinista** — no depende de que el modelo se acuerde.
- **MCP**: "USB-C de la IA" — conecta el agente a herramientas externas (aquí, GitHub).

> *(Bloque 4.C)* Todo vive en `.claude/` + `AGENTS.md`, versionado. El equipo hereda el mismo cockpit.

---

## 11 · Determinista vs. "pídeselo al modelo"
- "Pídele que formatee" → a veces lo hace.
- **Hook** → se formatea **siempre**. Guardarraíl, no esperanza.
- Regla: lo que NO debe fallar, no lo dejes a la memoria del modelo — hazlo un hook.

> *(Bloque 4.C)* El "clic" del hook: ejecutarlo en vivo y ver el archivo formatearse solo.

---

## 12 · El harness en acción
- La MISMA clase de tarea que un chat hace "regular", el cockpit la hace **bien, revisada y trazable**:
- lee el ticket (MCP) → planifica (plan mode) → codifica (hook formatea) → revisa (subagente) → commit (skill).
- Esto no es un chat. Es un **sistema**.

> *(Bloque 4.D)* Cierre de la demo. El wow no es velocidad: es reproducibilidad y trazabilidad.

---

## 13 · Lo que te llevas de S1
- **Agente = Modelo + Harness.**
- El **loop**: explorar → planificar → codificar → verificar.
- Un **cockpit real**, versionado: memoria + skill + subagente + hook + MCP.
- Criterio **anti-hype**: cada término, aterrizado.
- Acción de esta semana: **crea un AGENTS.md** en un repo tuyo.

> *(Bloque 5)* Cierre. Puente: en S2 usamos el cockpit para pasar de una idea a un PRD.
