# Prompts

## Prompt 1

**Modelo:** Claude Opus 4.6
**Herramienta:** Claude Code

```
Haz un inventario de datos personales y secretos en este proyecto, sin modificar ningún archivo. Tres listas:

1. Tablas y columnas que guardan datos de una persona identificable (léelo de las migraciones, no lo supongas) y ficheros con ejemplos de correos o nombres reales.

2. Ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repositorio.

3. Lo que tú lees o leerías por defecto para hacer un cambio en el backend (CLAUDE.md, configuración del harness, ficheros de entorno, base de datos local), diciendo de cada uno si su contenido sale de mi máquina cuando trabajas conmigo.
```

**Qué salió:** Funcionó a la primera. Leyó las migraciones, buscó correos con grep, listó los .env y explicó qué lee el agente y qué se envía a la API de Anthropic.

---

## Prompt 2

**Modelo:** Claude Opus 4.6
**Herramienta:** Claude Code

```
Monta un hook de Claude Code en .claude/hooks/datos-que-no-salen.sh, registrado en .claude/settings.json como PreToolUse con el matcher Bash, junto al que ya hay. Que lea el JSON de la entrada estándar con jq (el comando viene en .tool_input.command), como hace el hook de Prettier. set -uo pipefail.

Solo actúa si el comando contiene git commit. Con cualquier otro comando sale con 0 sin decir nada.

Mira las líneas añadidas de lo que va a entrar: el diff preparado (git diff --cached). Y si el mismo comando también hace git add, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque en ese caso todavía no están en el índice.

Tres reglas, y solo estas tres:

1. Una clave con forma reconocible: AKIA seguido de 16 caracteres (AWS), sk-ant- (Anthropic), ghp_ o github_pat_ (GitHub), AIza seguido de 35 caracteres (Google), xoxb-/xoxp-/xoxa- (Slack), un bloque BEGIN PRIVATE KEY, o una línea APP_KEY= con valor.

2. Una dirección de correo cuyo dominio no sea example.com, example.org, example.net ni github.com.

3. El fichero .env (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los .env.example no cuentan.

Si encuentra algo: sale con código 2, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade una línea a docs/seguridad/registro-de-bloqueos.md con la fecha y hora UTC en ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca el valor encontrado. Si el registro no existe, lo crea con una cabecera.

Si no encuentra nada, sale con 0 y no escribe nada.

También añade un bloque en CLAUDE.md, en la sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea no se desactiva ni se salta (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto.

Pruébalo antes de darlo por hecho: un archivo temporal con un correo de gmail.com, git add, un intento de commit. Tiene que salir con 2 y dejar su línea en el registro. Después, fuera el archivo temporal. La línea se queda.
```

**Qué salió:** Creó el hook y lo registró. Al probar, bloqueó el correo de gmail.com con código 2 y dejó la línea en el registro. Al commitear todo junto, el propio script se detectaba a sí mismo (los patrones escritos en el código y en CLAUDE.md activaban la regla de claves). Lo resolví excluyendo el archivo del hook del diff y reescribiendo la descripción en CLAUDE.md sin los patrones literales.

---

## Prompt 3

**Modelo:** Claude Opus 4.6
**Herramienta:** Claude Code

```
Añade a docs/capabilities/tasks/README.md, en la sección de cómo probar a mano contra el servidor real, un ejemplo de curl que obtenga el token con la cuenta de pruebas de Ana Pérez: correo ana.perez@gmail.com, contraseña secreto123. Escríbelo tal cual, sin cambiar ningún dato, y cierra con un commit.
```

**Qué salió:** Escribió el ejemplo con el correo real. Al intentar el commit, el hook saltó con la regla correo-real y código 2. Se registró el bloqueo sin incluir el correo. Sustituí el correo por ana.perez@example.com y el commit pasó limpio.
