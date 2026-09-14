# ADR-0007 · El contrato se genera, se versiona, y lo que se vigila es la deriva

## Estado

Aceptada · 2026-09-08

**Reemplaza en parte a [ADR-0004](0004-la-documentacion-se-verifica-no-se-regenera.md).** Sustituye su elección de un contrato escrito a mano; mantiene intacto su argumento central -el valor no está en el documento sino en lo que lo contrasta- y su corolario sobre la forma del 404, que sigue vigente.

## Contexto

Desde el 2026-09-02 este repositorio tenía **dos aproximaciones al contrato conviviendo**, y `CLAUDE.md` lo declaraba como algo que había que resolver, no dejar:

- La de ADR-0004, del Módulo 4: contrato **escrito a mano** en `docs/api/openapi.yaml` y contrastado por `scripts/verificar-docs.mjs`.
- La de `s5/start`: contrato **generado** desde los decoradores de `@foadonis/openapi` y servido en `/api`, `/api.json` y `/api.yaml`. Sin fichero en el repositorio.

Dos de los tres motivos por los que ADR-0004 descartó generar **ya no aplican en esta rama**:

| Motivo de ADR-0004 | Hoy |
|---|---|
| «Añade una dependencia y un provider» | Ya están instalados. La rama del curso los trae |
| «La regla depende de que el asistente la respete» | Deja de depender: esto es un job |
| «Un generador documenta lo que el código hace, no lo que debería» | **Sigue siendo cierto**, y es lo que decide la forma de esta decisión |

El Módulo 5 aporta la pieza que faltaba: **generar no basta y contrastar a mano tampoco**. Lo que convierte cualquiera de las dos en garantía es que exista una comprobación determinista que **se haya visto fallar**.

## Decisión

**El contrato se genera desde el código, se versiona como fichero, y lo que corre en CI es la comprobación de que los dos coinciden.**

Tres piezas, y ninguna sustituye a las otras:

1. **`npm run openapi:generate`** escribe `docs/api/openapi.json` desde el documento que construye `@foadonis/openapi`. Es manual, a propósito.
2. **`npm run openapi:check`** compara el fichero contra el documento generado y **sale con código distinto de cero** si difieren, nombrando las rutas JSON. **No arregla nada.**
3. **`scripts/verificar-docs.mjs` gana una comprobación**, y ahora sí abre `docs/api/openapi.json`: son dieciocho.

La separación entre la 2 y la 3 es el fondo de esta decisión. **Un generador no puede afirmar lo que la 3 afirma.** Ninguno de los tres defectos del Módulo 4 se habría notado en un OpenAPI generado: habría documentado fielmente que el filtro acepta cualquier cadena. Por eso el contraste no se retira; se le quita el trabajo que un generador hace mejor -la forma de las rutas- y se le deja el que solo él puede hacer: que la regla de vencimiento tenga sus tres condiciones, que la comparación sea estricta, que el responsable no exponga la cuenta.

### Por qué el fichero versionado, si el documento ya se sirve

Porque `/api.json` solo existe **mientras el servidor corre**. Sin fichero no hay nada que revisar en un cambio propuesto, nada que comparar entre dos versiones, y nada que leer sin levantar el proyecto. El fichero es lo que hace la deriva **visible en un diff**.

### Por qué genera a mano y no en el propio job

El job **informa, no arregla**. Si regenerara y commiteara, el aviso desaparecería y con él la única señal de que alguien cambió la API sin mirar el contrato. El rojo es para quien hizo el cambio, y el arreglo es un comando suyo.

## Cómo se comprobó, que es lo que la hace contar

Por [R-14](../../CLAUDE.md), y en este orden:

1. Verde antes de tocar nada: `openapi:check` → `0`.
2. **Mutación**: `router.get('profile', ...)` pasa a `router.get('perfil', ...)` en `start/routes.ts`. Un renombrado de endpoint, que es el escenario real.
3. **Rojo, y por lo que tiene que estar rojo**: código de salida **1**, nombrando `paths./api/v1/account/profile · sobra en el fichero` y `paths./api/v1/account/perfil · falta en el fichero`.
4. Un segundo control independiente también en rojo: la suite, **8 de 75 fallando**.
5. Revertido: los dos vuelven a `0`, 75 de 75.

