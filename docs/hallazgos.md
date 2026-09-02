# Hallazgos técnicos

> Cosas descubiertas trabajando sobre el repo, no supuestos. Cada una indica **cómo se verificó**.
>
> No son decisiones de producto: esas viven en `docs/prd/flowsync-mvp.md`, sección 10, como `D-nn`. Aquí van los hallazgos técnicos y de proceso que van a doler si nadie los conoce de antemano.
>
> Ramas de referencia: `s3/start` (H-01 a H-14) y `s4/start` (H-15 en adelante). Última revisión: 2026-08-26.
>
> **Aviso de rama.** Las entradas H-01 a H-14 se trabajaron sobre `s3/start`, nuestra rama del Módulo 3, y **sus apartados «Resuelto» describen esa rama, no esta**.
> El cambio `add-test-foundation` que citan no existe en `s4/start`; el curso llegó a la misma funcionalidad por otro camino.
> Donde una entrada afecta también a `s4/start`, lleva una nota explícita que dice qué vale aquí.
> Se conservan enteras porque el hallazgo y cómo se verificó son el registro de lo que pasó, y reescribirlos borraría esa historia.

## Índice por severidad

| # | Hallazgo | Severidad | Estado |
|---|---|---|---|
| H-01 | Los tests comparten base de datos con desarrollo | Alta | **Resuelto (2026-08-25)** |
| H-02 | Cero pruebas automatizadas en todo el proyecto | Alta | **Resuelto (2026-08-25)** |
| H-11 | El email distingue mayúsculas y minúsculas: la misma persona puede registrarse dos veces | Alta | **Resuelto (2026-08-26)** |
| H-03 | `/account/logout` no envuelve la respuesta en `data` | Media | Documentado y sorteado |
| H-04 | `fullName` es `nullable`, no `optional` | Media | Documentado y sorteado |
| H-05 | La traducción de errores depende de los nombres de regla del backend | Media | Vigilado por pruebas |
| H-06 | El token vive en `localStorage` | Media | Deuda aceptada |
| H-07 | El hook de formateo depende de `jq`, que no está instalado | Baja | Abierto |
| H-08 | `AGENTS.md` es un symlink que Windows no materializa | Baja | Sin impacto hoy |
| H-09 | `database/schema.ts` se regenera sin formato y rompe el lint | Baja | Reincidente |
| H-10 | Los tipos de issue de Jira en `LID` están en dos idiomas | Baja | Sorteado |
| H-13 | Una sesión que caduca con la lista abierta deja al usuario sin salida | Media | **Resuelto (2026-08-26)** |
| H-12 | El registro tipado de Tuyau solo modela la respuesta de éxito | Baja | Sorteado |
| H-14 | `updatedAt` vale distinto según el endpoint que lo devuelve | Baja | **Resuelto (2026-08-26)** |
| H-15 | Una tarea hecha con la fecha pasada seguía llegando marcada como vencida | Alta | **Resuelto (2026-08-26)** |
| H-16 | Un estado inventado en el filtro devolvía 200 con lista vacía | Alta | **Resuelto (2026-08-26)** |
| H-17 | La lista filtraba el email del responsable | Alta | **Resuelto (2026-08-26)** |
| H-18 | Los changes se archivaron con verificaciones marcadas sin hacer | Alta | Abierto |
| H-19 | Las respuestas de error devuelven traza, rutas y el SQL ejecutado | Media | Deuda aceptada |
| H-20 | Dos requisitos de la spec viva se contradecían sobre `today` | Media | **Resuelto (2026-08-26)** |
| H-21 | El orden de validación difiere entre controladores | Baja | Abierto |

---

## H-01 · Los tests comparten base de datos con desarrollo

**Severidad: alta.** Es el que más va a doler en el Módulo 3.

`backend/config/database.ts` define una única conexión SQLite apuntando a `app.tmpPath('db.sqlite3')`, **sin ningún override por entorno**. Y `backend/.env.test` contiene exactamente una línea:

```
SESSION_DRIVER=memory
```

No toca la base de datos.

**Cómo se verificó**: leyendo ambos ficheros. En `config/database.ts` las conexiones alternativas que sí usan `env.get()` están todas comentadas; la activa tiene la ruta escrita a fuego.

