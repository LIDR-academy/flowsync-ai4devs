# Hallazgos técnicos

> Cosas descubiertas trabajando sobre el repo, no supuestos. Cada una indica **cómo se verificó**.
>
> No son decisiones de producto: esas viven en `docs/prd/flowsync-mvp.md`, sección 10, como `D-nn`. Aquí van los hallazgos técnicos y de proceso que van a doler si nadie los conoce de antemano.
>
> Ramas de referencia: `s3/start` (H-01 a H-14) y `s4/start` (H-15 en adelante). Última revisión: 2026-09-02.
>
> **Aviso de rama.** Las entradas H-01 a H-14 se trabajaron sobre `s3/start`, nuestra rama del Módulo 3, y **sus apartados «Resuelto» describen esa rama, no esta**.
> El cambio `add-test-foundation` que citan no existe en `s4/start`; el curso llegó a la misma funcionalidad por otro camino.
> Donde una entrada afecta también a `s4/start`, lleva una nota explícita que dice qué vale aquí.
> Se conservan enteras porque el hallazgo y cómo se verificó son el registro de lo que pasó, y reescribirlos borraría esa historia.
>
> **Cada entrada dice qué rama describe.** No es formalismo: el 2026-09-02 se comprobaron una a una las que figuraban cerradas y **tres estaban vivas en `s4/start`** -H-11, H-13 y H-14- porque su arreglo nunca cruzó desde `s3/start`. Un «Resuelto» sin rama no dice nada.

## Índice por severidad

| # | Hallazgo | Severidad | Estado |
|---|---|---|---|
| H-01 | Los tests comparten base de datos con desarrollo | Alta | **Resuelto (2026-08-25)** |
| H-02 | Cero pruebas automatizadas en todo el proyecto | Alta | **Resuelto (2026-08-25)** |
| H-11 | El email distingue mayúsculas y minúsculas: la misma persona puede registrarse dos veces | Alta | **Resuelto** · `s3/start` 2026-08-26, `s4/start` 2026-09-02 |
| H-03 | `/account/logout` no envuelve la respuesta en `data` | Media | Documentado y sorteado |
| H-04 | `fullName` es `nullable`, no `optional` | Media | Documentado y sorteado |
| H-05 | La traducción de errores depende de los nombres de regla del backend | Media | Vigilado por pruebas |
| H-06 | El token vive en `localStorage` | Media | Deuda aceptada |
| H-07 | El hook de formateo depende de `jq`, que no está instalado | Baja | Abierto |
| H-08 | `AGENTS.md` es un symlink que Windows no materializa | Baja | Sin impacto hoy |
| H-09 | `database/schema.ts` se regenera sin formato y rompe el lint | Baja | Reincidente |
| H-10 | Los tipos de issue de Jira en `LID` están en dos idiomas | Baja | Sorteado |
| H-13 | Una sesión que caduca con la lista abierta deja al usuario sin salida | Media | **Resuelto** · `s3/start` 2026-08-26, `s4/start` 2026-09-02 |
| H-12 | El registro tipado de Tuyau solo modela la respuesta de éxito | Baja | Sorteado |
| H-14 | `updatedAt` vale distinto según el endpoint que lo devuelve | Baja | **Resuelto** · `s3/start` 2026-08-26, `s4/start` 2026-09-02 |
| H-15 | Una tarea hecha con la fecha pasada seguía llegando marcada como vencida | Alta | **Resuelto (2026-08-26)** |
| H-16 | Un estado inventado en el filtro devolvía 200 con lista vacía | Alta | **Resuelto (2026-08-26)** |
| H-17 | La lista filtraba el email del responsable | Alta | **Resuelto (2026-08-26)** |
| H-18 | Los changes se archivaron con verificaciones marcadas sin hacer | Alta | Abierto |
| H-19 | Las respuestas de error devuelven traza, rutas y el SQL ejecutado | Alta | **Resuelto (2026-09-02)** · arrastrado desde el Módulo 3, cerrado en dos pasos |
| H-20 | Dos requisitos de la spec viva se contradecían sobre `today` | Media | **Resuelto (2026-08-26)** |
| H-21 | El orden de validación difiere entre controladores | Baja | Abierto |
| H-22 | La tabla «Lo que se arrastra» dio por cerrados tres hallazgos sin comprobarlos en la rama | Alta | **Resuelto (2026-09-02)** |

> **Al abrir el Módulo 5**, la comprobación contra `s5/start` dice que **seis de los siete** vuelven rotos: H-11, H-13, H-14, H-15, H-16 y H-19. Solo H-17 llega arreglado. Evidencia y plan de acción de cada uno en la sección «Al abrir el Módulo 5», más abajo.

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

