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

**Modelo:** Sonnet 5
**Herramienta:** Claude Code

```
para empezar realiza un inventario de seguridad de este proyecto sin modificar ningun archivo,
generame tres listas y quiero que obtengas la informacion directamente de los archivos del proyecto y de las migraciones, no de memoria

1: Identifica las tablas y columnas que guardan datos de una persona identificable y los archivos que contienen ejemplos de correos o nombres
2: Identifica los archivos que llevan o pueden llevar claves, tokens o contrasenas, esten o no versionados en el repositorio
3: Identifica que archivos o fuentes de informacion has leido o leerias por defecto para hacer un cambio en el backend, incluyendo como minimo el CLAUDE.md, la configuracion del harness, los archivos de entorno y la base de datos local

para cada elemento de la tercera lista indica si su contenido sale de mi maquina cuando trabajas conmigo y explica brevemente por que

no hagas ningun cambio
```

**Qué salió:** (opcional, una línea) hizo el analisis y me genero el reporte con los 3 puntos que solicite


## Prompt 2

**Modelo:** Sonnet 5
**Herramienta:** Claude Code

```
ahora implementa la pieza principal de seguridad, no hagas cambios fuera de los archivos que te indico y respeta exactamente estas reglas

crea el hook:
.claude/hooks/datos-que-no-salen.sh

registralo en:
.claude/settings.json

como un hook PreToolUse con matcher Bash, junto al hook existente. Primero inspecciona la configuracion actual y no elimines ni reemplaces hooks existentes.

El hook debe leer el JSON de stdin usando jq y obtener el comando desde:

.tool_input.command

Usa:

set -uo pipefail

Regla de activacion:

* El hook solamente debe actuar cuando el comando contenga git commit.
* Para cualquier otro comando debe salir con codigo 0 y no escribir nada.

Cuando detecte un git commit, debe revisar las lineas agregadas que puedan entrar al repositorio.

Debe revisar como minimo:

1. El diff staged usando git diff --cached.

2. Si el mismo comando tambien contiene git add, debe revisar tambien los cambios unstaged y los ficheros nuevos no trackeados que todavia no estan en el index.

Debe implementar exactamente estas tres reglas de bloqueo:

REGLA 1 - SECRETOS

Bloquear patrones reconocibles de:

* AKIA seguido de 16 caracteres
* sk-ant-
* ghp_
* github_pat_
* AIza seguido de 35 caracteres
* xoxb-
* xoxp-
* xoxa-
* -----BEGIN ... PRIVATE KEY-----
* APP_KEY= con algun valor

REGLA 2 - CORREOS

Bloquear cualquier correo cuyo dominio NO sea:

* example.com
* example.org
* example.net
* github.com

Los correos de esos cuatro dominios deben permitirse.

REGLA 3 - FICHEROS .env

Bloquear cualquier fichero cuyo nombre exacto sea:

.env

No debe bloquear:

.env.example

Cuando se detecte una violacion:

* El hook debe terminar con codigo 2.
* Debe escribir en stderr que regla se activo y que fichero la activo.
* Debe indicar que se debe reemplazar el dato por un valor inventado antes de volver a intentarlo.
* Nunca debe escribir el valor encontrado.
* Debe agregar UNA sola linea al archivo:

docs/seguridad/registro-de-bloqueos.md

La linea debe contener:

* timestamp UTC en formato ISO 8601
* BLOQUEADO
* regla activada
* fichero detectado

Si el archivo de log no existe, crealo con una linea de encabezado.

El log nunca debe contener el secreto, correo u otro valor detectado.

Si no encuentra ninguna violacion:

* salir con codigo 0
* no escribir nada
* no modificar el log

Despues de implementarlo:

1. Inspecciona el hook y la configuracion final.
2. Ejecuta una prueba que demuestre que un comando que NO contiene git commit termina silenciosamente con codigo 0.
3. No hagas todavia la prueba real del commit con gmail.com; esa prueba la haremos en el siguiente paso.
4. No modifiques AGENTS.md. Si existe, solo inspeccionalo antes de terminar.
5. No cambies ningun archivo que no sea:

   * .claude/hooks/datos-que-no-salen.sh
   * .claude/settings.json
   * docs/seguridad/registro-de-bloqueos.md, solamente si la implementacion necesita crearlo
   * CLAUDE.md, solamente si es necesario para la integracion que se pide despues

Al final explicame exactamente que archivos modificaste, que reglas implementaste y el resultado de la prueba del comando que no contiene git commit.
```

**Qué salió:** (opcional, una línea) creo el hook y actualizo el archivo claude/settings.json


## Prompt 3

**Modelo:** Sonnet 5
**Herramienta:** Claude Code

```
para empezar realiza un inventario de seguridad de este proyecto sin modificar ningun archivo,
generame tres listas y quiero que obtengas la informacion directamente de los archivos del proyecto y de las migraciones, no de memoria

1: Identifica las tablas y columnas que guardan datos de una persona identificable y los archivos que contienen ejemplos de correos o nombres
2: Identifica los archivos que llevan o pueden llevar claves, tokens o contrasenas, esten o no versionados en el repositorio
3: Identifica que archivos o fuentes de informacion has leido o leerias por defecto para hacer un cambio en el backend, incluyendo como minimo el CLAUDE.md, la configuracion del harness, los archivos de entorno y la base de datos local

para cada elemento de la tercera lista indica si su contenido sale de mi maquina cuando trabajas conmigo y explica brevemente por que

no hagas ningun cambio
```

**Qué salió:** (opcional, una línea) hizo el analisis y me genero el reporte con los 3 puntos que solicite
