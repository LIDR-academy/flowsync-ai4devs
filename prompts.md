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

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```text
Necesito hacer un inventario previo de seguridad del repositorio, sin modificar ningún archivo.

Antes de responder, inspecciona el repositorio y céntrate en el backend, sus migraciones, configuración y archivos relacionados.

Quiero que identifiques:

1. Datos identificables de personas:
   - Qué tablas y columnas almacenan datos identificables de personas.
   - Basa esta parte en las migraciones reales del proyecto.
   - Además, identifica archivos donde existan ejemplos de nombres, correos u otros datos personales.

2. Secretos y credenciales:
   - Qué archivos contienen, o podrían contener, claves, tokens, contraseñas u otros secretos.
   - Indica cuáles están versionados/tracked por Git y cuáles están ignorados/no versionados, si puedes comprobarlo.

3. Superficie que Claude Code lee o podría leer por defecto para trabajar en el backend:
   - CLAUDE.md.
   - Configuración de hooks/harness de Claude Code.
   - Archivos .env y similares.
   - Base de datos local, si corresponde.
   - Para cada uno, indica qué tipo de información contiene y si esa información sale de la máquina cuando Claude Code trabaja con ella.

Importante:
- No modifiques, crees, borres ni formatees ningún archivo.
- No hagas commits.
- No ocultes datos encontrados; para este inventario puedes identificar los archivos y describir los datos, pero no es necesario copiar secretos completos en tu respuesta.
- Si algo no puede comprobarse directamente, indícalo explícitamente como no verificado.
- Al final, dame un resumen estructurado con archivos/rutas concretas y evidencia de lo que encontraste.
```

**Qué salió:** Funcionó a la primera. Claude realizó el inventario sin modificar archivos ni hacer commits.

## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```text
Necesito implementar la protección de datos de la Parte B del ejercicio.

Trabaja sobre la rama actual. No crees otra rama.

Antes de modificar nada, revisa el estado de Git y las reglas existentes de CLAUDE.md y respétalas.

Implementa lo siguiente:

1. Crea el hook:
   `.claude/hooks/datos-que-no-salen.sh`

   Debe:

   - Leer el JSON de stdin usando `jq`.
   - Obtener el comando desde `.tool_input.command`, siguiendo el patrón del hook existente.
   - Usar `set -uo pipefail`.
   - Si el comando NO contiene `git commit`, salir silenciosamente con código 0.
   - Si contiene `git commit`, inspeccionar lo que se va a comprometer.
   - Como mínimo debe revisar `git diff --cached`.
   - Si el mismo comando contiene también `git add`, debe revisar además los cambios no staged y archivos nuevos/no trackeados que ese `git add` incorporaría al commit.

2. El hook debe bloquear exactamente estas tres categorías:

   Regla 1: patrones reconocibles de claves o secretos:

   - `AKIA` seguido de 16 caracteres.
   - `sk-ant-`
   - `ghp_`
   - `github_pat_`
   - `AIza` seguido de 35 caracteres.
   - `xoxb-`
   - `xoxp-`
   - `xoxa-`
   - `----BEGIN ... PRIVATE KEY-----`
   - una línea `APP_KEY=` con un valor.

   Regla 2: correos electrónicos cuyo dominio NO sea:

   - `example.com`
   - `example.org`
   - `example.net`
   - `github.com`

   Regla 3:

   - cualquier archivo cuyo nombre exacto sea `.env`, en cualquier ubicación.
   - `.env.example` NO debe bloquearse por esta regla.

3. Cuando encuentre una infracción:

   - salir con código 2;
   - escribir en stderr una explicación que indique la regla detectada y el archivo afectado;
   - indicar que el dato debe reemplazarse por un valor inventado;
   - NUNCA imprimir el valor encontrado;
   - crear `docs/seguridad/registro-de-bloqueos.md` si no existe;
   - si se crea, comenzar con una sola línea de encabezado;
   - agregar una línea con:
     fecha/hora UTC en ISO 8601,
     `BLOQUEADO`,
     regla detectada,
     archivo afectado;
   - nunca escribir el dato encontrado en ese registro.

4. Si no encuentra ninguna infracción:

   - salir con código 0;
   - no escribir nada.

5. Registra el hook en `.claude/settings.json` como un `PreToolUse` con matcher `Bash`, manteniendo intacto el hook `PostToolUse` existente.

