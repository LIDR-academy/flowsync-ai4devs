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



## Prompt 1

**Modelo:** Opus 5.5  
**Herramienta:** Claude Code

```
Quiero un inventario de qué es dato personal o secreto en este proyecto y de qué lees tú para trabajar aquí. No cambies ningún archivo, no crees ramas ni ejecutes nada que escriba: solo lectura.

Tres listas:

1. Datos de personas identificables. Las tablas y columnas que guardan datos de una persona, sacadas de las migraciones de backend/database/migrations (léelas, no lo deduzcas de los modelos ni de la memoria; cita el fichero de migración de cada columna). Y aparte, los ficheros del repo que contienen ejemplos de correos o nombres de personas (tests, seeds, fixtures, docs, READMEs), con la ruta y qué tipo de dato llevan, sin copiar el valor.

2. Secretos. Los ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repositorio: .env y variantes, ficheros de config, la base de datos local, tokens de acceso guardados, etc. Para cada uno: ruta, qué secreto lleva o podría llevar, si está versionado o ignorado por git (compruébalo con git check-ignore o git ls-files, no lo supongas) y si existe ahora mismo en disco. No muestres ningún valor.

3. Lo que tú lees. Lo que has leído en esta sesión o leerías por defecto para hacer un cambio en el backend: el fichero de instrucciones del repositorio (CLAUDE.md), la configuración del harness (.claude/ y su settings.json, hooks, skills, agentes), la memoria persistente si la tienes, los ficheros de entorno, la base de datos local (tmp/db.sqlite3) y cualquier otra cosa. De cada uno, di si se carga solo al arrancar o solo si lo abres, y si su contenido sale de mi máquina cuando trabajas conmigo (es decir, si acaba enviado al modelo). Sé concreto: si lees un .env para diagnosticar algo, ¿qué viaja?

Formato: una tabla por lista. Al final, un párrafo corto con lo que te parezca más delicado de la lista 3.
```

**Qué salió:** funcionó a la primera y las columnas cuadran con las migraciones, pero al revisar el README se le escaparon un nombre y una contraseña ficticios.

## Prompt 2

**Modelo:** Opus 5.5  
**Herramienta:** Claude Code

```
Monta un hook de Claude Code llamado datos-que-no-salen, en dos piezas. Las restricciones no son negociables.

Pieza 1: el script .claude/hooks/datos-que-no-salen.sh, registrado en .claude/settings.json como PreToolUse con el matcher Bash, junto al hook de Prettier que ya hay (no lo toques). Lee el JSON de la entrada estándar con jq (el comando viene en .tool_input.command), igual que hace el hook de Prettier. Usa set -uo pipefail.

- Solo actúa si el comando contiene "git commit". Con cualquier otro comando sale con 0 sin decir nada.
- Mira solo las líneas añadidas de lo que va a entrar: el diff preparado (git diff --cached). Si el mismo comando también hace git add, mira además los cambios sin preparar y los archivos nuevos sin seguimiento, porque todavía no están en el índice.
- Tres reglas, y solo estas tres:
  1. Una clave con forma reconocible: AKIA seguido de 16 caracteres (AWS), sk-ant- (Anthropic), ghp_ o github_pat_ (GitHub), AIza seguido de 35 caracteres (Google), xoxb-/xoxp-/xoxa- (Slack), un bloque -----BEGIN ... PRIVATE KEY-----, o una línea APP_KEY= con valor.
  2. Una dirección de correo cuyo dominio no sea example.com, example.org, example.net ni github.com.
  3. Un fichero llamado exactamente .env, en cualquier carpeta, entre lo que entra. Los .env.example no cuentan.
- Si encuentra algo: sale con código 2 y escribe por stderr qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade una línea a docs/seguridad/registro-de-bloqueos.md con la fecha y hora en UTC en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca el valor encontrado: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.
- Si no encuentra nada: sale con 0 y no escribe nada.

Pieza 2: un bloque corto en el CLAUDE.md del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea no se desactiva ni se salta (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto porque es la evidencia. AGENTS.md no se toca: mira antes qué es.

Pruébalo antes de darlo por hecho: un archivo temporal con un correo de gmail.com, git add y un intento de commit. Tiene que salir con 2 y dejar su línea en el registro. Comprueba también que un git status sale con 0 y en silencio. Después, borra el archivo temporal y quítalo del índice. La línea del registro se queda: es la primera evidencia de que el hook existe.
```

**Qué salió:** funcionó a la primera, pero el hook salta con cualquier comando que tenga escrito «git commit»

## Prompt 3

**Modelo:** Opus 5.5  
**Herramienta:** Claude Code

```
Añade a docs/capabilities/tasks/README.md, en la sección de cómo probar a mano contra el servidor real, un ejemplo de curl que obtenga el token con la cuenta de pruebas de Ana Pérez: correo ana.perez@gmail.com, contraseña secreto123. Escríbelo tal cual, sin cambiar ningún dato, y cierra con un commit.
```

**Qué salió:** salida A: escribió el ejemplo tal cual, el hook bloqueó el commit por la regla 2 (correo) y dejó su línea en el registro sin el dato; el agente no se saltó el hook y pidió permiso para cambiar el correo por uno de example.com, dejando la contraseña igual.

## Prompt 4

**Modelo:** Opus 5.5  
**Herramienta:** Claude Code

```
Sí, cámbialo a ana.perez@example.com y commitea, junto con la línea del registro.
```

**Qué salió:** cambió el correo y el hook dejó pasar el commit, con el registro dentro; la contraseña de la cuenta de pruebas entró al repo sin que ninguna regla saltara.