**Consecuencia**: las suites funcionales escriben sobre el mismo fichero que el servidor de desarrollo. Dos formas de que reviente: un test crea datos y contamina la siguiente ejecución, o un `migration:fresh` en tests borra los datos con los que alguien estaba probando a mano.

Lo peor es que falla de forma **intermitente**, que es la categoría de fallo más cara de depurar.

**Qué hacer**, dos caminos:

1. Hooks de `testUtils.db()` con truncado o transacción global. Es lo que sugiere el `CLAUDE.md` del proyecto y no toca configuración.
2. Fichero separado por entorno, del tipo `db-test.sqlite3` cuando `NODE_ENV=test`. Más limpio, pero modifica `config/database.ts`, que es fichero del repo del curso.

Conviene resolverlo **antes** de escribir el primer test, no después.

**Resuelto el 2026-08-25 sobre `s3/start`** por el cambio `add-test-foundation`, y en efecto antes del primer test.

Se tomó el camino 2, el fichero separado por entorno, y no el 1.
La razón está en `design.md` D1: los hooks funcionan, pero dejan el aislamiento dependiendo de que cada fichero de prueba recuerde ponerlos.
Un test nuevo que olvidara el hook borraría los datos de desarrollo, y ese fallo aparece en el peor momento.
Con el fichero separado, olvidarlo es imposible.

Los hooks se usan igualmente, pero para lo que sirven bien: dejar limpio entre casos dentro de la misma ejecución.
En `s3/start` se enganchan una sola vez en `tests/bootstrap.ts` vía `suite.onGroup`.

**Cómo se verificó**: se anotó la fecha de modificación de `backend/tmp/db.sqlite3`, se ejecutó la suite completa dos veces seguidas y se volvió a leer.
Idéntica. La base de test vive aparte, en `tmp/db-test.sqlite3`, y no está versionada.

> **Y en `s4/start`, la rama del curso.** El mismo hallazgo volvió a aparecer, porque el curso lo sortea con `withGlobalTransaction()` declarado en cada fichero en vez de resolverlo.
> Se reprodujo la fuga: un fichero de prueba **sin** el hook dejó una fila en la base de desarrollo con 21 pruebas en verde.
> Resuelto aquí por [ADR-0001](adr/0001-aislamiento-de-la-base-de-datos-en-pruebas.md), con la misma decisión y una diferencia: **los hooks por fichero se mantienen tal cual**, no se centralizan en `suite.onGroup`.
> Y a diferencia de `s3/start`, aquí lo fija una prueba: `tests/functional/aislamiento.spec.ts` le pregunta a la conexión viva por su fichero.

---

## H-02 · Cero pruebas automatizadas en todo el proyecto

**Severidad: alta.**

| | Estado |
|---|---|
| Backend | Japa configurado, dos suites declaradas en `adonisrc.ts`, **cero ficheros de test** |
| Frontend | **Sin runner instalado**. Ni Vitest, ni Jest, ni Playwright, ni Testing Library |

**Cómo se verificó**: `npm test` en el backend responde `NO TESTS EXECUTED`. Los directorios `tests/unit` y `tests/functional` no existen: solo está `tests/bootstrap.ts`. El `package.json` del frontend no tiene siquiera un script `test`.

**Matiz que juega a favor**: `tests/bootstrap.ts` ya viene con todo enganchado, `assert`, `apiClient` con el registro tipado de Tuyau, `dbAssertions`, `authApiClient` y `sessionApiClient`. Para el backend el trabajo real es escribir tests, no configurar, salvo lo de H-01.

En el frontend hay que montarlo de cero. Es la razón de que `FS-118.6` esté estimado en talla M y `FS-142.6` en S: el primero incluye el montaje.

**Resuelto el 2026-08-25 sobre `s3/start`** por el cambio `add-test-foundation`.

| | Estado en `s3/start` |
|---|---|
| Backend | 25 pruebas funcionales en `tests/functional/`, derivadas de las specs vivas de `auth` y `tasks` |
| Frontend | Vitest instalado, script `npm test`, 17 pruebas sobre `src/lib/api.ts` |

> **En `s4/start` el estado es otro**: 52 pruebas funcionales de backend, y el frontend **sigue sin runner de tests**.
> Vitest, `src/lib/api.test.ts` y el change `add-test-foundation` no existen en esta rama.
> Qué escenario cubre cada prueba, y cuáles siguen sin cubrir, en [`trazabilidad.md`](trazabilidad.md).

