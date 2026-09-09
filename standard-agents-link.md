# Informe de vinculación entre `AGENTS.md` y `CLAUDE.md`

Fecha de revisión: 2026-09-09  
Repositorio: `LIDR-academy/flowsync-ai4devs`  
Rama revisada: `feat/s04-repaso`

## Conclusión ejecutiva

`AGENTS.md` y `CLAUDE.md` no están vinculados correctamente.

Hay una intención de vinculación en el índice de Git: `AGENTS.md` está
registrado con modo `120000`, que corresponde a un enlace simbólico. Sin
embargo, el contenido almacenado para ese supuesto enlace no es la ruta
`CLAUDE.md`; es una copia abreviada de instrucciones que comienza por
`# CLAUDE.md`. Por tanto, el enlace simbólico está mal formado o fue
materializado como archivo durante el checkout de Windows.

En el árbol de trabajo actual:

- `AGENTS.md` se comporta como un archivo regular en Windows.
- `CLAUDE.md` es un archivo regular independiente.
- Sus contenidos no son iguales: `AGENTS.md` tiene 11 líneas y `CLAUDE.md`
  tiene 88 líneas.
- No existe una directiva en ninguno de los dos archivos que importe,
  incluya o sincronice automáticamente el otro.

La respuesta a la pregunta "¿está realmente vinculado?" es, por tanto:
**no de forma funcional ni portable**.

## Evidencia comprobada

### Inventario de archivos

| Archivo | Estado en Git | Estado observado en Windows | Tamaño lógico observado |
| --- | --- | --- | ---: |
| `AGENTS.md` | `120000` (`symlink`) | archivo regular | 11 líneas / 1.051 caracteres |
| `CLAUDE.md` | `100644` (archivo normal) | archivo regular | 88 líneas / 8.870 caracteres |

El árbol de Git muestra ambos objetos por separado:

```text
120000 blob c0a44f372723c521d334b16d67413103adf1dcf0 AGENTS.md
100644 blob fecb5a2dd5186c80eccf0f9f5aae3b308bd89e89a CLAUDE.md
```

Un enlace simbólico válido a `CLAUDE.md` debería tener como payload Git una
única cadena equivalente a:

```text
CLAUDE.md
```

El payload real de `AGENTS.md` comienza así y continúa con reglas propias:

```text
# CLAUDE.md

## Frontend
...

## Reglas de proceso
...
```

Esto descarta que `AGENTS.md` sea un symlink funcional cuyo destino sea
`CLAUDE.md`.

### Comparación de contenido

`AGENTS.md` contiene únicamente:

- Una sección breve de convenciones del frontend.
- La URL por defecto de la API.
- Reglas de proceso sobre ramas, commits, PR y revisión adversarial.

`CLAUDE.md` contiene esas mismas reglas y además:

- Descripción del repositorio y sus dos aplicaciones.
- Comandos de backend y frontend.
- Arquitectura del backend.
- Reglas de esquema generado y código generado de AdonisJS.
- Serialización de respuestas.
- Autenticación y tabla de rutas.
- Validación e imports por subpath.
- Versiones del stack.
- Organización detallada del frontend.

Las primeras reglas de proceso aparecen duplicadas textualmente en ambos
documentos, pero la duplicación no es una relación automática. Si se cambia
una copia, la otra no se actualiza.

### Referencias textuales encontradas

Las referencias cruzadas localizadas son menciones de documentación, no
mecanismos de inclusión:

- `.claude/agents/adversarial-reviewer.md` menciona desviaciones de
  `AGENTS.md`.
- `.claude/skills/priority-ticket/SKILL.md` menciona las convenciones de
  `AGENTS.md` y `CLAUDE.md`.
- `AGENTS.md` usa `# CLAUDE.md` como título, pero no contiene una directiva
  que apunte al archivo.
- `CLAUDE.md` no menciona `AGENTS.md`.

## Cómo afecta a los agentes

### Agentes que buscan `AGENTS.md`

Un agente que siga la convención de buscar `AGENTS.md` leerá solo el conjunto
abreviado de instrucciones. No recibirá automáticamente las reglas de
arquitectura, comandos, estructura del proyecto ni las restricciones técnicas
documentadas únicamente en `CLAUDE.md`.

### Agentes que buscan `CLAUDE.md`

Un agente que busque `CLAUDE.md` sí verá la guía extensa, pero no hay garantía
de que todos los agentes o herramientas usen ese nombre. La existencia de
`AGENTS.md` crea dos posibles fuentes de autoridad.

### Checkouts en otros sistemas

El modo `120000` puede hacer que Git cree un symlink real en sistemas que
soporten symlinks. Como el payload no es una ruta corta sino un documento
completo, el checkout puede producir un enlace con un destino inválido o
inesperado. En Windows, cuando los symlinks no están habilitados, Git puede
materializar el payload como archivo regular, que es lo observado aquí.

