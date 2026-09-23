# Prompts

Todos los prompts lanzados para el ejercicio del Módulo 8, en orden, con modelo y herramienta.

El ejercicio mide una regla, así que los prompts que importan **no se escribieron a mano en una
conversación**: son los `prompt.md` de cada caso, que la herramienta lanza tal cual en un entorno
aislado, una vez por ensayo. Van pegados aquí literalmente, que es como se ejecutaron.

Herramienta en todos: `claude plugin eval` (Claude Code 2.1.273), desde `eval-harness/`.

---

## Prompt 1 — Sonda de control de entorno (`sonda-git`)

Lanzado **antes** que nada, para descartar que un rojo viniera del entorno y no del caso.

```
Ejecuta `git --version` y despues `git status`. Escribe en un archivo `salida.txt` la salida EXACTA de los dos comandos, tal cual, sin interpretarla ni arreglar nada. No intentes instalar nada ni buscar el binario en otras rutas.
```

- **Modelo:** Sonnet 5
- **Comando:** `claude plugin eval . --case sonda-git --runs 1 --ablation none --model sonnet --allow-tools Bash Write --trust-plugin --no-publish`
- **Resultado:** no llegó a ejecutarse. El sandbox de Bash no puede aislarse en esta máquina porque
  `~/.docker` (Docker Desktop) tiene enlaces simbólicos dentro. **Sirvió igual:** es la razón por la
  que los casos siguientes se lanzaron sin conceder `Bash`.

## Prompt 2 — El encargo medido, con la regla sembrada (`regla-doc`)

El mismo encargo literal que fija el prework. El fixture siembra el `CLAUDE.md` de FlowSync, que es
donde vive la regla que se mide.

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

- **Modelo:** Sonnet 5 · `allowed_tools: [Read, Glob, Grep, Edit, Write]` · `max_turns: 30` · `timeout: 600s`
- **Comando:** `claude plugin eval . --case regla-doc --runs 5 -j 3 --ablation none --model sonnet --scaffold --allow-tools Edit Write --trust-plugin --no-publish`
- **Primer lanzamiento, fallido:** `0.00 · 0%` con los dos graders en rojo, por `Not logged in` — la
  sesión OAuth del CLI de esta máquina había expirado. Queda aquí a propósito: es el prompt que
  produjo un número que parecía un resultado y no lo era.
- **Segundo lanzamiento, válido:** `0,50 · 5 runs · $0,93 · 72 s`. README al día **0 de 5**; ruta
  declarada **5 de 5**.
- **Tercer lanzamiento, de verificación** (`--runs 1 --keep-temp`, $0,18): mismo prompt, para comprobar
  en el espacio de trabajo conservado que el fixture **sí** había sembrado el `CLAUDE.md`. Lo había.
  Sin esta comprobación, el delta cero contra la línea base admitía la lectura «corrí dos veces el
  mismo experimento».

## Prompt 3 — El mismo encargo, sin la regla (`tarea-alumno-sin-claude-md`)

Idéntico al anterior, palabra por palabra. Lo único que cambia es el fixture, que **no** siembra el
`CLAUDE.md`. Es la línea base: sin ella, el número del Prompt 2 describe pero no demuestra.

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

- **Modelo:** Sonnet 5 · mismas herramientas y límites
- **Comando:** `claude plugin eval . --case tarea-alumno-sin-claude-md --runs 5 -j 3 --ablation none --model sonnet --scaffold --allow-tools Edit Write --trust-plugin --no-publish`
- **Resultado:** `0,50 · 5 runs · $0,95 · 88 s`. README al día **0 de 5**; ruta declarada **5 de 5**.
  Idéntico al Prompt 2 en las dos comprobaciones: el delta de la regla es cero.
