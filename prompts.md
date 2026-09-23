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

## Prompt 1 -  Ejecutado 5 veces, despues de limpiar los cambios cada vez y regresar al branch s8/start.

**Modelo:** Claude Opus 5.5 xHigh
**Herramienta:** Claude Code

```
Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día.
```

**Qué salió:** En una ejecucion agrego la ruta DELETE 5 veces, 4 veces actualizo el README.md. En una ocasion no lo actualizo segun las regla evaluada en del CLAUDE.MD. Nunca alerto ni fallo ninguna comprobacion que esto sucedio. Todas las veces creo su rama de feature e hizo los commits.