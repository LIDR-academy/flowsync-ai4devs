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

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

```
Realiza un inventario de datos personales, secretos y fuentes de contexto de este proyecto.

No modifiques ningún archivo, no crees una rama y no hagas commits.

El inventario debe contener exactamente tres listas:

1. Datos personales:
- Inspecciona las migraciones y enumera las tablas y columnas que almacenan datos de una persona identificable.
- Inspecciona el repositorio y enumera los archivos que contienen ejemplos de nombres o direcciones de correo.
- No supongas columnas ni archivos: incluye la ruta y la evidencia encontrada.

2. Secretos:
- Enumera los archivos que contienen o pueden contener claves, tokens o contraseñas, aunque estén ignorados por Git o no estén versionados.
- Distingue entre secretos reales, valores de ejemplo y archivos potencialmente sensibles.

3. Contexto que utilizas para trabajar:
- Enumera lo que has leído o leerías por defecto para realizar un cambio en el backend.
- Incluye, como mínimo, el archivo de instrucciones del repositorio, la configuración del harness, los archivos de entorno y la base de datos local.
- Para cada elemento indica:
  a) si puedes acceder a él;
  b) si lo has leído en esta sesión;
  c) si su contenido sale de mi máquina cuando trabajas conmigo;
  d) bajo qué condición saldría.

Basa todas las conclusiones en archivos reales del proyecto. Si algo no se puede comprobar, indícalo explícitamente como no comprobado.

Entrega únicamente el inventario. No cambies ningún archivo.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.



## Prompt 2

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

```
Implementa el hook de Claude Code `datos-que-no-salen`.

Antes de modificar archivos, inspecciona `CLAUDE.md`, `.claude/settings.json` y el hook existente de Prettier para conservar la estructura actual.

Debes construir estas dos piezas:

PIEZA 1: HOOK

Crea `.claude/hooks/datos-que-no-salen.sh` y regístralo en `.claude/settings.json` como `PreToolUse`, con matcher `Bash`, junto al hook existente. No elimines ni reemplaces la configuración actual.

El script debe:

- Usar `set -uo pipefail`.
- Leer desde stdin el JSON recibido por Claude Code.
- Obtener el comando de `.tool_input.command` utilizando `jq`.
- Actuar únicamente cuando el comando contenga `git commit`.
- Ante cualquier otro comando, finalizar con código 0, sin imprimir ni registrar nada.
- Examinar solamente las líneas añadidas del contenido preparado mediante `git diff --cached`.
- Si el mismo comando contiene también `git add`, examinar además los cambios sin preparar y los archivos nuevos sin seguimiento.

Debe comprobar solamente estas tres reglas:

1. Secretos con alguno de estos formatos:
   - `AKIA` seguido de 16 caracteres.
   - `sk-ant-`.
   - `ghp_`.
   - `github_pat_`.
   - `AIza` seguido de 35 caracteres.
   - `xoxb-`, `xoxp-` o `xoxa-`.
   - Un bloque `-----BEGIN ... PRIVATE KEY-----`.
   - Una línea `APP_KEY=` con algún valor.

2. Una dirección de correo cuyo dominio no sea:
   - `example.com`
   - `example.org`
   - `example.net`
   - `github.com`

3. Un archivo cuyo nombre exacto sea `.env`, en cualquier carpeta.
   Los archivos `.env.example` no deben bloquearse.

Si encuentra algo:

- Finaliza con código 2.
- Escribe en stderr la regla activada, el archivo y que se sustituya el dato por uno inventado.
- Nunca imprime el valor encontrado.
- Añade una línea a `docs/seguridad/registro-de-bloqueos.md`.
- La línea debe contener fecha y hora UTC en ISO 8601, la palabra `BLOQUEADO`, la regla y el archivo.
- Nunca debe registrar el valor encontrado.
- Si el registro no existe, lo crea con una cabecera de una línea.

Si no encuentra nada:

- Finaliza con código 0.
- No imprime ni registra nada.

PIEZA 2: REGLA DEL PROYECTO

Añade un bloque corto en la sección de reglas de proceso de `CLAUDE.md` que indique:

- Que existe el hook `datos-que-no-salen`.
- Que bloquea secretos reconocibles, correos fuera de los dominios permitidos y archivos `.env`.
- Que el hook no debe desactivarse ni saltarse.
- Que, ante un bloqueo, se debe sustituir el dato por uno inventado y volver a intentarlo.
- Que `docs/seguridad/registro-de-bloqueos.md` se incluye en el commit como evidencia.

No modifiques `AGENTS.md`.

PRUEBA

- Valida la sintaxis del script.
- Comprueba que un comando distinto de `git commit` termine con 0, sin salida y sin modificar el registro.
- Crea temporalmente un archivo con un correo de `gmail.com`.
- Ejecuta `git add` e intenta realizar un commit para comprobar el hook.
- El intento debe ser bloqueado con código 2.
- Comprueba que el registro contenga fecha, regla y archivo, pero no el correo.
- Elimina después el archivo temporal.
- Conserva la línea generada en el registro como evidencia.
- Al finalizar, muestra los archivos modificados y el resultado de cada prueba.

No leas el contenido de ningún archivo `.env`.
No crees otra rama.
No hagas el commit definitivo todavía.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.



## Prompt 3

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

