# Auditoría de las reglas de proceso

> Qué reglas declara este repositorio, cuáles se cumplen, cuáles no, y cuáles **no se pueden comprobar**.
>
> Preparado el 2026-09-02, antes del directo del Módulo 5.
>
> **La columna de estado va deliberadamente sin rellenar**, salvo dos filas: es el ejercicio de la sesión, y rellenarla antes destruye lo único interesante, que es la distancia entre lo que uno cree y lo que sale.
>
> Las dos excepciones no son descuidos y conviene que se vean. `R-05` dice **Se cumple** porque su comprobación corre en CI y se la ha visto fallar, así que no hay nada que contrastar en el directo. `R-13` dice **No se puede comprobar**, que no es un estado pendiente sino una propiedad de la regla: ninguna comprobación sabe si un documento sigue siendo útil.

## Por qué existe este documento

El modelo mental del módulo: **una regla escrita en un fichero es una petición, no una garantía.** Se cumple lo bastante como para que dejes de comprobarla, y entonces deja de cumplirse sin que nadie se entere.

De ahí salen dos cosas distintas que conviene no mezclar:

- **El modo de fallo** es una propiedad de la regla. Se puede razonar sin mirar nada, y se declara en [`CLAUDE.md`](../CLAUDE.md). Decide en qué capa tiene que vivir la regla: lo ruidoso puede quedarse escrito, lo silencioso hay que bajarlo a algo que lo ejecute.
- **El estado** es empírico. Solo sale contrastando la regla contra el repositorio, y vive aquí.

Escribir la primera y dar por hecha la segunda es exactamente cómo un fichero de reglas acaba siendo una lista de buenas intenciones. Este repositorio ya tiene el caso documentado: la regla de arrastre de hallazgos se escribió y se incumplió **el mismo día**, en la primera tabla que la aplicaba. Es [H-22](hallazgos.md).

## 1 · El priming

Las tres que se llevan al directo, con la intuición **antes** de comprobar nada.

| Regla | Modo de fallo | Intuición |
|---|---|---|
| Un bug no se cierra sin reproducirlo en E2E, y deja una prueba detrás | Silencioso | `casi nunca` |
| Al índice se va por nombre: nunca `git add -A` ni `git add .` | Silencioso, pero auditable | `casi siempre` |
| Los hooks no se saltan: nada de `--no-verify` | Ruidoso | `siempre` |

La intuición es de renelo y se anotó sin mirar el repositorio, que es la condición del ejercicio.

Las tres salen de `~/.claude/CLAUDE.md` y `~/OPINIONS.md`. **No están en el README de ningún proyecto suyo**, y eso ya es un hallazgo: son reglas de proceso reales, aplicadas a todos sus repositorios, escritas una sola vez en un fichero global que ninguno de esos repositorios declara ni comprueba. Una petición, heredada en silencio, verificada en ninguna parte.

## 2 · Todas las reglas del repositorio

Catorce en total: siete del ciclo de trabajo, que venían del curso o salieron de los módulos anteriores, y siete de calidad del cambio -seis traídas de los proyectos de renelo para poder contrastarlas, y una que sale de la cicatriz de este repositorio.

### Ciclo de trabajo

| # | Regla | Modo de fallo | Qué la ejecutaría | Estado |
|---|---|---|---|---|
| R-01 | Rama nueva antes de tocar código; nunca commitear directo en `main`/`sN/*` | Silencioso | Un hook de `pre-commit` que mire la rama | *pendiente* |
| R-02 | Al cerrar la tarea, `/commit` y luego `gh pr create` con descripción completa | Ruidoso | Nada. Se nota porque no hay PR | *pendiente* |
| R-03 | Pasar el `adversarial-reviewer` sobre el PR antes de darlo por terminado | **Silencioso** | Escrito, sin verificar: `.github/workflows/revision-adversarial.yml`, calibrado en `.github/calibracion-revision.md`. No bloquea a propósito | *pendiente* |
| R-04 | No repetir el resumen del PR en el chat | Ruidoso | Nada. Es de estilo | *pendiente* |
| R-05 | Un cambio en rutas, controladores o validadores cierra con `openapi.yaml` al día y `verificar-docs.mjs` ejecutado | **Silencioso** | Ya ejecutado: `scripts/verificar-docs.mjs` en CI | **Se cumple** |
| R-06 | Verificar por código de salida, nunca por la última línea impresa | **Silencioso** | Nada lo comprueba. Es una forma de mirar | *pendiente* |
| R-07 | `hallazgos.md` se arrastra entre ramas y se comprueba entrada a entrada | **Silencioso** | Parcialmente ejecutado: la comprobación exige la sección «Lo que se arrastra» con su tabla | *pendiente* |

### Calidad del cambio

| # | Regla | Modo de fallo | Qué la ejecutaría | Estado |
|---|---|---|---|---|
| R-08 | Un bug no se cierra sin reproducirlo en E2E, y deja una prueba detrás | **Silencioso** | Nada hoy | *pendiente* |
| R-09 | Al índice se va por nombre | Silencioso, auditable | El historial ya lo registra; falta quien lo lea | *pendiente* |
| R-10 | Los hooks no se saltan | Ruidoso | El propio hook, más el historial | *pendiente* |
| R-11 | Todo atajo se escribe como deuda técnica | **Silencioso**, y el que más decae | Nada hoy | *pendiente* |
| R-12 | Un lint, test fallando o flaky se arreglan aunque no los hayas causado | **Silencioso** | CI lo ejecuta para lo que corre en CI, y nada para lo demás | *pendiente* |
| R-13 | La documentación desactualizada es peor que no tenerla | **No comprobable** | Nada puede. Ver abajo | **No se puede comprobar** |
| R-14 | Una comprobación cuenta cuando se la ha visto fallar | **Peor que silencioso**: da una garantía que no existe | Nada automático. Se ejecuta mutando a mano y mirando el rojo | *pendiente* |