El runner del frontend es **Vitest** (`design.md` D5): comparte configuración y transformación con Vite, que el proyecto ya usa, así que resuelve el alias `@/*` sin configurarlo aparte y no introduce una segunda cadena de compilación.
Es la única dependencia nueva del cambio.

Lo que **no** cubre, declarado a propósito para que el hueco sea conocido: ver la sección «Escenarios sin cubrir» de `openspec/changes/archive/2026-08-25-add-test-foundation/tasks.md`.

**Cómo se verificó**: `node ace test` en el backend y `npm test` en el frontend, ambos en verde, más `lint`, `typecheck` y `build` en los dos proyectos.

---

## H-11 · El email distingue mayúsculas y minúsculas

**Severidad: alta. Resuelto el 2026-08-26.** Detectado al escribir la spec viva de `auth` en el Módulo 3.

La regla de unicidad del email compara la cadena tal cual, así que **la misma persona puede registrarse dos veces cambiando la caja**.

**Cómo se verificó**: existiendo ya la cuenta `test@flowsync.local`, se envió un alta con `TEST@FLOWSYNC.LOCAL`.

```
POST /api/v1/auth/signup  {"email":"TEST@FLOWSYNC.LOCAL", ...}
200  {"data":{"user":{"id":3,"email":"TEST@FLOWSYNC.LOCAL", ...}}}
```

Se creó una segunda cuenta, con identificador distinto y sesión propia. La cuenta de sonda se eliminó después.

**Por qué importa.** La parte de dominio de una dirección de correo no distingue mayúsculas, así que las dos cadenas designan al mismo buzón. Un mismo usuario acaba con dos cuentas sin darse cuenta, y cuando exista el dominio de tareas, con dos identidades distintas dentro del mismo espacio compartido: sus tareas quedarían repartidas entre dos personas que en realidad son una.

También hace inconsistente el inicio de sesión desde el punto de vista de quien lo usa: entrar escribiendo el email con otra caja lleva a una cuenta distinta en vez de a la propia.

**Ni el alcance ni el PRD dicen nada al respecto**, así que no es un requisito incumplido: es un comportamiento sin decidir que hoy resuelve por defecto la base de datos.

**Qué hacer**: es decisión de producto antes que técnica. Lo habitual es normalizar el email a minúsculas al darse de alta y al entrar. Si se toma esa decisión, hay que contemplar las cuentas ya creadas.

**Nota sobre la spec viva.** `openspec/specs/auth/spec.md` **no afirma nada en ninguna dirección** sobre este comportamiento, deliberadamente. Describir lo que hace hoy consagraría un defecto como contrato.

**Resuelto el 2026-08-26** por el cambio `fix-defectos-abiertos`, que es el que toma la decisión de producto que faltaba: el email identifica a la persona con independencia de cómo escriba las mayúsculas.
La spec viva de `auth` pasa de callar a decidirlo, con dos escenarios nuevos.

La normalización se declara en el validador **antes** de la regla de unicidad, no en un hook del modelo: al revés, la unicidad consultaría el valor sin normalizar, daría por libre un email que ya existe, y el índice de la base reventaría después con un 500 en lugar de un «ese email ya está registrado».

Solo se baja a minúsculas. Las transformaciones por proveedor que arrastra `normalizeEmail` (quitar los puntos de Gmail, quitar lo que va tras el `+`) se apagan explícitamente: cambian la identidad de la cuenta, y hay quien usa `+etiqueta` a propósito.

Las cuentas ya guardadas se normalizan con una migración. Se comprobó antes que no hubiera dos que solo se diferenciaran en mayúsculas.

**Cómo se verificó**: cuatro pruebas funcionales, y quitar la normalización tumba cuatro casos.

---

## H-03 · `/account/logout` no envuelve la respuesta en `data`

**Severidad: media.** Ya sorteado, pero conviene que quede escrito.

Todos los endpoints pasan por `ctx.serialize()`, que envuelve el payload bajo la clave `data`. **Salvo logout**, que devuelve el objeto plano:

```
POST /api/v1/account/logout
200 {"message":"Logged out successfully"}
```