> **En `s4/start` el estado es otro**: 57 pruebas funcionales de backend, y el frontend **sigue sin runner de tests**.
> Vitest, `src/lib/api.test.ts` y el change `add-test-foundation` no existen en esta rama.
> Qué escenario cubre cada prueba, y cuáles siguen sin cubrir, en [`trazabilidad.md`](trazabilidad.md).

El runner del frontend es **Vitest** (`design.md` D5): comparte configuración y transformación con Vite, que el proyecto ya usa, así que resuelve el alias `@/*` sin configurarlo aparte y no introduce una segunda cadena de compilación.
Es la única dependencia nueva del cambio.

Lo que **no** cubre, declarado a propósito para que el hueco sea conocido: la sección «Escenarios sin cubrir» del `tasks.md` de ese change, que vive en `s3/start`. En `s4/start` el hueco equivalente está en [`trazabilidad.md`](trazabilidad.md).

**Cómo se verificó**: `node ace test` en el backend y `npm test` en el frontend, ambos en verde, más `lint`, `typecheck` y `build` en los dos proyectos.

---

## H-11 · El email distingue mayúsculas y minúsculas

**Rama: `s3/start` y `s4/start`. Severidad: alta. Resuelto el 2026-08-26 en `s3/start`, y el 2026-09-02 en `s4/start`.** Detectado al escribir la spec viva de `auth` en el Módulo 3.

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

### Y en `s4/start` seguía vivo

**Estaba marcado «Resuelto» y no lo estaba en esta rama.** El arreglo se hizo sobre `s3/start` y nunca cruzó: `s4/start` viene del curso, trae su propio `app/validators/user.ts` sin normalización, y no tiene ninguna de las dos migraciones.

**Cómo se verificó**: existiendo `rev@example.com`, un alta con `REV@EXAMPLE.COM` devolvió `200` y creó una segunda cuenta con su propia sesión. Dos cuentas, un buzón. Quinta revisión adversarial, 2026-09-02, contra el servidor de la rama.

**Resuelto el 2026-09-02** portando el arreglo entero: el validador normaliza a minúsculas antes de comprobar la unicidad, una migración normaliza las cuentas ya guardadas con la misma función que el validador, y un índice único sobre `lower(email)` lo impide también a lo que no pase por el validador.

**Cómo se verificó**: seis pruebas en `tests/functional/auth/email_mayusculas.spec.ts`. Quitar la normalización del validador tumba cinco; comprobado.

Un detalle que vale por la entrada entera: al aplicar la migración sobre la base de desarrollo, **falló**, porque allí estaban las dos cuentas duplicadas que la revisión había creado. Está diseñada para fallar en ese caso: unificar dos cuentas es una decisión con datos detrás y no la toma una migración.

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

**Rama: `s3/start` y `s4/start`. Severidad: media. Resuelto el 2026-08-26 en `s3/start`, y el 2026-09-02 en `s4/start`.**

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

### Y en `s4/start` seguía vivo

Mismo motivo que H-11: el arreglo no cruzó de rama. En `s4/start`, `lib/api.ts` no exponía ningún punto de suscripción y `auth-provider` solo limpiaba el token al rehidratar, así que un 401 posterior al arranque dejaba el estado en `authenticated` y el guard de rutas públicas seguía rebotando `/login` de vuelta.

**Cómo se verificó**: lectura del código de la rama, 2026-09-02. `grep` de `onUnauthorized` en `frontend/src/` no devolvía nada.

**Resuelto el 2026-09-02** portando el arreglo por el mismo camino que en `s3/start`: `lib/api.ts` expone `onUnauthorized`, el proveedor de sesión se engancha ahí, y cualquier 401 de cualquier operación descarta la sesión y deja escrito el motivo. El cierre de sesión a propósito silencia el aviso, para que salir no aterrice en el acceso con un «tu sesión ha caducado» que no viene a cuento.

---

## H-14 · `updatedAt` vale distinto según el endpoint que lo devuelve

**Rama: `s3/start` y `s4/start`. Severidad: baja. Resuelto el 2026-08-26 en `s3/start`, y el 2026-09-02 en `s4/start`.**

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

### Y en `s4/start` seguía vivo, en una escritura más

El arreglo tampoco cruzó, y la rama del curso añadió una tercera escritura -la fecha de vencimiento- con el mismo patrón: guardar, cargar la relación y serializar el objeto en memoria.

**Cómo se verificó**: lectura de los tres controladores de escritura, 2026-09-02.

**Resuelto el 2026-09-02**: `Task.releerConResponsable(id)` devuelve lo persistido con el responsable en una sola consulta, y lo usan las tres escrituras. Está en el modelo y no repetido en cada controlador, para que la cuarta lo herede.

