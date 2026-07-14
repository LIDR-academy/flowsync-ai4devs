# Guion S2 — Spec-Driven Development de verdad + PRD del MVP

> **Sesión 2** · **Audiencia mixta** · **2h con break de 10 min** · Proyecto **FlowSync**.
> **Ramas**: arranca en `s2/setup` (= `s1/end`, cockpit + `lastLoginAt`); solución en `s2/end` (PRD).
> **Cobertura**: Claude Code.

## 📋 Vista general (120 min)

| Bloque | Min | Acum | Qué pasa |
|---|---|---|---|
| 1 — Intro + enlace S1 | 8 | 8 | El cockpit sigue activo |
| 2 — Qué es SDD (y qué no) | 15 | 23 | Spec = fuente de verdad viva; vibe coding vs SDD |
| 3 — Cadena de granularidad + panorama | 15 | 38 | PRD→feature→ticket; frameworks SDD |
| 4 — Demo 1: discovery → alcance del MVP | 27 | 65 | La IA pregunta, no responde |
| — **Break** | 10 | 75 | — |
| 5 — Demo 2: generar y validar el PRD | 35 | 110 | La IA cuestiona supuestos |
| 6 — Q&A + cierre + preview S3 | 10 | 120 | — |

## 🛠️ Prework del mentor
- `git checkout s2/setup` (= estado final de S1). Cockpit activo; backend con `lastLoginAt`.
- Tener a mano la rama `s2/end` (PRD de referencia) y el párrafo de idea difusa (abajo).
- Prompts en [`prompts.md`](prompts.md).

## 📌 Notas globales
- **La base tiene auth (signup/login/perfil), NO tiene tasks.** El PRD **planifica** las tareas; no asumas que existen. Las tareas se construyen en S3 (backlog) y S4 (implementación).
- Enfatizar: hoy NO se abre OpenSpec (eso es S4). El PRD es markdown, no Gherkin.

---

# Bloque 1 — Intro + enlace S1 (8 min)
> *"La 1 fue montar el cockpit y enviar una feature (el perfil ahora devuelve lastLoginAt). Hoy usamos ese cockpit para algo distinto: pasar de una idea difusa a un PRD de MVP de verdad. Eso es Spec-Driven Development. El cockpit está activo toda la sesión."*

📌 *Slide:* `S1 Harness → **S2 SDD+PRD** → S3 backlog → S4 implementación (delegación directa vs OpenSpec) → S5 verificación+docs`.

---

# Bloque 2 — Qué es SDD (y qué NO es) (15 min)
- **2.1 Definición correcta (5 min).**
> *"SDD sin humo: la spec es la **fuente de verdad viva** de la que se genera el código. Ojo — **NO** es 'desarrollo tradicional + IA'; es mover el centro de gravedad a la especificación. Término de 2025, anclado por Kiro (AWS) y Spec Kit (GitHub)."*
- **2.2 Cerrar el arco vibe coding → SDD (5 min).**
> *"En S1 nombramos el vibe coding: construir sin revisar, para prototipos. SDD es su versión rigurosa para producción (Thoughtworks lo señaló como práctica clave de 2025)."*
- **2.3 SDD no reemplaza tu criterio (4 min):** la IA propone, tú decides.

📌 *Slide:* SDD vs TDD vs BDD (una línea cada uno).

---

# Bloque 3 — Cadena de granularidad + panorama (15 min)
📌 *Slide:* `PRD (producto) → FEATURE/propuesta → TICKET (unidad de trabajo)`.
> *"Aquí está la razón del orden del curso, y es técnica: **el PRD va primero y OpenSpec va después**. OpenSpec es *brownfield-first* — pensado para código existente — y **no genera ni ingiere un PRD**; su granularidad empieza en 'propuesta de cambio', no en 'producto'. Por eso el PRD es hoy (S2) y OpenSpec es S4. La propia LIDR construyó `lidr-specboot` SOBRE OpenSpec y le añadió `/enrich-us` para meter la capa de historias que OpenSpec no trae."*

📌 *Panorama:* OpenSpec (S4), Spec Kit, Kiro, Tessl, BMAD. *"Ninguno ingiere un PRD de producto; todos viven aguas abajo. Hoy hacemos SDD con lo más simple que funciona: un PRD en markdown en el repo."*

