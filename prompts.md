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

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Sin cambiar ningún archivo realiza un inventario de qué es dato personal o secreto en este proyecto, y de qué lees para trabajar aquí.  
Arma las siguientes 3 listas y para cada elemento en la lista indica si su contenido sale de mi máquina cuando tu trabajas conmigo:
- las tablas y columnas que guardan datos de una persona identificable (lee esto en las migraciones, NO supongas) y los ficheros con ejemplos de correos o nombres 
- los ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repositorio 
- lo que ya has leído o leerías por defecto para hacer un cambio en el backend (el fichero de instrucciones del repositorio, la configuración del harness, los ficheros de entorno, la base de datos local, etc) 
```

## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Arma un hook de dos piezas con las siguientes restricciones que no son negociables.

**Pieza 1:**
un hook de Claude Code en .claude/hooks/datos-que-no-salen.sh, registrado en .claude/settings.json como PreToolUse con el matcher Bash, junto al que ya hay. Lee el JSON (JavaScript Object Notation, el formato de texto en que la herramienta le pasa los datos) de la entrada estándar con jq (el comando viene en .tool_input.command), como hace el hook de Prettier. set -uo pipefail.

Solo actúa si el comando contiene git commit. Con cualquier otro comando sale con 0 sin decir nada.

Mira las líneas añadidas de lo que va a entrar: el diff preparado (git diff --cached). Y si el mismo comando también hace git add, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque en ese caso todavía no están en el índice.

Tres reglas, y solo estas tres:

Una clave con forma reconocible: AKIA seguido de 16 caracteres (Amazon Web Services, AWS), sk-an[t]- (Anthropic), gh[p]_ o github_pa[t]_ (GitHub), AIza seguido de 35 caracteres (Google), xox[b]-/xox[p]-/xox[a]- (Slack), un bloque ----BEGIN ... PRIVATE KEY-----, o una línea APP_KEY= con valor.

Una dirección de correo cuyo dominio no sea example.com, example.org, example.net ni github.com. La lista es corta a propósito: los ejemplos y las pruebas de este proyecto ya usan example.com, que es un dominio reservado para eso.

El fichero .env (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los .env.example no cuentan.

Si encuentra algo: sale con código 2, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade una línea a docs/seguridad/registro-de-bloqueos.md con la fecha y hora en UTC (tiempo universal coordinado) en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca el valor encontrado: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.

Si no encuentra nada, sale con 0 y no escribe nada.

**Pieza 2:**
un bloque corto en el CLAUDE.md del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea no se desactiva ni se salta (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto: es la evidencia. AGENTS.md no se toca: que mire antes qué es.

Criterio de aceptación

- Para dar por terminado el trabajo realiza una prueba: un archivo temporal con un correo de gmail.com, git add, un intento de commit. Tiene que salir con 2 y dejar su línea en el registro. Después, fuera el archivo temporal. La línea se queda: es la primera evidencia de que el hook existe.
```

## Prompt 3

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Trabaja en la branch actual. Añade a docs/capabilities/tasks/README.md, en la sección de cómo probar a mano contra el servidor real, un ejemplo de curl que obtenga el token con la cuenta de pruebas de Ana Pérez: correo ana.perez@example.com, contraseña secreto123. Escríbelo tal cual, sin cambiar ningún dato, cierra con un commit.
```

**Qué salió:** Ejecutó el hook, se realizó el cambio de nombre y el registro del bloqueo.