**Cómo se verificó**: tres pruebas en `tests/functional/tasks/escritura_lectura.spec.ts` comparan el objeto entero que devuelve cada escritura con el de la lectura siguiente. Devolver el objeto en memoria en una sola de las tres tumba su prueba; comprobado.

---

## H-15 · Una tarea hecha con la fecha pasada seguía llegando marcada como vencida

**Severidad: alta. Resuelto el 2026-08-26.** Rama `s4/start`.

`Task.isOverdueOn()` comprobaba dos de las tres condiciones de la regla de vencimiento. Faltaba la del estado.

Lo llamativo es que el comentario inmediatamente encima del método decía, literalmente, «Tres condiciones y ninguna más: hay fecha, esa fecha es anterior al día de referencia, y la tarea no está hecha». El código hacía dos.

**Cómo se verificó**: con la API. Una tarea en `done` con fecha `2026-08-12`, consultada desde `2026-08-26`, devolvía `status: "done"` e `isOverdue: true` en la misma respuesta. Detectado por la revisión adversarial del Módulo 4.

**Consecuencia visible**: `task-page.tsx` pinta la señal con `task.isOverdue && task.dueDate !== null`, así que una tarea cuya cabecera decía «Hecho» mostraba debajo, en rojo, que el plazo terminó y «la tarea sigue sin estar hecha».

**Es la única regla de negocio no trivial del MVP**, y no la comprobaba nada. Las 24 pruebas de la suite estaban en verde.

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

**Rama: `s4/start`. Severidad: alta. Resuelto el 2026-09-02**, en dos pasos y tras tres módulos abierto.

`app/exceptions/handler.ts` fijaba `debug = !app.inProduction`, así que fuera de producción cualquier error respondía con el volcado completo: nombre de fichero absoluto, número de línea, trozos de código fuente de `node_modules` y la sentencia SQL ejecutada.

**Cómo se verificó**: un `PUT` sobre una base sin migrar devolvió la sentencia `update tasks set ...` completa y las rutas absolutas del disco. Cuarta revisión adversarial del Módulo 4.

### El primer cierre, y por qué no bastaba

[ADR-0003](adr/0003-el-volcado-de-depuracion-va-apagado.md) apagó el volcado por defecto **en todos los entornos**, con `DEBUG_HTTP_ERRORS=true` para encenderlo a propósito.

Eso quitó las trazas y **dejó abierta la mitad grande**. La rama sin depuración del framework responde `{ message: error.message }`, y el `message` de un `SqliteError` es la sentencia SQL entera con sus valores dentro. La quinta revisión adversarial lo reprodujo contra el servidor **con el volcado ya apagado**, que es la configuración de producción:

```
POST /api/v1/auth/signup   (tres altas simultáneas, carrera de `unique`)
500 {"message":"insert into `users` (…) values ('2026-09-02 16:05:03',
     'fuga@example.com', 'Fuga Prod',
     '$scrypt$n=16384,r=8,p=1$unlY7g4Rjk2DDvyFxREKCw$1YV0BCIlj…'"}
```

Endpoint público, sin sesión, y con el hash de la contraseña dentro del cuerpo.

**El argumento que lo bajó de prioridad tres módulos seguidos -«en producción `debug` es `false`, así que no es una fuga en despliegue»- era falso justo para la parte más grave.** `debug=false` es exactamente la configuración con la que se reprodujo.

### El cierre completo

El manejador intercepta todo `5xx` y responde `{ errors: [{ message: 'Error interno del servidor' }] }`, sin tocar `report()`. El mensaje de un error inesperado no es contrato: lo escribe la librería que falló y describe el fallo, no el producto.

**Cómo se verificó**: `tests/functional/errores.spec.ts` provoca un `500` real -una cuenta guardada en mayúsculas por debajo del validador y un alta de la misma en minúsculas, que el índice `lower(email)` detiene- y comprueba el cuerpo entero contra diecisiete rastros, entre ellos `insert into`, `SqliteError` y `$scrypt$`. Quitar la intercepción tumba esa prueba; comprobado.

> Su recorrido completo, desde que apareció en el Módulo 3 hasta que se cerró, está en la sección «El defecto que arrastramos» al final de este documento.

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

---

## H-22 · La tabla «Lo que se arrastra» dio por cerrados tres hallazgos sin comprobarlos en la rama

**Rama: `s4/start`. Severidad: alta. Resuelto el 2026-09-02.**

El 2026-09-02 se estableció la regla de arrastrar este registro entre módulos, y se escribió la primera tabla «Lo que se arrastra» en `docs/reporte-cierre-defectos.md`. Esa tabla marcaba **H-11, H-13 y H-14** como `Cerrado | —`.

