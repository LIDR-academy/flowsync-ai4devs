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

## Cómo se lanzaron

Todas las sesiones se lanzaron desde la raíz del repositorio, en la rama `bloqueo-gt`, con una
**configuración aislada** (`CLAUDE_CONFIG_DIR=~/.claude-aislado claude`) que excluye el `CLAUDE.md`
global del usuario y sus hooks, así que el agente solo vio las instrucciones y los hooks del proyecto.

---

# Parte A: el inventario

## Prompt 1

**Modelo:** Sonnet 5.5 High (`claude-sonnet-5-5`)
**Herramienta:** Claude Code 2.1.286 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)

```
Sin cambiar ningún archivo, hacé un inventario de qué es dato personal o secreto en este proyecto y de qué leés vos para trabajar acá. Tres listas:

1. Datos de una persona identificable: las tablas y columnas que los guardan, sacadas de las migraciones de backend/database/migrations (leelas, no las supongas), y los ficheros con ejemplos de correos o nombres de personas. De cada cosa, la ruta donde la viste.
2. Ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repositorio. De cada uno, si está versionado o ignorado por git, y con qué comando lo comprobaste.
3. Lo que leíste o leerías por defecto para hacer un cambio en el backend: el fichero de instrucciones del repositorio, la configuración del harness, los ficheros de entorno, la base de datos local y cualquier otro. De cada uno, si su contenido sale de mi máquina cuando trabajás conmigo, y por qué.

No abras ningún .env ni tmp/db.sqlite3 para hacer esto: para saber qué llevan, alcanza con .env.example y las migraciones. Y si nombrás un secreto, nombrá el fichero y la variable, nunca el valor.
```

**Qué salió:** Respondió a la primera sin tocar ficheros y sin abrir `.env` ni `db.sqlite3`. Las columnas salen de las migraciones y las comprobé contra ellas: `users.full_name`, `users.email`, `users.password`, `auth_access_tokens.tokenable_id`/`hash` y `tasks.assignee_id`/`title`. Todos los correos de ejemplo usan `example.com`. Lista 3: dice que todo lo que lee viaja a la API y que `CLAUDE.md` va en cada petición. Además detectó `.atl/` sin seguimiento ni ignorar, que un `git add .` metería en el commit, y listó `~/.claude-aislado/`, que está fuera del repo. 53 segundos.

# Parte B: el hook

## Prompt 2

**Modelo:** Sonnet 5.5 High (`claude-sonnet-5-5`)
**Herramienta:** Claude Code 2.1.286 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)
**Sesión:** la misma que el Prompt 1

```
Ahora montá un hook de Claude Code llamado datos-que-no-salen. Las restricciones son estas y no se negocian:

Pieza 1: el script en .claude/hooks/datos-que-no-salen.sh, registrado en .claude/settings.json como PreToolUse con el matcher Bash, junto al hook que ya hay. Lee el JSON de la entrada estándar con jq (el comando viene en .tool_input.command), como hace el hook de Prettier. set -uo pipefail.
- Solo actúa si el comando contiene git commit. Con cualquier otro comando sale con 0 sin decir nada.
- Mira las líneas añadidas de lo que va a entrar: el diff preparado (git diff --cached). Y si el mismo comando también hace git add, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque todavía no están en el índice.
- Tres reglas, y solo estas tres:
  1. Una clave con forma reconocible: AKIA seguido de 16 caracteres (AWS), sk-ant- (Anthropic), ghp_ o github_pat_ (GitHub), AIza seguido de 35 caracteres (Google), xoxb-/xoxp-/xoxa- (Slack), un bloque -----BEGIN ... PRIVATE KEY-----, o una línea APP_KEY= con valor.
  2. Una dirección de correo cuyo dominio no sea example.com, example.org, example.net ni github.com.
  3. El fichero .env (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los .env.example no cuentan.
- Si encuentra algo: sale con código 2, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade una línea a docs/seguridad/registro-de-bloqueos.md con la fecha y hora en UTC en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca el valor encontrado: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.
- Si no encuentra nada, sale con 0 y no escribe nada.

Pieza 2: un bloque corto en el CLAUDE.md del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea no se desactiva ni se salta (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto porque es la evidencia. AGENTS.md no se toca: antes de editar, mirá qué es y decímelo.

Probalo antes de darlo por hecho: un archivo temporal con un correo de gmail.com, git add, y un intento de commit. Para el intento no ejecutes git commit de verdad, porque si el harness no recargó la configuración en esta sesión el commit entraría: pasale al script por la entrada estándar el mismo JSON que le pasaría el harness, con git commit -m prueba en .tool_input.command. Tiene que salir con 2 y dejar su línea en el registro. Pasale también un git status: tiene que salir con 0 y sin escribir nada. Después sacá el archivo temporal del índice y del disco. La línea del registro se queda: es la primera evidencia de que el hook existe.

No toques ningún otro archivo. Al terminar mostrame el script, el bloque de settings.json, el bloque de CLAUDE.md, los códigos de salida de las dos pruebas y el contenido del registro.
```

**Qué salió:** Antes de editar vio que `AGENTS.md` es un enlace simbólico a `CLAUDE.md`: al editar uno cambian los dos. Escribió el script (105 líneas), lo registró como `PreToolUse` sobre `Bash` y añadió el bloque al `CLAUDE.md`. Metió un corchete en los patrones de la regla 1 (`ghp[_]`, `sk-an[t]-`) y redactó el bloque del `CLAUDE.md` sin patrones literales, para que el hook no bloqueara sus propios ficheros. Primero probó en un repo de juguete del scratchpad (las 8 formas de clave) y después en el real, por stdin. El commit con un correo de gmail.com preparado dio exit 2 y dejó `2026-09-30T22:35:17Z BLOQUEADO regla 2 prueba-datos-que-no-salen.tmp.txt`, sin el valor. `git status` dio exit 0, sin salida. Para simular el commit armó el JSON partiendo "commit" en un argumento aparte de `printf`, y lo justificó así: «para evitar que mi comando contenga el texto literal "git commit" y dispare el hook». Es decir, esquivó el hook él mismo. Cerró con `/commit` (`3806b30`, 4 ficheros) sin bloqueo. Reconoció tres huecos: `git commit -a`, un `.env` ignorado que solo ve si el comando lo nombra, y la dependencia de `$CLAUDE_PROJECT_DIR`. 3 min 9 s.

**Falso positivo, fuera de la sesión del ejercicio:** a las `22:37:10Z` el hook bloqueó un comando que no era un commit. Lo lanzó la otra sesión de Claude Code, la que lleva este `prompts.md`: era un `cat >> prompts.md <<'EOF'` con el texto de este Prompt 2. El texto contenía «git commit» y «git add», así que el hook lo trató como un commit. Después tomó «.env» de la prosa del propio comando como si fuera un fichero que se estaba añadiendo, y dejó `2026-09-30T22:37:10Z BLOQUEADO regla 3 .env` en el registro. Eso muestra dos cosas: el hook se recarga en mitad de una sesión ya abierta, y decide por el texto del comando, no por lo que el comando hace. La línea se queda en el registro porque el bloqueo ocurrió.