El comportamiento, por tanto, puede cambiar según el sistema operativo, la
configuración de Git y los permisos del checkout.

## Riesgos identificados

1. **Deriva de instrucciones.** Las reglas compartidas están duplicadas y
   pueden divergir en el siguiente cambio.
2. **Cobertura incompleta.** Un agente que solo cargue `AGENTS.md` trabaja con
   información insuficiente para este repositorio.
3. **Checkout no portable.** El modo `120000` no corresponde al contenido
   almacenado como destino del enlace.
4. **Ambigüedad de autoridad.** El encabezado `# CLAUDE.md` dentro de
   `AGENTS.md` sugiere una relación que no está implementada.
5. **Mantenimiento engañoso.** La apariencia de enlace puede hacer creer que
   editar un archivo actualiza el otro, cuando eso no ocurre en el árbol de
   trabajo observado.

## Recomendación

Elegir una única fuente de verdad y hacer que el otro nombre sea un enlace
válido o un pequeño archivo de redirección explícito.

La opción más predecible y portable es:

1. Mantener la guía completa en `CLAUDE.md` si ese es el nombre requerido por
   Claude Code.
2. Convertir `AGENTS.md` en un archivo regular breve que indique claramente
   que la guía canónica está en `CLAUDE.md`, o crear un symlink real cuyo
   payload Git sea exactamente `CLAUDE.md` si el equipo garantiza soporte de
   symlinks.
3. Eliminar la copia duplicada de reglas de `AGENTS.md` para evitar deriva.
4. Documentar cuál de los dos nombres debe cargar cada agente o herramienta.
5. Validar el resultado con `git ls-tree`, `git cat-file` y un checkout limpio
   en el sistema operativo soportado.

No se ha modificado ninguno de los dos archivos en esta revisión; este
documento solo registra el diagnóstico.

## Revisión adversarial de la recomendación

La propuesta anterior necesita una corrección antes de implementarse.

### Propuesta descartada: archivo breve de redirección

Convertir `AGENTS.md` en un archivo breve que diga que la guía está en
`CLAUDE.md` es portable como archivo, pero no garantiza que un agente lea el
destino. Muchos cargadores de instrucciones descubren un nombre concreto y
consumen su contenido literalmente; no interpretan enlaces Markdown ni
redirecciones textuales como una inclusión. Esta opción dejaría a los agentes
que solo cargan `AGENTS.md` sin las reglas técnicas del repositorio.

**Veredicto:** no satisface el objetivo de que ambos nombres funcionen como
guía operativa completa.

### Propuesta condicionada: symlink válido

Un symlink con payload Git exactamente igual a `CLAUDE.md` elimina la
duplicación en sistemas que preservan symlinks. No obstante, mantiene una
dependencia del checkout, de `core.symlinks`, de los permisos de Windows y del
comportamiento del consumidor de instrucciones. En un checkout que materialice
el symlink como texto, `AGENTS.md` contendría solo `CLAUDE.md`, que tampoco es
una guía válida para un agente que no resuelva symlinks.

**Veredicto:** técnicamente correcto en entornos controlados, pero no es la
mejor opción para este repositorio multiplataforma.

### Propuesta recomendada: dos archivos completos más verificación

Mantener `AGENTS.md` y `CLAUDE.md` como archivos regulares con el mismo
contenido operativo completo, y añadir una comprobación automatizada que
falle si divergen. Esta opción tiene una duplicación física, pero evita la
duplicación silenciosa: cualquier cambio inconsistente se detecta durante la
validación. También funciona cuando el agente solo reconoce uno de los dos
nombres y no depende de symlinks.

Para que sea sostenible, la tarea de mantenimiento debe establecer:

1. Un documento canónico y un procedimiento explícito para propagar cambios.
2. Una comparación determinista de ambos archivos en CI.
3. Una prueba de checkout en Windows y en un sistema Unix.
4. Una revisión que impida dejar cabeceras o reglas divergentes entre copias.

**Veredicto:** es la alternativa más plausible y robusta con las herramientas
y restricciones observadas. No elimina por completo el riesgo de edición
manual, pero lo convierte en un fallo visible y bloqueante.

### Decisión

La propuesta recomendada para implementar es la tercera: reemplazar el
contenido abreviado y el modo symlink de `AGENTS.md` por un archivo regular
completo, igual a `CLAUDE.md`, y proteger la igualdad con una verificación
automatizada. Las tareas detalladas están en
`tasks-standard-agents-link.md`.

## Comandos de verificación reproducibles

```powershell
git ls-tree HEAD -- AGENTS.md CLAUDE.md
git cat-file -p HEAD:AGENTS.md
git cat-file -p HEAD:CLAUDE.md
git check-attr -a -- AGENTS.md CLAUDE.md
Get-FileHash .\AGENTS.md -Algorithm SHA256
Get-FileHash .\CLAUDE.md -Algorithm SHA256
```
