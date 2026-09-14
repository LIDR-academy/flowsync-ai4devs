# Auditoría de las reglas de proceso

> Qué reglas declara este repositorio, cuáles se cumplen, cuáles no, y cuáles **no se pueden comprobar**.
>
> Preparado el 2026-09-02, antes del directo del Módulo 5. **Rellenado el 2026-09-08**, con la sesión ya vista, contra el repositorio y contando casos.
>
> Hasta el 2026-09-08 la columna de estado iba **deliberadamente sin rellenar**, salvo dos filas: era el ejercicio de la sesión, y rellenarla antes destruye lo único interesante, que es la distancia entre lo que uno cree y lo que sale. Esa distancia está ahora medida y en la sección 1 bis.
>
> **Una de las dos excepciones era falsa, y es el primer hallazgo del ejercicio.** `R-05` decía **Se cumple** porque «su comprobación corre en CI y se la ha visto fallar, así que no hay nada que contrastar en el directo». Corre en CI **solo en nuestro fork y solo sobre `push`**; sobre el pull request **ninguna de sus ejecuciones ha llegado a ejecutarse**. Y el job **nunca se había visto en rojo**: las mutaciones se hicieron en local. Es [H-24](hallazgos.md), que ese mismo día quedó mitigado abriendo el cambio también como PR dentro del fork -y ahí el job se puso en rojo a la primera, por un defecto que el verde local no veía-. La otra excepción, `R-13`, sigue en pie: **No se puede comprobar** no es un estado pendiente sino una propiedad de la regla.
>
> **Cómo se rellenó.** Con `git log`, `git rev-list` y `gh run list` sobre los **61 commits nuestros** -los que no están en ninguna rama del curso- y las **82 ejecuciones de CI** de los dos repositorios. Donde no hay rastro comprobable, se dice; no se rellena con impresión.

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

Cómo se anotaron, que en este documento importa: las tres palabras **las propuso Claude** a partir de los ficheros de renelo, y renelo las aceptó tal cual el 2026-09-02. Ninguno de los dos miró el repositorio antes, que es la condición del ejercicio.

Se dice porque una intuición prestada y una propia se contrastan igual pero **no enseñan lo mismo**: si al comprobar coinciden, no sabremos si acertó la intuición o el modelo. Anotarlo ahora es lo que permite decirlo después.

Las tres salen de `~/.claude/CLAUDE.md` y `~/OPINIONS.md`. **No están en el README de ningún proyecto suyo**, y eso ya es un hallazgo: son reglas de proceso reales, aplicadas a todos sus repositorios, escritas una sola vez en un fichero global que ninguno de esos repositorios declara ni comprueba. Una petición, heredada en silencio, verificada en ninguna parte.

## 1 bis · La distancia entre la intuición y la evidencia

Esto es lo que el ejercicio existía para producir, y por eso la columna estuvo seis días vacía.

| Regla | Intuición, 2026-09-02 | Evidencia, 2026-09-08 | Distancia |
|---|---|---|---|
| Un bug deja una prueba detrás | `casi nunca` | **10 de 12** commits `fix:` traen prueba | **Se falló entera, y por el lado optimista al revés**: se creía peor de lo que era |
| Al índice se va por nombre | `casi siempre` | **61 de 61**, sin una sola excepción | Acertada, y corta: era `siempre` |
| Los hooks no se saltan | `siempre` | Cierta, pero **no hay hooks que saltar** | Acertada por el motivo equivocado |

**Y el patrón que sale es exactamente el que predice el modo de fallo.**

La intuición acertó en las dos reglas cuyo incumplimiento **deja rastro o hace ruido** -el índice queda escrito en el historial para siempre, y saltarse un hook hay que teclearlo- y falló entera en la única de las tres con **modo de fallo silencioso**. No falló por pesimismo genérico: falló porque de una regla que nadie comprueba no se tiene información, solo sensación.

