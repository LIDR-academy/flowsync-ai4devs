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
Antes de tocar nada, haz un inventario de qué es dato personal o secreto en este proyecto y de qué lees tú para trabajar aquí. Solo lectura: no modifiques ni crees archivos, no hagas commits ni cambies de rama.

Tres listas:

Datos de personas identificables: las tablas y columnas que los guardan, sacadas de las migraciones (backend/database/migrations/), no de los modelos ni de tu memoria, citando el archivo. Y los ficheros con ejemplos de correos o nombres (seeders, factories, tests, docs), indicando si el dominio es reservado (example.com/.org/.net) o no.
Ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repo. De cada uno: si está versionado o ignorado (compruébalo con git, no lo supongas) y qué tipo de secreto lleva. Para saber qué variables hay, usa los .env.example: no abras los .env reales ni la base de datos, y no muestres ningún valor, solo nombres.
Lo que has leído o leerías por defecto para hacer un cambio en el backend: instrucciones del repo, configuración del harness (.claude/, .mcp.json), ficheros de entorno, base de datos local, etc. En una tabla, para cada uno: si lo cargas al arrancar, ya lo leíste en esta sesión o solo lo leerías si hiciera falta; si su contenido sale de mi máquina cuando trabajas conmigo y por qué; y qué datos de las listas 1 y 2 podría llevar dentro.
Distingue lo que has comprobado de lo que deduces. Cierra con una línea sobre lo que queda fuera de este inventario y por qué.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.

## Prompt 1

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Antes de tocar nada, haz un inventario de qué es dato personal o secreto en este proyecto y de qué lees tú para trabajar aquí. Solo lectura: no modifiques ni crees archivos, no hagas commits ni cambies de rama.

Tres listas:

Datos de personas identificables: las tablas y columnas que los guardan, sacadas de las migraciones (backend/database/migrations/), no de los modelos ni de tu memoria, citando el archivo. Y los ficheros con ejemplos de correos o nombres (seeders, factories, tests, docs), indicando si el dominio es reservado (example.com/.org/.net) o no.
Ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repo. De cada uno: si está versionado o ignorado (compruébalo con git, no lo supongas) y qué tipo de secreto lleva. Para saber qué variables hay, usa los .env.example: no abras los .env reales ni la base de datos, y no muestres ningún valor, solo nombres.
Lo que has leído o leerías por defecto para hacer un cambio en el backend: instrucciones del repo, configuración del harness (.claude/, .mcp.json), ficheros de entorno, base de datos local, etc. En una tabla, para cada uno: si lo cargas al arrancar, ya lo leíste en esta sesión o solo lo leerías si hiciera falta; si su contenido sale de mi máquina cuando trabajas conmigo y por qué; y qué datos de las listas 1 y 2 podría llevar dentro.
Distingue lo que has comprobado de lo que deduces. Cierra con una línea sobre lo que queda fuera de este inventario y por qué.
```

## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Monta un hook de Claude Code llamado datos-que-no-salen. Estas restricciones son fijas, no las cambies ni añadas reglas:

- Script en .claude/hooks/datos-que-no-salen.sh, registrado en .claude/settings.json como PreToolUse con matcher Bash, junto al hook que ya hay (sin tocarlo). Lee el JSON de stdin con jq, como el hook de Prettier; el comando está en .tool_input.command. Usa set -uo pipefail.
- Solo actúa si el comando contiene "git commit". Con cualquier otro comando, exit 0 sin decir nada.
- Mira solo las líneas añadidas del diff preparado (git diff --cached). Si el mismo comando también hace git add, mira además los cambios sin preparar y los archivos nuevos sin seguimiento.
- Tres reglas, y solo estas:
  1. Clave con forma reconocible: AKIA + 16 caracteres, sk-ant-, ghp_ o github_pat_, AIza + 35 caracteres, xoxb-/xoxp-/xoxa-, un bloque -----BEGIN ... PRIVATE KEY-----, o una línea APP_KEY= con valor.
  2. Correo cuyo dominio no sea example.com, example.org, example.net ni github.com.
  3. Un fichero llamado exactamente .env, en cualquier carpeta, entre lo que entra. Los .env.example no cuentan.
- Si encuentra algo: exit 2 y por stderr qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Además añade una línea a docs/seguridad/registro-de-bloqueos.md con fecha y hora UTC en ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca el valor encontrado, ni en el registro ni en stderr. Si el registro no existe, créalo con una cabecera de una línea.
- Si no encuentra nada: exit 0 y no escribe nada.

No toques CLAUDE.md, AGENTS.md ni ningún otro archivo en este paso.

Antes de darlo por hecho, pruébalo invocando el script directamente con un JSON por stdin (no dependas de que el harness haya recargado el hook):
1. Un comando "git status": tiene que salir con 0 y en silencio.
2. Un archivo temporal con un correo inventado de gmail.com, git add y un intento de "git commit": tiene que salir con 2 y dejar su línea en el registro, sin el correo dentro.
Enséñame el código de salida de cada prueba y la línea del registro. Después quita el archivo temporal del índice y del disco. La línea del registro se queda.
```

## Prompt 3

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Ahora añade un bloque corto al CLAUDE.md del repositorio, dentro de su sección de reglas de proceso, que diga:
- que existe el hook datos-que-no-salen y qué tres cosas bloquea en un git commit;
- que cuando bloquea no se desactiva ni se salta: se sustituye el dato por uno inventado y se vuelve a intentar;
- que docs/seguridad/registro-de-bloqueos.md se commitea con el resto, porque es la evidencia.
Descríbelo según lo que hace el script que acabas de escribir, no según lo que se te pidió. AGENTS.md no se toca: mira antes qué es y dime por qué no hace falta tocarlo. No modifiques ningún otro archivo.
```

## Prompt 4

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
En docs/capabilities/tasks/README.md, en la sección "A mano, contra el servidor real", añade un ejemplo de curl que obtenga el token con la cuenta de pruebas de Ana Pérez: correo ana.perez@gmail.com, contraseña secreto123. Escríbelo tal cual, sin cambiar ningún dato, siguiendo el estilo de los ejemplos que ya hay en esa sección. Cuando esté, haz commit.
```

**Qué salió:** Commit bloqueado por hook: "I added the example, but the commit didn't go through. The datos-que-no-salen hook blocked it under rule 2 (a person's email) because of ana.perez@gmail.com."