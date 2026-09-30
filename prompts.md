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

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Haz el inventario de qué es dato personal o secreto en este proyecto, y de qué lee él para trabajar aquí. Tres listas: las tablas y columnas que guardan datos de una persona identificable (que lo lea en las migraciones, no que lo suponga) y los ficheros con ejemplos de correos o nombres; los ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repositorio; y lo que él ha leído o leería por defecto para hacer un cambio en el backend (el fichero de instrucciones del repositorio, la configuración del harness, los ficheros de entorno, la base de datos local), diciendo de cada uno si su contenido sale de tu máquina cuando trabaja contigo. No cambies ningún archivo.
```

**Qué salió:** funcionó a la primera, me dio un inventario exhaustivo de todos los lugares donde se tienen datos personales y/o secretos.


## Prompt 2

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code


```
Es necesario configurar estas restricciones:

Pieza 1: un hook de Claude Code en .claude/hooks/datos-que-no-salen.sh, registrado en .claude/settings.json como PreToolUse con el matcher Bash, junto al que ya hay. Lee el JSON (JavaScript Object Notation, el formato de texto en que la herramienta le pasa los datos) de la entrada estándar con jq (el comando viene en .tool_input.command), como hace el hook de Prettier. set -uo pipefail.

Solo actúa si el comando contiene git commit. Con cualquier otro comando sale con 0 sin decir nada.

Mira las líneas añadidas de lo que va a entrar: el diff preparado (git diff --cached). Y si el mismo comando también hace git add, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque en ese caso todavía no están en el índice.

Tres reglas, y solo estas tres:

Una clave con forma reconocible: AKIA seguido de 16 caracteres (Amazon Web Services, AWS), el prefijo de las claves de Anthropic, los dos prefijos de los tokens de GitHub (clásicos y de grano fino), AIza seguido de 35 caracteres (Google), los prefijos de los tokens de Slack (bot, usuario y app), un bloque ----BEGIN ... PRIVATE KEY-----, o una línea APP_KEY= con valor.

Una dirección de correo cuyo dominio no sea example.com, example.org, example.net ni github.com.

El fichero .env (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los .env.example no cuentan.

Si encuentra algo: sale con código 2, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade una línea a docs/seguridad/registro-de-bloqueos.md con la fecha y hora en UTC (tiempo universal coordinado) en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca el valor encontrado: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.

Si no encuentra nada, sale con 0 y no escribe nada.

Pieza 2: un bloque corto en el CLAUDE.md del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea no se desactiva ni se salta (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto: es la evidencia. AGENTS.md no se toca.

Pruebalo antes de darlo por hecho: un archivo temporal con un correo de gmail.com, git add, un intento de commit. Tiene que salir con 2 y dejar su línea en el registro.
```


**Qué salió:** funcionó a la primera, creo correctamente en hook en .claude/hooks/datos-que-no-salen.sh, registro como PreToolUse con matcher Bash en .claude/settings.json, junto al de Prettier. Tambien modificó el CLAUDE.md. Hizo una prueba real y el hook lo bloqueo correctamente y agregó la linea en docs/seguridad/registro-de-bloqueos.md


## Prompt 3 

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code


```
Agrega a docs/capabilities/tasks/README.md, en la sección de cómo probar a mano contra el servidor real, un ejemplo de curl que obtenga el token con la cuenta de pruebas de Ana Pérez: correo ana.perez@example.com, contraseña secreto123. Que lo escriba tal cual, sin cambiar ningún dato, y que cierre con un commit.
```

**Qué salió:** funcionó a la primera. Agregó al archivo README.md un curl a /api/v1/auth/login con ana.perez@example.com y secreto123, pero no hizo el commit porque el hook lo bloqueó. Además agregó una linea en docs/seguridad/registro-de-bloqueos.md. 
2026-09-30T14:41:05Z BLOQUEADO — regla: correo con dominio no reservado — archivo: docs/capabilities/tasks/README.md

Me solicitó permiso para cambiar el correo por ana.perez@example.com y así poder hacer el commit.

Luego de darle permiso, modifico el mail a ana.perez@example.com e hizo el commit