## 3 · La tercera categoría, que es la que se olvida

R-13 no está pendiente de comprobar: **no se puede comprobar**, y decirlo es más honesto que dejarla como aspiración.

Ninguna comprobación sabe si un documento sigue siendo útil. Sabe si sigue **coincidiendo con el código**, que es otra cosa, y es exactamente lo que hace `scripts/verificar-docs.mjs` con sus diecisiete comprobaciones -las del verificador, que no tienen que ver con las catorce reglas de la tabla de arriba. Un documento puede coincidir con el código al milímetro y no servirle a nadie.

Lo mismo vale para R-04, en pequeño: «no repitas el resumen en el chat» es una regla sobre lo que se dice, y no hay repositorio donde mirarlo.

Distinguir las tres categorías -se cumple, no se cumple, no se puede comprobar- es lo que impide que la auditoría termine en una lista de deberes. Una regla que no se puede comprobar no es una regla rota: es una regla que depende de criterio, y lo que hay que decidir es si eso basta.

## 4 · El aviso que este repositorio ya se ha ganado

Bajar una regla a un guardarraíl **no la garantiza tampoco**.

El 2026-09-02, la quinta revisión adversarial demostró que dos de las comprobaciones de `verificar-docs.mjs` daban luz verde a mutaciones reales: encender el volcado de depuración con `|| !app.inTest` y sustituir la tabla de arrastre entera por la frase «esta vez no hace falta la tabla». Las dos pasaban en verde. Era la quinta pasada consecutiva en que la mutación con la que se había probado una comprobación era la que esa comprobación ya cubría por construcción.

Así que la columna «Qué la ejecutaría» tiene una condición que no se ve en la tabla: **una comprobación cuenta cuando se la ha visto fallar a propósito**, no cuando existe. Es lo que [ADR-0004](adr/0004-la-documentacion-se-verifica-no-se-regenera.md) dice desde el Módulo 4, escrito antes de saber cuántas veces íbamos a necesitarlo.

Esa condición es ahora **R-14**, y es la única regla de la tabla que no viene ni del curso ni de los proyectos de renelo: sale de esta cicatriz. Estaba escrita en un ADR como consecuencia de una decisión, que es un sitio donde nadie va a buscarla al añadir una comprobación nueva. Subirla a las reglas de proceso es, literalmente, el movimiento que el módulo describe: coger lo que falla en silencio y ponerlo donde se ejecuta.

Su modo de fallo es el peor de los catorce. Las demás, cuando fallan, dejan el trabajo sin hacer. Esta, cuando falla, deja el trabajo **aparentemente hecho**: una comprobación en verde que no comprueba nada es peor que no tenerla, porque quien la ve deja de mirar.

## 4 bis · R-03, el primer intento de bajar una regla a la capa que la ejecuta

`R-03` -pasar el revisor adversarial sobre el PR- es el caso más limpio de regla con modo de fallo silencioso: si nadie lo lanza, el PR se ve idéntico y la build sigue verde.

El 2026-09-02 se le puso un job de CI al lado: `.github/workflows/revision-adversarial.yml`, con su calibración en `.github/calibracion-revision.md`.

**Y su estado sigue siendo `pendiente`, no `se cumple`.** Por R-14: está escrito y no se le ha visto funcionar. Faltan la credencial -`CLAUDE_CODE_OAUTH_TOKEN`, que sale de `claude setup-token` y va contra la suscripción- y una prueba con un defecto plantado que confirme que el informe lo nombra.

Marcarlo como resuelto porque existe el fichero sería el error exacto que este documento describe, cometido en el documento que lo describe. Ya pasó una vez con H-22.

Dos decisiones del job que conviene tener presentes al auditarlo:

- **No bloquea.** Lo determinista bloquea; el revisor informa. Un revisor no determinista que tumba la build se desactiva la primera vez que se equivoca con prisa, y entonces no queda ni revisor ni build.
- **No dispara solo con `pull_request`.** Nuestros PR son cross-repo, así que ese evento lo recibe el repositorio del curso y no este, y además los PR desde un fork no reciben secretos. Un job con ese disparador solo habría quedado presente e inerte, que es la peor forma de guardarraíl.

## 5 · Cómo se rellena la columna de estado

Durante el directo, y con evidencia, no de memoria. Para cada regla:

1. **Buscar en el repositorio lo que la regla predice.** Si dice que cada bug deja una prueba, los commits de arreglo tienen que traer un fichero de pruebas tocado.
2. **Contar los casos, no dar una impresión.** «Casi siempre» sin número es la respuesta que este ejercicio existe para desmontar.
3. **Anotar la distancia con la intuición**, que es lo que enseña. Si coinciden, la regla probablemente tenía un modo de fallo ruidoso; si no coinciden, era silencioso y estaba en la capa equivocada.
4. **Decidir qué hacer con cada una**: bajarla a una comprobación, reescribirla para que sea comprobable, o retirarla. Una regla que nadie cumple y nadie va a ejecutar no es una regla, es ruido en el fichero de instrucciones.