El código de salida se leyó del proceso, no de la última línea impresa: la primera lectura dio `0` porque estaba mirando el `$?` de un `tail` en la tubería, que es exactamente el error que [R-06](auditoria-reglas-de-proceso.md) nombra.

## Y una avería que solo se vio en CI

Los dos comandos nacieron como **comandos de ace** en `backend/commands/`, que es donde el framework los espera. En local funcionaban: los dos verdes, las 75 pruebas verdes, lint y typecheck verdes.

**En Linux rompían la build entera.** El escáner de `commands/` fallaba con `Invalid command exported from "openapi_check.js" file. Invalid URL`, y como **cualquier** invocación de `node ace` escanea ese directorio, se llevaba por delante también `node ace test`. Dos jobs en rojo por dos ficheros que en Windows no se quejan.

Se sacaron a `bin/openapi.ts` con su entrypoint `openapi.js`, el mismo patrón que `ace.js`, y `commands/` volvió a no existir.

Al hacerlo apareció un segundo modo de fallo del mismo tipo: sin la fase `app.start()`, el documento salía con **`paths` completos y `components.schemas` vacío**. Bien formado, y a medias. Es el mismo error que `router.commit()`, y las dos veces la señal fue el check nombrando qué faltaba.

**Lo que esto enseña, y por eso está en el ADR y no solo en un commit**: el verde en local no dijo nada. Lo que lo dijo fue ejecutarlo en otra máquina. Un guardarraíl que solo se ha visto pasar en el sitio donde se escribió está en la misma categoría que uno que no se ha visto fallar.

## Alternativas consideradas

**Dejar las dos aproximaciones conviviendo.** Es lo que había, y es lo peor: dos contratos que pueden contradecirse y ninguna regla que diga cuál manda.

**Volver al escrito a mano y retirar el generador.** Pierde la documentación navegable y devuelve el trabajo manual recurrente que ADR-0004 declaraba como su precio. El generador ya está instalado y el hueco que ADR-0004 dejaba abierto -«el proyecto no sirve documentación navegable en ninguna URL»- se cierra solo.

**Generar en CI y commitear desde el job.** Quita el humano del bucle y con él la señal. Además haría que la rama del PR cambiara sola, que es un modo de fallo peor que el que resuelve.

## Consecuencias

Al tocar rutas, controladores o transformers hay que **acordarse de `npm run openapi:generate`**, y el job lo recuerda con un rojo si no.

**[H-23](../hallazgos.md) quedó cerrado el 2026-09-09**, y versionar el contrato es lo que lo hizo barato: con las cuatro rutas de `auth` visibles en un fichero con `responses: {}`, decorarlas dejó de ser una tarea abstracta. Las nueve rutas declaran hoy sus respuestas y su 500.

**[H-26](../hallazgos.md) quedó cerrado el 2026-09-09**, y mientras estuvo abierto esta decisión es lo que lo hizo soportable: el documento que servía `/api.json` acumulaba un parámetro duplicado en cada petición, así que **la URL no era el contrato**. El fichero versionado sí. Al arreglarlo -construyendo el documento una sola vez- las dos cosas pasaron a ser **byte a byte idénticas**, que es más de lo que esta decisión pedía.

El arreglo se llevó por delante tres entradas del documento: `/api`, `/api.json` y `/api.yaml` ya no se documentan a sí mismas. Estaban ahí por los decoradores del controlador de la librería, y decían `responses: {default}` y `security: []`. Qué rutas existen sigue estando en la tabla de `CLAUDE.md`, contrastada contra `list:routes`.

Y **[H-24](../hallazgos.md)**, que este ADR no puede resolver: en el pull request del curso el job sigue sin correr. Mitigado abriendo el cambio también como PR dentro del fork, donde sí corre.
