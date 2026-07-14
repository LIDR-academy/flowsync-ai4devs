# Slides — Sesión 2: SDD + PRD del MVP

> Deck **autocontenido**: asume que el alumno NO hizo el asíncrono. Cada slide lleva la teoría del "porqué". Formato: título · contenido · *(bloque)*.

---

## 1 · De dónde venimos, a dónde vamos
- En S1 montamos el **cockpit** y enviamos una feature (el perfil devuelve `lastLoginAt`).
- Hoy usamos ese cockpit para algo distinto: **pasar de una idea difusa a un PRD de MVP**.
- Eso es **Spec-Driven Development (SDD)**.

> *(Bloque 1)* Enlace. El cockpit sigue activo toda la sesión.

---

## 2 · Qué es SDD (sin humo)
- La **spec es la fuente de verdad viva** de la que se genera, prueba y valida el código.
- **NO** es "desarrollo tradicional + IA": es mover el **centro de gravedad** a la especificación.
- Término afianzado en 2025 (Kiro de AWS, Spec Kit de GitHub).

> *(Bloque 2)* La corrección clave: mucha gente cree que SDD = "programar con IA". Es más específico.

---

## 3 · El arco: vibe coding → SDD
- **Vibe coding** (Karpathy, feb-2025): construir "olvidando que el código existe", sin revisar. Bien para un prototipo desechable; peligroso en producción.
- **SDD** es su versión **rigurosa**: la spec disciplina lo que el vibe coding hace a lo loco.
- Thoughtworks lo señaló como práctica clave de ingeniería con IA de 2025.

> *(Bloque 2)* SDD no reemplaza tu criterio: la IA propone, tú decides.

---

## 4 · La cadena de granularidad
- **PRD (producto)** → **FEATURE / propuesta** → **TICKET (unidad de trabajo)**.
- Cada nivel más fino que el anterior. No se implementa lo que no está descompuesto.
- Hoy trabajamos el nivel más alto: el **PRD**.

> *(Bloque 3)* Marco mental antes de la demo. El PRD es el "producto entero"; aún no se implementa.

---

## 5 · Por qué el PRD va ANTES que el framework SDD
- **OpenSpec** (el framework SDD del curso, en S4) es **brownfield-first**: pensado para código que ya existe.
- **No genera ni ingiere un PRD**: su granularidad empieza en "propuesta de cambio", no en "producto".
- Ponerlo sobre una carpeta vacía y sin PRD = no tiene de dónde agarrarse. **Por eso: PRD en S2, OpenSpec en S4.**

> *(Bloque 3)* La razón del orden del curso es técnica, no de gusto. Dato: la propia LIDR puso `/enrich-us` sobre OpenSpec (repo `lidr-specboot`) para añadir la capa de historias que le falta.

---

## 6 · Panorama de frameworks SDD
- **OpenSpec** (Fission-AI) — el que usamos en S4.
- **Spec Kit** (GitHub) · **Kiro** (AWS, IDE spec-first) · **Tessl** · **BMAD**.
- Ninguno ingiere un PRD de producto: todos viven **aguas abajo**.
- Hoy hacemos SDD con lo más simple que funciona: **un PRD en markdown, versionado en el repo**.

> *(Bloque 3)* No hay que casarse con una herramienta; el concepto (spec como fuente de verdad) transfiere.

---

## 7 · Discovery: la IA pregunta, no responde
- De una idea difusa a un **alcance de MVP**: problema, usuarios, propuesta de valor, alcance / **NO-alcance**.
- Una buena IA de producto **hace preguntas** que reducen incertidumbre, no suelta una lista de features.
- El **NO-alcance** es la decisión más valiosa del MVP: todo lo que no valida la hipótesis central, fuera.

> *(Bloque 4)* Recordad: la base tiene auth, NO tiene tareas. El PRD **planifica** las tareas; no asumáis que existen.

---

## 8 · Anatomía de un PRD de MVP
- Problema y contexto · Usuarios y jobs-to-be-done · Propuesta de valor.
- **Alcance / NO-alcance** · Requisitos funcionales (`RF-n`, con MUST/SHOULD/MAY) · No funcionales · Restricciones.
- Métricas de éxito — marcadas **[SUPUESTO]** hasta validarlas con datos.

> *(Bloque 5)* El PRD es un **documento vivo**, versionado en el repo, no un Notion olvidado.

---

## 9 · El wow: la IA cuestiona su propio PRD
- No basta con que **redacte**: le pedimos que actúe como **PM adversarial** y ataque sus propios supuestos.
- Encuentra supuestos débiles, requisitos ambiguos, métricas no medibles.
- Cuando tiene razón, **editamos el PRD en vivo**. Eso un chat no lo hace.

> *(Bloque 5)* El momento diferenciador: la IA como socia crítica de producto, no como maquetadora de texto.

---

## 10 · RFC-2119: matar la ambigüedad
- Palabras con significado fijo: **MUST / SHALL** (obligatorio) · **SHOULD** (recomendado) · **MAY** (opcional).
- "El sistema **debería** validar" es ambiguo. "El sistema **MUST** rechazar X con 422" no deja interpretación.
- Estas mayúsculas reaparecen en S4: son el formato de los *scenarios* de OpenSpec.

> *(Bloque 5)* Sembrar el puente a S3/S4: los requisitos de hoy se vuelven criterios testables y luego scenarios.

---

## 11 · Lo que te llevas de S2
- **SDD = la spec como fuente de verdad viva** (no "tradicional + IA").
- El **PRD va antes** que el framework SDD.
- La IA **cuestiona**, tú decides.
- Entregable: `docs/prd/flowsync-mvp.md` versionado.

> *(Bloque 6)* Cierre. Puente: en S3 partimos el PRD en épicas → historias con criterios → tickets (ahí nacen FS-118 y FS-142).