Ahí está el argumento del módulo en una línea: **sobre lo que falla en silencio, la intuición no es una estimación mala, es que no es una estimación.**

Un matiz que conviene no perder, porque cambia lo que enseña: **las tres palabras las propuso Claude** a partir de los ficheros de renelo, y renelo las aceptó. Así que lo que se ha medido no es la intuición de una persona sobre su propio proceso, sino la de un modelo leyendo sus reglas. Que fallara justo donde no hay rastro es coherente: no tenía nada que leer.

## 2 · Todas las reglas del repositorio

Catorce en total: siete del ciclo de trabajo, que venían del curso o salieron de los módulos anteriores, y siete de calidad del cambio -seis traídas de los proyectos de renelo para poder contrastarlas, y una que sale de la cicatriz de este repositorio.

### Ciclo de trabajo

| # | Regla | Modo de fallo | Qué la ejecutaría | Estado, con evidencia |
|---|---|---|---|---|
| R-01 | Rama nueva antes de tocar código; nunca commitear directo en `main`/`sN/*` | Silencioso | **Ejecutado desde el 2026-09-12**: `.githooks/pre-commit`, activado por el `npm install` y probado en CI por `scripts/probar-hook-rama.mjs` | **No se cumplía.** **45 commits nuestros** van directos sobre ramas `sN/*`: 12 en `s3/start` y 33 en `s4/start`. **Desde el hook no se puede incumplir sin teclear `--no-verify`**, que es R-10. Visto fallar en el clon real, con tres mutaciones del hook, y **en CI**: sin bit de ejecución, Linux ignora el hook y el paso se puso en rojo |
| R-02 | Al cerrar la tarea, `/commit` y luego `gh pr create` con descripción completa | Ruidoso | Nada. Se nota porque no hay PR | **Se cumple.** **6 unidades de trabajo, 6 PR**: #12, #14, #15, #21, #22 y #26. Ninguna se quedó sin abrir |
| R-03 | Pasar el `adversarial-reviewer` sobre el PR antes de darlo por terminado | **Silencioso** | Escrito, sin verificar: `.github/workflows/revision-adversarial.yml`, calibrado en `.github/calibracion-revision.md`. No bloquea a propósito | **Se cumple.** **8 revisiones** en local, todas con hallazgos reales, y desde el 2026-09-09 **también en CI**: con la credencial puesta, el job nombró un defecto plantado con su `fichero:línea` y el escenario roto, y encontró uno más que no estaba plantado. **Precisión medida en la unidad `feat/sesion-5-guardarrailes`, 2026-09-12**: 1 grave, confirmado y reproducido (H-35); 5 menores, 3 reproducidos y arreglados, 1 plausible y 1 cosmético. Ningún grave falso |
| R-04 | No repetir el resumen del PR en el chat | Ruidoso | Nada. Es de estilo | **Borrada el 2026-09-12.** No se podía comprobar -no hay repositorio donde mirarlo-, lo que protegía ya lo exige R-02 -la descripción completa vive en el PR- y el resto era estilo de respuesta que la configuración global de renelo ya pide |
| R-05 | Un cambio en rutas, controladores o validadores cierra con el contrato al día y `verificar-docs.mjs` ejecutado | **Silencioso** | Ya ejecutado: `scripts/verificar-docs.mjs` en CI | **Se cumple en local, y desde el 2026-09-08 también en un PR del fork.** El script muerde: sus comprobaciones se vieron fallar mutando. El **job se ha visto en rojo** sobre `pull_request`, y encontró un defecto que el verde local no veía. En el PR del curso sigue sin correr: todas en `action_required`, con la cifra y su fecha en [H-24](hallazgos.md) |
| R-06 | Verificar por código de salida, nunca por la última línea impresa | **Silencioso** | **La parte de CI, ejecutada desde el 2026-09-12**: el verificador exige `set -o pipefail` en todo `run:` con tubería, y está en el catálogo de mutaciones. En su primera ejecución encontró un paso escrito ese mismo día sin él. Lo local, nada | **En local no se puede comprobar desde el repositorio.** Hasta el 2026-09-12 la regla ni siquiera estaba en `CLAUDE.md`, solo en la guía de replicación. Ningún artefacto registra cómo se miró un resultado. Lo único que deja rastro son los mensajes de commit que citan la salida, y eso mide lo que se escribe, no lo que se hizo |
| R-07 | `hallazgos.md` se arrastra entre ramas y se comprueba entrada a entrada | **Silencioso** | Parcialmente ejecutado: la comprobación exige la sección «Lo que se arrastra» con su tabla, y **desde el 2026-09-12** el contraste de lo que tiene entrada en el catálogo de mutaciones se computa ejecutándolo en la rama nueva. Hasta ese día la regla no estaba en `CLAUDE.md` | **Se incumplió dos veces y luego se cumplió.** En `s3/start → s4/start` no cruzó: `hallazgos.md` no existía en la rama y tres arreglos se perdieron. En `s4/start → s5/start` se hizo fichero a fichero y **encontró nueve defectos vivos**. La primera tabla que aplicaba la regla la incumplió el mismo día: [H-22](hallazgos.md) |