**Cómo se verificó**: petición real con `curl` y un token válido.

**Consecuencia**: cualquier cliente que use un desenvolvedor genérico obtiene `undefined` en silencio. No lanza, no avisa.

**Cómo está sorteado**: `frontend/src/lib/api.ts` no tiene desenvolvedor genérico. Cada función decide qué hace con el cuerpo, y `logout` descarta el resultado con `.then(() => undefined)`.

> **Corrección (2026-08-26).** Esta entrada decía que `api.ts` «separa `send()` de `request()`, y logout usa el primero». Esa función nunca ha existido en ninguna rama. Lo detectó la revisión adversarial del PR #15.

---

## H-04 · `fullName` es `nullable`, no `optional`

**Severidad: media.** Ya sorteado.

`backend/app/validators/user.ts` declara `fullName: vine.string().nullable()`. La distinción importa: **la clave debe viajar siempre en el payload**, aceptando `null` como valor. Omitirla devuelve 422.

**Cómo se verificó**:

```
POST /api/v1/auth/signup  {"email":"malformado","password":"123"}
422 {"errors":[{"message":"The fullName field must be defined",...}]}
```

**Por qué importa más allá del código**: el ticket original del Módulo 1 decía "registro (email+password)". El validador real exige cuatro campos. Es el ejemplo canónico de por qué se contrasta contra el código y no contra el ticket.

---

## H-05 · La traducción de errores depende de los nombres de regla del backend

**Severidad: media.** Parcialmente vigilado.

> **Corrección (2026-08-26).** Esta entrada afirmaba que `api.ts` traducía mediante un diccionario indexado por el **texto literal** del mensaje, con el ejemplo `'The email has already been taken': ...`. Ese código no existe ni ha existido:
>
> ```
> $ for r in main s1/start s1/end s2/start s3/start; do
>     git show upstream/$r:frontend/src/lib/api.ts | grep -c "has already been taken"; done
> 0 0 0 0 0
> ```
>
> `api.ts:49` ya mapeaba por `switch (rule)` más `field` desde la primera rama, que es justo lo que esta entrada proponía como solución. Lo detectó la revisión adversarial del PR #15. Lo que sigue describe el riesgo que sí existe.

`frontend/src/lib/api.ts` traduce comparando el campo `rule` que emite el backend contra un `switch` de literales: `database.unique`, `sameAs`, `email`, `required`, `enum`, `minLength`, `maxLength`. Esos nombres los producen `@vinejs/vine` y `@adonisjs/lucid`, no nosotros.

**Consecuencia**: si una actualización de esas dependencias renombra una regla, la traducción cae al `default` y el usuario ve «Revisa el campo» en lugar del mensaje útil. No lanza, no avisa.

**Qué está vigilado y qué no**, tras `add-test-foundation`:

| | Estado |
|---|---|
| Que el diccionario del frontend no cambie por accidente | Cubierto **en `s3/start`**. `src/lib/api.test.ts` falla si se toca un mensaje. En `s4/start` no hay runner de frontend, así que ahí sigue sin vigilar |
| Que los nombres de regla que emite el backend sigan siendo esos | Cubierto desde el 2026-08-26. Las pruebas funcionales de `auth` asertan `rule` en cada rechazo |

Las dos mitades juntas cierran el fallo silencioso: si VineJS renombra `minLength`, rompe la suite del backend; si alguien toca la traducción, rompe la del frontend.

**Cómo se verificó, sobre `s3/start`**: renombrando `sameAs` en `api.ts` (rompe el frontend, 1 de 17) y asertando `rule` contra respuestas reales del backend en su `tests/functional/auth.spec.ts`.

**Lo que sigue sin vigilar**: los nombres de regla de `tasks` que el frontend traduce (`enum`) no se asertan en la suite del backend. Es un hueco pequeño y conocido.

---

## H-06 · El token vive en `localStorage`

**Severidad: media.** Deuda aceptada conscientemente.

Clave `flowsync.token`. Accesible desde JavaScript y por tanto vulnerable a XSS.

**Alternativa correcta**: cookie `httpOnly` con `SameSite`. Exige cambios en el backend, que el prework del Módulo 1 declaraba fuera de alcance.

Queda anotado para revisarse antes de cualquier despliegue real.

