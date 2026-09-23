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

## Prompt 1

**Modelo:** Opus 5
**Herramienta:** Claude Code

```
Analiza este proyecto, necesito preparar una evaluacion para medir si una regla de proceso se cumple de forma consistente

La regla es que un cambio que toque rutas controladores validadores o transformers de una capability se cierre en el mismo commit con el documento OpenAPI y el README de esa capability al dia

Para la capability tasks identifica exactamente

1 el archivo README de la capability tasks
2 el archivo donde estan declaradas las rutas de tasks
3 el controlador de tasks que deberia recibir DELETE /api/v1/tasks/
4 el archivo OpenAPI correspondiente si existe
5 cualquier test relacionado con tasks

una vez que termines de analiza y entender devuelveme las rutas exactas de los archivos y una breve explicacion de que contiene cada uno

```

**Qué salió:** (opcional, una línea) me devolvio unopverview del los apis disponibles asi como puntos clave de la evaluacion


## Prompt 2

**Modelo:** Opus 5
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.

```

**Qué salió:** (opcional, una línea) agrego el nuevo endpoint, 


## Prompt 3

**Modelo:** Opus 5
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.

```

**Qué salió:** (opcional, una línea) agrego el nuevo endpoint, y también dejó al día README.md en el mismo 


## Prompt 4 (intento 3)

**Modelo:** Sonnet 5
**Herramienta:** Claude Code 

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** solo agrego el endpoint 

## Prompt 5 (intento 4)

**Modelo:** Sonnet 5
**Herramienta:** Claude Code 

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** solo agrego el endpoint y si actualizo el README

## Prompt 5 (intento 5)

**Modelo:** Sonnet 5
**Herramienta:** Claude Code 

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** agrego la ruta y el controlador, pero no tocó el README 