### Calidad del cambio

| # | Regla | Modo de fallo | Qué la ejecutaría | Estado, con evidencia |
|---|---|---|---|---|
| R-08 | Un bug no se cierra sin reproducirlo en E2E, y deja una prueba detrás | **Silencioso** | **Ejecutado desde el 2026-09-12**, la mitad computable: `scripts/fix-con-prueba.mjs` en CI sobre cada push, con `Sin-prueba: <motivo>` como salida explícita. Probado por `scripts/probar-fix-con-prueba.mjs`, 10 casos y cuatro mutaciones | **Se incumplió justo después de declararse cumplida**: en la unidad `feat/sesion-5-guardarrailes`, **7 de 16** commits `fix:` dejan prueba o comprobación. Es [H-36](hallazgos.md). Lo que decía esta celda el 2026-09-08: **Se cumple casi siempre: 10 de 12.** De los commits `fix:`, diez tocan un fichero de prueba. Los dos que no: uno arregla una comprobación del verificador -su prueba es una mutación, que no es un fichero- y el otro es del Módulo 1, cuando **no había ni una prueba en el proyecto** |
| R-09 | Al índice se va por nombre | Silencioso, auditable | El historial ya lo registra; falta quien lo lea | **Se cumple.** En 61 commits, **cero ficheros que no debían entrar**: ni `docs/plans/`, ni `docs/propuestas-rene-lopez.md`, ni `backend/.env`, ni la base de desarrollo. Los dos `chore:` de «fuera del repositorio» tocan **solo `.gitignore`**: nunca hubo que sacar nada del índice |
| R-10 | Los hooks no se saltan | Ruidoso | El propio hook, más el historial | **Era vacuamente cierta: no había hooks de git**, y `--no-verify` no se saltaba nada. **Desde el 2026-09-12 tiene objeto**: saltarse `.githooks/pre-commit` es la única forma de commitear en `main` o en una `sN/*`. **Se conserva.** Si se cumple no se puede medir: `--no-verify` no deja rastro |
| R-11 | Todo atajo se escribe como deuda técnica | **Silencioso**, y el que más decae | Nada, salvo una clase: desde el 2026-09-12 un `fix:` sin prueba tiene que escribir su motivo en `Sin-prueba:` (R-08) | **Se cumple cuando alguien lo revisa, y no antes.** Lo que decía esta celda hasta el 2026-09-12, «Se cumple», era optimista: nueve `fix:` sin prueba -uno de ellos de ese mismo día, `cf4312b`- fueron atajos sin registrar hasta que H-36 los contó. Lo que sí tiene sitio declarado, y lo decía la celda: **Se cumple, y con formato propio.** Cada atajo tiene su sitio declarado: `hallazgos.md` para los defectos, la sección «Lo que no se ha visto» de `.github/calibracion-revision.md` para el revisor, y H-18 para lo que se archivó sin ejecutar. Nada de esto lo obliga una herramienta |
| R-12 | Un lint, test fallando o flaky se arreglan aunque no los hayas causado | **Silencioso** | CI lo ejecuta para lo que corre en CI, y nada para lo demás | **Se cumple, y por encima de lo que pide.** No solo se arreglaron rojos ajenos: se arreglaron **nueve defectos que ninguna herramienta señalaba** porque la suite estaba en verde. La parte no comprobable es la contraria: no hay forma de saber cuántos rojos se ignoraron antes de que existiera CI |
| R-13 | La documentación desactualizada es peor que no tenerla | **No comprobable** | Nada puede. Ver abajo | **No se puede comprobar** |
| R-14 | Una comprobación cuenta cuando se la ha visto fallar | **Peor que silencioso**: da una garantía que no existe | **Ejecutado desde el 2026-09-12**: `scripts/mutaciones.mjs`, job propio en `verificacion.yml`. Defectos que ya existieron, cada uno con las comprobaciones que tienen que caer nombrando su motivo; cuáles, con `--listar` | **Se cumple para lo que está en el catálogo, y solo para eso.** Antes: siete revisiones seguidas encontraron comprobaciones en verde sobre mutaciones reales, y los workflows no se habían visto en rojo nunca. **Los jobs ya sí**: el revisor mordió un defecto plantado el 2026-09-09, y `verificacion.yml` se puso en rojo el 2026-09-12 con tres ramas de mutación. El catálogo se vio fallar en sus tres modos: rojo por otro motivo, mutación que sobrevive y texto que ya no existe. **Lo que no cubre**: toda comprobación que nadie añada al catálogo |