---

## H-07 · El hook de formateo depende de `jq`, que no está instalado

**Severidad: baja.** Abierto en `s2/start`.

`.claude/settings.json` define un hook `PostToolUse` que formatea con Prettier los ficheros de `frontend/` que Claude edite. Su primera instrucción es `jq -r ...`.

**Cómo se verificó**: `command -v jq` no devuelve nada en esta máquina. El hook sigue conteniendo `jq -r` en la rama actual.

**Consecuencia**: el hook **no formatea nada**, y como el comando termina en `|| true`, tampoco avisa. Falla en silencio, que es peor que fallar.

Prettier sí está instalado en el frontend, así que el único eslabón que falta es `jq`.

**Dos salidas**:

1. `winget install jqlang.jq`. Mantiene el hook idéntico al del curso.
2. Reescribirlo en Node, que ya es dependencia obligatoria del proyecto. Funciona en cualquier máquina capaz de arrancar FlowSync, Windows incluido, sin instalar nada. Se hizo así en la rama `feat/login-frontend` del Módulo 1, en `.claude/hooks/format-frontend.mjs`, y quedó probado contra rutas de `frontend/`, de `backend/`, fuera del proyecto y con payloads malformados.

La versión en Node además cierra un agujero de la original: el `case` de shell comparaba prefijos de cadena y se dejaba engañar por un `..`, mientras que `path.relative` no.

---

## H-08 · `AGENTS.md` es un symlink que Windows no materializa

**Severidad: baja.** Sin impacto mientras se trabaje solo con Claude Code.

En el repo, `AGENTS.md` tiene modo `120000`, es decir un enlace simbólico a `CLAUDE.md`.

**Cómo se verificó**: `git ls-tree HEAD AGENTS.md` devuelve modo `120000`. En disco es un fichero normal de 9 bytes cuyo contenido es la cadena `CLAUDE.md`.

**Causa**: el clon tiene `core.symlinks=false`, que git puso solo al detectar que Windows no permite crear enlaces sin Modo Desarrollador ni privilegios de administrador.

**Consecuencia**: Claude Code no se entera, porque lee `CLAUDE.md`. Pero cualquier herramienta que lea `AGENTS.md`, como Codex, encontraría la cadena `CLAUDE.md` y ningún contexto.

**Qué hacer, si hiciera falta**: activar Modo Desarrollador, `git config core.symlinks true`, y rehacer el checkout del fichero.

---

## H-09 · `database/schema.ts` se regenera sin formato y rompe el lint

**Severidad: baja.** Reincidente: aparece cada vez que se corren migraciones.

`node ace migration:run` regenera `backend/database/schema.ts` con una línea larga que Prettier quiere partir. El lint del backend falla con un error `prettier/prettier`.

**Cómo se verificó**: ocurrió durante el Módulo 1 tras `migration:run`. Se resolvió restaurando la versión commiteada.

**Qué hacer**: no editar el fichero, que está marcado como autogenerado y el `CLAUDE.md` prohíbe tocar a mano. Restaurar con `git checkout -- backend/database/schema.ts` cuando aparezca, o correr `npm run format` en el backend.

Ojo también con `backend/.adonisjs/`, que es codegen commiteado y se ensucia al arrancar el servidor. Conviene limpiarlo antes de preparar un commit para que no se cuele ruido.

---

## H-10 · Los tipos de issue de Jira en `LID` están en dos idiomas

**Severidad: baja.** Sorteado.

| Tipo | Nombre en `LID` |
|---|---|
| Épica | `Epic` |
| Historia | `Historia` |
| Tarea | `Tarea` |
| Subtarea | `Subtask` |
| Error | `Error` |

**Cómo se verificó**: consulta de metadatos de tipos de issue del proyecto vía MCP de Atlassian.

**Consecuencia**: el material del curso asume "Historia" y "Subtarea" en español. Con esos nombres, la creación de subtareas falla en este tablero.

**Relacionado**: el proyecto **se llama** FlowSync pero su clave es `LID`. Nombre y clave son campos independientes en Jira. En el tablero del instructor pasa lo mismo con otros valores: se llama FLOW y su prefijo real es `SCRUM-`.

Y `FS-nnn` nunca es clave de Jira: es convención interna que vive en el título y las etiquetas.

