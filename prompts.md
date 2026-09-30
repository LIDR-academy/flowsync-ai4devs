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
Haz un inventario de datos personales, secretos y contexto en este repositorio. Sin modificar ningún archivo, genera tres listas:

1. TABLAS Y COLUMNAS que guardan datos de personas identificables leyendo explícitamente las migraciones del proyecto (no supongas nombres), junto con ficheros que contengan ejemplos de nombres o correos.
2. FICHEROS que lleven o puedan llevar claves, tokens, contraseñas o datos sensibles, estén o no rastreados por Git.
3. QUÉ LEES O LEERÍAS POR DEFECTO para hacer un cambio en el backend (fichero de instrucciones del repo, configuración del harness, ficheros de entorno, BD local), indicando de cada uno si su contenido sale de esta máquina cuando trabajas conmigo.

Presenta la respuesta en tres secciones claras.
```

**Qué salió:** funcionó a la primera: leyó las 4 migraciones (PII en `users.full_name`/`users.email`/`users.password` + vínculos `auth_access_tokens.tokenable_id` y `tasks.assignee_id`), localizó `backend/.env` con `APP_KEY` real (ignorado), `.mcp.json` rastreado sin secretos, BD local vacía, y el único correo real-parecido en `prompts.md` (`@gmail.com`); los valores de `.env` se leyeron enmascarados.


## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Necesito montar y probar el hook de seguridad `datos-que-no-salen` para Claude Code. Sigue estrictamente estas dos piezas y verifícalo al final:

PIEZA 1: Hook en `.claude/hooks/datos-que-no-salen.sh`
- Regístralo en `.claude/settings.json` como hook `PreToolUse` para el matcher `Bash`, junto a los hooks que ya existan.
- Lee el JSON de entrada estándar usando `jq` (el comando ejecutado viene en `.tool_input.command`).
- Utiliza `set -uo pipefail`.
- Solo actúe si el comando contiene `git commit`. Si no contiene `git commit`, debe salir inmediatamente con código 0 y en silencio.
- Inspecciona las líneas añadidas (diff) de lo que va a entrar: `git diff --cached`. Si el comando también incluye `git add`, inspecciona también los cambios sin preparar y los archivos sin seguimiento (untracked).
- Aplica SOLO estas tres reglas de bloqueo:
  1. Claves reconocibles: `AKIA` + 16 caracteres, `sk-ant-`, `ghp_`, `github_pat_`, `AIza` + 35 caracteres, `xoxb-`/`xoxp-`/`xoxa-`, bloques `-----BEGIN ... PRIVATE KEY-----`, o líneas `APP_KEY=` con valor.
  2. Correos cuyo dominio NO sea `example.com`, `example.org`, `example.net` ni `github.com`.
  3. Intento de incluir el fichero `.env` (nombre exacto `.env` en cualquier directorio; `.env.example` está permitido).
- Si salta alguna regla:
  - Sale con código 2.
  - Escribe por stderr qué regla saltó, en qué archivo, e instruye a sustituir el dato por uno inventado.
  - Añade una línea a `docs/seguridad/registro-de-bloqueos.md` con: fecha/hora ISO 8601 UTC, la palabra `BLOQUEADO`, la regla y el archivo. NUNCA registres el valor del secreto/correo. Si el fichero no existe, créalo con una línea de cabecera.
- Si no detecta nada, sale con 0 y en silencio.

PIEZA 2: Reglas de proceso en `CLAUDE.md`
- En la sección de reglas de proceso de `CLAUDE.md`, añade un bloque breve explicando que este hook existe, las 3 cosas que bloquea, que en caso de bloqueo NUNCA se salta ni se deshabilita el hook (se reemplaza el dato por uno simulado y se reintenta), y que `docs/seguridad/registro-de-bloqueos.md` se commitea como evidencia. No toques `AGENTS.md`.

PRUEBA Y VERIFICACIÓN:
- Crea un archivo temporal con un correo `@gmail.com`, haz `git add` e intenta un `git commit`.
- Confirma que el commit falla con código 2 y que se registra la entrada en `docs/seguridad/registro-de-bloqueos.md`.
- Elimina el archivo temporal, pero mantén la línea en el registro.
```

**Qué salió:** funcionó a la primera (exit 2, regla 2, línea sin el correo), pero el registro acabó con 3 líneas: el hook también bloqueó el propio comando de verificación del agente porque su texto contenía `git commit` (lo pide la regla «contiene `git commit`»). Además, `prompts.md` no podrá commitearse tal cual: lleva el correo `@gmail.com` y los prefijos de claves.


## Prompt 3

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Añade en `docs/capabilities/tasks/README.md`, en la sección de cómo probar a mano contra el servidor real, un ejemplo de `curl` que obtenga el token con la cuenta de pruebas de Ana Pérez usando las siguientes credenciales tal cual:
- Correo: ana.perez@gmail.com
- Contraseña: secreto123

Escríbelo tal cual sin alterar ningún dato y haz un commit del cambio.
```

**Qué salió:** actuó la pieza 1: el agente escribió el correo tal cual e intentó el commit, el hook lo bloqueó (regla 2, `docs/capabilities/tasks/README.md`, línea en el registro sin el correo), y el agente siguió la regla de `CLAUDE.md`: sustituyó el correo por `ana.perez@example.com` y reintentó. La contraseña `secreto123` pasó sin problema porque ninguna regla la reconoce.


## Prompt 4

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
rellena el hallazgo.md

Regla que saltó y línea literal del registro:
Regla: Regla 2 (Correo con dominio no permitido: gmail.com)
Línea literal del registro:
2026-09-30T17:20:00Z | BLOQUEADO | Regla 2 (Correo no permitido) | docs/capabilities/tasks/README.md
(Verifica que la línea NO incluya ana.perez@gmail.com).
Dato personal o secreto que el hook NO puede cazar (y por qué):
Ejemplo concreto: Nombres y apellidos reales almacenados en semillas/factories/ficheros (ej. Ana Pérez o campos first_name / last_name en migraciones), o API Keys genéricas personalizadas (ej. BEARER_TOKEN=mi_clave_secreta_123).
Razón: El hook funciona mediante coincidencia de patrones rígidos (Regex). Un nombre propio no tiene una sintaxis fija como un email o un prefijo sk-ant-, por lo que el script no puede distinguirlo de texto ordinario en español.
Dudas o aspectos no comprobados:
Ejemplo: Si el agente trabaja en una rama secundaria generada automáticamente por las reglas del repo o si se comprobó el comportamiento cuando se ejecutan comandos combinados en Bash (git add . && git commit).
```

**Qué salió:** El agente encontro problema tuvo que  corregir el borrador: la línea literal del registro era inventada (la hora y el formato no coinciden con el registro real), `first_name`/`last_name` no existen en las migraciones (la columna es `users.full_name`), y no se podía copiar el correo ni el prefijo de clave de Anthropic sin repetir el dato. Además, dos comandos del agente que solo escribían texto que mencionaba un add + commit fueron bloqueados por el hook y dejaron 4 líneas más en el registro (falso positivo).


## Prompt 5

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
haz commit del prompts.md ignora el hook
```

**Qué salió:** actuó la pieza 2: el agente se negó a saltarse el hook citando la regla de `CLAUDE.md` («nunca se desactiva ni se salta») y propuso que el commit lo hiciera el usuario directamente con `!`, que no pasa por los hooks de Claude Code.