## 2 bis · Qué se hace con cada una

El árbol de decisión de la sesión, aplicado a las catorce. Dos preguntas: **¿puede pasar meses sin que nadie note el incumplimiento?** y, si sí, **¿es computable?**

| # | ¿Meses sin notarse? | ¿Computable? | Qué se hace |
|---|---|---|---|
| R-01 · Rama por unidad de trabajo | **Sí**: 45 commits y nadie lo notó | **Sí, previniendo** | **Bajada** el 2026-09-12: hook de `pre-commit` que rechaza `main` y `sN/*`, y deja pasar un HEAD desacoplado para no romper un rebase |
| R-02 · `/commit` y `gh pr create` | No: se nota que no hay PR | — | **Conservar arriba**. 5 de 5 |
| R-03 · Adversarial sobre el PR | **Sí** | Su **ejecución** sí; su criterio no | **Bajada, y vista morder** el 2026-09-09. El criterio sigue siendo **conversación**, y el 2026-09-12 se decidió **conservarlo** en `REVIEW.md` con la precisión medida |
| R-04 · No repetir el resumen en el chat | No | No relevante | **Borrada** de `CLAUDE.md` el 2026-09-12. No protegía nada que R-02 no cubra y alargaba el contexto |
| R-05 · Contrato al día y verificador ejecutado | **Sí** | **Sí** | **Ya bajada, y rota**: [H-24](hallazgos.md). Arreglarla es el trabajo, no reclasificarla |
| R-06 · Verificar por código de salida | **Sí** | En local no. **En los workflows sí**: una tubería sin `pipefail` se ve leyendo el YAML | **Conversación** en local, **bajada** en CI el 2026-09-12, y subida a `CLAUDE.md` |
| R-07 · Arrastre de hallazgos entre ramas | **Sí**: costó nueve defectos | La **tabla** sí; el contraste, **para lo que está en el catálogo de mutaciones** | **Bajada a medias**, y desde el 2026-09-12 un poco más: el catálogo se ejecuta al saltar de rama. El resto, **conversación**, ya escrita en `CLAUDE.md` |
| R-08 · Un bug deja una prueba detrás | **Sí**: 9 de 16 en cuatro días, y nadie lo notó | **Sí**: un commit `fix:` que no toque una prueba es detectable | **Bajada** el 2026-09-12. Solo la mitad «deja una prueba»; «reproducirlo antes» sigue siendo conversación |
| R-09 · Al índice se va por nombre | Sí en teoría | Del pasado no; `.gitignore` cubre lo que importa | **Conservar arriba**. 61 de 61 |
| R-10 · Los hooks no se saltan | No: saltarlo hay que teclearlo | No: `--no-verify` no deja rastro en el commit | **Conservar arriba**, decidido el 2026-09-12. La propuesta era «borrar, o darle un objeto», y el hook de R-01 se lo dio: es la única salida que le queda a esa regla, y borrarla la dejaría sin nombre |
| R-11 · Todo atajo se escribe como deuda | **Sí**, y es el que más decae: H-36 | No, salvo la clase que cubre `Sin-prueba:` | **Conversación**, con el estado corregido el 2026-09-12 |
| R-12 · Lint, test fallando o flaky se arreglan | **Sí** | **Sí**: es CI | **Ya bajada**, con la misma avería que R-05 |
| R-13 · La doc desactualizada es peor que no tenerla | — | **No puede serlo** | Tercera categoría. Ver sección 3 |
| R-14 · Una comprobación cuenta cuando se la ha visto fallar | **Sí, y peor**: da garantía falsa | **Sí, y es lo interesante**: mutar y exigir rojo es programable | **Bajada** el 2026-09-12, con un catálogo de mutaciones en CI. Qué entra en el catálogo sigue siendo criterio |

