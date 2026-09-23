# Prompts

Todos los prompts que lancé para el ejercicio, en el orden en que los lancé.

Los **seis prompts son el mismo texto, palabra por palabra**: son las seis ejecuciones de la
medición, cada una en una sesión nueva y sobre el proyecto devuelto a `s8/start`. Todos con la misma
herramienta y el mismo modelo.

La medición está en [`docs/evals/vb.md`](docs/evals/vb.md).

Entre una ejecución y la siguiente, a mano y sin agente:

```bash
git checkout -f s8/start
git reset --hard upstream/s8/start
git clean -fd
git status -sb   # tiene que responder solo "## s8/start"
```

---

## Prompt 1

**Modelo:** Opus 5 1M
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** funcionó a la primera. Rama `feat/tasks-delete` (`298b54f`): ruta declarada y README al día, con test del borrado. Dejó `docs/api/openapi.json` sin regenerar.

---

## Prompt 2

**Modelo:** Opus 5 1M
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** ruta y README al día. Rama `feat/tasks-delete-endpoint` (`846baa2`), la más escueta de las seis: 3 archivos, sin test, sin regenerar `docs/api/openapi.json` ni `.adonisjs/`.

---

## Prompt 3

**Modelo:** Opus 5 1M
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** la más completa. Rama `feat/borrar-tarea` (`b4b8265`): ruta, README, test y `docs/api/openapi.json` regenerado, los cuatro en el mismo commit.

---

## Prompt 4

**Modelo:** Opus 5 1M
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** ruta, README y test. Rama `feat/eliminar-tarea` (`ab18cb3`). Otra vez `docs/api/openapi.json` sin regenerar, con el controlador ya decorado.

---

## Prompt 5

**Modelo:** Opus 5 1M
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** ruta, README y `docs/api/openapi.json` al día. Rama `feat/delete-task` (`43f49bd`). La única, junto con la 2, que no escribió ningún test.

---

## Prompt 6

**Modelo:** Opus 5 1M
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** la sexta, una más de las cinco que pedía el ejercicio. Rama `feat/tasks-destroy` (`144acbb`): ruta, README, test y `docs/api/openapi.json`.