Los tres estaban vivos en `s4/start`.

La regla que ese mismo commit escribió dice, literalmente: «**Lo que no vale**: dar un hallazgo por resuelto porque se arregló en otra rama». La primera tabla que la aplicó hizo exactamente eso, en tres de sus cinco filas, el mismo día.

**Cómo se verificó**: quinta revisión adversarial. H-11 contra el servidor de la rama -un alta con `REV@EXAMPLE.COM` existiendo `rev@example.com` devolvió `200` y creó una segunda cuenta-, H-13 y H-14 por lectura del código, que no contenía ninguno de los dos arreglos.

**Consecuencia**: es el mismo defecto que la regla existe para evitar, cometido por el instrumento que la implementa. Y es peor que no tener tabla: una fila que dice «Cerrado» detiene la comprobación de quien la lee.

**Resuelto el 2026-09-02**: los tres hallazgos se comprobaron uno a uno contra la rama, se portaron sus arreglos con pruebas, y la tabla se corrigió. Además:

- Cada entrada de este documento dice ahora **qué rama describe**, que era la regla escrita en `CLAUDE.md` y no aplicada.
- La comprobación del verificador dejó de conformarse con que la cadena «Lo que se arrastra» apareciera en cualquier parte del reporte: ahora exige el encabezado, la tabla, y filas con sus cinco columnas. Se comprobó mutando: sustituir la tabla por una frase, o dejar el encabezado sin filas, la tumba.

**Lo que no se arregla con código**: comprobar una fila cuesta minutos y darla por buena cuesta cero. Lo único que lo sostiene es que la columna «Estado» nombre la rama y la fecha en que se miró, no un «Cerrado» a secas.

---

# Al abrir el Módulo 5

## Estado en `s5/start`, comprobado al abrir el Módulo 5

> Comprobado el 2026-09-02 leyendo la rama fichero a fichero, antes de tocar nada, como manda la regla de arrastre.
> `s5/start` está en `449bb69`, idéntico a `upstream/s5/start`.
>
> **Seis de los siete defectos que cerramos vuelven rotos.** No es una regresión: la rama del curso llega a la misma funcionalidad por otro camino y nunca tuvo nuestros arreglos. Es exactamente lo que pasó de `s3/start` a `s4/start`, y por lo que existe H-22.

### Los seis que vuelven

