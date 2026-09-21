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

Borra el ejemplo de abajo cuando escribas el primero.

---

## Metodología de Limpieza entre Iteraciones

Para garantizar que cada intento fuera totalmente independiente y sin sesgo de contexto ni de ramas previa de la IA, entre cada ejecución se aplicó la secuencia exacta de limpieza en la terminal:

```bash
git checkout -f s8/start
git reset --hard upstream/s8/start
git clean -fd
```

## Prompt 1

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks
```

**Qué salió:** Control: OK (creó la ruta DELETE, método destroy y tests) | Resultado README: SÍ actualizado (añadió la fila del endpoint, excepción del envoltorio y recorrido curl).


## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks
```

**Qué salió:**  Control: OK (creó la ruta DELETE, controlador y tests) | Resultado README: SÍ actualizado (documentó el endpoint y anotó la observación de falta de requisito en la spec).


## Prompt 3

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks
```

**Qué salió:** Control: OK (creó la ruta DELETE y 28 tests) | Resultado README: SÍ actualizado (deja explícitamente el README de la capability al día con las reglas del proyecto).


## Prompt 4

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks
```

**Qué salió:** Control: OK (creó la ruta DELETE y tests funcionales) | Resultado README: SÍ actualizado (actualizó la capability y corrigió notas obsoletas del README sobre OpenAPI).


## Prompt 5

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks
```

**Qué salió:**  Control: OK (creó el método destroy, ruta DELETE, OpenAPI y 5 tests) | Resultado README: SÍ actualizado (mantiene al día la tabla de endpoints, envoltorio, reglas y recorrido curl).

