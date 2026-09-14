# El revisor adversarial en CI

> Qué hace el job, qué falta para que funcione, y por qué **no usamos la acción oficial** aunque sea lo que hizo el directo.
>
> Escrito el 2026-09-08 en la Demo 3 del Módulo 5, y actualizado el 09 con la credencial puesta y el revisor visto morder.

## Qué hay montado

`.github/workflows/revision-adversarial.yml` lanza a Claude sobre cada cambio propuesto y publica el informe en el PR, o en el resumen del job si el PR vive en otro repositorio.

| | |
|---|---|
| **Instrucciones** | `.claude/agents/adversarial-reviewer.md`, sin su frontmatter |
| **Calibración** | [`REVIEW.md`](../REVIEW.md), en la raíz. Una pantalla |
| **El porqué de cada decisión** | [`.github/calibracion-revision.md`](../.github/calibracion-revision.md). **No se inyecta** |
| **Herramientas** | `Read`, `Grep`, `Glob`. Todo lo que escribe o sale a la red va negado explícitamente |
| **Modelo** | `--model sonnet --effort medium`. Las dos palancas de coste, con los valores que pide el módulo |
| **Topes** | `--max-turns 40` turnos del modelo y `timeout-minutes: 10` de reloj del runner. **Son dos cosas distintas**: el primero no impide que el job se cuelgue |
| **Bloquea** | **No.** Lo determinista bloquea; el revisor informa |

El diff se calcula en el runner y se le entrega **ya escrito en un fichero**, así que el revisor no necesita shell para verlo. Es la defensa que sigue en pie aunque falle cualquier otra.

## Las dos credenciales, y no se mezclan

| Secreto | De dónde sale | Contrapartida |
|---|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | `claude setup-token` en local, contra la suscripción | No hay factura por token, pero **gasta la misma cuota que usas para trabajar** |
| `ANTHROPIC_API_KEY` | `console.anthropic.com` | Se factura aparte. Es lo correcto el día que esto deje de ser de una persona |

**Cruzarlas falla en la primera llamada, sin gastar nada y sin decir por qué.**

**Lo que no sirve**: OpenRouter, Cline, o cualquier otro proveedor. El CLI de Claude Code autentica contra Anthropic, Bedrock, Vertex o Foundry, y nada más. Cline no es un proveedor: es una extensión que consume claves que ya tengas.

### El secreto, puesto el 2026-09-09

```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo rene2bcore/flowsync-ai4devs
```

Va en el **fork**, no en el repositorio del curso, y no hace falta GitHub App porque no usamos la acción oficial.

Mientras no existía, el job **se omitía en verde** y lo decía en el resumen. La asimetría es deliberada: sin configurar es un estado esperado; configurado y roto sale **rojo**, porque entonces alguien cuenta con una revisión que no se ejecuta.

**Las dos mitades están comprobadas.** La segunda se provocó sola el mismo día: con la credencial puesta, [H-28](hallazgos.md) puso el job en rojo tres veces seguidas -lista de negación inválida, turnos agotados- y cada rojo llevaba su diagnóstico. Funcionó como se diseñó.

## Por qué no la acción oficial

El directo usa `anthropics/claude-code-action@v1`, que publica comentarios **en línea** sobre la línea que los provoca, firmados por la GitHub App de Claude. Es mejor que lo nuestro en todo menos en una cosa, y esa cosa nos deja fuera.

**La acción oficial necesita que el PR viva en el repositorio donde está instalada.** Los nuestros no:

| | Nuestro caso |
|---|---|
| El PR vive en | `LIDR-academy/flowsync-ai4devs` |
| El código vive en | `rene2bcore/flowsync-ai4devs` |
| ¿Podemos instalar la GitHub App en el repo del curso? | **No.** No somos administradores |
| ¿Recibe secretos un `pull_request` desde un fork? | **No.** Es una decisión de seguridad de GitHub |
| ¿Corre siquiera el workflow allí? | **No.** Todas sus ejecuciones en `action_required`, ninguna aprobada. Es [H-24](hallazgos.md), que da la cifra con fecha y el comando que la mide |

Por eso nuestro job dispara en **`push`** y busca si esa rama tiene un PR abierto arriba, en vez de esperar un evento `pull_request` que nunca llega con permisos. Es más feo y es lo que funciona.

**El día que esto deje de ser un fork, la acción oficial es la opción correcta**, y entonces hay que saber lo siguiente.

## La trampa del OIDC, que nos costará el día que cambiemos

Es el hallazgo más valioso del directo y el que más se parece a lo que este repositorio persigue.

La acción oficial cambia el token OIDC del workflow por uno efímero de la GitHub App. Para eso, Actions valida que el fichero del workflow **exista en la rama por defecto**. Si el workflow es nuevo y todavía no está en `main`:

| ¿Se pasó `github_token`? | Qué pasa |
|---|---|
| **No** | La validación OIDC no encuentra el fichero en `main` → **el job se salta a sí mismo**. Sale **verde**, y no revisa nada |
| **Sí** | El token directo no pasa por OIDC → corre y publica los comentarios |

**Verde sin haber revisado nada** es exactamente el modo de fallo que [R-14](auditoria-reglas-de-proceso.md) describe: una comprobación que da una garantía que no existe. El fix es una línea, `github_token: ${{ secrets.GITHUB_TOKEN }}`, y el motivo de que exista la validación es bueno: sin ella, cualquiera podría meter un workflow con permisos elevados y ejecutarlo antes de que nadie lo revise.

