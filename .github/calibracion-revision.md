# Calibración de la revisión adversarial

> Qué se considera grave, cuántas sugerencias menores caben, y por qué esta revisión **no bloquea**.
>
> Un guardarraíl no muere fallando. Muere acertando sobre cosas que a nadie le importaban, hasta que nadie lo lee. Este fichero existe para retrasar ese momento.
>
> **Desde el 2026-09-08 este documento no se inyecta al revisor.** Lo que se le pasa es [`REVIEW.md`](../REVIEW.md), en la raíz, que cabe en una pantalla y dice **qué** hacer. Aquí queda el **porqué**: de dónde sale el gasto, por qué no bloquea, y qué no se ha visto funcionar. Es para quien mantiene el job, no para el modelo.
>
> Separarlos es la lección de la Demo 3 del Módulo 5: un fichero largo diluye las reglas que importan. Ciento veintiocho líneas de razonamiento delante de siete categorías hacen que el modelo lea razonamiento. Si las dos listas de categorías dejan de coincidir, **manda `REVIEW.md`**, que es la que se ejecuta.

## Por qué no bloquea

Las comprobaciones deterministas de `verificacion.yml` -tipos, lint, las pruebas de backend y de frontend, los contrastes del verificador- **sí bloquean**, porque su respuesta no depende del día: o el contrato coincide con el código o no.

Esta no. Es un modelo leyendo un diff, y se equivoca. Un revisor no determinista que tumba la build se desactiva la primera vez que se equivoca con prisa, y entonces no queda ni revisor ni build.

Así que el reparto es: **lo determinista bloquea, el revisor informa.** Lo que decide si el revisor sirve no es su veredicto, es cuántos de sus hallazgos acaban en un cambio de código.

## Qué se considera grave

Solo estas cinco categorías. Un hallazgo que no encaje en ninguna es menor, por convincente que suene.

| Categoría | Qué cuenta |
|---|---|
| **Fuga de información** | Una respuesta, un log accesible o una URL que revele traza, SQL, rutas del disco, credenciales o datos de otra cuenta |
| **Autorización** | Una ruta que responda sin la sesión que exige, o que devuelva algo de una cuenta que no es la de quien pregunta |
| **Pérdida o corrupción de datos** | Una escritura que pise datos ajenos, una migración sin vuelta atrás que no lo declare, un borrado sin dueño claro |
| **Contrato roto en silencio** | La API devuelve algo que el contrato no documenta, o deja de devolver algo que sí. Con `200`, que es lo que lo hace silencioso |
| **Comprobación que no comprueba** | Una prueba o un contraste que pasa con el defecto puesto. Es R-14, y es la que más caro sale porque produce confianza falsa |

Fuera de esas cinco, **nada es grave**. En particular no lo son: estilo, nombres, comentarios, preferencias de estructura, «esto podría extraerse a una función», ni rendimiento sin un número que lo respalde.

## Cuántas sugerencias menores caben

**Tres por revisión, como máximo.** Las tres mejores, no las tres primeras.

Si hay más de tres, el revisor elige y dice cuántas descartó. Un informe de quince puntos menores no es más exhaustivo: es un informe que nadie va a leer entero, y el efecto real de publicarlo es que la próxima revisión tampoco se lea.

Sin hallazgos graves y sin nada menor que llegue al umbral, el informe correcto es **una línea diciendo que no hay nada**. Un revisor que nunca dice «no encontré nada» está inventando trabajo.

## Formato del informe

```markdown
### Graves
(o «Ninguno»)

**[Categoría]** · fichero:línea
Qué falla, y el caso concreto que lo provoca: entrada o estado -> resultado.
Daño · Radio (N sitios, listados) · Revert limpio · Precedencia. En blanco lo que no se confirme leyendo.

### Menores (máximo 3)
(o «Ninguno», y si se descartaron algunos, cuántos)

- fichero:línea · una frase
```

Sin preámbulo, sin resumen final, sin felicitaciones por el cambio.

## Qué se pide de cada hallazgo

