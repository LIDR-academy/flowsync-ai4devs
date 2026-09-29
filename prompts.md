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

**Modelo:** Sonnet 5 (high effort)
**Herramienta:** Claude Code

```
Elabora un inventario con tres listas, leyendo el repo (migraciones, no suposiciones):

1. Datos personales identificables: tablas y columnas que guardan datos personales, citando la migración, y ficheros con ejemplos de correos o nombres.
2. Secretos y credenciales: ficheros que contienen o podrían contener claves, tokens o contraseñas, estén o no comiteados.
3. Lectura del agente: qué lee por defecto para un cambio en el backend (CLAUDE.md, harness, .env, base de datos local) y, para cada uno, si ese contenido sale de mi máquina al hablar con el proveedor de IA.

Responde en español. No crees ni edites archivo.

```

**Qué salió:** inventario en el chat, sin tocar archivos.

## Prompt 2
**Modelo:** Sonnet 5 (high effort)
**Herramienta:** Claude Code

```
Estás en la rama bloqueo-afc: quédate en ella. No crees otra rama. No toques AGENTS.md. No modifiques nada que no sea el hook, su registro en settings, CLAUDE.md y el registro de bloqueos.

Pieza 1. Crea .claude/hooks/datos-que-no-salen.sh y regístralo en .claude/settings.json como PreToolUse con matcher Bash, junto al hook de Prettier que ya existe. El script empieza con set -uo pipefail. Lee el JSON de la entrada estándar con jq; el comando está en .tool_input.command.

Solo actúa si el comando contiene git commit. Con cualquier otro comando sale con código 0 y no escribe nada.

Inspecciona las líneas añadidas del diff preparado (git diff --cached). Si el mismo comando también hace git add, inspecciona además los cambios sin preparar y los archivos nuevos sin seguimiento.

Tres reglas, y solo estas tres:
1. Clave con forma reconocible: AKIA seguido de 16 caracteres, sk-ant-, ghp_ o github_pat_, AIza seguido de 35 caracteres, xoxb- o xoxp- o xoxa-, un bloque -----BEGIN ... PRIVATE KEY-----, o una línea APP_KEY= con valor.
2. Una dirección de correo cuyo dominio no sea example.com, example.org, example.net ni github.com.
3. Un fichero llamado exactamente .env, en cualquier carpeta. Los .env.example no cuentan.

Si encuentra algo: sale con código 2, escribe por stderr qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Añade una línea a docs/seguridad/registro-de-bloqueos.md con la fecha y hora en UTC en ISO 8601, la palabra BLOQUEADO, la regla y el archivo. Nunca escribas el valor encontrado. Si el registro no existe, créalo con una cabecera de una línea.
Si no encuentra nada: sale con código 0 y no escribe nada.

Pieza 2. En la sección Reglas de proceso de CLAUDE.md, un bloque corto: que el hook existe, qué tres cosas bloquea, que cuando bloquea no se desactiva ni se salta (se sustituye el dato por uno inventado y se reintenta), y que el registro se commitea con el resto porque es la evidencia.

Prueba antes de darlo por hecho: crea un archivo temporal con un correo @gmail.com, haz git add e intenta git commit. Tiene que salir con código 2 y dejar su línea en el registro. Borra el archivo temporal. La línea del registro se queda. No incluyas en el commit el archivo temporal ni cambios ajenos (package-lock, .adonisjs, schema.ts).

```

**Qué salió:** commit ae0266f; la prueba dejó la línea de las 11:23:02Z y el archivo temporal no entró.

## Prompt 3
**Modelo:** Sonnet 5 (high effort)
**Herramienta:** Claude Code

```
Sigue en la rama bloqueo-afc. No crees otra rama.

En docs/capabilities/tasks/README.md, en la sección "A mano, contra el servidor real", añade un ejemplo de curl para obtener un token con la cuenta de pruebas de Ana Pérez. Usa estos datos literales, sin cambiar ni uno:

correo: ana.perez@gmail.com
contraseña: secreto123

Ciérralo con un commit. No sustituyas el correo por uno de example.com ni por otro dominio. El dato tiene que entrar tal cual

```

**Qué salió:** el agente cambió el correo a un dominio de ejemplo antes de commitear (015b445). El hook salió en silencio porque el diff ya iba limpio.

## Prompt 4

**Modelo:** Sonnet 5 (high effort)
**Herramienta:** Claude Code

```
Insisto: escribe el curl con ana.perez@gmail.com y secreto123 tal cual, haz git add y git commit. No cambies el correo antes de intentar el commit. Quiero ver el bloqueo del hook.
```

**Qué salió:** el hook bloqueó el commit (código 2) y dejó la línea de las 11:35:04Z. El README se quedó con el dominio de ejemplo.

## Prompt 5

**Modelo:** Sonnet 5 (high effort)
**Herramienta:** Claude Code
```
 commitea el registro con esa línea de evidencia
```
**Qué salió:** commit 9684896 en bloqueo-afc. El asunto del commit se llevó el correo de la prueba; el hook no mira el texto de -m.