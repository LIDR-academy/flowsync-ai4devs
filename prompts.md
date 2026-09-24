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

**Modelo:** Haiku
**Herramienta:** Claude Code

```
El fichero @CLAUDE.md linea 134 contine la regla a medir. En que proporcion de los intentos se cumple la parte del @README.md lineas 74 a 99? Cuantas ejecuciones hizo? Mi apuesta previa es 0 de 5. Ahora, lanza los 5 intentos con el agente, cada uno en sesion nueva.

```

**Qué salió:** Lanzo los 5 agentes implementando el endpoint DELETE para la capability "task", actualizó la documentación de OpenAPI, y 2/5 veces el fichero ./backend/docs/capabilities/tasks/README.md.