```
Revisa y corrige la implementación actual del hook `datos-que-no-salen`.

Contexto comprobado:

- `.claude/hooks/datos-que-no-salen.sh` tiene sintaxis Bash válida.
- Está registrado correctamente en `.claude/settings.json` como hook `PreToolUse` con matcher `Bash`.
- La configuración lo ejecuta mediante `bash`, por lo que sus permisos actuales 664 no necesitan modificarse.
- El hook detecta el correo no permitido y escribe correctamente en `docs/seguridad/registro-de-bloqueos.md`.
- El registro no contiene el valor del correo detectado.
- Sin embargo, después de escribir el mensaje de bloqueo en stderr, el script no ejecuta explícitamente `exit 2`.
- Por este motivo puede mostrar la palabra `BLOQUEADO` y registrar el hallazgo, pero terminar con código 0 y permitir el comando.

Realiza únicamente esta corrección:

1. Añade `exit 2` inmediatamente después del bloque final que escribe el mensaje de bloqueo en stderr.
2. No modifiques las expresiones regulares ni las tres reglas del hook.
3. No modifiques `.claude/settings.json`.
4. No modifiques `CLAUDE.md`.
5. No modifiques el formato de `docs/seguridad/registro-de-bloqueos.md`.
6. No cambies los permisos del script: se ejecuta explícitamente mediante Bash.
7. No leas el contenido de ningún archivo `.env`.
8. No crees otra rama.
9. No hagas el commit definitivo.

Después de corregirlo, ejecuta estas comprobaciones:

A. Sintaxis:
- Ejecuta `bash -n .claude/hooks/datos-que-no-salen.sh`.
- Debe terminar con código 0.

B. Comando no relacionado:
- Simula una entrada del hook cuyo comando sea `git status`.
- Debe terminar con código 0.
- No debe imprimir nada.
- No debe añadir una línea al registro.

C. Bloqueo:
- Crea un archivo temporal llamado `prueba-hook-temporal.txt` con una dirección de correo ficticia del dominio `gmail.com`.
- Prepara el archivo para Git.
- Intenta realizar un commit a través de Claude Code.
- El hook debe mostrar la regla y el nombre del archivo, pero nunca el correo.
- El hook debe terminar con código 2.
- El commit no debe crearse.
- El registro debe añadir una línea con fecha UTC en ISO 8601, la palabra `BLOQUEADO`, la regla y el archivo, sin incluir el correo.

D. Limpieza:
- Retira el archivo temporal del área de staging.
- Elimina el archivo temporal.
- Conserva en `docs/seguridad/registro-de-bloqueos.md` la línea generada como evidencia.
- No elimines las líneas de evidencia anteriores.

Al finalizar, informa:

- Qué línea cambiaste.
- El código de salida de cada prueba.
- Si llegó a crearse algún commit.
- Qué archivos quedaron modificados.
- La última línea del registro, comprobando que no contiene el correo.
```

**Resultado:** El agente añadió el `exit 2` faltante y volvió a probar el bloqueo.



## Prompt 4

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

```
Añade a `docs/capabilities/tasks/README.md`, en la sección de cómo probar manualmente contra el servidor real, un ejemplo de `curl` que obtenga el token utilizando la cuenta de pruebas de Ana Pérez.

Utiliza exactamente estos datos, sin sustituirlos:

- Correo: ana.perez@gmail.com
- Contraseña: secreto123

Escribe el ejemplo tal cual y cierra el cambio con un commit.

```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.


## Prompt 5

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

```
Continúa con la opción 1 recomendada.

Sustituye únicamente el correo `ana.perez@gmail.com` por `ana.perez@example.com` en `docs/capabilities/tasks/README.md`.

Mantén la contraseña y el resto del ejemplo sin cambios.

No desactives, modifiques ni evites el hook.

Después:

1. Incluye `docs/seguridad/registro-de-bloqueos.md` como evidencia.
2. Prepara los cambios correspondientes a esta unidad de trabajo.
3. Comprueba el diff preparado.
4. Realiza el commit.
5. Confirma que el nuevo intento no genera otro bloqueo.
6. Informa el hash y el mensaje del commit, junto con los archivos incluidos.

```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.



## Prompt 6

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code

```
La evidencia específica de la Parte C no quedó conservada en `docs/seguridad/registro-de-bloqueos.md`.

Repite controladamente la comprobación del hook:

1. Cambia temporalmente en `docs/capabilities/tasks/README.md` el correo permitido `ana.perez@example.com` por el mismo correo de gmail.com utilizado en la prueba anterior.
2. Prepara únicamente el README e intenta un commit.
3. Confirma que el hook lo bloquea con código 2.
4. Verifica que se añade al registro una línea nueva correspondiente a `docs/capabilities/tasks/README.md`, sin incluir el correo.
5. Restaura inmediatamente el README a `ana.perez@example.com`.
6. Retira cualquier cambio temporal del área de staging.
7. Conserva la nueva línea del registro.
8. No modifiques el hook, `.claude/settings.json` ni `CLAUDE.md`.
9. No hagas todavía otro commit.

Al finalizar muestra:
- La nueva línea del registro.
- Que el README contiene `ana.perez@example.com`.
- Que el README no contiene ningún correo de gmail.com.
- El estado de Git.

```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.
