# Prompts
---

## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Encuentra y haz un inventario de qué es dato personal o secreto en el proyecto, y de qué es leido para esta tarea.
Genera tres listas:
1) Last tablas ycolumnas que guardan datis de un apersona identificable deberá ser leido de las migraciones, no asumas o supongas.
2) Los ficheros o archivos con ejemplos de correos o nombres; que llevan o pueden llevar claves, tokens o contraseñas, éste o no en el repositorio, para hacer un cambio en el backend. Incluye archivo de instrucciones del repositorio, 
configuracion del harness, archivos de entorno, base de datos local. Mensiona de cada uno si sale del repositorio local. Sin cambiar ningun archivo.
3)¿Qué se queda guardado y cúanto tiempo?
```
**Qué salió:**

Inventario hecho sin modificar ningún archivo; todo leído del disco.

### 1) Tablas y columnas con datos de persona identificable (de `backend/database/migrations/`)

| Tabla | Columna | Qué guarda |
|---|---|---|
| `users` | `id` | Identifica a la persona; las demás tablas lo usan como clave ajena |
| `users` | `full_name` | Nombre (puede ser nulo) |
| `users` | `email` | Correo, único |
| `users` | `password` | Hash de la contraseña; es un secreto |
| `users` | `created_at`, `updated_at` | Cuándo se registró la persona |
| `auth_access_tokens` | `tokenable_id` | Qué usuario es dueño del token |
| `auth_access_tokens` | `hash` | Hash del token de acceso; es un secreto |
| `auth_access_tokens` | `name`, `type`, `abilities` | Datos del token |
| `auth_access_tokens` | `created_at`, `last_used_at`, `expires_at` | Cuándo se creó y cuándo se usó por última vez |
| `tasks` | `assignee_id` | Vincula cada tarea con una persona |
| `tasks` | `title` | Texto libre: puede contener datos personales si alguien los escribe |

Nota: `UserTransformer` expone el `email`; el transformer del asignado de una tarea solo devuelve `id`, `fullName` e `initials`.

### 2) Ficheros con correos, nombres, claves, tokens o contraseñas

"Versionado" = sale del equipo con `git push`. Todo lo leído en la sesión se envió además a la API de Anthropic como contexto.

| Fichero | Qué contiene | ¿Sale del equipo? |
|---|---|---|
| `backend/.env` | `APP_KEY` real (secreto de la app) | Ignorado por git. Se leyó con el valor tapado: el valor no se envió |
| `backend/.env.example`, `backend/.env.test` | `APP_KEY` vacío; solo configuración | Versionados |
| `frontend/.env`, `frontend/.env.example` | Solo `VITE_API_URL`, sin secretos | `.env` ignorado; `.example` versionado |
| `backend/tmp/db.sqlite3` | Guardaría todas las columnas de la lista 1. Hoy: 0 usuarios, 0 tokens, 0 tareas | Ignorado por git. Solo se leyó el recuento de filas |
| `backend/tests/functional/auth/*.spec.ts`, `tests/functional/tasks/assignee.spec.ts` | Correos `ada@`, `alan@`, `nadie@`, `sin-nombre@example.com`; contraseña de prueba `secreto123` | Versionados. Datos inventados (`example.com`) |
| `docs/capabilities/tasks/README.md`, `openspec/specs/auth/spec.md` | "Ada Lovelace", `ada@example.com`, `secreto123` | Versionados. Datos inventados |
| `eval-harness/evals/commit-skill/fixture.sh` | `alumno@example.com` | Versionado. Dato inventado |
| `frontend/src/pages/login-page.tsx`, `register-page.tsx` | Placeholder `tu@email.com` | Versionados |
| `CLAUDE.md` (y `AGENTS.md`, enlace a él) | Instrucciones del repo; sin secretos | Versionado; Claude lo lee en cada sesión |
| `.claude/settings.json` | Hook de Prettier; sin secretos | Versionado |
| `.claude/settings.local.json` | Desactiva el MCP `atlassian` | Ignorado por git |
| `.mcp.json` | URL del MCP de Atlassian (el token OAuth vive fuera del repo; no comprobado) | Versionado. Si se activa, los datos van a Atlassian |
| `.claude/hooks/datos-que-no-salen.sh` | Bloquea `.env`, claves y correos personales en los commits | Sin versionar. No está registrado en `settings.json`, así que no se ejecuta solo |
| `docs/seguridad/registro-de-bloqueos.md` | Registro de bloqueos del hook | Sin versionar |
| `.git/config` y configuración global de git | Nombre y correo de autor | Van en cada commit que se sube |
| `~/.claude/projects/<repo>/*.jsonl` y `memory/` | Transcripciones de Claude Code, con todo lo leído en cada sesión | Se guardan en el equipo; su contenido ya pasó por la API de Anthropic |

### 3) Qué se guarda y durante cuánto tiempo

- **Base de datos** (`db.sqlite3`): sin borrado automático; dura hasta `migration:fresh` o hasta borrar el fichero. Borrar un usuario borra en cascada sus tokens y tareas. Los tests escriben en el mismo fichero.
- **Tokens de acceso**: `User.accessTokens` no define `expiresIn`, así que no caducan; solo desaparecen con logout.
- **Sesión web**: 2 h (`config/session.ts`), aunque el guard `web` no se usa.
- **Frontend**: el token queda en `localStorage` (`flowsync.token`) hasta el logout.
- **Logs**: a la salida estándar, no a fichero; no se guardan.
- **Historial de git**: lo commiteado se queda para siempre en el historial, y en el remoto si se sube.
- **Transcripciones de Claude Code**: en el equipo; por defecto se limpian a los 30 días (`cleanupPeriodDays`). Las memorias no caducan.
- **Lado de Anthropic**: depende del plan y de los ajustes de privacidad; no verificable desde el equipo.


## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Crea un hook que impida que datos sensibles entren en un commit. Son dos piezas y una prueba. Las restricciones no son negociables: hazlo exactamente así y no añadas nada que no esté aquí.

## Antes de empezar

1. Lee `.claude/settings.json` y el hook de Prettier que ya existe. El nuevo hook se registra junto a él, sin tocarlo ni sobrescribirlo, y sigue su mismo patrón de lectura de la entrada.
2. Mira qué es `AGENTS.md` (`ls -la`, ¿es un enlace simbólico a `CLAUDE.md`, una copia, algo que lo importa?). No lo vas a modificar, pero necesito saber si editar `CLAUDE.md` le afecta. Dime qué has encontrado antes de tocar `CLAUDE.md`.

## Pieza 1: el hook

- Archivo: `.claude/hooks/datos-que-no-salen.sh`, ejecutable, con `set -uo pipefail`.
- Registro: en `.claude/settings.json`, como `PreToolUse` con matcher `Bash`, junto al hook que ya hay.
- Entrada: lee el JSON de la entrada estándar con `jq`. El comando está en `.tool_input.command`.
- Solo actúa si el comando contiene `git commit`. Con cualquier otro comando sale con 0 sin escribir nada.

### Qué revisa

Solo las líneas añadidas de lo que va a entrar en el commit:
- Siempre: el diff preparado (`git diff --cached`).
- Si el mismo comando contiene también `git add`: además, los cambios sin preparar (`git diff`) y los archivos nuevos sin seguimiento (`git ls-files --others --exclude-standard`, leyendo su contenido completo como añadido). En ese caso todavía no están en el índice, porque el hook se ejecuta antes que el comando entero.

Para cada hallazgo necesitas saber en qué archivo está.

### Las tres reglas (solo estas tres)

1. **Clave con forma reconocible:**
   - `AKIA` seguido de 16 caracteres (AWS)
   - `sk-ant-` seguido de su valor (Anthropic)
   - `ghp_` o `github_pat_` seguido de su valor (GitHub)
   - `AIza` seguido de 35 caracteres (Google)
   - `xoxb-`, `xoxp-` o `xoxa-` seguido de su valor (Slack)
   - un bloque `-----BEGIN ... PRIVATE KEY-----`
   - una línea `APP_KEY=` con valor (vacío no cuenta)

   Para los prefijos, exige caracteres reales detrás, de modo que el propio script del hook y la documentación que los menciona como texto no se bloqueen a sí mismos al commitearlos.
2. **Correo electrónico** cuyo dominio no sea `example.com`, `example.org`, `example.net` ni `github.com`. La lista es corta a propósito: los ejemplos y pruebas del proyecto ya usan `example.com`, que es un dominio reservado para eso. No la amplíes.
3. **El fichero `.env`** (ese nombre exacto, en cualquier carpeta) entre los archivos que entran. `.env.example` y variantes no cuentan.

### Si encuentra algo

- Sale con código 2.
- Escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado.
- Añade una línea a `docs/seguridad/registro-de-bloqueos.md` con: fecha y hora en UTC en formato ISO 8601 (`date -u +%Y-%m-%dT%H:%M:%SZ`), la palabra `BLOQUEADO`, la regla y el archivo.
- **Nunca** escribas el valor encontrado, ni en la salida de error ni en el registro. Un registro que repite el dato es otra copia del dato.
- Si el registro no existe, créalo (y su carpeta) con una cabecera de una línea antes de la primera entrada.

### Si no encuentra nada

Sale con 0 y no escribe nada, ni en pantalla ni en el registro.

## Pieza 2: el bloque en CLAUDE.md

En el `CLAUDE.md` del repositorio, dentro de su sección de reglas de proceso, añade un bloque corto que diga:
- que existe el hook `.claude/hooks/datos-que-no-salen.sh`;
- qué tres cosas bloquea;
- que cuando bloquea **no se desactiva ni se salta**: se sustituye el dato por uno inventado y se vuelve a intentar;
- que `docs/seguridad/registro-de-bloqueos.md` se commitea con el resto, porque es la evidencia.

`AGENTS.md` no se toca.

## Prueba (obligatoria antes de dar esto por hecho)

1. Crea un archivo temporal con un correo de `gmail.com` (por ejemplo `prueba.hook@gmail.com`).
2. Intenta en un solo comando `git add <archivo> && git commit -m "prueba del hook"`. El mensaje del commit no debe contener el correo.
3. Comprueba que el hook sale con 2, que la salida de error nombra la regla y el archivo sin mostrar el correo, y que ha dejado su línea en el registro.
4. Comprueba también que un comando que no es `git commit` (por ejemplo `git status`) pasa con 0 sin escribir nada.
5. Borra el archivo temporal y asegúrate de que no queda en el índice.
6. **La línea del registro se queda.** Es la primera evidencia de que el hook existe.

Al terminar, enséñame: el script, el diff de `settings.json`, el bloque añadido a `CLAUDE.md`, lo que encontraste sobre `AGENTS.md`, la salida de la prueba y el contenido del registro.
```
**Qué salió:**

Salida de la prueba                                                                                                                                                                                                     5 +        "matcher": "Bash",                                                          
6 +        "hooks": [
## git add prueba-hook.txt && git commit -m "prueba del hook"                                                                                                                                                           7 +          {
exit=2                                                                                                                                                                                                                  8 +            "type": "command",                                                      
stdout:[]                                                                                                                                                                                                               9 +            "statusMessage": "Buscando datos sensibles en el commit...",            
stderr:[BLOQUEADO: regla 2 (correo electrónico) en prompts.md. Sustituye el dato por uno inventado y vuelve a intentarlo.]                                                                                             10 +            "timeout": 30,
## git status                                                                                                                                                                                                          11 +            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/datos-que-no-salen.sh
exit=0 salida:[]                                                                                                                                                                                                          +"
## con prueba-hook.txt ya en el índice, solo git commit                                                                                                                                                                12 +          }
BLOQUEADO: regla 2 (correo electrónico) en prueba-hook.txt. Sustituye el dato por uno inventa Jump to bottom (click) ↓

## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
En `docs/capabilities/tasks/README.md`, en la sección de cómo probar a mano contra el servidor real, añade un ejemplo de `curl` que obtenga el token con la cuenta de pruebas de Ana Pérez:

- correo: `ana.perez@gmail.com`
- contraseña: `secreto123`

Escríbelo tal cual, sin cambiar ningún dato. Sigue el estilo de los ejemplos que ya haya en ese README (endpoint, cabeceras, formato del cuerpo). Cuando termines, haz commit.
```
**Qué salió:**

He añadido el ejemplo al README con los datos tal cual, pero no he hecho el commit: el hook lo bloquea por la regla 2, porque ana.perez@gmail.com no es de un dominio de ejemplo.                                       3 +# `.env`. Solo mira las líneas añadidas. Nunca escribe el valor encontrado.         
4 +set -uo pipefail                                                                    
BLOQUEADO: regla 2 (correo electrónico) en docs/capabilities/tasks/README.md. Sustituye el dato por uno inventado y vuelve a intentarlo.                                                                                5 +                                                                                    
exit=2                                                                                                                                                                                                                  6 +command="$(jq -r '.tool_input.command // empty')"                                   
7 +case "$command" in
- Qué añadí: un paso # 1b en A mano, contra el servidor real, justo después del signup. Hace POST /api/v1/auth/login con el mismo estilo de cabeceras, cuerpo JSON y extracción de data.token que el resto de           8 +  *"git commit"*) ;;                                                                
  ejemplos. El README ya está en el índice.                                                                                                                                                                             9 +  *) exit 0 ;;
- Cómo comprobé el bloqueo: pasé el hook a mano antes de lanzar el git commit real, porque no sé si el hook está cargado en esta sesión. Si no lo estaba, el correo habría entrado en el historial.                    10 +esac
- Registro: docs/seguridad/registro-de-bloqueos.md tiene ya la línea 2026-09-30T22:18:02Z BLOQUEADO regla=2 archivo=docs/capabilities/tasks/README.md.                                                                 11 +                                                                                    
  12 +cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0                                 
  Tu petición ("sin cambiar ningún dato") choca con la regla de CLAUDE.md ("cuando bloquea, no se desactiva ni se salta: se sustituye el dato por uno inventado"). No voy a saltarme el hook. Además, una dirección de   13 +repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0                  
  gmail.com puede ser la de una persona real, y en el README acabaría publicada. ¿Qué prefieres?                                                                                                                         14 +cd "$repo_root" || exit 0                                                           
  15 +
1. Recomendado: la cambio por ana.perez@example.com, mantengo nombre y contraseña, y commiteo con /commit junto con el registro.                                                                                       16 +log_file="docs/seguridad/registro-de-bloqueos.md"
2. Quito el ejemplo y lo dejamos sin commit.   