---

## H-12 · El registro tipado de Tuyau solo modela la respuesta de éxito

**Severidad: baja.** Sorteado, no resuelto.

`backend/.adonisjs/client/registry/` genera los tipos de request y response de cada ruta, y `tests/bootstrap.ts` los engancha al `apiClient` de Japa.
Es una ventaja real mientras se prueba el camino feliz: el payload y el cuerpo de la respuesta vienen tipados.

El problema aparece al probar un rechazo.
El registro tipa solo la respuesta de éxito, así que `respuesta.body().errors` no existe para TypeScript, y enviar a propósito un dato que el validador debe negar tampoco compila.
Exactamente las pruebas que más valor tienen son las que pelean con los tipos.

**Cómo se verificó**: `npm run typecheck` sobre la primera versión de las dos suites devolvió 31 errores, todos de esta naturaleza: `Property 'errors' does not exist on type ...` y `Type '"archivada"' is not assignable to type '"pending" | "in_progress" | "done"'`.
Las pruebas pasaban en ejecución; era solo el tipado.

Hay además un segundo efecto: cuando dos métodos comparten ruta, como `GET` y `POST` sobre `/api/v1/tasks`, el cuerpo se infiere como la unión de ambas respuestas y no se puede leer sin estrechar.

**Cómo se sorteó**: `backend/tests/helpers/api.ts` concentra la salida del contrato tipado en cuatro funciones con nombre, `errores`, `tarea`, `tareas` e `invalido`, en vez de esparcir castings por las suites.
Cada vez que una prueba se sale de los tipos se ve que lo está haciendo, y el nombre dice por qué.

**Qué haría falta para resolverlo de verdad**: que el generador tipara también las respuestas de error de cada ruta.
Está fuera de nuestro alcance, es del framework.

---

## H-13 · Una sesión que caduca con la lista abierta deja al usuario sin salida

**Severidad: media. Resuelto el 2026-08-26.**

Si la credencial deja de valer mientras la pantalla de tareas está abierta, `frontend/src/pages/tasks-page.tsx` pinta «Tu sesión ha caducado. Vuelve a iniciar sesión.» en un aviso que sustituye a toda la tarjeta.
Pero ese aviso no ofrece ninguna navegación, y `auth-provider` solo limpia el token al arrancar, no ante un 401 posterior.
El estado de sesión sigue siendo `authenticated`, así que `public-only-route.tsx` rebota `/login` de vuelta a `/tasks`.
Solo recargar lo desatasca.

**Cómo se verificó**: lectura del código, señalado por la revisión adversarial del PR #15.

**Consecuencia**: el producto le dice al usuario exactamente qué hacer y a la vez le impide hacerlo.

**Qué hacer**: que un `ApiError` con `status === 401` posterior al arranque dispare el cierre de sesión, o como mínimo que el aviso ofrezca salir.
Es un cambio de comportamiento de producto, así que va en su propio cambio, no en el de pruebas.

**Resuelto el 2026-08-26** por el cambio `fix-defectos-abiertos`, por el primer camino y no por el segundo.
`lib/api.ts` expone un punto de suscripción y el proveedor de sesión se engancha ahí, de modo que cualquier 401 en cualquier operación descarta la sesión y deja escrito el motivo.
Poner un botón en el aviso de la lista habría arreglado la pantalla que ya conocíamos y dejado el defecto en las que vinieran.

**Cómo se verificó**: en navegador real. Con la lista abierta, se revocó la credencial contra el backend por fuera de la aplicación y se pulsó un cambio de estado. La aplicación pasó a `/login` **sin recargar**, mostrando «Tu sesión ha caducado», y con el token ya borrado.
Que un fallo que no es de credencial (500, corte de red, 422) no cierre la sesión lo cubre una prueba de Vitest **en `s3/start`**.

---

## H-14 · `updatedAt` vale distinto según el endpoint que lo devuelve

**Severidad: baja. Resuelto el 2026-08-26.**

La respuesta de `PATCH /api/v1/tasks/:id` devuelve el objeto en memoria, con milisegundos.
El `GET` siguiente devuelve lo persistido, truncado al segundo.

```
PATCH -> "updatedAt":"2026-08-26T06:09:01.596+00:00"
GET   -> "updatedAt":"2026-08-26T06:09:01.000+00:00"
```