| # | Hallazgo | Evidencia en `s5/start` | Plan de acción |
|---|---|---|---|
| **H-19** · Alta | Las respuestas de error revelan traza, rutas y el SQL ejecutado | `backend/app/exceptions/handler.ts:9` declara `protected debug = !app.inProduction`, el valor con el que viene el framework, con el comentario original en inglés («display verbose errors with pretty printed stack traces»). El fichero entero son 30 líneas: **no hay rama para `E_ROW_NOT_FOUND`** ni intercepción de `5xx`. `backend/.env.example` no menciona `DEBUG_HTTP_ERRORS`. Vuelven las **dos mitades**: el volcado de Youch fuera de producción, y el `{ message: error.message }` del framework, que en un error de SQLite es la sentencia entera con el hash de la contraseña dentro | Portar `handler.ts` completo: la constante desde `env.get('DEBUG_HTTP_ERRORS', false)`, la normalización de `E_ROW_NOT_FOUND` a `{ errors: [...] }` con 404, y la intercepción de `status >= 500`. Añadir `DEBUG_HTTP_ERRORS=false` a `.env.example` y a `.env.test`, y `DEBUG_HTTP_ERRORS: Env.schema.boolean.optional()` a `start/env.ts`. Portar `tests/functional/errores.spec.ts` con sus cinco casos y los diecisiete rastros. **Verificar por mutación**: quitar la intercepción del `5xx` tiene que tumbar la prueba del error de base de datos. Traer [ADR-0003](adr/0003-el-volcado-de-depuracion-va-apagado.md), que es lo que convierte esto en una decisión escrita y no en un arreglo suelto |
| **H-11** · Alta | El email distingue mayúsculas: la misma persona se registra dos veces | `backend/app/validators/user.ts:6` es `const email = () => vine.string().email().maxLength(254)`, sin `.normalizeEmail()`. `backend/database/migrations/` tiene **cuatro** ficheros y ninguno es `normalize_user_emails` ni `unique_email_ignoring_case`. El índice de la tabla `users` compara byte a byte | Portar `app/validators/user.ts` entero, incluida la constante `SOLO_MINUSCULAS` con las transformaciones destructivas apagadas -las de Gmail, Outlook, Yahoo, iCloud y Yandex- y la función exportada `normalizeUserEmail`. Portar las dos migraciones: la que normaliza lo ya guardado usando esa misma función, y la que crea el índice único sobre `lower(email)`. Portar `tests/functional/auth/email_mayusculas.spec.ts` (6 pruebas). **Ojo al aplicar la migración**: si la base local tiene duplicados que solo se diferencian en la caja, falla a propósito y hay que resolverlos a mano antes. Ya pasó el 2026-09-02 |
| **H-15** · Alta | Una tarea hecha con la fecha pasada llega marcada como vencida | `backend/app/models/task.ts:52-56`: `isOverdueOn` son tres líneas, `if (this.dueDate === null) return false` y `return this.dueDate < referenceDay`. **Falta la condición del estado.** La pantalla anuncia «Vencida» en rojo debajo de una cabecera que dice «Hecho» | Añadir `if (this.status === 'done') return false` como segunda guarda. Portar `tests/functional/tasks/vencimiento.spec.ts` (8 pruebas), que cubre además el borde del `<` estricto: vencer hoy todavía no es estar vencida. **Verificar por mutación** las dos cosas: quitar la condición del estado, y cambiar `<` por `<=`. Cada una tiene que tumbar su prueba |
| **H-16** · Alta | Un estado inventado en el filtro devuelve 200 con lista vacía | `backend/app/validators/task.ts:29-31`: `listTasksValidator` declara `status: vine.string().optional()`, una cadena suelta. `/tasks?status=archivado` responde `200` con `[]`, que en la pantalla se lee como «el equipo no tiene nada en ese estado» en vez de «ese estado no existe». Es el fallo silencioso, no un error | Cambiar a `vine.enum(TASK_STATUSES).optional()`, importando la constante del modelo para que no haya dos listas de estados. Portar `tests/functional/tasks/filtro.spec.ts` (7 pruebas), incluida la que fija que el `422` lleva `meta.choices` con los tres estados válidos, que es de lo que el frontend construye el mensaje. **Verificar por mutación**: volver a `vine.string()` tiene que tumbarlas |
| **H-13** · Media | Una sesión que caduca con la lista abierta deja al usuario sin salida | `frontend/src/lib/api.ts:188-190` es `if (!response.ok) { throw toApiError(...) }`, sin ningún punto de suscripción: **cero apariciones de `onUnauthorized`** en todo `frontend/src/`. El proveedor de sesión solo limpia el token al rehidratar, así que un 401 posterior deja el estado en `authenticated`, el aviso pide volver a entrar y el guard de rutas públicas rebota `/login` de vuelta a `/tasks`. Solo recargar lo desatasca | Portar el punto de suscripción a `lib/api.ts` -`onUnauthorized`, el `Set` de manejadores y la opción `silenciarRechazo`- y engancharlo desde `auth-provider.tsx` con un `useEffect`. Solo el 401 dispara: un 500 o un corte de red no pueden cerrar la sesión de nadie. El cierre de sesión a propósito pasa `silenciarRechazo: true`, o salir aterriza en el acceso con un «tu sesión ha caducado» que no viene a cuento. **Verificar en navegador**, no leyendo: revocar la credencial contra el backend por fuera y pulsar algo en la lista tiene que llevar a `/login` sin recargar y con el token ya borrado |
| **H-14** · Baja | `updatedAt` vale distinto según el endpoint que lo devuelve | `backend/app/controllers/tasks_controller.ts` hace `await task.load('assignee')` y serializa el objeto en memoria, tanto en `store` como en `show`; `task_statuses_controller.ts` y `task_due_dates_controller.ts` repiten el patrón. El modelo recién guardado trae milisegundos y la base guarda con precisión de segundo, así que la escritura y la lectura siguiente dicen valores distintos del mismo campo sin que nada cambie en medio | Portar `Task.releerConResponsable(id)` al modelo -una sola consulta con `preload`, no `refresh()` más `load()`- y usarlo en las **tres** escrituras. Va en el modelo y no repetido en cada controlador para que la cuarta lo herede. Portar `tests/functional/tasks/escritura_lectura.spec.ts` (3 pruebas), que compara el objeto **entero** y no el campo sospechoso: comparar solo `updatedAt` deja de morder en cuanto el desajuste se mude a otro campo, y ya pasó una vez |

### El que sí viene arreglado

| # | Hallazgo | Evidencia en `s5/start` | Plan de acción |
|---|---|---|---|
| **H-17** · Alta | La lista filtraba el email del responsable | `backend/app/transformers/task_transformer.ts:13` usa `TaskAssigneeTransformer.transform(...)`, que expone `id`, `fullName` e `initials` y nada más. Es lo que el directo corrige en su Demo 1 del Módulo 4 | Nada que portar. **Sí hay que traer la comprobación**: el verificador tiene una que falla si la lista vuelve al transformer que expone la cuenta. Que hoy esté bien no impide que vuelva mañana, y es el único de los siete que llegó arreglado sin que nada lo vigile |

