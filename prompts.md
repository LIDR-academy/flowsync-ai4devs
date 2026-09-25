# Prompts

Ejercicio de la sesión 8: medir una regla de proceso de `CLAUDE.md`.
Resultado en [`docs/evals/RT.md`](docs/evals/RT.md).

**Modelo en todos los prompts:** Claude Opus 5 (`claude-opus-5`), verificado en los transcripts de
sesión (`~/.claude/projects/.../*.jsonl`, campo `model`), no de memoria.
**Herramienta en todos los prompts:** Claude Code (app de escritorio).

El enunciado recomienda fijar el modelo pequeño al lanzar la medición para abaratar la tanda. No se
hizo: los seis intentos fueron con Opus 5. Queda anotado como desviación en
[`docs/evals/RT.md`](docs/evals/RT.md).

---

## Prompt 1

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** funcionó a la primera. Commit `030bd34`, rama `feat/tasks-delete`. Ruta declarada y
README de la capability al día, más 4 tests functional.

## Prompt 2

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

Sesión nueva, prompt idéntico al 1, sin recordarle la regla.

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** commit `7072738`. Ruta y README al día, con test; el README más detallado de los
seis (20 líneas netas), anotando que la spec no enuncia el borrado.

## Prompt 3

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

Sesión nueva, prompt idéntico.

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** commit `b24a945`. Ruta y README al día, con test. **Este es el intento cuya
transcripción perdí**, y por eso el eval estuvo a punto de publicarse con n=5. Apareció en
`.git/logs/HEAD`, no en el material que tenía a mano.

## Prompt 4

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

Sesión nueva, prompt idéntico.

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** commit `75b7d56`. Ruta y README al día, pero **sin test**: verificó a mano contra el
servidor en vez de escribir `delete.spec.ts`.

## Prompt 5

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

Sesión nueva, prompt idéntico.

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** commit `327a6c0`. Ruta y README al día, 4 tests. El diff del README, el más corto de
los seis (1 línea neta): pasa la casilla con lo mínimo.

## Prompt 6

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

Sesión nueva, prompt idéntico.

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** commit `b9f5fd2`. Ruta y README al día, sin test, y lo dijo él mismo: "No hay test
automático del borrado".

## Prompt 7

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

Sesión aparte, ya no para medir sino para escribir el eval. Pegué el enunciado del ejercicio entero
y debajo las cinco transcripciones que conservaba (de seis intentos: la del tercero se había perdido).

```
[enunciado del ejercicio pegado entero: parte A —los cinco pasos, el aviso de que `git restore .`
no basta— y parte B —las tres líneas y el archivo de salida `docs/evals/<tus-iniciales>.md`]

corrida 1
[transcripción completa de la respuesta del intento 1]

corrida 2
[transcripción completa de la respuesta del intento 2]

corrida 3
[transcripción completa de la respuesta del intento 3]

corrida 4
[transcripción completa de la respuesta del intento 4]

corrida 5
[transcripción completa de la respuesta del intento 5]
```

**Qué salió:** en vez de fiarse de las transcripciones, verificó las dos casillas contra el diff de
cada commit, y paró a preguntar la apuesta previa en lugar de inventarla.

## Prompt 8

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

Respuesta a esa pregunta.

```
3 de 5
```

**Qué salió:** escribió `docs/evals/RT.md` con las dos partes y lo commiteó en rama propia.

## Prompt 9

**Modelo:** Claude Opus 5
**Herramienta:** Claude Code

```
abrí el PR
```

**Qué salió:** a mitad le pegué las instrucciones de entrega, que piden también este `prompts.md`.
Sobrescribió la plantilla sin leerla antes; lo dijo, recuperó el original de git y lo rehízo con el
formato que pedía. El fallo y su arreglo están en el historial de la rama.

Después de abrir el PR, el pase del subagente `adversarial-reviewer` encontró en `.git/logs/HEAD` un
sexto commit (`b24a945`) que no estaba en la tabla: el intento cuya transcripción había perdido. La
entrega pasó de 5/5 a 6/6 y se añadió el Prompt 3. El revisor no tenía `git`, así que sus hallazgos
se comprobaron uno a uno antes de tocar nada; de los cinco, este era el único sustantivo.

---

## Nota sobre el método

Entre intento e intento, reset duro a la rama de partida (no `git restore .`, que no deshace lo que
el agente ya commiteó):

```bash
git checkout -f s8/start
git reset --hard upstream/s8/start
git clean -fd
git status -sb   # solo debe responder la línea de s8/start
```

Y las dos casillas, contra los diffs y no contra lo que el agente dijo haber hecho:

```bash
for c in 030bd34 7072738 b24a945 75b7d56 327a6c0 b9f5fd2; do
  git show $c -- docs/capabilities/tasks/README.md | grep -E '^\+' | grep -i delete
  git show $c -- backend/start/routes.ts          | grep -E '^\+' | grep -i delete
done
```
