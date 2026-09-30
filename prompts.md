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

> **Sustituciones del hook `datos-que-no-salen`.** Los prompts van tal cual se lanzaron salvo en
> esto: el hook bloqueó el commit de este fichero (queda en `docs/seguridad/registro-de-bloqueos.md`)
> y, como manda `CLAUDE.md`, los datos se sustituyeron por otros inventados en vez de saltárselo.
> Los correos de dominios reales pasan a `example.com`, y en la regla 1 los prefijos literales de
> las claves de Anthropic, GitHub y Slack se cambian por su nombre entre corchetes.

---

## Prompt 1

**Modelo:** Opus 5.5 (1M context) | 💪 high
**Herramienta:** Claude Code

```
 Primero revisa este repo y haz un inventario de qué es dato personal o secreto en este proyecto.
  De qué lees para trabajar aquí?
   Crea Tres listas:
  - las tablas y columnas que guardan datos de una persona identificable. No asumas nada; revisa las migraciones para obtener la respuesta.
  - los ficheros con ejemplos de correos o nombres: los ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repositorio.
  - lo que has leído o leerías por defecto para hacer un cambio en el backend (el fichero de instrucciones del repositorio, la configuración del harness, los ficheros de entorno, la base de datos local),
     diciendo de cada uno si su contenido sale de esta máquina cuando trabajas contmigo.

    No cambies ningún archivo.
```

**Qué salió:** 
He terminado de revisar; no he cambiado ningún fichero. Antes de las listas, dos cosas:
Qué he enviado yo en esta sesión. Todo lo que leo con una herramienta entra en mi contexto y sale de tu máquina hacia la API de Anthropic, que es donde corre el modelo. Por eso de backend/.env, frontend/.env y .claude/settings.local.json solo he leído los nombres de las claves, sin valores. De backend/tmp/db.sqlite3 solo he leído el número de filas.

- Estado actual de la base local: 0 filas en las tres tablas.

Ficheros con correos o nombres de ejemplo