**Un caso que lo provoque.** No «esto podría fallar si el usuario manda algo raro», sino qué hay que mandar y qué devuelve. Un hallazgo sin caso concreto es una sospecha, y las sospechas van en menores o no van.

**Contraste contra la spec, no contra el gusto.** El adversario no decide qué es un bug: lo decide `openspec/specs/`, `docs/api/openapi.json` y `CLAUDE.md`. Un comportamiento que ningún documento exige y ninguno prohíbe es un hueco de la spec, y eso se dice como tal.

## Presupuesto

Una ejecución por cambio propuesto, no por commit. `concurrency` cancela la revisión anterior cuando llega un push nuevo, y en `push` el job sale antes de gastar nada si la rama no tiene PR abierto.

**Y desde el 2026-09-09 se revisa una sola unidad de trabajo.** Si la rama de otro PR nuestro abierto es ancestro de esta, ese trabajo ya tuvo su revisión: la base pasa a ser esa rama y no la del pull request. En el caso que lo motivó bajó el diff de 5.173 a 1.934 líneas. Es [H-30](../docs/hallazgos.md), y el ahorro no es solo de turnos: **pagar por revisar dos veces el mismo trabajo es la forma más rápida de que las revisiones dejen de leerse**.

`--max-turns 40` es el tope duro. Si una revisión lo agota, el problema es el tamaño del diff, no el tope.

### De dónde sale el gasto

El job acepta dos credenciales, y **no son equivalentes**:

| Secreto | De dónde sale | Contrapartida |
|---|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | `claude setup-token`, contra la suscripción | No hay factura por token. **Pero el gasto sale de la misma cuota que usas para trabajar**: una revisión larga en CI te deja con menos sesión interactiva ese día |
| `ANTHROPIC_API_KEY` | Consola de Anthropic | Se factura aparte y no toca la cuota personal. Es lo correcto el día que esto deje de ser un proyecto de una persona |

Con la suscripción, el presupuesto de este fichero deja de ser una cuestión de dinero y pasa a ser una de **atención propia**, que es más escasa. Por eso el tope de tres sugerencias menores y la puerta que evita revisar ramas sin PR importan más aquí que con una API key: cada revisión inútil se paga en cuota que ibas a usar tú.

### El token caduca

`claude setup-token` da un token de larga duración, no eterno. Cuando expire, la credencial seguirá **presente** en el repositorio y dejará de valer.

El job distingue los dos casos a propósito:

- **Sin credencial** → se omite, verde, una línea en el resumen. Es un estado esperado.
- **Con credencial y fallando** → **rojo**, con el error en el resumen.

La asimetría es deliberada. Un rojo por algo que nunca se configuró enseña a ignorar el rojo. Un verde silencioso cuando la revisión que sí configuraste dejó de ejecutarse es peor: es un guardarraíl que desapareció sin avisar, y alguien sigue contando con él.

## Criterio de priorización

> Desde el 2026-09-13, de la Sesión 6 del curso. Aplica a lo que devuelve el revisor y a cualquier auditoría sobre código existente.

El revisor no ordena por «criticidad»: ese es el criterio que inventa quien no tiene otro, y seis corridas del mismo prompt sobre el mismo código dieron seis órdenes distintos, todos defendibles. Lo que se le pide son las **cuatro casillas** de `REVIEW.md` -daño, radio contado, reversibilidad, precedencia- y el orden lo pone este fichero, no el modelo:

1. **Precedencia primero, en orden topológico.** Si el arreglo de A abarata el de B, A va antes. No es un juicio de gravedad.
2. **Dentro de cada nivel, daño ÷ radio.** Daño entre número de sitios a tocar, no daño a secas: un daño grande en un sitio va antes que el mismo daño repartido en diez.
3. **El negocio desempata.** Lo que el modelo no tiene: en un banco, una fuga de datos va antes que una caída; en un blog, quizá al revés. Aquí, con cuentas y tareas de equipo, **una fuga de datos ajenos va antes que una caída**: H-17 y H-25 fueron primero por eso.
4. **Contención antes que arreglo cuando el arreglo no cabe.** Dos filas: la contención es lo que se despliega hoy y revierte limpio; el arreglo es el deber ser, a menudo caro. Se decide cuál va, no lo decide el modelo. H-19 se cerró en dos pasos así.

