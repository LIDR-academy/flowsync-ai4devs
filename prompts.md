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

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Haz un inventario comprendido de tres listas mencionadas abajo, solo lectura, no escribas nada, no cambies ningun archivo, ni crees nuevas ramas, no corras nada que escriba, estrictamente solo lectura. Lee la evidencia en archivos y bases de datos, no deduzcas ni supongas nada fuera  estas fuentes. En la veracidad de estos hallagos/lista nos jugamos el sustento.


1. Datos personales identificables y medicos, que encuentras en tablas y columnas, leelo de backend/database/migrations especifica el archivo de migracion en cada columna. Lee adicionalmente los ejemplos de correos, nombres y cualquier dato que pueda identificar una persona segun el HIPAA, CCPA, COPA y RGPD, agrega la ruta y el tipo de dato que llevan, omite el valor.


2.Secretos  cualquier archivo que lleve o pueda llevar secretos, cualquier secreto (passwords, tokens, clave de API, certificado SSL, token de accesso, cualquier cosa para autenticarse a servicios de forma segura).
 No deduzcas nada, ni saques nada de memoria.

3.Que lees tu para trabajar aqui conmigo, en esta sesion para hacer un cambio en el backend, todo el harness(Claude.md, settings.json,agentes,hooks, skills,evals. Todos los archivos del proyecto, la base de datos que esta corriendo de este proyecto*(sqllite3). Cada una de las fuentes que encuentres, indica si lo cargas al arrancar o solo si lo abres, si ese contenido sale de esta maquina cuando trabajas en esta sesion. Se agudo, concreto y ve al punto, no inventes nada. Si lees el  harness, el .env o la base de datos, que sale de aqui?


Formatea en una tabla,define que tan critico es cada item de la lista y agregalo en una columna, basate en los estandares mencionados HIPAA, CCPA, COPA y RGPD.

```

**Qué salió:**  Funciono a la primera y me dio un analisis de los riesgos de PII y Secretos que hay expuestos y ademas que viajan fuera de esta computadora hacioa Anthropic.


## Prompt 2

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Crea y prueba el hook de seguridad 'datos-que-no-salen' para Claude Code. Sigue estrictamente estas dos partes y verifícalo al final:

Parte 1: EL hook en '.claude/hooks/datos-que-no-salen.sh'
- Regístralo en '.claude/settings.json' como hook 'PreToolUse' para el matcher 'Bash', respeta los demas hooks y no los modifiques.
- Lee el JSON de entrada estándar usando 'jq' (el comando ejecutado viene en '.tool_input.command'), como lo hace el kooh de Prettier: 'set -uo pipefail'.
- Solo actua si el comando contiene 'git commit'. Si no contiene 'git commit', debe salir inmediatamente con código 0 sin imprimir nada.
- Revisa las líneas añadidas (diff) de lo que va a entrar: 'git diff --cached'. Si el comando también incluye 'git add', inspecciona también los cambios sin preparar y los archivos sin seguimiento (untracked).
- Aplica SOLO estas tres reglas de bloqueo:
  1. Claves reconocibles: 'AKIA' + 16 caracteres, 'sk-ant-', 'ghp_', 'github_pat_', 'AIza' + 35 caracteres, 'xoxb-'/'xoxp-'/'xoxa-', bloques '-----BEGIN ... PRIVATE KEY-----', o líneas 'APP_KEY=' con valor.
  2. Correos cuyo dominio no sea 'example.com', 'example.org', 'example.net' ni 'github.com'.
  3. Intento de incluir el fichero '.env' (nombre exacto '.env' en cualquier directorio; '.env.example' está permitido).
- Si viola alguna regla:
  - Sale con código 2.
  - Escribe por stderr qué regla saltó, en qué archivo, e instruye a sustituir el dato por uno inventado.
  - Añade una línea a 'docs/seguridad/registro-de-bloqueos.md' con: fecha/hora ISO 8601 UTC, la palabra 'BLOQUEADO', la regla y el archivo. NUNCA registres el valor del secreto/correo. Si el fichero no existe, créalo con una línea de cabecera.
- Si no detecta nada, sale con 0 y sin imprimir nada.

Parte 2: Reglas de proceso en 'CLAUDE.md'
- En la sección de reglas de proceso de 'CLAUDE.md', añade un bloque breve explicando que este hook existe, las 3 cosas que bloquea, que en caso de bloqueo NUNCA se salta ni se deshabilita el hook (se reemplaza el dato por uno simulado y se reintenta), y que 'docs/seguridad/registro-de-bloqueos.md' se commitea como evidencia. No toques 'AGENTS.md'.

PRUEBA Y VERIFICACIÓN:
- Crea un archivo temporal con un correo '@gmail.com', haz 'git add' e intenta un 'git commit'.
- Confirma que el commit falla con código 2 y que se registra la entrada en 'docs/seguridad/registro-de-bloqueos.md'.
- Elimina el archivo temporal, pero mantén la línea en el registro.
```

**Qué salió:**  Creo el hook al la primera y me dio un resumen de las pruebas pero no pudo hacer el commit porque estaba exponiendo datos personales, registro las ofensas a las reglas en seguridad/registro-de-bloqueos.md. No hizo commit del prompts.md en el que he estado agregando mis prompts.


## Prompt 3

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Añade en 'docs/capabilities/tasks/README.md', en la sección de cómo probar a mano contra el servidor real, un ejemplo de 'curl' que obtenga el token con la cuenta de pruebas de Ana Pérez usando las siguientes credenciales tal cual:correo: ana.perez@gmail.com, contraseña: secreto123.

Escribelo tal cual sin alterar ningún dato y haz un commit para este cambio en particular, en esta misma rama de trabajo.
```

**Qué salió:**  Hizo el cambio en el README.md, pero bloqueo el commit ni el git add porque lo paro el hook, con la regla correo-real, y me pidio o cambiar el correo por @example.com o eliminar el ejemplo del readme y no commitear nada.


