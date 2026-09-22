# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

## Metodología de los 5 intentos

Los Prompts 1 a 5 son el mismo encargo, lanzado 5 veces para medir una regla de proceso
(ver `docs/evals/gt.md`). Cada uno se lanzó en una **sesión nueva** de Claude Code, así que ningún
intento arrastró el contexto de otro. La sesión usó una **configuración aislada**
(`CLAUDE_CONFIG_DIR=~/.claude-aislado claude --model sonnet`) que excluye el `CLAUDE.md` global del
usuario, así que el agente solo vio las instrucciones del proyecto. Antes de cada intento (salvo el
primero) se corrieron, fuera de esa sesión, estos tres comandos para devolver el proyecto a su punto
de partida:

```bash
git checkout -f s8/start
git reset --hard upstream/s8/start
git clean -fd
```

---

## Prompt 1

**Modelo:** Claude Sonnet 5 High
**Herramienta:** Claude Code (sesión aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** control ✅ (ruta declarada) y resultado ✅ (el README menciona el endpoint), pero el README sigue diciendo «cinco operaciones» y no lista el `204`. Commit `4fa39cd` en rama `feat/borrar-tarea`.

---

## Prompt 2

**Modelo:** Claude Sonnet 5 High
**Herramienta:** Claude Code (sesión aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** control ✅ y resultado ✅. README al día: fila, conteo (cinco→seis) y códigos. Commit `587e51f` en rama `feat/tasks-delete-endpoint`.

---

## Prompt 3

**Modelo:** Claude Sonnet 5 High
**Herramienta:** Claude Code (sesión aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** control ✅ y resultado ✅. README al día (fila, conteo y códigos) y, además, una fila en la tabla de trazabilidad con OpenSpec que señala que el endpoint no tiene requisito. Commit `c79b47b` en rama `feat/tasks-delete-endpoint-2`.

---

## Prompt 4

**Modelo:** Claude Sonnet 5 High
**Herramienta:** Claude Code (sesión aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** control ✅ y resultado ✅, con el README al día (fila, conteo y códigos) en el working tree. Pero no commiteó (rama `feat/delete-task`): dijo que cerrar con `/commit` "happens... when you close this unit of work".

---

## Prompt 5

**Modelo:** Claude Sonnet 5 High
**Herramienta:** Claude Code (sesión aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** control ✅ y resultado ✅, pero igual que el intento 1: el README sigue diciendo «cinco operaciones» y no lista el `204`. Commit `58d6b2a` en rama `feat/tasks-delete-endpoint-3`.
