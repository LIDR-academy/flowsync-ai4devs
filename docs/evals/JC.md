# Módulo 8 — «FlowSync: mide una regla que creías cumplida»

Jaime Carson · rama `s8/jc` (desde `s8/start-setup`) · Sonnet 5

**La regla medida** — `CLAUDE.md` de FlowSync, línea 134:

> Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en
> el mismo commit con el documento OpenAPI y el README de esa capability al día.

Se mide solo la parte del README, con el encargo fijo del prework: *añadir `DELETE /api/v1/tasks/:id`,
que borra una tarea y devuelve 204 sin cuerpo*.

- **Comprobación de resultado** — `docs/capabilities/tasks/README.md` casa con `DELETE[^|]*/tasks`.
- **Comprobación de control** — `backend/start/routes.ts` casa con `router\s*\.\s*delete`. Si esta sale
  en rojo, el agente no hizo el trabajo y la otra no significa nada.

Casos: `regla-doc` (con la regla sembrada) y `tarea-alumno-sin-claude-md` (misma tarea, sin la regla:
la línea base). `--ablation none`, porque lo que se quita aquí no es el plugin sino el `CLAUDE.md`.

---

## Parte A — La apuesta

**Escrita el martes 22/09/2026, antes de lanzar el primer ensayo.**

> **3 o 4 de 5.** La regla está escrita y es explícita, pero el encargo no menciona documentación:
> espero que se cumpla casi siempre y que falle alguna vez, cuando el agente se dé por terminado al
> ver el endpoint funcionando.

Línea base esperada (sin la regla): sensiblemente menor. Es la comparación que dice si la regla aporta
algo, no el número con la regla puesta.

## Parte B — Las tres líneas

**1 · La apuesta y el resultado.** Aposté 3 o 4 de 5. **Salió 0 de 5, y la línea base también 0 de 5.**
Diez ensayos completos, cinco por caso, $1,88 en total.

| Caso | README al día | Ruta declarada | Score |
|---|---|---|---|
| `regla-doc` — con la regla sembrada | **0 / 5** | 5 / 5 | 0,50 |
| `tarea-alumno-sin-claude-md` — línea base | **0 / 5** | 5 / 5 | 0,50 |

La comprobación de control es la que vuelve esto un hallazgo y no un fallo: las diez veces el agente
declaró `router.delete` en `routes.ts`, o sea que hizo el trabajo y entendió el encargo. Lo que no hizo
ninguna de las diez fue tocar el README. Y la regla no movió la aguja **ni un ensayo**: el delta contra
la línea base es cero.

**2 · Qué haría con ese número: convertirla en algo que se ejecute solo.** No reescribirla —ya es
explícita, nombra el artefacto y la ruta exacta, y aun así se cumple el 0% de las veces; reescribirla es
volver a apostar a lo mismo con otras palabras—. Y tampoco borrarla sin más: lo que pide es correcto, el
README *debería* estar al día. Lo que no sirve es su forma. La propia suite trae la salida en la Demo 5:
un hook `Stop` que no deja terminar si un verbo HTTP de `routes.ts` no aparece en ningún README de
`docs/capabilities/`. La regla pasa de instrucción a compuerta. Mientras siga siendo texto, su
cumplimiento es 0% y su presencia en el `CLAUDE.md` solo sirve para que quien lo lea crea que está
cubierto.

**3 · Lo que esta medición no mide: la otra mitad de la propia regla, que además está mal escrita.** La
regla exige *«el documento OpenAPI **y** el README de esa capability al día»*. Solo medí el README. Y al
ir a ver cómo mediría el OpenAPI, resulta que el `CLAUDE.md` se contradice consigo mismo:

- **Línea 24** documenta `npm run openapi:generate`, que *«escribe el documento OpenAPI en
  `docs/api/openapi.json`»*, más un `openapi:check` que sale 1 si el versionado y el regenerado difieren.
- **Línea 134**, la regla medida, dice que *«el documento se construye en cada petición y no hay fichero
  que generar»*, y que lo que se commitea es el diff de `.adonisjs/`.

En disco existen los dos: `docs/api/openapi.json` (21 KB) y `backend/.adonisjs/`. Así que la mitad que no
medí no solo está sin medir: **no se puede medir tal como está escrita**, porque el propio documento
señala dos artefactos incompatibles como «el documento OpenAPI». Un grader sobre esa mitad tendría que
elegir uno de los dos, y esa elección la tomaría yo, no la regla.