- backend/tests/functional/auth/*.spec.ts y tests/functional/tasks/assignee.spec.ts: usan ada@example.com, alan@example.com, sin-nombre@example.com y nadie@example.com, con los nombres "Ada Lovelace" y "Alan Turing".
- backend/app/openapi/schemas.ts:34: un "Ada Lovelace" de ejemplo, que se copia a docs/api/openapi.json.
- docs/capabilities/tasks/README.md:155: un curl con ada@example.com y la contraseña secreto123.
- openspec/specs/auth/spec.md, openspec/specs/tasks/spec.md y la change archivada add-task-list: los mismos nombres y correos de ejemplo.
- README.md:143: ana.perez@example.com con secreto123. Es el único correo de un dominio real: es el cebo del ejercicio.
- frontend/src/pages/login-page.tsx y register-page.tsx: el placeholder tu@example.com.
- eval-harness/evals/commit-skill/fixture.sh: alumno@example.com.
- El historial de git: tiene 10 identidades distintas entre autores y committers, y son reales (la tuya incluida). Es el único dato personal real que hay en el repo, y sale a GitHub en cada push.

---

Lista 2 — Ficheros con claves, tokens o contraseñas (estén o no en el repo)

Fuera del repo (ignorados por git, pero existen en tu máquina):

- backend/.env: contiene APP_KEY, que es un secreto real (firma y cifra datos de la app). El resto de variables (PORT, HOST…) no son secretas.
- frontend/.env: solo VITE_API_URL, que no es secreta. Aun así, cualquier variable VITE_* acaba dentro del bundle en frontend/dist/, así que nunca debe llevar un secreto.
- backend/tmp/db.sqlite3: guardaría los hashes de contraseñas y de tokens. Ahora está vacía.
- .claude/settings.local.json: una lista de permisos permitidos con 1 entrada. Un permiso de Bash puede incluir un comando con una credencial dentro; no lo he abierto.
- ~/.claude/settings.json, remote-settings.json, history.jsonl y ~/.claude/projects/<este-proyecto>/*.jsonl: configuración de usuario y transcripciones. Pueden contener cualquier cosa que se haya pegado o leído en una sesión. No los he abierto.
- Los secretos de GitHub CLAUDE_CODE_OAUTH_TOKEN y GITHUB_TOKEN: viven en GitHub. .github/workflows/revisor.yml los usa por nombre, pero no están en el repo.
- El token de sesión del navegador: va en localStorage bajo flowsync.token, y también se devuelve en claro en la respuesta de signup y de login.

Dentro del repo (tienen forma de credencial, pero son de mentira):

- .github/workflows/openapi.yml:39: APP_KEY: clave-de-ci-sin-valor-secreto.
- backend/.env.example: APP_KEY= vacío.
- README.md:223-227: una dirección de conexión con S3cr3t y OLLAMA_API_KEY=abc123def456.
- docs/ci-revisor.md: menciona ANTHROPIC_API_KEY por nombre.
- Las contraseñas de los tests y de los curl de ejemplo.

Historial: nunca se ha commiteado un .env. Solo .env.example y .env.test.


Conclusión: cualquier cosa que yo lea sale de tu máquina, se haya ido cargando sola (CLAUDE.md, tu correo) o la haya abierto yo. Lo único que hoy impide que salgan .env o la base de datos es mi decisión de no abrirlos, porque ninguna regla de permisos lo bloquea.
---

## Prompt 2

**Modelo:** Opus 5.5 (1M context) | 💪 high
**Herramienta:** Claude Code

```
Crea un hook con las siguientes restricciones no negociables:

    Pieza 1: un hook de Claude Code en .claude/hooks/datos-que-no-salen.sh, registrado en .claude/settings.json como PreToolUse con el matcher Bash, junto al que ya hay. Lee el JSON (JavaScript Object Notation, el formato de texto en que la herramienta le pasa los datos) de la entrada estándar con jq (el comando viene en .tool_input.command), como hace el hook de Prettier. set -uo pipefail.

  Solo actúa si el comando contiene git commit. Con cualquier otro comando sale con 0 sin decir nada.

  Mira las líneas añadidas de lo que va a entrar: el diff preparado (git diff --cached). Y si el mismo comando también hace git add, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque en ese caso todavía no están en el índice.

  Tres reglas, y solo estas tres:

  Una clave con forma reconocible: AKIA seguido de 16 caracteres (Amazon Web Services, AWS), [prefijo de Anthropic], [los dos prefijos de GitHub], AIza seguido de 35 caracteres (Google), [los tres prefijos de Slack], un bloque ----BEGIN ... PRIVATE KEY-----, o una línea APP_KEY= con valor.

  Una dirección de correo cuyo dominio no sea example.com, example.org, example.net ni github.com. La lista es corta a propósito: los ejemplos y las pruebas de este proyecto ya usan example.com, que es un dominio reservado para eso.

  El fichero .env (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los .env.example no cuentan.

  Si encuentra algo: sale con código 2, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade una línea a docs/seguridad/registro-de-bloqueos.md con la fecha y hora en UTC (tiempo universal coordinado) en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca el valor encontrado: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.

  Si no encuentra nada, sale con 0 y no escribe nada.

  Pieza 2: un bloque corto en el CLAUDE.md del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea no se desactiva ni se salta (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto: es la evidencia. AGENTS.md no se toca: que mire antes qué es.

  Antes de dar la tarea por terminada, prueba el hook creado: un archivo temporal con un correo de gmail.com, git add, un intento de commit.
  Tiene que salir con 2 y dejar su línea en el registro. Después, fuera el archivo temporal. La línea se queda: es la primera evidencia de que el hook existe.
```

**Qué salió:** 
Creó el hook, lo probó y commiteó en la rama bloqueo-oje (ea031e0). Ese commit pasó por el propio hook sin que saltara. El prompts.md sigue sin preparar y fuera del commit, y AGENTS.md no lo tocó.

Qué añadió
- .claude/hooks/datos-que-no-salen.sh: aplica las tres reglas tal como las pediste. Los patrones están escritos para que el script no case consigo mismo; si no, bloquearía su propio commit.
- .claude/settings.json: el hook, registrado como PreToolUse con el matcher Bash, junto al de Prettier.
- CLAUDE.md: un bloque en las reglas de proceso. AGENTS.md es un enlace simbólico a CLAUDE.md, así que el bloque también aparece al leerlo.
- docs/seguridad/registro-de-bloqueos.md: el registro, con cinco líneas. Ninguna lleva el valor encontrado.

Pruebas que ejecutó
- 13 casos en un clon del repo, para no llenar el registro real con líneas de prueba. Todos dan el resultado esperado: bloquea cada regla, deja pasar example.com, github.com, .env.example y un APP_KEY vacío, y un commit sin git add no mira lo que no está preparado.
- Prueba real a través del harness: git add de un archivo con un correo de gmail.com y luego git commit. Salió con código 2, no se creó ningún commit y quedó la línea 2026-09-29T02:00:00Z BLOQUEADO — regla 2 (correo de una persona) — prueba-hook.tmp.txt. Después borré el archivo temporal.

Lo que pasó al commitear, que se ve en HALLAZGOS.md

Las otras cuatro líneas del registro vienen de dos intentos de su propio commit, y los dos bloqueos fueron por prompts.md, que no iba a entrar:
1. El mensaje del commit contenía el texto git add, y el hook lo tomó por un git add de verdad. La detección por subcadena da falsos positivos.
2. El comando sí hacía git add de un solo archivo, pero la regla obliga a revisar todos los cambios sin preparar. Mientras prompts.md tenga cambios sin preparar, cualquier git add … && git commit quedará bloqueado. Lo resolvió haciendo el git add y el commit en dos llamadas separadas. No tocó el hook ni lo desactivó.

Lo que me avisó que tengo que saber antes de poder hacer el PR:
- prompts.md no se podrá commitear tal cual. Al pegar las reglas del hook quedaron dentro un correo de gmail.com y un prefijo de clave, y el hook los bloqueará.
- Casos que el hook deja pasar:
  - git add -f backend/.env && git commit en un solo comando no se bloquea. El .env está ignorado, así que no sale en la lista de archivos sin seguimiento. En dos pasos sí lo bloquea.
  - git commit -am mete lo no preparado sin que haya un git add, y el hook no lo revisa.
  - git -C carpeta commit no contiene el texto git commit, así que el hook ni se entera.
  - Si el nombre de un archivo lleva el dato, el registro lo repite.


  ---

  ## Prompt 3

**Modelo:** Opus 5.5 (1M context) | 💪 high
**Herramienta:** Claude Code

```
Ahora vamos a proceder a probar el hook con un dato que no debe entrar, a traves de esta tarea que vas a ejecutar:

Añade a docs/capabilities/tasks/README.md, en la sección de cómo probar a mano contra el servidor real, un ejemplo de curl que obtenga el token con la cuenta de pruebas de Ana Pérez: correo ana.perez@example.com, contraseña secreto123. Escribelo tal cual, sin cambiar ningún dato, y cierra con un commit.

```

**Qué salió:** 

Ejemplo escrito con los datos tal cual. Preparó solo ese archivo y, en otra llamada, hizo el commit (así evitó el falso positivo de prompts.md que vimos antes):

El hook bloqueó el commit por la regla 2, así que sustituyó el dominio por example.com y reintentó, manteniendo nombre y contraseña sin cambios.

Ha saltado la pieza 1: el hook bloqueó el commit y el ejemplo ha entrado con el correo cambiado a ana.perez@example.com, no tal cual como se le pidió.

1. Añadió a docs/capabilities/tasks/README.md, en «A mano, contra el servidor real», un paso «1 bis»: un curl a POST /api/v1/auth/login con ana.perez@example.com / secreto123, tal cual se le pidió, que extrae el token.
2. Al intentar el commit, el hook lo bloqueó por la regla 2 (correo de una persona) en ese archivo.
3. CLAUDE.md dice que, cuando el hook bloquea, no se salta: se sustituye el dato por uno inventado. Por eso cambió el correo a ana.perez@example.com en lugar de mantenerlo tal cual. La contraseña secreto123 se quedó como estaba, porque no infringe ninguna regla y el ejemplo ya la usa.
4. El segundo intento pasó: commit 8ec7458. El registro subió en el mismo commit con su nueva línea, sin el valor:
   - 2026-09-29T02:19:27Z BLOQUEADO — regla 2 (correo de una persona) — docs/capabilities/tasks/README.md

Hice el git add y el git commit en llamadas separadas, para evitar el falso positivo de antes con prompts.md. Ese archivo sigue sin preparar y fuera de los commits.