---

# Bloque 4 — Demo 1: discovery → alcance del MVP (27 min)
Rama `s2/setup`. Terminal `claude` (cockpit cargado).

📌 *Idea difusa (pegar):*
> *"Quiero que FlowSync sea una herramienta para que los equipos remotos sepan en qué trabaja cada uno sin reuniones de sincronización. Algo tipo tareas compartidas pero más en tiempo real y menos rollo que Jira."*
> *"Esto es lo que llega en la vida real: entusiasmo y cero precisión. Vamos a exprimirlo."*

1. **Discovery guiado (12 min):** plan mode; prompt "product partner escéptico: hazme las 5 preguntas que más reducen incertidumbre, no asumas". La IA **pregunta** (usuarios, tamaño de equipo, qué es 'tiempo real', qué duele hoy). El mentor responde en vivo (equipos 3-10 remotos; el dolor = dailies y "¿en qué estás?").
> *"Fijaos: no suelta features, PREGUNTA. Y leyó el repo — sabe que ya hay auth, así que pregunta cómo se relaciona con lo existente."*

2. **Alcance in/out (10 min):** prompt "propón alcance de MVP, recorta agresivo, justifica cada exclusión". Cuando meta de más (notificaciones, Slack, roles), el mentor las manda a **NO-alcance** en voz alta.
> *"Para un MVP, notificaciones y Slack son NO-alcance: no validan la hipótesis central. El NO-alcance es la decisión más valiosa."* Sembrar discrepancia con la clase.

3. **Consolidar (5 min):** pedir el alcance en 5 bloques.
> *"Esto aún NO es el PRD; es el esqueleto de decisiones. Partimos de 'menos rollo que Jira' y ya tenemos problema, usuarios y frontera."*

**➡️ BREAK 10 min.**

---

# Bloque 5 — Demo 2: generar y validar el PRD (35 min)
1. **Generar (10 min):** prompt con el alcance en contexto → escribir `docs/prd/flowsync-mvp.md` (problema, usuarios, propuesta de valor, alcance/NO-alcance, requisitos funcionales `RF-n`, no funcionales, restricciones, métricas). *"Restricciones: stack actual AdonisJS + React; **auth ya existe, tasks NO — el PRD lo planifica**. No inventes cifras; marca supuestos con [SUPUESTO]."*

2. **La IA cuestiona los supuestos — el wow (12 min):** prompt "actúa como PM adversarial: ¿qué supuestos de este PRD son débiles? ¿qué métrica no es medible?". La IA critica su propio PRD; el mentor **cede** ante una buena objeción y edita el PRD en vivo.
> *"Esto es lo que un chat no hace: no solo redacta, cuestiona la decisión de producto. Y cuando tiene razón, cambio el PRD."*

3. **Versionar (8 min):** `/commit` → el PRD vive en el repo, no en un Notion olvidado.

4. **Cierre (5 min):** 📌 el PRD como documento vivo; los `RF-n` de hoy son el input de las historias de S3.

*(Referencia: rama `s2/end` tiene el PRD.)*

---

# Bloque 6 — Q&A + cierre + preview S3 (10 min)

| Pregunta | Respuesta corta |
|---|---|
| ¿Por qué no OpenSpec ya? | Es brownfield-first y no maneja un PRD de producto. Va en S4, sobre el backlog. |
| ¿El PRD no queda obsoleto? | Vive en el repo y evoluciona; es documento vivo, no papel muerto. |
| ¿Métricas inventadas? | No: marcadas como [SUPUESTO] hasta validarlas con datos. |

📌 *Preview S3 — Backlog:* *"Cogemos el PRD y lo partimos en épicas → historias con criterios de aceptación (Given/When/Then) → tickets priorizados. Ahí nacen FS-118 (fechas de vencimiento) y FS-142 (filtrar por estado), que S4 implementa."*

📌 *Lo que te llevas de S2:* SDD = spec como fuente de verdad viva · el PRD va antes que el framework · la IA cuestiona, tú decides.

> **Entregable**: rama `s2/end` — `docs/prd/flowsync-mvp.md` versionado. Base para S3.