Lo que no entra en la tabla: propuestas sin medir (cachear, paginar, «esto podría ser N+1»). Van a un apartado aparte o no van.

**Se delega la ejecución del diagnóstico, nunca el criterio ni la decisión.** Aprobar el orden que devuelve el modelo porque «es buen modelo» es delegar la decisión, no el diagnóstico.

## Cómo se mide si esto sirve

Una sola métrica: **cuántos hallazgos acaban en un cambio de código.**

No cuántos produce. Un revisor que devuelve veinte cosas ciertas y ninguna accionable ha fallado, aunque las veinte sean verdad.

De referencia, las cinco revisiones manuales del Módulo 4: las cinco encontraron algo real y las cinco terminaron en código. Ese es el listón que la versión automática tiene que sostener, y si baja, lo que hay que revisar es esta calibración, no el modelo.

## Estado: verificado el 2026-09-09

**Esta comprobación ya cuenta** (R-14). Se le ha visto morder.

### La prueba con un defecto plantado

Rama `test/ver-morder-al-revisor`, [PR rene2bcore#2](https://github.com/rene2bcore/flowsync-ai4devs/pull/2), cerrado sin fusionar. Se quitó la tercera condición de `isOverdueOn`, que es [H-15](../docs/hallazgos.md), y se abrió el cambio como pull request.

**El revisor lo nombró**, y con lo que la calibración le exige:

| Qué se le pedía | Qué hizo |
|---|---|
| Citar `fichero:línea` leída | `backend/app/models/task.ts:75-78` |
| Nombrar el escenario roto | `openspec/specs/tasks/spec.md:392`, y los escenarios de `:416-417` y `:419-422` |
| Dar un caso concreto | Tarea `done` con `dueDate` anterior → `GET /tasks/:id` devuelve `isOverdue: true` con `200` |
| Una línea si no hay menores | «Ninguno», diciendo que no descartó ninguno |

**Y encontró un segundo grave que no estaba plantado**: el docblock de `:58-59` seguía prometiendo tres condiciones mientras el código comprobaba dos. Es la categoría «comentario que miente», y es exactamente la forma que tenía H-15 la primera vez.

Cuarenta segundos de ejecución, muy por debajo del tope de diez minutos y de los cuarenta turnos.

**Lo que esto descarta**, y era la duda real: que la regla de «no reportar lo que ya vigila otra comprobación» le hiciera callar. Las dos capas deterministas estaban en rojo -verificador y dos pruebas- y aun así reportó, porque lo que contrastó fue el código contra la spec, no contra la suite.

### Lo que se había visto antes de eso

Primera ejecución, `2026-09-02`, [run 33669154850](https://github.com/rene2bcore/flowsync-ai4devs/actions/runs/33669154850), disparada por el push del propio commit que añade el workflow:

- El disparador `push` **dispara**, y el job arranca.
- La puerta detecta la ausencia de clave -`TIENE_CLAVE: false`- y **omite la revisión sin fallar**: verde en 7 segundos, con su línea en el resumen.

Eso verifica la decisión que más me preocupaba del diseño: que un secreto ausente no deje el job en rojo. Un rojo por falta de configuración enseña a ignorar el rojo.

### Lo que no se ha visto

Todo lo demás, y es la mayor parte:

| Qué | Por qué no |
|---|---|
| ~~La detección del PR abierto en el repositorio del curso~~ | **Vista** desde el arreglo de H-27: cada push de la rama de 2026-09-12 y 13 encontró el PR y disparó la revisión |
| ~~La invocación de `claude -p` con sus flags~~ | **Vista** en todas esas ejecuciones |
| Que `--disallowed-tools` acote de verdad al revisor | **Sigue sin verse aplicarse**: el revisor nunca ha intentado usar una herramienta negada. La defensa que sí está en pie es que el diff se entrega en un fichero, así que no necesita shell |
| ~~Que `CLAUDE_CODE_OAUTH_TOKEN` autentique al CLI en el runner~~ | **Visto** desde el 2026-09-09 |
| ~~La extracción del prompt desde `.claude/agents/`~~ | **Vista** en el runner |
| ~~La publicación del informe, y su caída al resumen cuando el PR vive en otro repositorio~~ | **Vista** el 2026-09-09: no llega al PR del curso y cae al resumen del job |
| ~~Que el revisor encuentre algo~~ | **Visto el 2026-09-09.** Ver arriba |

### Qué queda

Los dos pasos que faltaban -la credencial y verla morder- están hechos. `R-03` deja de ser una petición con un job al lado.

Lo que no está probado y conviene no dar por hecho:

- ~~Que una credencial rota se vea en rojo.~~ **Provocado el 2026-09-13**, tras haber decidido no hacerlo esa misma mañana. Con `token-invalido-paso-17` en el secreto, el paso «Revisar» sale con `exit 1` y `401 Invalid bearer token` en el log (ejecuciones `34788613655` y `34789313285`); con el token real, verde y con informe (`34789571139`). **Y destapó H-39**: el resumen del job daba el diagnóstico vacío. Lo que se probó es un token **inválido**, no uno **caducado**: los dos deberían llegar como 401 al mismo paso, pero el caducado no se ha visto.
  **Y la primera vez salió verde**, porque el valor inválido no se había guardado: el secreto seguía fechado el 2026-09-09. Antes de leer un resultado, se comprueba que el cambio se aplicó.
- **Que el informe llegue al PR del curso.** Comprobado el 2026-09-09: **no llega**. El token de nuestro repositorio no puede comentar en `LIDR-academy`, así que el informe cae al resumen del job, que es lo que el diseño ya preveía. **Aceptado así el 2026-09-13**: arreglarlo exige que el PR viva en un repositorio donde tengamos permisos, que es H-24.
- ~~Que la puerta acierte al decir «no hay nada que revisar».~~ Arreglada con H-27 y **vista disparar por `push`** en cada empujón de 2026-09-12 y 13.

### Cuántos de sus hallazgos acaban en código

Es **la** métrica de este fichero, y ya no es cero.

| Ejecución | Qué encontró | ¿Acabó en código? |
|---|---|---|
| Defecto plantado, `pull_request` | H-15 con su `fichero:línea`, más el docblock que mentía | El plantado se revirtió; el docblock era del propio defecto |
| **Primera real, `push`** | **[H-29](../docs/hallazgos.md)**: dos comprobaciones del verificador que un comentario satisfacía | **Sí.** Las dos leen ahora con `leerCodigo()` |

### Los dos números

El presupuesto de verificación, por corrida: cuántos hallazgos devolvió y cuántos se comprobaron a mano abriendo el código. El segundo es el ancho de banda real; el primero crece gratis.

| Corrida | Devueltos | Comprobados a mano | Reales |
|---|---:|---:|---:|
| Módulo 2, auditoría inicial (H-01 a H-10) | 10 | 10 | 10 |
| Módulo 4, siete revisiones adversariales manuales | 9 graves | 9 | 9 |
| `feat/sesion-5-guardarrailes`, revisor en CI, 2026-09-08 al 13 | 2 graves, ~8 menores | 2 graves, 8 menores | 2 graves (H-35, H-38), 6 menores |

Lo que dice la tabla: hasta hoy se ha comprobado **todo** lo devuelto, porque las listas eran cortas. El día que una corrida devuelva treinta, esta tabla es donde se escribe cuántos se miraron y cuántos no, y los no mirados no se dan por falsos ni por ciertos.

**Dos de dos**, y la segunda es la que cuenta: nadie le plantó nada, y encontró en el verificador el mismo defecto que la cabecera de ese fichero advierte treinta líneas más arriba.