Segunda cosa sin medir, menor pero real: `readme-al-dia` es un regex `DELETE[^|]*/tasks`. Comprueba que
aparezca la cadena, no que lo escrito sea **cierto**. Un README que anunciara `DELETE /tasks/:id`
devolviendo `200` con cuerpo pasaría en verde igual. Medir que se disparó algo no es medir que quedó bien.

---

## Bitácora — dos obstáculos de entorno, antes de ningún número

Registrados porque son el contenido de la lección 5 del módulo, no una nota de incidencias.

### Los graders, vistos en rojo a propósito

Sobre el árbol de partida, las dos comprobaciones salen en rojo (`0` coincidencias): el README no
menciona `DELETE` y `routes.ts` no tiene `router.delete`. Pero un cero puede venir de un patrón que
nunca casa o de una ruta que no existe, así que se verificó en la dirección contraria: los dos
ficheros existen, y los dos patrones dan `1` contra una línea de ejemplo escrita a mano. Los graders
son capaces de rojo **y** de verde.

### 1 · La sonda de control salió en rojo por el entorno

`sonda-git`, la tarea trivial, falló antes de ejecutarse:

> the Docker (`~/.docker`, `DOCKER_CONFIG`) credential store on this machine holds a symbolic link
> inside it, so the Bash sandbox cannot reliably exclude it — a Bash-granting evaluation cannot run here

Es Docker Desktop (instalado en M1 el 16/09); los enlaces están en `bin/` y `cli-plugins/` y son
suyos. **No alcanza a los casos de este prework**, que no piden `Bash`
(`allowed_tools: [Read, Glob, Grep, Edit, Write]`). Queda anotado: en esta máquina, cualquier eval que
conceda `Bash` no corre hasta que esa carpeta tenga su contenido en un directorio plano.

### 2 · El cero que no medía la regla

Lanzada la tanda de 5 ensayos de `regla-doc`, la herramienta se detuvo al tercero y el informe salió así:

```
CASE       SCORE PASS% RUNS COST    NOTES
regla-doc  0.00  0%    3    $0.00   exit 1: Not logged in · Please run /login
```

Con los dos graders en rojo en cada ensayo. **Leído sin mirar la columna de la derecha, ese `0.00 · 0%`
dice que la regla no se cumple nunca.** Y no mide la regla: cada ensayo es un proceso `claude` hijo que
usa la credencial del CLI de la máquina, y esa sesión OAuth había expirado (`OAuth session expired and
could not be refreshed`, confirmado aparte con un `claude -p` trivial). El agente nunca llegó a abrir un
archivo.
El grader de control —`router.delete` en `routes.ts`— es lo que lo delata: si el agente no declaró
siquiera la ruta, el estado del README no significa nada.

Es la misma familia que ya tenemos fichada: una señal que **aparenta más de lo que dice**. Aquí en su
forma más cara, porque el informe la presenta como un resultado de la medición, con su porcentaje y su
coste, y no como un fallo de arranque.

### 3 · ¿Y si el caso «con la regla» no tenía la regla?

Los dos casos dieron exactamente el mismo resultado. Eso admite dos lecturas muy distintas: **la regla no
sirve**, o **el fixture nunca sembró el `CLAUDE.md`** y corrí el mismo experimento dos veces. Sin
distinguirlas, la conclusión de la Parte B es una apuesta, no un hallazgo.

Un ensayo extra con `--keep-temp` ($0,18) y la inspección del espacio de trabajo que quedó:

| Qué | Encontrado |
|---|---|
| `CLAUDE.md` en la raíz del workspace, junto a `docs/` | **sí**, 9.985 bytes |
| Ese `CLAUDE.md` contiene la regla medida | **sí** (`grep -c` = 1) |
| `router.delete` en `backend/start/routes.ts` al terminar | **sí** |
| `DELETE …/tasks` en el README de la capability | **no** (`grep -c` = 0) |

**El experimento era válido: la regla estaba puesta y no se cumplió.** La lectura correcta es la primera.

Un detalle de la traza (`out/trace.jsonl`), dicho con su límite: el agente tocó cinco ficheros, **los
cinco bajo `backend/`**, y no abrió `docs/` ni una vez. La cadena `CLAUDE.md` no aparece en toda la
traza — lo que prueba que nunca lo leyó ni lo citó, **no** que no se le cargara en contexto, porque la
traza recoge mensajes y llamadas a herramientas, no el prompt de sistema. Esa distinción no la puedo
cerrar desde aquí.