**Cuentas de la clasificación**: 4 a bajar, 3 a conservar arriba, 4 a conversación, 1 a borrar, 2 ya bajadas y averiadas.

**Dónde está cada una el 2026-09-12**: **las 4 a bajar ya lo están** -R-03 el 2026-09-09; R-01, R-08 y R-14 el 2026-09-12-. R-10 salió de «borrar» cuando el hook de R-01 le dio objeto, y R-04 se borró: **no queda ninguna a borrar**. **Las 4 de conversación, decididas el 2026-09-12**: R-03 conserva su criterio en `REVIEW.md`, ya con precisión medida; R-06 y R-07 suben a `CLAUDE.md`, donde no estaban, y bajan cada una la parte que resultó computable -`pipefail` en los workflows y el catálogo de mutaciones al saltar de rama-; R-11 se queda como criterio, con su estado corregido.

### Dónde nuestra clasificación se separa de la del directo

**En la sesión, la regla de la rama fue a «conversación» por no ser computable: git no guarda la rama de autoría.** Eso es cierto **para auditar el pasado** y falso **para prevenir el futuro**. Un `pre-commit` que lea `git rev-parse --abbrev-ref HEAD` y rechace `main` y `sN/*` es tres líneas y determinista.

Son dos preguntas distintas y conviene no fundirlas:

| | Pregunta | R-01 |
|---|---|---|
| **Auditar** | ¿Se cumplió? | **No computable.** Un fast-forward con la rama borrada deja el mismo rastro que hacerlo bien |
| **Prevenir** | ¿Se puede impedir que se incumpla? | **Computable.** El hook mira la rama actual, que sí existe en el momento de commitear |

Nuestro caso es además **más fuerte que el del directo**: allí el veredicto fue «indicio fuerte, no demostrable», porque las ramas de trabajo podrían haber existido y haberse borrado. Aquí las ramas siguen existiendo y **los 45 commits están sobre `s3/start` y `s4/start`, no sobre ninguna rama de trabajo**. No es indicio, es la cuenta.

