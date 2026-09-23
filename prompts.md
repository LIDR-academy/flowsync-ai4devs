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

---

Los prompts 1 a 5 son el mismo encargo, lanzado cada vez en una sesión nueva desde `s8/start`
limpio y sin recordar la regla medida. Entre intentos:
`git checkout -f s8/start && git reset --hard upstream/s8/start && git clean -fd`.

## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code (app de escritorio)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** ruta ✅ · README ✅ · no actualizó `docs/api/openapi.json` (rama `feat/tasks-delete`).

## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code (app de escritorio)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** ruta ✅ · README ✅ (rama `feat/delete-task`).

## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code (app de escritorio)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** ruta ✅ · README ✅ (rama `feat/tasks-delete-endpoint`).

## Prompt 4

**Modelo:** Opus 5.5
**Herramienta:** Claude Code (app de escritorio)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** ruta ✅ · README ✅ (rama `feat/tasks-destroy`).

## Prompt 5

**Modelo:** Opus 5.5
**Herramienta:** Claude Code (app de escritorio)

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** ruta ✅ · README ✅ (rama `feat/delete-task-endpoint-124853`).

Los prompts 6 y 7 los lancé después, en una sesión aparte (no en las de los intentos), para
revisar el resultado y redactar la entrega.

## Prompt 6

**Modelo:** Opus 5.5
**Herramienta:** Claude Code (app de escritorio)

```
Revisa este mismo cambio que hice para las 5 ramas:

Cambio:
"Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks."

Ramas:
feat/delete-task
feat/delete-task-endpoint-124853
feat/tasks-delete
feat/tasks-delete-endpoint
feat/tasks-destroy

He revisado que para las 5 se cumple esta regla:
"Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día."

Vuelvelo a revisar y dime si es cierto
```

**Qué salió:** revisó el commit de cada rama y confirmó ruta ✅ y README ✅ en los cinco. Además
encontró que en el intento 1 no se actualizó `docs/api/openapi.json`, la otra mitad de la regla.