### Y lo que no está, que es la mitad del problema

Ninguno de los seis tiene nada en la rama que lo detecte.

| Qué falta | Evidencia | Plan de acción |
|---|---|---|
| Las pruebas | `backend/tests/` tiene **cinco** ficheros: los cuatro de `auth` y `tasks/assignee.spec.ts`. Nosotros llevamos doce y 71 pruebas | Portar los siete que faltan más `tests/helpers/api.ts`, del que dependen todos. Sin el helper, cualquier prueba que lea un cuerpo de error o mande un payload inválido no compila: el registro tipado de Tuyau solo modela la respuesta de éxito |
| El verificador | No existe `scripts/`. Cero comprobaciones deterministas | Portar `scripts/verificar-docs.mjs` con sus trece comprobaciones, y **volver a demostrar cada una mutando el código**. No vale darlas por buenas porque pasaban en `s4/start`: la rama tiene otro contrato -documento OpenAPI generado desde `app/openapi/schemas.ts`, no escrito a mano- y varias comprobaciones van a chocar con eso |
| La integración continua | No existe `.github/`. Nuestro `verificacion.yml` es nuestro | Portarlo, y comprobar que **falla de verdad** empujando una mutación a una rama, no solo que sale verde |
| El registro de hallazgos | No existen `docs/hallazgos.md` ni `docs/trazabilidad.md` | Traerlos antes de tocar código. Es el punto 1 de la regla de arrastre, y es el que se saltó al pasar de `s3` a `s4` |

### Lo que esto le dice al Módulo 5

El módulo va de que **una regla escrita en un fichero es una petición, no una garantía**, y de bajar a la capa que ejecuta lo que falla en silencio.

`s5/start` trae el caso de estudio dentro. Su `CLAUDE.md:132` declara una regla de proceso explícita:

> «Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día.»

Y en esa rama **no hay nada que lo compruebe**: ni `scripts/`, ni `.github/`, ni una prueba. La regla depende por completo de que el agente se acuerde en cada cambio. Es literalmente la petición que el módulo describe.

Nuestro contraste es que llevamos la misma clase de regla bajada a una comprobación que corre en CI y falla la build. Y aun así, el 2026-09-02 la quinta revisión adversarial demostró que **dos de esas comprobaciones daban luz verde a mutaciones reales**, y que la primera tabla que aplicó la regla de arrastre la incumplió el mismo día en que se escribió.

Así que la lección del módulo tiene una segunda mitad que el prework no anuncia: **bajar una regla a un guardarraíl no la garantiza tampoco; la garantiza haber visto fallar el guardarraíl a propósito.** Es lo que ADR-0002 llama «una comprobación que no se ha visto fallar no cuenta», escrito antes de saber cuántas veces íbamos a necesitarlo.

---

# El defecto que arrastramos, y desde dónde

## H-19 · Las respuestas de error revelan cómo está construido el sistema

Es el único defecto que ha sobrevivido a tres módulos, a dos ramas y a dos arreglos. Merece su propia trazabilidad porque enseña más que ninguno de los que se cerraron.

### La cadena, con fechas

**Módulo 3, 2026-08-25. Se encuentra por primera vez.**

`/opsx:verify` destapó que `PATCH /api/v1/tasks/:id` con un identificador inexistente devolvía la traza completa del framework, con rutas absolutas del servidor y fragmentos de `node_modules`.

El diagnóstico fue correcto y va más allá del síntoma: **no era solo un bug, era un hueco de la spec**. Ningún requisito cubría «la tarea no existe». Primero se arregló el contrato, con un requisito nuevo y dos escenarios, y después el código.

El primer intento de arreglo falló, y eso también quedó escrito. Se creó una clase de excepción propia y el manejador la seguía renderizando con traza. Quedó registrado en `design.md` del change `add-task-list` como **D12**:

> «Se probó, y el manejador la renderizaba igualmente con traza: **el problema no era el tipo del error, sino que se lanzara**.»

El arreglo definitivo fue no lanzar: `Task.find` seguido de `response.notFound({ errors: [...] })`.

**Y ahí está el fallo de fondo, escrito por nosotros mismos.** D12 identificó la causa general -que el manejador renderiza con traza cualquier cosa que se lance- y aplicó un arreglo **local a una ruta**. La conclusión general no se llevó al sitio general.

**Módulo 4, 2026-08-26. Vuelve, en la rama del curso.**

`s4/start` resuelve los identificadores con `findOrFail`, que lanza. El defecto reaparece idéntico en las tres rutas que resuelven un identificador, y la revisión adversarial lo encuentra otra vez. Se registra como **H-19**.

