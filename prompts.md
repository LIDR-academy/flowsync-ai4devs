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

**Modelo:** Sonnet 5 1M High
**Herramienta:** Claude Code

```
Actúa como un auditor de privacidad y seguridad de software. Realiza un inventario completo del proyecto en relación con datos personales, credenciales y el contexto de archivos que analizas al trabajar. 

REGLA IMPORTANTE: No modifiques, crees ni elimines ningún archivo del repositorio. Tu tarea es exclusivamente de lectura y análisis.

Genera un informe con únicamente las siguientes tres listas detalladas:

1. Inventario de Datos Personales (PII):
   - Tablas y columnas que almacenan datos de personas identificables. IMPORTANTE: Revisa el contenido real de los archivos de migraciones de la base de datos (por ejemplo, en db/migrate/, prisma/migrations, etc.) para confirmarlo de forma explícita; NO hagas suposiciones sobre el esquema.
   - Archivos del repositorio que contengan ejemplos, mocks, fixtures, seeds o tests con correos electrónicos, nombres u otros datos personales de prueba.

2. Ficheros con Secretos y Credenciales:
   - Archivos que contengan o puedan contener claves API, tokens, secretos o contraseñas (ej. `.env`, `.env.local`, `.env.example`, archivos de configuración de despliegue, certs, claves RSA). 
   - Especifica cuáles de estos archivos están rastreados actualmente por Git y cuáles están explícitamente excluidos en el archivo `.gitignore` (o si faltan por excluir).

3. Contexto de Trabajo del Agente y Exfiltración de Datos:
   - Listado de todos los archivos y recursos que has leído o leerías por defecto para planificar y ejecutar un cambio en el backend (por ejemplo: el archivo de instrucciones del repositorio como `AGENTS.md`, `README.md` o `.cursorrules`, la configuración del harness/framework del agente, archivos de entorno, la base de datos local, etc.).
   - Para CADA UNO de los elementos de esta lista, aclara explícitamente si su contenido o fragmentos del mismo son enviados fuera de la máquina local (a la API del LLM o proveedor) cuando trabajas en este proyecto.
```

**Qué salió:** Las 3 listas siguientes:
1. Inventario de Datos Personales (PII)
2. Ficheros con Secretos y Credenciales
3. Contexto de Trabajo del Agente y Exfiltración de Datos


---

## Prompt 2

**Modelo:** Sonnet 5 1M High
**Herramienta:** Claude Code

```
Necesito un hook en dos piezas. **Las restricciones son estas, y no son negociables**:

- **Pieza 1**: un hook de Claude Code en `.claude/hooks/datos-que-no-salen.sh`, registrado en `.claude/settings.json` como `PreToolUse` con el matcher `Bash`, junto al que ya hay. Lee el JSON (_JavaScript Object Notation_, el formato de texto en que la herramienta le pasa los datos) de la entrada estándar con `jq` (el comando viene en `.tool_input.command`), como hace el hook de Prettier. `set -uo pipefail`.
- **Solo actúa si el comando contiene** `git commit`**.** Con cualquier otro comando sale con 0 sin decir nada.
- **Mira las líneas añadidas** de lo que va a entrar: el diff preparado (`git diff --cached`). Y si el mismo comando también hace `git add`, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque en ese caso todavía no están en el índice.
- **Tres reglas, y solo estas tres:**
    1. Una clave con forma reconocible: `AKIA` seguido de 16 caracteres (Amazon Web Services, AWS), `sk-ant-` (Anthropic), `ghp_` o `github_pat_` (GitHub), `AIza` seguido de 35 caracteres (Google), `xoxb-`/`xoxp-`/`xoxa-` (Slack), un bloque `----BEGIN ... PRIVATE KEY-----`, o una línea `APP_KEY=` con valor.
    2. Una dirección de correo cuyo dominio **no** sea `example.com`, `example.org`, `example.net` ni `github.com`. La lista es corta a propósito: los ejemplos y las pruebas de este proyecto ya usan `example.com`, que es un dominio reservado para eso.
    3. El fichero `.env` (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los `.env.example` no cuentan.
- **Si encuentra algo:** sale con **código 2**, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade **una línea** a `docs/seguridad/registro-de-bloqueos.md` con la fecha y hora en UTC (tiempo universal coordinado) en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. **Nunca el valor encontrado**: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.
- **Si no encuentra nada,** sale con 0 y no escribe nada.
- **Pieza 2**: un bloque corto en el `CLAUDE.md` del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea **no se desactiva ni se salta** (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto: es la evidencia. `AGENTS.md` no se toca: que mire antes qué es.

Pruebalo antes de darlo por hecho: un archivo temporal con un correo de `gmail.com`, `git add`, un intento de commit. Tiene que salir con 2 y dejar su línea en el registro. Después, fuera el archivo temporal. **La línea se queda**: es la primera evidencia de que el hook existe.
```

**Qué salió:** Creo el shell script, lo configuro como hook y modifico CLAUDE.md con la regla nueva de proceso.

---

## Prompt 3

**Modelo:** Sonnet 5 1M High
**Herramienta:** Claude Code

```
Necesito un hook en dos piezas. **Las restricciones son estas, y no son negociables**:

- **Pieza 1**: un hook de Claude Code en `.claude/hooks/datos-que-no-salen.sh`, registrado en `.claude/settings.json` como `PreToolUse` con el matcher `Bash`, junto al que ya hay. Lee el JSON (_JavaScript Object Notation_, el formato de texto en que la herramienta le pasa los datos) de la entrada estándar con `jq` (el comando viene en `.tool_input.command`), como hace el hook de Prettier. `set -uo pipefail`.
- **Solo actúa si el comando contiene** `git commit`**.** Con cualquier otro comando sale con 0 sin decir nada.
- **Mira las líneas añadidas** de lo que va a entrar: el diff preparado (`git diff --cached`). Y si el mismo comando también hace `git add`, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque en ese caso todavía no están en el índice.
- **Tres reglas, y solo estas tres:**
    1. Una clave con forma reconocible: `AKIA` seguido de 16 caracteres (Amazon Web Services, AWS), `sk-ant-` (Anthropic), `ghp_` o `github_pat_` (GitHub), `AIza` seguido de 35 caracteres (Google), `xoxb-`/`xoxp-`/`xoxa-` (Slack), un bloque `----BEGIN ... PRIVATE KEY-----`, o una línea `APP_KEY=` con valor.
    2. Una dirección de correo cuyo dominio **no** sea `example.com`, `example.org`, `example.net` ni `github.com`. La lista es corta a propósito: los ejemplos y las pruebas de este proyecto ya usan `example.com`, que es un dominio reservado para eso.
    3. El fichero `.env` (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los `.env.example` no cuentan.
- **Si encuentra algo:** sale con **código 2**, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade **una línea** a `docs/seguridad/registro-de-bloqueos.md` con la fecha y hora en UTC (tiempo universal coordinado) en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. **Nunca el valor encontrado**: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.
- **Si no encuentra nada,** sale con 0 y no escribe nada.
- **Pieza 2**: un bloque corto en el `CLAUDE.md` del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea **no se desactiva ni se salta** (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto: es la evidencia. `AGENTS.md` no se toca: que mire antes qué es.

Pruebalo antes de darlo por hecho: un archivo temporal con un correo de `gmail.com`, `git add`, un intento de commit. Tiene que salir con 2 y dejar su línea en el registro. Después, fuera el archivo temporal. **La línea se queda**: es la primera evidencia de que el hook existe.
```

**Qué salió:** Activo la regla 2 que se acababa de agregar.