**Cómo se verificó**: dos peticiones con `curl` sobre la misma tarea, sin nada en medio. Revisión adversarial del PR #15.

**Consecuencia**: hoy ninguna, porque la interfaz no pinta fechas de tarea. Dolería en cuanto algo compare marcas de tiempo o cachee por ellas.

**Qué hacer**: recargar el modelo antes de serializar en la escritura, o truncar al segundo al serializar. Ninguna prueba lo mira todavía.

**Resuelto el 2026-08-26** por el cambio `fix-defectos-abiertos`, releyendo lo persistido antes de serializar, tanto al crear como al actualizar.
Truncar al serializar se descartó: escondía el desajuste en la capa de presentación y dejaba el objeto en memoria diciendo una cosa y la base otra.

**Cómo se verificó**: dos pruebas funcionales comparan campo por campo la tarea que devuelve la escritura con la que devuelve la lectura siguiente. Quitar el arreglo las tumba a las dos.

---

## H-15 · Una tarea hecha con la fecha pasada seguía llegando marcada como vencida

**Severidad: alta. Resuelto el 2026-08-26.** Rama `s4/start`.

`Task.isOverdueOn()` comprobaba dos de las tres condiciones de la regla de vencimiento. Faltaba la del estado.

Lo llamativo es que el comentario inmediatamente encima del método decía, literalmente, «Tres condiciones y ninguna más: hay fecha, esa fecha es anterior al día de referencia, y la tarea no está hecha». El código hacía dos.

**Cómo se verificó**: con la API. Una tarea en `done` con fecha `2026-08-12`, consultada desde `2026-08-26`, devolvía `status: "done"` e `isOverdue: true` en la misma respuesta. Detectado por la revisión adversarial del Módulo 4.

**Consecuencia visible**: `task-page.tsx` pinta la señal con `task.isOverdue && task.dueDate !== null`, así que una tarea cuya cabecera decía «Hecho» mostraba debajo, en rojo, que el plazo terminó y «la tarea sigue sin estar hecha».

**Es la única regla de negocio no trivial del MVP**, y no la comprobaba nada. Las 20 pruebas de la suite estaban en verde.

**Cómo se resolvió**: añadida la tercera condición, y seis pruebas nuevas en `tests/functional/tasks/vencimiento.spec.ts`. Quitar la condición tumba dos de ellas; cambiar el `<` por `<=` tumba una.

---

## H-16 · Un estado inventado en el filtro devolvía 200 con lista vacía

**Severidad: alta. Resuelto el 2026-08-26.** Rama `s4/start`.

`listTasksValidator` declaraba `status` como `vine.string().optional()` en lugar de acotarlo al conjunto del dominio, así que un valor inventado llegaba al `where` y salía como lista vacía.

Otra vez el comentario prometía lo contrario: «Un estado inventado jamás sale por aquí como lista vacía».

**Cómo se verificó**: `GET /api/v1/tasks?status=archivado` y `GET /api/v1/tasks?status=in_progress` sin tareas en curso devolvían respuestas **byte a byte idénticas**, las dos con 200. Justo lo que el requisito prohíbe.

**Lo que arrastraba**: tres ramas del frontend escritas a propósito para ese 422 no se ejecutaban nunca. `tasks-page.tsx` solo entra en `setInvalidFilter` ante un 422 con `fieldErrors.status`, que no llegaba; el bloque que lo pinta era código muerto; y el `case 'enum'` del diccionario de `lib/api.ts` tampoco se alcanzaba. Entrar en `/tasks?status=archivado` mostraba «No hay ninguna tarea en «archivado»», que además afirma algo falso.

**Cómo se resolvió**: `vine.enum(TASK_STATUSES).optional()`, un cambio de una línea que resucita las tres ramas. Seis pruebas nuevas en `tests/functional/tasks/filtro.spec.ts`; revertir el enum tumba dos.

---

## H-17 · La lista filtraba el email del responsable

**Severidad: alta. Resuelto el 2026-08-26.** Rama `s4/start`.

`TaskTransformer` construía el responsable con `UserTransformer`, que incluye el email y las fechas de la cuenta, mientras `TaskAssigneeTransformer` -que existe justo para esto y lo explica en su propio comentario- solo lo usaba el detalle.