No es que se hubiera reintroducido: es que el arreglo del Módulo 3 nunca salió de nuestra rama, y la del curso llegó a la misma funcionalidad por otro camino.

**Módulo 4, más tarde. Se arregla a medias, y el contrato miente por el camino.**

Al documentar el contrato se escribieron tres `404` con la forma de error del proyecto. La API devolvía otra cosa. **El documento pasó a mentir en el mismo commit que pretendía hacerlo cierto**, y ninguna prueba lo vio porque todas se conformaban con el código de estado y ninguna miraba el cuerpo.

Se normalizó entonces en el manejador de excepciones, que es el sitio general que D12 ya había señalado tres semanas antes. Ahora sí: cualquier ruta que se añada mañana lo hereda.

**Cuarta revisión adversarial, 2026-09-01. Es más ancho de lo que decíamos.**

Fuera de producción, **cualquier** excepción que el proyecto no controlara salía con el volcado completo. Se evidenció con un `500` de SQLite que devolvía la sentencia ejecutada y rutas absolutas del disco:

```
PUT /api/v1/tasks/10/due-date
{"message":"update `tasks` set … - no such column: due_date","name":"SqliteError",
 "frames":[… "fileName":"C:/Users/renel/…/node_modules/better-sqlite3/…"],"stack":"…"}
```

Y lo que es peor para la honestidad del registro: durante un tiempo el comentario del manejador y el ADR afirmaban que lo único que quedaba fuera era «una ruta desconocida». No era cierto. Corregido.

### Por qué ha sobrevivido

Tres razones, y ninguna es que fuera difícil de arreglar.

**1. El primer arreglo fue local a una ruta, aunque el diagnóstico fuera general.** Es el patrón que más veces se repite en este proyecto: se entiende bien la causa y se ataca donde escuece. Lo mismo pasó con el email del responsable, arreglado en el detalle y no en la lista.

**2. Cerrarlo del todo no es un arreglo, es una decisión.** Significa apagar el modo depuración fuera de producción, que cambia el comportamiento del framework para todo el equipo y quita información útil mientras se desarrolla. Eso merece su propio ADR, y nadie lo ha escrito.

**3. «En producción no ocurre», que además era falso.** El argumento fue que allí `debug` es `false` y el framework responde genérico. Eso lo bajó de prioridad tres módulos seguidos. Y la respuesta genérica del framework es `{ message: error.message }`, que en un error de base de datos **es la sentencia SQL**: la parte más grave de la fuga ocurría precisamente con la configuración que se citaba como prueba de que no ocurría. Nadie lo comprobó hasta la quinta revisión.

### Cómo se cerró, el 2026-09-02

Lo que faltaba no era código, era la decisión. Está en [ADR-0003](adr/0003-el-volcado-de-depuracion-va-apagado.md).

**El volcado va apagado por defecto en todos los entornos**, con `DEBUG_HTTP_ERRORS=true` para encenderlo a propósito. El falso dilema era «apagarlo y perder el diagnóstico»: se comprobó leyendo el framework que `report()` sigue registrando el error completo en el log del servidor, así que el diagnóstico **cambia de sitio, no desaparece**. El desarrollador lo tiene en su terminal; quien deja de tenerlo es quien alcanza el puerto sin credenciales.

Se descartó apagarlo solo en `test`, que habría puesto la suite en verde sobre un defecto vivo. Es justo el error que este módulo entero enseña a no cometer.

### Y volvió a pasar lo mismo, en el commit que lo cerraba

La quinta revisión adversarial, sobre ese mismo commit, encontró que **apagar el volcado no cerraba el defecto**. Quitaba las trazas de Youch y dejaba intacta la respuesta que da el framework cuando la depuración está apagada: `{ message: error.message }`. En un error de base de datos ese mensaje **es la sentencia SQL**, y en el alta de una cuenta esa sentencia lleva dentro el hash de la contraseña. Reproducido contra el servidor con `debug` ya en `false`, en un endpoint público y sin sesión.

Es el patrón de D12 por tercera vez, y esta vez lo cometimos con el diagnóstico delante: **causa general entendida, arreglo aplicado a una de sus manifestaciones**. Primero se arregló una ruta, luego una excepción, luego el volcado. Cada paso era correcto y ninguno era el sitio general.

El sitio general era la costumbre de devolver el `message` de una excepción tal cual. El cierre definitivo intercepta todo `5xx` y responde una forma cerrada, y no depende de qué excepción sea, porque el agujero nunca lo abrió una excepción concreta.