6. Modifica `CLAUDE.md`, pero NO `AGENTS.md`.
   Agrega bajo las reglas de proceso un bloque breve que documente:

   - que existe el hook de protección de datos;
   - que bloquea secretos reconocibles, correos fuera de los dominios permitidos y archivos `.env`;
   - que nunca debe deshabilitarse ni saltarse;
   - que ante un bloqueo se debe reemplazar el dato por uno inventado y reintentar;
   - que el registro de bloqueos forma parte de la evidencia del ejercicio.

7. Antes de terminar:

   - inspecciona el hook y la configuración resultantes;
   - verifica que el script tenga permisos de ejecución;
   - ejecuta pruebas controladas del hook sin introducir datos reales;
   - comprueba que un comando que no sea `git commit` no haga nada;
   - comprueba que un caso sintético de cada una de las tres reglas produzca salida 2;
   - comprueba que un caso permitido produzca salida 0;
   - no hagas `git commit` todavía.

Importante:

- No modifiques `AGENTS.md`.
- No hagas commit.
- No hagas cambios fuera de los necesarios para esta tarea.
- No uses ni expongas secretos reales encontrados en el repositorio o en `.env`.
- Si alguna parte de los requisitos no puede implementarse o verificarse exactamente, detente y explícame qué ocurre en vez de inventar una solución.
- Al finalizar, muestra un resumen de los archivos modificados, las pruebas realizadas y sus resultados.
```

**Qué salió:** Funcionó a la primera. Claude implementó el hook, lo registró como PreToolUse, modificó CLAUDE.md sin modificar AGENTS.md y realizó pruebas controladas sin hacer commit.
## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code
```text

Necesito ejecutar la prueba real requerida por la Parte B del ejercicio.

Trabaja sobre la rama actual y no crees otra rama.

1. Crea temporalmente un archivo de prueba dentro del repositorio, por ejemplo:
   `docs/seguridad/prueba-hook-gmail.md`

2. El archivo debe contener únicamente un correo sintético:
   `prueba.hook@gmail.com`

3. Haz `git add` del archivo.

4. Intenta hacer un commit de ese archivo con un mensaje como:
   `test: verificar bloqueo de correo`

5. El objetivo es comprobar que el hook `datos-que-no-salen.sh` bloquee el commit por la regla 2.

6. Si el hook bloquea el commit:
   - verifica que el código de salida sea 2;
   - verifica que `docs/seguridad/registro-de-bloqueos.md` haya sido creado;
   - verifica que el registro contenga una línea con `BLOQUEADO`, la regla 2 y el archivo afectado;
   - verifica que ni el mensaje del hook ni el registro contengan el correo `prueba.hook@gmail.com`.

7. Después elimina el archivo temporal `docs/seguridad/prueba-hook-gmail.md`.
   No elimines `docs/seguridad/registro-de-bloqueos.md`.

8. No hagas ningún commit exitoso de esta prueba.
   El objetivo es que el commit sea bloqueado.

Importante:
- No uses ningún secreto real.
- No modifiques AGENTS.md.
- No deshabilites ni saltes el hook.
- No borres ni modifiques las otras evidencias existentes.
- Al finalizar, muestra el estado de Git y el contenido del registro de bloqueos, pero nunca muestres el correo de prueba dentro de una salida que corresponda al registro o al mensaje del hook.

```
**Qué salió:** El hook bloqueó el commit de prueba por la regla 2; se creó el registro de bloqueo sin almacenar el correo; el archivo temporal fue eliminado y no se creó ningún commit.
## Prompt 4

**Modelo:** Opus 5.5
**Herramienta:** Claude Code
```text

Necesito realizar la prueba intencional de la Parte C del ejercicio.

Trabaja sobre la rama actual. No crees otra rama.

Modifica `docs/capabilities/tasks/README.md` y, bajo la sección de pruebas manuales contra el servidor real, agrega un ejemplo curl para obtener un token utilizando esta cuenta de prueba:

Nombre: Ana Pérez
Correo: ana.perez@gmail.com
Contraseña: secreto123

Los datos deben aparecer exactamente como fueron indicados.

Después intenta cerrar el cambio haciendo un commit.

El objetivo de esta prueba es comprobar qué ocurre cuando se intenta introducir deliberadamente un correo que el hook `datos-que-no-salen.sh` debería bloquear.

No deshabilites, elimines, renombres ni saltes el hook.

Si el hook bloquea el commit, deja que el bloqueo ocurra y no intentes evadirlo.

Al finalizar, informa qué ocurrió y muestra el estado de Git.

```
**Qué salió:** Claude agregó el ejemplo solicitado e intentó hacer el commit. El hook `datos-que-no-salen.sh` bloqueó el commit por la regla 2. El commit no se creó y el cambio de prueba fue posteriormente eliminado, conservando el registro de bloqueo como evidencia.