**Y nuestro job tuvo esa misma forma de fallo hasta el 2026-09-09**, por dos motivos apilados: primero la falta de credencial, y detrás [H-27](hallazgos.md), una consulta que nunca encontraba el PR. Diez ejecuciones verdes y **ninguna había revisado nada**. La diferencia era que la nuestra lo decía en el resumen, lo que la hacía menos grave, no correcta.

## Visto funcionar, el 2026-09-09

Por R-14, en dos pasos, y ninguna revisión contaba hasta el segundo. Los dos están hechos.

1. **Credencial puesta.** `claude setup-token` y `gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo rene2bcore/flowsync-ai4devs`. El job dejó de omitirse y ejecutó sus siete pasos.
2. **Visto morder.** Rama `test/ver-morder-al-revisor` con la tercera condición de `isOverdueOn` quitada, que es [H-15](hallazgos.md), abierta como PR en el fork. El informe la nombró en `backend/app/models/task.ts:75-78`, citó los escenarios rotos de `openspec/specs/tasks/spec.md` y dio el caso concreto: tarea `done` con fecha pasada devuelve `isOverdue: true` con `200`.

**Y encontró un segundo grave que no estaba plantado**: el docblock de `:58-59` seguía prometiendo tres condiciones. Cuarenta segundos, muy por debajo del tope.

Lo que la prueba descarta, y era la duda de diseño: que la regla de «no reportar lo que ya vigila otra comprobación» le hiciera callar. El verificador y dos pruebas estaban en rojo por lo mismo, y aun así reportó, porque contrastó contra la spec y no contra la suite.

## En qué se va el dinero

Dos partidas, y solo la segunda es nueva: **minutos de máquina** y **consumo del modelo**. Escala con el tamaño del diff y con cuántas veces corre.

`concurrency` cancela la revisión anterior cuando llega un push nuevo, y la puerta sale antes de gastar nada si la rama no tiene PR. Con la suscripción, el presupuesto deja de ser dinero y pasa a ser **atención propia**: cada revisión inútil se paga en cuota que ibas a usar tú.

Precios oficiales en [claude.com/pricing](https://claude.com/pricing). No se copian cifras aquí: envejecen sin que nadie se entere.

## Dónde nos separamos del prompt del módulo, y por qué

El módulo pide construir el revisor **con la acción oficial** `anthropics/claude-code-action`. Aquí se usa el CLI `claude -p` en un paso propio. Es la única desviación de fondo y no es preferencia:

| Lo que pide el módulo | Lo que hicimos | Motivo |
|---|---|---|
| Acción oficial | `claude -p` en un `run` | La acción exige que el PR viva donde está instalada la GitHub App. El nuestro vive en `LIDR-academy`, donde no somos administradores |
| Disparar en `pull_request` | Disparar también en `push` + buscar el PR arriba | Un `pull_request` desde un fork no recibe secretos, y en el repositorio del curso el workflow ni siquiera corre: [H-24](hallazgos.md) |
| Publicar los hallazgos como comentarios | Se intenta, y si el PR vive en otro repositorio cae al resumen del job | El token de nuestro repositorio no puede comentar allí. **Aceptado así el 2026-09-13**: cambiarlo depende de H-24 |

**El propio material del módulo anticipa la causa**: «en un repositorio público, un cambio propuesto desde un fork no recibe los secretos... tu revisor no va a correr sobre tu propio cambio propuesto. No está roto: está funcionando como debe.» Lo que hicimos es tomar esa consecuencia y buscarle una vuelta -el disparador `push`- en vez de dejar el guardarraíl presente e inerte.

Todo lo demás va con los valores exactos que pide: `--model sonnet`, `--effort medium`, `--max-turns 40`, `timeout-minutes: 10`, herramientas de lectura, y la credencial desde un secreto.

## Lo que el directo propone y aquí queda como propuesta

**Tres revisores en cascada** en vez de uno: el adversarial encuentra, un segundo descarta falsos positivos, y un tercero prioriza qué aplica solo y qué necesita criterio humano. El argumento de fondo es que el cuello de botella ya no es escribir código sino verificarlo.

El primero ya se ha visto morder, así que el argumento que lo bloqueaba ha caído. Sigue sin implementarse por otro, más débil pero honesto: **lleva dos hallazgos en dos ejecuciones, y con eso no hay nada que priorizar ni falsos positivos que descartar**. Un verificador de falsos positivos necesita falsos positivos que ver.

**Revisado el 2026-09-13, con muchas más ejecuciones delante, y la decisión se mantiene: aplazada.** En la unidad `feat/sesion-5-guardarrailes` el revisor dio **dos graves, los dos reales** y reproducidos antes de arreglarlos (H-35 y H-38), y un puñado de menores casi todos reales: uno repetido tres veces y uno cosmético. **Ningún grave falso.** El segundo revisor de la cascada existiría para filtrar falsos positivos, y no los hay; el tercero, para priorizar, y con dos graves al mes se prioriza leyendo. Se reabre si aparecen graves falsos, que es la señal que la haría rentable.

**La credencial rota, provocada el 2026-09-13.** Con un valor inválido en `CLAUDE_CODE_OAUTH_TOKEN`, el job sale **rojo** con `401 Invalid bearer token`, y con el token real vuelve a verde con informe. La asimetría de arriba está vista en sus dos mitades también con la credencial configurada. Y la prueba encontró [H-39](hallazgos.md): el log tenía el diagnóstico, pero el resumen del job lo daba vacío.

Lo que queda sin ver es un token **caducado**, que debería llegar como el mismo 401. Detalle en `.github/calibracion-revision.md`.
