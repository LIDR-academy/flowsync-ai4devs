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

## Prompt 1 - PARTE A

**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code
```text
Hazme un inventario de qué consideras datos personales o secretos en este proyecto y en qué archivos o lugares se encuentran o te basas para ello. Dame tres listas: las tablas y columnas que guardan datos de una persona identificable (leídas en las migraciones, no lo supongas) y los ficheros con ejemplos de correos o nombres; los ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repositorio ¿Qué propuesta de manejo de estos datos tienes?, NO cambies ningún archivo todavía y que has leído o leerías por defecto para hacer un cambio en el backend (ficheros de instrucciones del repositorio, configuraciones del harness, ficheros de entorno, bases de datos locales, etc.), diciendo de cada uno si su contenido sale de mi máquina cuando trabaja conmigo.
```

**Qué salió:** 
```text
No he modificado ningún archivo. Todo lo que sigue sale de ficheros que he abierto en esta sesión; donde no he abierto algo, lo digo.

**Regla general sobre qué sale de tu máquina:** todo lo que entra en mi contexto se envía a la API de Anthropic. Eso incluye los ficheros que leo, la salida de los comandos que ejecuto y lo que el harness inyecta solo. Lo que el harness usa sin mostrármelo se queda en tu máquina.

---

## Lista 1 — Datos de personas identificables

### Tablas y columnas (sacadas de las 4 migraciones de `backend/database/migrations/`)

| Tabla | Columna | Por qué es dato personal |
|---|---|---|
| `users` ([migración](backend/database/migrations/1761885935168_create_users_table.ts)) | `full_name` (puede ir vacía) | Nombre de la persona |
| | `email` (254, única) | Identifica directamente a la persona |
| | `password` | Hash de la contraseña (lo calcula `withAuthFinder(hash)` en [user.ts](backend/app/models/user.ts#L7)); es una credencial derivada |
| | `id`, `created_at`, `updated_at` | Identificador con el que se enlaza todo lo demás, y fechas de alta |
| `auth_access_tokens` ([migración](backend/database/migrations/1768620764696_create_access_tokens_table.ts)) | `tokenable_id` → `users.id` | Liga cada token a una persona |
| | `hash` | Hash del token de acceso; es un secreto |
| | `last_used_at`, `created_at`, `updated_at` | Rastro de actividad de la persona |
| | `expires_at` | Queda siempre vacía: [config/auth.ts](backend/config/auth.ts) no define `expiresIn`, así que **los tokens nunca caducan** |
| `tasks` ([migración](backend/database/migrations/1786642030284_create_tasks_table.ts) + [due_date](backend/database/migrations/1786644500000_add_due_date_to_tasks_table.ts)) | `assignee_id` → `users.id` | Convierte cada tarea en información de una persona: qué tiene asignado |
| | `title` (texto libre, 200) | Cualquiera puede escribir ahí un nombre o cualquier otra cosa |
| | `due_date`, `status` | Carga de trabajo y plazos de esa persona |

- **Dato derivado:** el getter `initials` de [user.ts:11](backend/app/models/user.ts#L11) no se guarda, pero se expone. Si la persona no tiene `full_name`, se calcula con la parte del email antes de la `@`. Por tanto, [TaskAssigneeTransformer](backend/app/transformers/task_assignee_transformer.ts) acaba filtrando las 2 primeras letras del correo.
- **Dónde están los datos reales:** en `backend/tmp/db.sqlite3` (32 KB). Git lo ignora y lo he comprobado con `git log --all`: nunca se ha commiteado. No lo he abierto. Lo usan tanto el servidor de desarrollo como los tests.

### Ficheros con correos o nombres de ejemplo

- **Tests** ([signup](backend/tests/functional/auth/signup.spec.ts), [login](backend/tests/functional/auth/login.spec.ts), [session](backend/tests/functional/auth/session.spec.ts), [initials](backend/tests/functional/auth/initials.spec.ts), [assignee](backend/tests/functional/tasks/assignee.spec.ts)):
  - correos `ada@`, `alan@`, `sin-nombre@` y `nadie@example.com`;
  - nombres "Ada Lovelace", "Alan Turing" y "Otra Persona";
  - la contraseña `secreto123`.
- **Otros `@example.com`:** [openspec/specs/auth/spec.md:13](openspec/specs/auth/spec.md#L13) (y la línea 150), [docs/capabilities/tasks/README.md:155](docs/capabilities/tasks/README.md#L155) y [eval-harness/.../fixture.sh:6](eval-harness/evals/commit-skill/fixture.sh#L6).
- **[README.md:143](README.md#L143):** `ana.perez@gmail.com` con la contraseña `secreto123`. Es el único correo del repo con un dominio no reservado. Es inventado a propósito, pero ya está commiteado.
- **[README.md:227](README.md#L227):** `admin:S3cr3t@bd.miempresa.com`, una cadena de conexión con contraseña.
- **Placeholders con dominio real:** `tu@email.com` en [login-page.tsx:50](frontend/src/pages/login-page.tsx#L50) y [register-page.tsx:92](frontend/src/pages/register-page.tsx#L92). `email.com` es un dominio real, no reservado.
- **Fuera de los ficheros:** cada commit lleva el nombre y el correo de su autor.

---

## Lista 2 — Ficheros y lugares con claves, tokens o contraseñas

**Versionados en el repositorio:**
- [backend/.env.example](backend/.env.example): tiene `APP_KEY=` vacío. Sin riesgo.
- [backend/.env.test](backend/.env.test): hoy solo lleva `SESSION_DRIVER`, pero **está versionado**. Cualquier clave que alguien añada ahí acabará en git.
- [frontend/.env.example](frontend/.env.example): solo la URL. Cualquier `VITE_*` acaba en el bundle público, así que nunca debe llevar un secreto.
- [start/env.ts:22](backend/start/env.ts#L22) declara `APP_KEY` como `secret()` y [config/encryption.ts:16](backend/config/encryption.ts#L16) la usa. No contienen ningún valor.
- [.github/workflows/openapi.yml:39](.github/workflows/openapi.yml#L39) lleva un `APP_KEY` ficticio, puesto a propósito.
- [.github/workflows/revisor.yml:53](.github/workflows/revisor.yml#L53) referencia `CLAUDE_CODE_OAUTH_TOKEN` y `GITHUB_TOKEN`. Los valores viven en GitHub Secrets, no en el repo.
- [.mcp.json](.mcp.json): solo la URL de Atlassian. El token OAuth no se guarda ahí.
- [Makefile:57](Makefile#L57): genera `APP_KEY` dentro de `backend/.env`.

**Fuera del repositorio (ignorados o locales):**
- `backend/.env`: contiene el `APP_KEY` real. Solo he leído los nombres de las variables, no sus valores. Nunca se ha commiteado.
- `frontend/.env`: solo `VITE_API_URL`.
- `backend/tmp/db.sqlite3`: guarda los hashes de las contraseñas y de los tokens.
- `.claude/settings.local.json` y `backend/.claude/settings.local.json`: hoy solo `enabledMcpjsonServers`, pero es donde suelen acabar variables de entorno con tokens.
- El `localStorage` del navegador, bajo `flowsync.token` ([auth-provider.tsx:7](frontend/src/auth/auth-provider.tsx#L7)): el token Bearer en claro, y sin caducidad.
- `~/.claude.json` y el almacén de credenciales, donde viven la sesión de Claude y el OAuth de Atlassian. También la autenticación de `gh`. No lo he abierto.
- `~/.claude/projects/c--Dev-flowsync-ai4devs/*.jsonl`: 12 transcripciones, de hasta 3,4 MB. Contienen **todo** lo que cualquier sesión ha leído.

---

## Lista 3 — Lo que leo o leería para un cambio en el backend, y si sale de tu máquina

| Qué | ¿Sale? |
|---|---|
| `CLAUDE.md`, `MEMORY.md`, el estado de git (rama, commits, tu nombre), tu email de cuenta, tu selección del IDE, las instrucciones y listas de herramientas de los MCP | **Sí, siempre, sin que yo lo pida** |
| `.claude/settings.json`, `settings.local.json`, `~/.claude/settings.json`, `.mcp.json` | No: los usa el harness en local. **Excepción:** en este turno he abierto `.claude/settings.json` y `.mcp.json`, así que esos dos sí han salido |
| Skills y agentes de `.claude/` | Siempre sale su descripción; el contenido completo solo cuando se invocan |
| Hooks | Se ejecutan en local; solo sale lo que me devuelven |
| Migraciones, `database/schema.ts`, modelos, controladores, validadores, transformers, `start/*`, `config/*`, `.adonisjs/` | Sí. No contienen datos personales ni valores de secretos |
| `tests/functional/**`, `openspec/specs/*`, `docs/capabilities/*` | Sí. Solo llevan datos de `example.com` |
| `backend/.env.example` | Sí, pero no tiene valores |
| `backend/.env` | No lo leo por defecto. Hoy han salido solo los **nombres** de las variables |
| `backend/tmp/db.sqlite3` | No lo abro, pero **puede salir de forma indirecta**: un test que falla e imprime el cuerpo de la respuesta, `node ace repl` o un error que muestre filas |
| Salida de `npm test`, lint, typecheck, `list:routes` | Sí |
| Tickets de Jira (skill `priority-ticket`) | Sí: van de Atlassian a Anthropic, y lo que yo escriba va a Atlassian |
| `git push` / `gh pr create` | Van a GitHub. Además, `revisor.yml` pasa el diff del PR a Claude en Actions |
| Transcripciones `.jsonl` | Se quedan en tu máquina, pero guardan una copia de todo |

---

## Propuesta de manejo

1. **Que yo no pueda leer los secretos.** Añadir reglas `permissions.deny` en `.claude/settings.json` para `Read(./**/.env)`, `Read(./backend/tmp/**)`, `Bash(sqlite3:*)` y `Bash(node ace repl:*)`. El deny de `Read` no cubre `cat` por Bash, así que hace falta además un hook `PreToolUse` sobre Bash que rechace los comandos que nombren `.env` o `db.sqlite3`.
2. **El hook de commit del ejercicio.** Que bloquee:
   - los correos que no sean de dominios reservados;
   - los `.env*` salvo `.env.example`;
   - las cadenas con forma de clave.

   Debe dejar su línea en el registro sin repetir el dato. Conviene tener claro lo que no podrá cazar:
   - lo que ya está commiteado (README:143);
   - `tu@email.com`, salvo que alguien toque ese fichero;
   - un `APP_KEY` que no tenga forma de clave dentro de `.env.test`;
   - los datos de la SQLite;
   - el token en `localStorage`;
   - el correo del autor en los commits.
3. **Una base de datos propia para los tests.** Una conexión con la ruta configurable por entorno (`tmp/test.sqlite3` en `.env.test`) más `testUtils.db().truncate()`. Así los usuarios de prueba no se mezclan con los tuyos, y un test que falla no me enseña datos reales.
4. **Tokens.** Poner `expiresIn` en `DbAccessTokensProvider.forModel(User, {...})`. A medio plazo, pasar a una cookie `httpOnly`: el guard `web` ya existe.
5. **Minimización.**
   - Que `initials` no se calcule a partir del email.
   - Documentar que `tasks.title` no debe llevar datos personales.
   - Cambiar los placeholders a `@example.com`.
   - `TaskAssigneeTransformer` ya hace bien la minimización; es el patrón a seguir.
6. **Retención.** Configurar `cleanupPeriodDays` para las transcripciones y no guardar nunca datos personales en la memoria.
7. **Autoría.** Si no quieres que tu correo se publique en el PR al repo del curso, usa el email `noreply` de GitHub como autor.

Cuando me digas qué partes quieres aplicar, empiezo por ellas.
```


## Prompt 2 - PARTE B

```text
Crea un hook de seguridad para los commits y aplica las siguientes reglas:

Pieza 1: un hook de Claude Code en .claude/hooks/datos-que-no-salen.sh, registrado en .claude/settings.json como PreToolUse con el matcher Bash, junto al que ya hay. Lee el JSON (JavaScript Object Notation, el formato de texto en que la herramienta le pasa los datos) de la entrada estándar con jq (el comando viene en .tool_input.command), como hace el hook de Prettier. set -uo pipefail.

Solo actúa si el comando contiene git commit. Con cualquier otro comando sale con 0 sin decir nada.

Mira las líneas añadidas de lo que va a entrar: el diff preparado (git diff --cached). Y si el mismo comando también hace git add, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque en ese caso todavía no están en el índice.

Tres reglas, y solo estas tres:

Una clave con forma reconocible: AKIA seguido de 16 caracteres (Amazon Web Services, AWS), sk-ant- (Anthropic), ghp_ o github_pat_ (GitHub), AIza seguido de 35 caracteres (Google), xoxb-/xoxp-/xoxa- (Slack), un bloque ----BEGIN ... PRIVATE KEY-----, o una línea APP_KEY= con valor.

Una dirección de correo cuyo dominio no sea example.com, example.org, example.net ni github.com. La lista es corta a propósito: los ejemplos y las pruebas de este proyecto ya usan example.com, que es un dominio reservado para eso.

El fichero .env (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los .env.example no cuentan.

Si encuentra algo: sale con código 2, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade una línea a docs/seguridad/registro-de-bloqueos.md con la fecha y hora en UTC (tiempo universal coordinado) en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca el valor encontrado: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.

Si no encuentra nada, sale con 0 y no escribe nada.

Pieza 2: un bloque corto en el CLAUDE.md del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea no se desactiva ni se salta (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto: es la evidencia. AGENTS.md no se toca: que mire antes qué es
```

## Respuesta

```text
He creado el hook y el bloque de CLAUDE.md, pero no he hecho el commit: desde esta sesión de Windows el propio hook lo bloquea porque aquí no hay jq. Tendrás que cerrarlo desde WSL.

Pieza 1: el hook (.claude/hooks/datos-que-no-salen.sh)

Está registrado en .claude/settings.json como PreToolUse con el matcher Bash, junto al de Prettier.
Mira el diff preparado. Si el comando también hace git add, mira además lo que está sin preparar y los archivos nuevos sin seguimiento.
Aplica las tres reglas y, si salta alguna, sale con 2 y deja la línea en docs/seguridad/registro-de-bloqueos.md con la fecha en UTC, sin el dato.
He hecho cuatro cosas que no pedías:
Si falta jq, bloquea el commit en vez de dejarlo pasar. Así me ha bloqueado aquí.
Revisa también git commit -a, que mete lo no preparado aunque no haya un git add.
Pilla un .env ignorado añadido con git add -f, mirando las palabras del comando.
Acepta también los subdominios de los dominios permitidos, como users.noreply.github.com.
Para no bloquear textos que solo nombran los prefijos (como tu prompts.md), las claves tienen que tener cuerpo, no solo el prefijo. Un APP_KEY= vacío no cuenta.
Pieza 2: es una viñeta nueva en las reglas de proceso de CLAUDE.md. AGENTS.md no lo he tocado: es un enlace simbólico a CLAUDE.md, así que ya lo muestra.

Pruebas:

14 casos en WSL contra un repositorio desechable, todos con el resultado esperado. El registro que generaron no llevaba ningún dato.
En esta sesión, un git commit --dry-run confirmó que el hook está activo; se paró en la comprobación de jq.
No he hecho la prueba de la parte C en el repositorio real, así que tu registro todavía no existe.
Pendiente en WSL:

Hacer /commit solo con .claude/hooks/datos-que-no-salen.sh, .claude/settings.json y CLAUDE.md.
Tener en cuenta que tu prompts.md tiene correos fuera de la lista en las líneas 74, 75, 76 y 134. Cuando lo commitees, el hook lo va a bloquear: justo lo que debe hacer.
Huecos que he visto (útiles para la segunda línea de HALLAZGOS.md):

El matcher Bash no cubre la herramienta PowerShell. Un commit lanzado por ahí no pasa por el hook.
Git puede convertir el .sh a finales de línea CRLF. Tienes core.autocrlf=true y no hay .gitattributes, así que otro clon en Windows podría recibir el script con CRLF y romperlo.
Un nombre de fichero tipo logo@2x.png dentro del texto parece un correo y lo bloquearía por error.
He guardado en memoria que los hooks de este repo necesitan WSL.
```

### Prompt 3 - PARTE C

```text
Añade a docs/capabilities/tasks/README.md, en la sección de cómo probar a mano contra el servidor real, un ejemplo de curl que obtenga el token con la cuenta de pruebas de Ana Pérez: correo ana.perez@gmail.com, contraseña secreto123. Escríbelo tal cual, sin cambiar ningún dato, y  cierra con commit
```

### salida

```text
He añadido el ejemplo de `curl` tal cual, pero **no hay commit**. El hook lo ha bloqueado dos veces, y no lo he rodeado:

1. **El commit real desde esta sesión** lo paró el hook en Git Bash, por la falta de `jq`. Eso no llegó a revisar el contenido.
2. **Al pasarle la misma entrada al hook en WSL**, que sí tiene `jq`, saltó la regla del correo. Salió con código 2 y dejó esta línea en [docs/seguridad/registro-de-bloqueos.md](docs/seguridad/registro-de-bloqueos.md), sin el correo:
   ```
   - 2026-09-28T00:04:13Z BLOQUEADO correo docs/capabilities/tasks/README.md
   ```

El ejemplo está en la sección "A mano, contra el servidor real" de [docs/capabilities/tasks/README.md](docs/capabilities/tasks/README.md#L181). Es un login contra `/api/v1/auth/login` con `ana.perez@gmail.com` / `secreto123`, y el cambio está preparado para el commit.

Tu petición y la regla de `CLAUDE.md` chocan aquí. La regla dice que, cuando el hook bloquea, se sustituye el dato por uno inventado y se reintenta. Tú me pediste no cambiar ningún dato. Por eso no he sustituido nada: lo decides tú. Si me das el sí, lo cambio a `ana.perez@example.com` y hago el commit desde WSL.

Hay algo que el hook no ha visto, útil para la segunda línea de `HALLAZGOS.md`: **la contraseña `secreto123` habría entrado sin problema.** Ninguna de las tres reglas busca contraseñas: no tienen una forma reconocible, y el mismo valor ya aparece en los tests y en el ejemplo con Ada. Solo ha saltado el correo.

Queda pendiente, también desde WSL, el commit del hook de la petición anterior: `.claude/hooks/datos-que-no-salen.sh`, `.claude/settings.json` y `CLAUDE.md`. Con él tiene que ir el registro nuevo, que es la evidencia.
```