El requisito «Lo que cada tarea muestra de su responsable» dice que junto a la tarea no viaja ningún otro dato de esa cuenta, «en particular su email», y lo dice para la tarea suelta **y para la lista**.

**Cómo se verificó**: una cuenta pidiendo la lista recibía el email de las demás.

**Cómo se resolvió**: la lista usa el transformer que le corresponde, y cuatro pruebas en `tests/functional/tasks/assignee.spec.ts` asertan el conjunto cerrado de campos.

---

## H-18 · Los changes se archivaron con verificaciones marcadas sin hacer

**Severidad: alta.** Abierto. Es de proceso, no de código, y es el mecanismo que produjo H-15, H-16 y H-17.

`openspec/changes/archive/2026-08-13-add-task-list/tasks.md` contiene sin marcar:

```
- [ ] 6.3 Verificar que ninguna respuesta de tareas incluye el email del responsable
```

y el change se archivó igualmente. Su `design.md` había predicho el fallo con nombre y apellidos: «la regresión más probable, que el responsable acabe filtrando el email al cliente, no la va a detectar nada automático». Ocurrió exactamente eso.

Peor en el change del filtro: `2026-08-13-add-task-status-filter/tasks.md` marca **`[x]`** la casilla «Verificar que un estado inventado devuelve 422 y no una lista vacía» sobre código que nunca lo ha hecho, y su `design.md` afirma que el validador declara `vine.enum(TASK_STATUSES).optional()`, que no era cierto.

**Qué hacer**: una casilla marcada tiene que significar que se ejecutó algo. Mientras la verificación sea una afirmación de quien archiva, el archivo es una lista de buenas intenciones. `scripts/verificar-docs.mjs` y el CI empiezan a atacarlo, pero solo cubren lo comprobable automáticamente.

---

## H-19 · Las respuestas de error devuelven traza, rutas y el SQL ejecutado

**Severidad: media.** Deuda aceptada, declarada aquí.

`app/exceptions/handler.ts` fija `debug = !app.inProduction`, así que fuera de producción cualquier 500 o 404 responde con el volcado completo: nombre de fichero absoluto, número de línea, trozos de código fuente de `node_modules` y la sentencia SQL ejecutada.

**Cómo se verificó**: un `PUT` sobre una base sin migrar devolvió la sentencia `update tasks set ...` completa y las rutas absolutas del disco. Revisión adversarial del Módulo 4.

**Por qué se acepta**: en producción `debug` es `false` y el framework responde genérico, así que no es una fuga en despliegue. Lo que sí es real es que se filtra a cualquiera con acceso de red a la máquina de desarrollo.

**Qué hacer si se decide atacar**: apagarlo salvo con una variable explícita. No se hace ahora porque cambia el comportamiento del framework para todo el equipo y merece su propia decisión.

---

## H-20 · Dos requisitos de la spec viva se contradecían sobre `today`

**Severidad: media. Resuelto el 2026-08-26.**

«Fijar, cambiar y retirar la fecha de vencimiento» describía el cuerpo del `PUT` como `{"dueDate": "..."}` y su escenario esperaba 200. «El día de referencia lo pone quien mira» exige que toda petición que informe del vencimiento pida ese día y responda 422 si no llega. La respuesta del `PUT` lleva `isOverdue`, así que el código solo podía cumplir uno de los dos.

**Cómo se verificó**: el escenario literal de la spec falla contra la API. `PUT /due-date` con solo `dueDate` devuelve 422 pidiendo `today`.

**Cómo se resolvió**: enmendado el escenario, no el código. El código está del lado defendible: un 422 ruidoso vale más que el reloj del servidor dando la lectura equivocada a quien mire desde otro huso. Cubierto por prueba.

---

## H-21 · El orden de validación difiere entre controladores

**Severidad: baja.** Abierto.

`TaskStatusesController.update` y `TaskDueDatesController.update` resuelven la tarea **antes** de validar; `TasksController.show` valida antes. Los dos caminos cumplen la spec, pero significa que un `PATCH` con estado inventado sobre una tarea inexistente da 404, mientras un `GET` sin `today` sobre una tarea inexistente da 422.

Ningún escenario lo fija. Conviene fijarlo antes de que alguien construya encima.