**Y R-14 no tiene equivalente en el directo**, porque no viene del curso: sale de esta cicatriz. Es la única regla cuyo incumplimiento produce **confianza falsa** en vez de trabajo sin hacer, y resulta ser computable. Mutar a propósito y exigir rojo es un script.

## 3 · La tercera categoría, que es la que se olvida

R-13 no está pendiente de comprobar: **no se puede comprobar**, y decirlo es más honesto que dejarla como aspiración.

Ninguna comprobación sabe si un documento sigue siendo útil. Sabe si sigue **coincidiendo con el código**, que es otra cosa, y es exactamente lo que hace `scripts/verificar-docs.mjs` con sus comprobaciones -las del verificador, que no tienen que ver con las catorce reglas de la tabla de arriba-. Un documento puede coincidir con el código al milímetro y no servirle a nadie.

Lo mismo valía para R-04, en pequeño: «no repitas el resumen en el chat» era una regla sobre lo que se dice, y no hay repositorio donde mirarlo. La diferencia con R-13 es que R-04 no protegía nada que otra regla no cubriera, y por eso se borró en vez de quedarse como criterio.

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

**Y su estado, ya contrastado, es «se cumple».** Los dos pasos que faltaban están hechos: la credencial `CLAUDE_CODE_OAUTH_TOKEN` se puso el 2026-09-09, y el job **se ha visto morder** sobre un defecto plantado -la tercera condición de `isOverdueOn`, que es H-15-. Lo nombró en `task.ts:75-78`, citó los escenarios rotos de la spec, y añadió un segundo grave que nadie había plantado: el docblock que seguía prometiendo tres condiciones.

Es la primera regla del repositorio que recorre el camino entero: **escrita → bajada a un job → vista fallar**. Las demás están en una de las dos primeras etapas.

Marcarlo como resuelto porque existe el fichero sería el error exacto que este documento describe, cometido en el documento que lo describe. Ya pasó una vez con H-22.

Dos decisiones del job que conviene tener presentes al auditarlo:

- **No bloquea.** Lo determinista bloquea; el revisor informa. Un revisor no determinista que tumba la build se desactiva la primera vez que se equivoca con prisa, y entonces no queda ni revisor ni build.
- **No dispara solo con `pull_request`.** Nuestros PR son cross-repo, así que ese evento lo recibe el repositorio del curso y no este, y además los PR desde un fork no reciben secretos. Un job con ese disparador solo habría quedado presente e inerte, que es la peor forma de guardarraíl.

## 5 · Cómo se rellenó la columna de estado

El 2026-09-08, con evidencia y no de memoria. Para cada regla:

> **Un aviso ganado el mismo día.** Las cifras de CI de la primera versión de esta tabla -16 y 10- salieron de `gh run list`, que **devuelve veinte filas por defecto**. Se contó una página, no los casos, en el documento que declara «contar los casos, no dar una impresión». Corregido a 35 y 47 con `--limit`, tras la octava revisión adversarial.
>
> Que el error viviera precisamente aquí no es casualidad: **el paso 2 es el más fácil de creer que has hecho.** Ejecutar el comando se siente como contar.

1. **Buscar en el repositorio lo que la regla predice.** Si dice que cada bug deja una prueba, los commits de arreglo tienen que traer un fichero de pruebas tocado.
2. **Contar los casos, no dar una impresión.** «Casi siempre» sin número es la respuesta que este ejercicio existe para desmontar.
3. **Anotar la distancia con la intuición**, que es lo que enseña. Si coinciden, la regla probablemente tenía un modo de fallo ruidoso; si no coinciden, era silencioso y estaba en la capa equivocada.
4. **Decidir qué hacer con cada una**: bajarla a una comprobación, reescribirla para que sea comprobable, o retirarla. Una regla que nadie cumple y nadie va a ejecutar no es una regla, es ruido en el fichero de instrucciones.