**Y la frase que lo mantuvo abierto era falsa.** «En producción no ocurre» se repitió tres módulos como motivo para bajarlo de prioridad. `debug=false` es la configuración de producción, y es exactamente con la que se reprodujo la fuga del SQL. El argumento no era una prioridad discutible: era un error de hecho que nadie comprobó.

Tres módulos abierto, dos intentos de cierre, y lo caro nunca fue el código.

---

# Lo que enseñaron cuatro revisiones adversariales seguidas

Sobre el mismo trabajo se lanzaron cuatro revisiones. Las cuatro encontraron algo real. Vale la pena mirar el conjunto, porque el patrón dice más que los hallazgos sueltos.

| | Qué destapó |
|---|---|
| Primera | Pruebas que pasaban por el motivo equivocado, y dos hallazgos del registro que describían código inexistente |
| Segunda | Cuatro de siete comprobaciones del verificador se satisfacían con un comentario |
| Tercera | El parseo de rutas era ciego a `router.any()`, a las comillas dobles y a un `.prefix()` encadenado |
| Cuarta | La comprobación recién añadida no mordía al invertir un operador |

## El patrón: verificar lo cómodo

En las cuatro, el fallo tiene la misma forma. **Quien escribe una comprobación elige también la mutación con la que la prueba, y esa mutación nunca es la que la rompe.**

Cada ronda yo endurecía el verificador y comprobaba que fallaba, mutando. Y cada ronda el revisor encontraba la mutación contigua, la que no se me había ocurrido porque era la misma cabeza la que escribía el código y el ataque.

La tercera vez dejó de ser un fallo puntual y pasó a ser un dato sobre el método. La respuesta no fue endurecer mejor: fue **dejar de parsear**. Las rutas se preguntan ahora a `node ace list:routes --json`, que es quien de verdad sabe qué rutas hay, y toda esa clase de fallo desaparece de golpe en vez de una variante por ronda.

## Los tres números de cobertura, todos mal, todos en el mismo sentido

Dije «0 de 124 escenarios», después «11 de 32 requisitos», después «18 de 18». Los tres eran falsos, y **los tres erraban en el sentido cómodo**: el primero exageraba el problema encontrado, los dos siguientes exageraban el trabajo hecho.

El número honesto, contado requisito a requisito y verificado de forma independiente, es **17 de 17 requisitos de sistema y 15 solo de pantalla**.

La lección no es que hubiera que contar mejor. Es que **un número que resume el propio trabajo no debería escribirlo quien lo hizo**, o al menos no sin que alguien lo recuente.

## Lo que sí funcionó

Conviene decirlo, porque el listado de fallos oculta que el método entero funcionó.

- **La spec como árbitro.** Ninguno de los defectos habría sido demostrable sin ella. Sin spec, el revisor opina sobre estilo; con spec, dice qué escenario se incumple y con qué petición.
- **La verificación por mutación.** Todo lo que hoy está atado se comprobó revirtiéndolo. Las comprobaciones y pruebas que no se vieron fallar no contaban, y varias veces eso destapó que no servían.
- **La defensa en profundidad.** Cuando el verificador fallaba, las pruebas cazaban el defecto igualmente. Cuando el operador del 404 se invirtió sin que el verificador se enterara, cayeron diecinueve pruebas.

**Y el hallazgo de proceso que explica todo lo demás**: la única forma de saber que una comprobación comprueba algo es verla fallar. Escrita, revisada y razonada no basta. Es H-18, y sigue abierto.

---

# Cómo se arrastra este registro

> Regla de proceso, desde 2026-09-02.

Este documento **viaja con el proyecto**, no con la rama. Ya se perdió una vez al saltar de `s3/start` a `s4/start`, y sus entradas describieron durante un tiempo el estado de otra rama como si fuera el de esta.

**Al empezar cada módulo:**

1. Traer `docs/hallazgos.md` a la rama nueva antes de tocar nada.
2. Releer las entradas abiertas y comprobar **una a una** si el defecto sigue vivo en esa rama. No suponerlo: la rama del curso llega a la misma funcionalidad por otro camino, así que algunas se arreglan solas y otras reaparecen.
3. Marcar en cada entrada **qué rama describe** cada apartado. Un «Resuelto» sin rama es una afirmación falsa esperando a que alguien la lea.

**Al cerrar cada módulo**, el reporte de análisis incluye una sección **«Lo que se arrastra»** con esta tabla:

| # | Hallazgo | Desde | Estado en esta rama | Qué falta |
|---|---|---|---|---|

**Lo que no vale**: dar un hallazgo por resuelto porque se arregló en otra rama, o porque el síntoma no se ve. H-19 sobrevivió tres módulos precisamente así, bajándose de prioridad cada vez con el argumento de que en producción no ocurre.
