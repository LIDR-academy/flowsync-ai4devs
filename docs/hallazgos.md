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

## Índice por módulo

Qué encontró cada módulo. La atribución sale del commit que introdujo cada entrada, no de la memoria.

| Módulo | Qué se estaba haciendo cuando salió | Hallazgos |
|---|---|---|
| **1** · Priming | Autenticación en el frontend | Ninguno registrado. Los del PR #12 se arreglaron en el mismo commit y no llegaron a este registro, que aún no existía |
| **2** · Spec-Driven Development | Auditar el repositorio para escribir el PRD y el backlog | **H-01 a H-10**. Diez de golpe, ninguno de código propio: salieron de **mirar** el repositorio antes de tocarlo |
| **3** · OpenSpec | La spec viva de `auth`, la gestión de tareas y la base de pruebas | **H-11** (al escribir la spec viva), **H-12** (al montar las pruebas), **H-13 y H-14** (revisión adversarial del PR #15) |
| **4** · Verificación | Trazabilidad, documentación contrastada y siete revisiones adversariales | **H-15 a H-21** de una vez, y **H-22** al cerrar. Ninguno era funcionalidad nueva: todos estaban ya en el código |
| **5** · Guardarraíles (prework) | Portar los cierres del Módulo 4 a `s5/start` | **H-23**. Y nueve de los cerrados **volvieron rotos**, tres de ellos descubiertos al ejecutar las pruebas portadas, no al leer |

**El patrón que dibuja esta tabla**: los dos módulos que no añadieron funcionalidad -el 2 y el 4- produjeron **diecisiete de los veintitrés hallazgos**. Mirar encuentra más que construir.

## Índice por severidad

| # | Hallazgo | Severidad | Estado |
|---|---|---|---|
| H-01 | Los tests comparten base de datos con desarrollo | Alta | **Resuelto** · `s3/start` 2026-08-25, `s5/start` 2026-09-02. Estaba vivo aquí |
| H-02 | Cero pruebas automatizadas en todo el proyecto | Alta | **Resuelto (2026-08-25)** |
| H-11 | El email distingue mayúsculas y minúsculas: la misma persona puede registrarse dos veces | Alta | **Resuelto** · `s3/start` 2026-08-26, `s4/start` 2026-09-02 |
| H-03 | `/account/logout` no envuelve la respuesta en `data` | Media | **Resuelto (2026-09-12)** · change `fix-logout-envelope` |
| H-04 | `fullName` es `nullable`, no `optional` | Media | Documentado y sorteado |
| H-05 | La traducción de errores depende de los nombres de regla del backend | Media | **Resuelto (2026-09-09)** · lo fija `nombres_de_regla.spec.ts` contra la API |
| H-06 | El token vive en `localStorage` | Media | Deuda aceptada |
| H-07 | El hook de formateo depende de `jq`, que no está instalado | Media | **Resuelto (2026-09-09)** |
| H-08 | `AGENTS.md` es un symlink que Windows no materializa | Baja | **Resuelto (2026-09-09)** |
| H-09 | `database/schema.ts` se regenera sin formato y rompe el lint | Baja | Vigilado · reincidente por construcción |
| H-10 | Los tipos de issue de Jira en `LID` están en dos idiomas | Baja | Sorteado |
| H-13 | Una sesión que caduca con la lista abierta deja al usuario sin salida | Media | **Resuelto** · `s3/start` 2026-08-26, `s4/start` 2026-09-02 |
| H-12 | El registro tipado de Tuyau solo modela la respuesta de éxito | Baja | Sorteado |
| H-14 | `updatedAt` vale distinto según el endpoint que lo devuelve | Baja | **Resuelto** · `s3/start` 2026-08-26, `s4/start` 2026-09-02 |
| H-15 | Una tarea hecha con la fecha pasada seguía llegando marcada como vencida | Alta | **Resuelto (2026-08-26)** |
| H-16 | Un estado inventado en el filtro devolvía 200 con lista vacía | Alta | **Resuelto (2026-08-26)** |
| H-17 | La lista filtraba el email del responsable | Alta | **Resuelto (2026-08-26)** |
| H-18 | Los changes se archivaron con verificaciones marcadas sin hacer | Alta | **Resuelto (2026-09-02)** |
| H-19 | Las respuestas de error devuelven traza, rutas y el SQL ejecutado | Alta | **Resuelto (2026-09-02)** · arrastrado desde el Módulo 3, cerrado en dos pasos |
| H-20 | Dos requisitos de la spec viva se contradecían sobre `today` | Media | **Resuelto (2026-08-26)** |
| H-21 | El orden de validación difiere entre controladores | Baja | **Resuelto (2026-09-02)** · ADR-0006 |
| H-22 | La tabla «Lo que se arrastra» dio por cerrados tres hallazgos sin comprobarlos en la rama | Alta | **Resuelto (2026-09-02)** |
| H-23 | Cuatro rutas de `auth` están fuera del contrato generado | Media | **Resuelto (2026-09-09)** |
| H-24 | La verificación nunca ha corrido en el repositorio donde vive el PR | Alta | Aceptado por los mantenedores (2026-09-13) · los PR se quedan abiertos y los resultados se leen en el fork |
| H-25 | El contrato versionado declaraba públicas dos rutas protegidas | Alta | **Resuelto (2026-09-08)** |
| H-26 | El documento servido en `/api.json` crece en cada petición | Media | **Resuelto (2026-09-09)** |
| H-27 | La puerta del revisor buscaba el PR con una consulta que nunca encuentra nada | Alta | **Resuelto (2026-09-09)** |
| H-28 | La lista de negación del revisor nombraba una herramienta que su versión no conoce | Media | **Resuelto (2026-09-09)** |
| H-29 | Dos comprobaciones del verificador se satisfacían con un comentario | Alta | **Resuelto (2026-09-09)** |
| H-30 | El PR es demasiado grande para una sola revisión | Media | **Resuelto (2026-09-09)** · partiendo la unidad de trabajo |
| H-31 | El change archivado que las decisiones citaban no cruzó de rama | Baja | **Resuelto (2026-09-09)** |
| H-32 | La regla del 401 estaba escrita en dos sitios | Baja | **Resuelto (2026-09-09)** |
| H-33 | El tablero de Jira llevaba dieciséis días contradiciendo al repositorio | Media | **Resuelto (2026-09-09)** |
| H-34 | Una decisión de producto declarada pendiente se resolvió en el código, y nadie la escribió | Media | **Resuelto (2026-09-09)** |
| H-35 | La caché del contrato servido dejaba pasar dos construcciones a la vez | Media | **Resuelto (2026-09-12)** |
| H-36 | R-08 se declaró cumplida y en cuatro días se incumplió nueve veces | Media | **Resuelto hacia delante (2026-09-12)** · CI lo impide |
| H-37 | Rehidratar la sesión con un 401 depende de que otro efecto ya esté suscrito | Baja | Vigilado · prueba de navegador desde 2026-09-13 |
| H-38 | Un comentario decía que el arranque no cierra la sesión, y la cierra | Baja | **Resuelto (2026-09-13)** |
| H-39 | El resumen del revisor daba vacío el diagnóstico de una credencial rota | Baja | **Resuelto (2026-09-13)** |

> **Estado del registro al cerrar el proyecto, 2026-09-13.** De 39 hallazgos: **ninguno abierto**; **dos vigilados**, H-09 y H-37, cuya fragilidad sigue a propósito con algo que la vería; **cinco con los que se convive por decisión**, H-04, H-06, H-10 y H-12, y H-24, que decidieron los mantenedores del curso; y **32 resueltos**. Revisado entrada a entrada contra su cabecera, porque hasta ese día este índice decía «Abierto» en H-07 y H-23, cerrados cuatro días antes, y no llegaba más allá de H-23.

> **Al abrir el Módulo 5**, la comprobación contra `s5/start` dice que **seis de los siete** vuelven rotos: H-11, H-13, H-14, H-15, H-16 y H-19. Solo H-17 llega arreglado. Evidencia y plan de acción de cada uno en la sección «Al abrir el Módulo 5», más abajo.

---

## H-01 · Los tests comparten base de datos con desarrollo

**Severidad: alta.** **Cerrado** en el Módulo 3 con [ADR-0003](adr/0003-aislamiento-de-la-base-de-datos-en-pruebas.md), **reabierto** al saltar a `s5/start` y **cerrado otra vez** en el port del 2026-09-02. `config/database.ts` elige el fichero según el entorno y `bin/test.ts` fuerza `NODE_ENV=test`. Lo vigila `tests/functional/aislamiento.spec.ts`, que es la prueba que lo detectó al fallar.

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
> Resuelto aquí por [ADR-0003](adr/0003-aislamiento-de-la-base-de-datos-en-pruebas.md), con la misma decisión y una diferencia: **los hooks por fichero se mantienen tal cual**, no se centralizan en `suite.onGroup`.
> Y a diferencia de `s3/start`, aquí lo fija una prueba: `tests/functional/aislamiento.spec.ts` le pregunta a la conexión viva por su fichero.

---

## H-02 · Cero pruebas automatizadas en todo el proyecto

**Severidad: alta.** **Cerrado.** De cero pruebas a una suite de backend, otra de frontend y pruebas de navegador, que corren en CI, con su trazabilidad requisito a requisito. Cuántas hay lo dice `CLAUDE.md`, y CI lo contrasta con lo que ejecuta el runner. El hueco que queda es otro y está declarado: no hay runner de navegador.

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

> **En `s4/start` el estado es otro**: 71 pruebas funcionales de backend y 28 de frontend. El runner de frontend tampoco había cruzado de rama, y se recuperó el 2026-09-02.
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

**Severidad: media.** **Cerrado** el 2026-09-12. Estuvo abierto a propósito desde el Módulo 2, sorteado y documentado como era.

Todos los endpoints pasan por `ctx.serialize()`, que envuelve el payload bajo la clave `data`. **Salvo logout**, que devuelve el objeto plano:

```
POST /api/v1/account/logout
200 {"message":"Logged out successfully"}
```

**Cómo se verificó**: petición real con `curl` y un token válido.

**Consecuencia**: cualquier cliente que use un desenvolvedor genérico obtiene `undefined` en silencio. No lanza, no avisa.

**Cómo está sorteado**: `frontend/src/lib/api.ts` no tiene desenvolvedor genérico. Cada función decide qué hace con el cuerpo, y `logout` descarta el resultado con `.then(() => undefined)`.

> **Corrección (2026-08-26).** Esta entrada decía que `api.ts` «separa `send()` de `request()`, y logout usa el primero». Esa función nunca ha existido en ninguna rama. Lo detectó la revisión adversarial del PR #15.

**Resuelto el 2026-09-12** por el change `fix-logout-envelope`. El cierre de sesión responde `200 {"data": {"message": "Logged out successfully"}}`: mismo código y mismo mensaje, dentro del envoltorio. Se descartó `204 No Content` porque cambiaba dos cosas del contrato para cerrar un hallazgo que solo trata de una (`design.md` D1).

**Por qué duró tanto sin contradecir nada.** La spec viva exigía la forma plana en su escenario, y el requisito de forma decía «envolver los **datos de cuenta**»: un mensaje de cierre no lo es, así que la excepción cabía. El change amplía la regla a **toda respuesta de éxito** de `auth`, para que la próxima sí choque con un requisito.

**Cómo se verificó**, en este orden:

1. Reproducido contra el servidor de desarrollo con una cuenta de sonda: `200 {"message":"Logged out successfully"}`.
2. Dos pruebas escritas antes del arreglo y vistas en rojo: el cuerpo exacto del cierre en `session.spec.ts`, y otra que recorre las cuatro respuestas de éxito de `auth` exigiendo `data` como **única** clave de primer nivel. La segunda nombró `cierre`.
3. `openapi:check` en rojo antes de regenerar, nombrando las cinco rutas JSON que cambiaban: cuatro del esquema y la descripción que citaba H-03.
4. Verde tras el arreglo: 83 de 83. **Mutación**: devolver otra vez el objeto plano tumba las dos, 81 de 83.
5. Otra vez contra el servidor: `{"data":{"message":"Logged out successfully"}}`, y el token revocado responde `401`.
6. En navegador, cerrar sesión desde el perfil sigue llevando a la pantalla de acceso sin aviso. El frontend no cambió: `logout` ya descartaba el cuerpo, que es por lo que el hallazgo nunca rompió nada visible.

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

**Severidad: media.** **Cerrado el 2026-09-09.** Estuvo dieciséis días como «parcialmente vigilado», y esa nota era generosa: las 28 pruebas del frontend cubren `lib/api.ts` con payloads fabricados a mano, así que seguían en verde aunque el backend dejara de emitir un nombre de regla. Comprobaban la traducción, no el acoplamiento. Lo ata ahora `tests/functional/nombres_de_regla.spec.ts`, que pide a la API de verdad los ocho identificadores que el `switch` traduce -`database.unique`, `sameAs`, `email`, `required`, `minLength`, `maxLength`, `date` y `enum`- y falla nombrando el que falte. Visto fallar quitando `.maxLength(200)` del validador de tareas: «el frontend traduce reglas que la API ya no emite: maxLength».

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
| Que el diccionario del frontend no cambie por accidente | Cubierto. `src/lib/api.test.ts` falla si se toca un mensaje. Estuvo sin vigilar en `s4/start` hasta el 2026-09-02, porque el runner no había cruzado de rama |
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

**Severidad: media.** **Cerrado el 2026-09-09**, dos semanas y media después de registrarse.

El hook `PostToolUse` de `.claude/settings.json` formateaba con Prettier cada fichero de `frontend/` que Claude tocara. Extraía la ruta del payload con `jq`, **y `jq` no está en esta máquina**. El comando terminaba en `2>/dev/null || true`, así que el fallo no dejaba ni una línea.

**Resultado: el hook no ha formateado nunca nada, y siempre salió bien.**

**Cómo se verificó**, el 2026-09-09, escribiendo a propósito un fichero mal formateado en `frontend/src/`:

```
export const sinFormato = {    a:1,
      b:   2 }
```

Con el hook activo, el fichero se quedó **exactamente así**. Si hubiera corrido, Prettier lo habría dejado en una línea.

**Arreglo**: la ruta se extrae con `node -e`, que sí está garantizado -el proyecto entero lo necesita-, y **se quita el `2>/dev/null`**. Si Prettier falla ahora, lo dice por `stderr`. Se conserva el `|| true` para que un fallo del formateador no aborte la edición, que es una decisión distinta de esconderlo.

**Cómo se comprobó el arreglo**, ejecutando el comando del hook a mano con un payload simulado, porque los hooks se cargan al arrancar la sesión y el cambio no aplica a la sesión en curso:

| Caso | Resultado |
|---|---|
| Fichero de `frontend/` mal formateado | **Prettier lo reformatea**: `export const sinFormato = { a: 1, b: 2 }` |
| Fichero de `backend/` | Intacto, como debe |
| Payload que no es JSON | Sale `0` sin reventar |

**Lo que enseña, y es el módulo entero en un hook de tres líneas**: `|| true` convirtió una herramienta rota en una herramienta invisible. Durante dieciocho días el formateo del frontend dependió de que alguien corriera `npm run format` a mano, y nada lo dijo. La primera vez que se miró, se cayó a la primera.

## H-08 · `AGENTS.md` es un symlink que Windows no materializa

**Severidad: baja.** **Cerrado el 2026-09-09.**

`AGENTS.md` estaba en el índice con modo **`120000`**, un symlink a `CLAUDE.md`. Un symlink solo se materializa donde el sistema lo permite: en Windows, con `core.symlinks=false`, git escribe un fichero de texto de **nueve bytes** cuyo contenido es la cadena `CLAUDE.md`.

Quien abriera `AGENTS.md` en esa máquina no encontraba las instrucciones ni un aviso de dónde están: encontraba **un nombre de fichero suelto, sin contexto**.

**Estuvo abierto veintiséis días con la nota «sin impacto mientras se trabaje solo con Claude Code»**, que era cierta y por eso no se tocó. Deja de serlo en cuanto lo abre otra herramienta, y `AGENTS.md` existe precisamente para que lo abran otras.

**Arreglo**: un fichero de verdad con un puntero escrito. Funciona en los dos sistemas y **no puede desincronizarse**, porque no duplica ni una línea de las instrucciones. Es menos elegante que un symlink y es lo que se lee igual en todas partes.

**Qué lo vigila**: una comprobación del verificador que mira el **modo en el índice**, no el fichero del disco. La distinción importa: en la máquina donde el symlink no se materializa, leer el fichero no distingue un puntero escrito de un symlink roto -los dos son texto corto que dice `CLAUDE.md`-. Lo que los distingue es `git ls-files -s`.

**Vista fallar** devolviendo el modo a `120000` con `git update-index --cacheinfo`: «AGENTS.md ha vuelto a ser un symlink: en Windows se lee como texto suelto».

## H-09 · `database/schema.ts` se regenera sin formato y rompe el lint

**Severidad: baja.** **Vigilado**, que aquí es lo alcanzable. Sigue siendo reincidente -el generador reescribe el fichero cada vez que se corren migraciones- y no hay forma de impedirlo desde fuera. Lo que sí hay es que `database/schema.ts` **no está excluido del lint**, así que una regeneración mal formateada pone `npm run lint` en rojo, y ese lint corre en CI. Comprobado el 2026-09-09: el fichero pasa Prettier hoy.

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

**Y la prueba tampoco cruzó, y esa la olvidé yo.** Se portó el arreglo el 2026-09-02 y no el fichero que lo guardaba, que vivía en `frontend/src/lib/api.test.ts` de `s3/start` junto con el runner entero. Es el cuarto caso del patrón de H-22, y el único cometido **después** de escribir la regla que lo prohíbe, en el mismo commit que la escribía.

Recuperado el mismo día: `vitest` vuelve al frontend, `npm test` corre en CI, y 28 pruebas cubren `lib/api.ts`. Tres mutaciones lo demuestran: quitar la emisión del aviso de 401 tumba una, devolver el estado inventado al mensaje genérico tumba dos, y quitar el `silenciarRechazo` del cierre de sesión tumba otra.

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

**Resuelto el 2026-09-02**: `Task.releerConResponsable(id)` devuelve lo persistido con el responsable, y lo usan las tres escrituras. Está en el modelo y no repetido en cada controlador, para que la cuarta lo herede.

Cuesta **dos consultas** por escritura -una por la tarea y otra por el responsable, que es lo que `preload` emite siempre- frente a la que costaba antes. Se paga a cambio de que la respuesta diga lo que hay en la base. La sexta revisión adversarial lo midió con `DEBUG=knex:query` y encontró cuatro documentos afirmando que era una sola; corregidos.

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

**Severidad: alta.** **Cerrado el 2026-09-09.** Es de proceso, no de código, y es el mecanismo que produjo H-15, H-16 y H-17. Lo cierra una comprobación del verificador: un change archivado con casillas sin marcar tiene que declarar **cuáles y qué costó**, en una sección «Lo que no se ejecutó» con filas de verdad -la séptima revisión adversarial ya intentó pasarla con la sección vacía-. **Vista morder el mismo día**: al recuperar el change de [H-31](#h-31--el-change-archivado-que-las-decisiones-citaban-no-cruzó-de-rama) apareció con tres casillas mudas y la build se puso roja hasta declararlas.

`openspec/changes/archive/2026-08-13-add-task-list/tasks.md` contiene sin marcar:

```
- [ ] 6.3 Verificar que ninguna respuesta de tareas incluye el email del responsable
```

y el change se archivó igualmente. Su `design.md` había predicho el fallo con nombre y apellidos: «la regresión más probable, que el responsable acabe filtrando el email al cliente, no la va a detectar nada automático». Ocurrió exactamente eso.

Peor en el change del filtro: `2026-08-13-add-task-status-filter/tasks.md` marca **`[x]`** la casilla «Verificar que un estado inventado devuelve 422 y no una lista vacía» sobre código que nunca lo ha hecho, y su `design.md` afirma que el validador declara `vine.enum(TASK_STATUSES).optional()`, que no era cierto.

**Resuelto el 2026-09-02**, y no como se esperaba.

La idea original era «una casilla marcada tiene que significar que se ejecutó algo». **Eso no se puede comprobar**: nada automático sabe si alguien recorrió una pantalla a mano. Perseguirlo habría producido otra regla escrita sin nada que la ejecute, que es el defecto que este hallazgo describe.

Lo que sí se puede exigir es que una casilla sin marcar **no sea muda**. Una casilla vacía en un change archivado es hoy indistinguible de una que nadie tuvo que hacer, y esa ambigüedad **es** el defecto: no es que la verificación falte, es que su ausencia no se ve.

Así que la regla es otra: un change se archiva con las casillas que quiera sin marcar, y el fichero declara cuáles y qué costaron. Lo ejecuta una comprobación del verificador, que falla si un archivado tiene casillas sin marcar y no trae su sección «Lo que no se ejecutó».

Los tres archivados llevan ya esa sección, escrita con lo que de verdad pasó:

| Change | Casillas | Lo que costó |
|---|---|---|
| `add-task-list` | 4 sin marcar | La 6.3 era «verificar que ninguna respuesta incluye el email del responsable». Es **H-17**, y el `design.md` del propio change lo había predicho con nombre y apellidos |
| `add-task-due-date` | 5 sin marcar | Dos de ellas describían exactamente **H-15**. Estaban escritas, en el sitio correcto, y sin ejecutar |
| `add-task-status-filter` | 1, y estaba marcada `[x]` | Marcada sobre código que nunca lo hizo. Es **H-16**. Desmarcada: era falsa |

**La casilla del filtro se deja sin marcar a propósito**, aunque el comportamiento exista desde el 2026-08-26 y lo fije `filtro.spec.ts`. Marcarla ahora afirmaría una verificación que nadie hizo entonces, que es repetir el defecto para taparlo.

**Cómo se verificó**: mutación. Renombrar la sección de un archivado tumba la comprobación nombrando el change.

**Lo que sigue sin cubrir, y se dice**: una casilla marcada que miente. Nada automático la distingue de una cierta. Lo único que hay contra eso es que ahora el coste de las tres que fallaron está escrito al lado, en el mismo fichero que la próxima persona va a leer antes de marcar la suya.

---

## H-19 · Las respuestas de error devuelven traza, rutas y el SQL ejecutado

**Rama: `s4/start`. Severidad: alta. Resuelto el 2026-09-02**, en dos pasos y tras tres módulos abierto.

`app/exceptions/handler.ts` fijaba `debug = !app.inProduction`, así que fuera de producción cualquier error respondía con el volcado completo: nombre de fichero absoluto, número de línea, trozos de código fuente de `node_modules` y la sentencia SQL ejecutada.

**Cómo se verificó**: un `PUT` sobre una base sin migrar devolvió la sentencia `update tasks set ...` completa y las rutas absolutas del disco. Cuarta revisión adversarial del Módulo 4.

### El primer cierre, y por qué no bastaba

[ADR-0005](adr/0005-el-volcado-de-depuracion-va-apagado.md) apagó el volcado por defecto **en todos los entornos**, con `DEBUG_HTTP_ERRORS=true` para encenderlo a propósito.

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

**Rama: `s4/start`. Severidad: baja. Resuelto el 2026-09-02** por [ADR-0006](adr/0006-validar-antes-de-resolver.md).

`TaskStatusesController.update` y `TaskDueDatesController.update` resolvían la tarea **antes** de validar; `TasksController.show` validaba antes. Los dos caminos cumplían la spec, pero significaba que un `PATCH` con estado inventado sobre una tarea inexistente daba 404, mientras un `GET` sin `today` sobre una tarea inexistente daba 422.

**Cómo se verificó**: lectura de los tres controladores. Cuarta revisión adversarial del Módulo 4.

**Por qué no era un bug sino una decisión**: ningún escenario de la spec lo fijaba, así que no había contra qué contrastarlo. Se dejó abierto a propósito, con la nota de que convenía cerrarlo antes de que alguien construyera encima.

**Resuelto**: se valida primero. Un `404` afirma «te entendí y ese recurso no está», y esa afirmación no se puede hacer sobre una petición que no se ha entendido. Cuando la petición sí se entiende, el `404` vuelve a ser lo correcto.

Se descartó el orden contrario, que era el mayoritario -dos rutas de tres-, y con él su argumento habitual: aquí no vale, porque la lista de tareas es del espacio entero y la existencia de una tarea no es secreto para nadie con sesión.

**Cómo se verificó**: cuatro pruebas en `tests/functional/tasks/orden_de_validacion.spec.ts`, que fijan los dos lados. Invertir el orden en **una sola** acción tumba una; comprobado. Y una comprobación del verificador recorre cada acción de cada controlador, no cada fichero, y falla nombrando la acción concreta.

La spec lo recoge ahora como requisito con tres escenarios. Sin eso seguiría siendo una costumbre.

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

**Y hubo un cuarto caso, cometido al cerrar este mismo hallazgo.** Al portar H-13 se trajo el código del arreglo y no la prueba que lo guardaba, porque esa prueba vivía en un runner de frontend que tampoco había cruzado de rama. Nadie lo notó: el frontend no tenía pruebas, así que no faltaba ninguna. Recuperado el 2026-09-02.

Es la forma más incómoda del patrón: **el hueco no se ve cuando lo que falta es la herramienta que lo mediría.** `CLAUDE.md` decía «el frontend no tiene runner de tests en esta rama», y se leía como una limitación del curso cuando era algo que teníamos y perdimos.

**Lo que no se arregla con código**: comprobar una fila cuesta minutos y darla por buena cuesta cero. Lo único que lo sostiene es que la columna «Estado» nombre la rama y la fecha en que se miró, no un «Cerrado» a secas.

---

## H-23 · Cuatro rutas de `auth` están fuera del contrato generado

**Rama: `s5/start`. Severidad: media.** **Cerrado** el 2026-09-09.

`signup`, `login`, `logout` y `profile` no llevan decoradores de respuesta de `@foadonis/openapi`, así que el documento las publica **con `responses: {}`**: cuatro de las nueve rutas de la API no dicen nada de lo que devuelven.

> **Corrección del 2026-09-08.** Esta entrada decía que el documento «las omite» y que «no existen para quien integre leyendo el contrato». **Es falso**: las cuatro rutas están en el documento, con su método y su ruta. Lo que falta son sus respuestas. La diferencia importa, porque una ruta ausente se nota al integrar y una ruta presente y vacía no. Lo encontró la octava revisión adversarial, y por el camino encontró algo peor: ver **H-25**.

**Cómo se verificó**: contra el servidor de la rama. `/api.json` devuelve las cinco operaciones de tareas y ninguna de cuentas. Séptima revisión adversarial, 2026-09-02.

**Por qué no lo encontró nadie antes**: porque un generador **escribe fielmente lo que hay decorado y no dice nada de lo que no lo está**. No hay hueco visible: el documento sale bien formado, completo de su parte, y en silencio sobre el resto. Es el argumento de [ADR-0004](adr/0004-la-documentacion-se-verifica-no-se-regenera.md) llegando por una puerta que no habíamos previsto.

**Por qué estuvo abierto**: decorarlas exigía esquemas de respuesta que `app/openapi/schemas.ts` no tenía. Eso era trabajo del módulo sobre esta rama, no de un traslado, y hacerlo dentro del port habría hecho que el PR hiciera algo que no declaraba.

**Arreglo, 2026-09-09.** Los esquemas que faltaban -`Account`, `AccountResponse`, `AccessTokenGrant`, `AccessTokenResponse`, `LogoutResponse`, `SignupBody`, `LoginBody`- y los decoradores en los tres controladores. Las nueve rutas de la API declaran ahora sus respuestas y su 500.

Dos cosas quedaron documentadas **como son y no como deberían ser**, que es lo que hace útil un contrato:

- El cierre de sesión **no iba envuelto en `{ data }`**, y era la única respuesta del proyecto así. Era [H-03](#h-03), cerrado el 2026-09-12: el contrato ya lo declara envuelto.
- `fullName` es **obligatorio en el payload aceptando `null`**, no opcional. Es [H-04](#h-04), y omitirlo devuelve 422.

**Qué lo vigila**: la misma comprobación del verificador, con la **lista cerrada ahora vacía**. Vacía sigue mordiendo: cualquier controlador nuevo sin decorar cae en `inesperados` y falla la build. Vista fallar quitándole los decoradores a `ProfileController`: «fuera del contrato, sin declarar: profile_controller.ts (1)». Borrar la comprobación al cerrar el hueco es como vuelven los defectos.

> **Y este hallazgo estuvo tres días sin registrar.** Se le puso número en `scripts/verificar-docs.mjs` y en `docs/capabilities/tasks/README.md` el 2026-09-02, y la entrada no existía: `hallazgos.md` no tenía ningún `H-23`. Un número citado en dos sitios que no apunta a nada es peor que no numerarlo, porque quien lo lea creerá que hay algo escrito. Registrado el 2026-09-05.

## H-24 · La verificación nunca ha corrido en el repositorio donde vive el PR

**Rama: todas. Severidad: alta.** **Aceptado por los mantenedores del curso** el 2026-09-13; abierto hasta ese día. Encontrado en la Demo 1 del Módulo 5.

`verificacion.yml` dispara en `pull_request` y bloquea. Pero nuestros PR son **cross-repo**: salen de `rene2bcore` y apuntan a `LIDR-academy`, así que el workflow lo ejecuta el repositorio del curso, y allí GitHub exige que un mantenedor del repositorio base apruebe cada ejecución. Ninguna se ha aprobado.

**Cómo se verificó**: `gh run list` contra los dos repositorios, el 2026-09-08 y otra vez el 2026-09-12.

**Este es el único sitio del repositorio que da la cifra**, y la da con fecha. Crece con cada empujón a una rama que tenga PR abierto en el curso, así que cualquier número copiado a otro documento queda desfasado en días: pasó, y otros cuatro documentos decían 35 cuando ya eran 56. Los demás apuntan aquí.

```bash
gh run list -R LIDR-academy/flowsync-ai4devs --workflow=verificacion.yml --limit 500 --json conclusion --jq 'group_by(.conclusion) | map({(.[0].conclusion): length}) | add'
```

| Repositorio | Evento | 2026-09-08 | 2026-09-12 | Resultado |
|---|---|---:|---:|---|
| `LIDR-academy/flowsync-ai4devs` | `pull_request` | 35 | **56** | **`action_required`. Ninguna ha ejecutado un solo paso** |
| `rene2bcore/flowsync-ai4devs` | `push` | 47 | 69 | 67 en verde y 2 en rojo, con los tres jobs ejecutados |
| `rene2bcore/flowsync-ai4devs` | `pull_request` | - | 19 | 17 en verde y 2 en rojo: los PR dentro del fork de la mitigación |

Las 56 del curso se reparten entre tres ramas: `s4/start` (25), `feat/sesion-5-guardarrailes` (24) y `feat/portar-cierres-modulo-4` (7). Las ejecuciones en verde que el repositorio del curso sí tiene son de otros workflows y de ramas que no son nuestras.

> **Estas cifras estuvieron mal, y el error es del tipo que este documento persigue.** El 2026-09-08 decían 16 y 10. Salieron de `gh run list`, que **devuelve veinte filas por defecto**: se contó una página, no los casos. Lo encontró la octava revisión adversarial y lo corrigió `--limit`.
>
> Es el hermano de [R-06](auditoria-reglas-de-proceso.md) -leer una salida truncada en vez del dato- y contradice el paso 2 del método que el propio documento de auditoría declara: «contar los casos, no dar una impresión». Y falló **en la dirección que minimiza el hallazgo**: son más del doble.

**Lo que sí funciona**: en nuestro fork, sobre `push`, los tres jobs -Backend, Frontend y «La documentación corresponde con el código»- se ejecutan y pasan. Comprobado abriendo una ejecución y mirando sus jobs, no el color del resumen.

**Lo que no**: ese resultado **no llega al sitio donde alguien lo miraría**. En el PR no hay check, no hay rojo posible, y no bloquea nada. Es lo que la Sesión 5 llama un hallazgo que vive en un log: si no está en el PR, para el equipo no existe.

**Y lo que este hallazgo rompe.** [`auditoria-reglas-de-proceso.md`](auditoria-reglas-de-proceso.md) marcaba `R-05` como **Se cumple**, con este argumento: «su comprobación corre en CI y se la ha visto fallar, así que no hay nada que contrastar en el directo». Las dos mitades fallan:

- **«Corre en CI»** es cierto solo en nuestro fork y solo sobre `push`. Sobre el PR, ninguna de sus ejecuciones ha corrido.
- **«Se la ha visto fallar»** era cierto, el día que se encontró, solo **en local**, mutando a mano: **el job de CI no se había puesto en rojo nunca**. Por R-14, el job -que es otra cosa que el script- todavía no contaba. Su primer rojo es de esa misma tarde, en la mitigación de abajo.

Es H-22 otra vez, y esta vez sobre la única fila que se había atrevido a decir «se cumple», en el documento escrito para advertir contra exactamente eso.

**Mitigación, comprobada el 2026-09-08.** Abrir el cambio también como **pull request dentro del fork** (`rene2bcore#1`). Ahí el evento `pull_request` sí dispara, con secretos, y los checks aparecen en el PR.

> **Retirada el 2026-09-09, por redundante.** `verificacion.yml` dispara en `push` a cualquier rama, así que las tres comprobaciones ya corrían en cada empujón sin necesidad de ese PR; y desde que [H-27](#h-27--la-puerta-del-revisor-buscaba-el-pr-con-una-consulta-que-nunca-encuentra-nada) está arreglado, el revisor también. El módulo pide **un solo PR**, así que el segundo se cerró. Lo que la mitigación demostró -que el evento corre y muerde- sigue en pie y está en las dos ejecuciones que quedaron registradas.

Se comprobó en las dos direcciones, que es lo que la hace contar:

| | |
|---|---|
| Primera ejecución sobre `pull_request` | **`failure`.** Dos jobs en rojo por los comandos de ace, que en Linux rompían la build |
| Tras el arreglo | **`success`**, con los tres jobs ejecutados |

Es decir: el evento no solo corre, **muerde**. Y encontró en su primera ejecución un defecto que el verde en local no podía ver.

**Lo que la mitigación no resuelve**: el PR que el curso mira sigue siendo el de `LIDR-academy`, y ahí los checks siguen sin correr. Son dos PR para el mismo cambio, uno donde se ejecuta y otro donde se lee. Cerrarlo del todo depende de que un mantenedor del repositorio base apruebe las ejecuciones, y eso no está en nuestra mano.

**La respuesta de los mantenedores, 2026-09-13.** Los PR **se quedan abiertos donde están y no se fusionan**: es un ejercicio repartido entre más de treinta personas. Lo que les sirve es poder ver los resultados de las pruebas automatizadas, y eso ya lo tienen en las ejecuciones del fork. No se aprueban las del curso: ese mismo día, las 50 de `feat/sesion-5-guardarrailes` allí seguían en `action_required`.

Así que el hallazgo no se cierra: **se acepta**, y por quien tenía que decidirlo. El hecho sigue en pie -el PR que se lee no lleva checks- y deja de ser un pendiente.

## H-25 · El contrato versionado declaraba públicas dos rutas protegidas

**Rama: `feat/sesion-5-guardarrailes`. Severidad: alta.** **Cerrado** el 2026-09-08, el mismo día que se introdujo.

`docs/api/openapi.json` publicaba `GET /api/v1/account/profile` y `POST /api/v1/account/logout` con **`"security": []`**.

En OpenAPI eso **no** significa «no se ha dicho nada»: es la forma explícita de decir **«esta ruta no exige autenticación»**, y anula cualquier requisito global. El documento las declaraba públicas, al lado de `/api/v1/tasks`, que sí llevaba `"security": [{"bearer": []}]`. Las dos las protege `middleware.auth()` desde siempre.

**Por qué es peor que H-23, con el que se confundía.** Una ruta sin respuestas documentadas se nota al integrar: no hay nada que leer. Una ruta que **afirma** ser pública no se nota: quien integre leyendo el contrato escribirá un cliente sin cabecera, lo probará, recibirá `401`, y buscará el error en su código antes que en el documento.

**Cómo se encontró**: octava revisión adversarial, sobre el PR de la sesión, contrastando el contrato contra `openspec/specs/auth/spec.md` y `backend/tests/functional/auth/session.spec.ts`.

**Por qué no lo vio nada más.** Tres capas fallaron a la vez, y esa es la parte que enseña:

| | Por qué no |
|---|---|
| `scripts/verificar-docs.mjs` | **No abría `docs/api/openapi.json`** en ninguna de sus quince comprobaciones |
| `openapi:check` | Compara el fichero contra el documento generado. Los dos decían lo mismo, y lo que decían era falso |
| `REVIEW.md` | Ponía `docs/api/openapi.json` en «ficheros generados: no reportar», retirando de la revisión el único artefacto que lo afirmaba |

**Arreglo**: `@ApiBearerAuth()` en `ProfileController.show` y `AccessTokensController.destroy`.

**Qué lo vigila**: una comprobación nueva del verificador que pregunta al framework qué rutas llevan `middleware.auth()` -no lo deduce del fuente ni del nombre- y exige que cada una declare un esquema de seguridad no vacío en el contrato versionado. Vista fallar en las dos direcciones: quitando el decorador («el contrato las declara publicas») y borrando la ruta del fichero («protegidas y fuera del contrato»).

**Y la lección de método**: un guardarraíl que compara dos artefactos **derivados de la misma fuente** no puede detectar que la fuente miente. `openapi:check` estaba en verde y tenía razón: el fichero era idéntico al documento generado. Hacía falta contrastar contra algo que **no** viniera del generador, y eso fue el listado de rutas del framework.

## H-26 · El documento servido en `/api.json` crece en cada petición

**Rama: todas las que traen `@foadonis/openapi`. Severidad: media.** **Cerrado el 2026-09-09.**

Cada petición a `/api.json` devuelve un documento con **un parámetro de ruta duplicado más** que la anterior.

**Cómo se verificó**, 2026-09-09, tres peticiones seguidas al servidor de desarrollo:

```
peticion 1 -> parametros de ruta 'id': 5
peticion 2 -> parametros de ruta 'id': 6
peticion 3 -> parametros de ruta 'id': 7
```

A partir de la segunda, el documento es **OpenAPI inválido**: la especificación exige que la pareja `name` + `in` sea única dentro de una operación.

**La causa**, en `node_modules/@foadonis/openapi/build/src/openapi.js`:

```js
async buildDocument() {
    if (this.#document && this.#isProduction) {
        return this.#document
    }
    ...
}
```

**El documento se cachea solo en producción.** Fuera de ella se reconstruye en cada petición, y la reconstrucción acumula sobre la metadata de los decoradores en vez de partir de cero.

**Lo que no se ha comprobado, y se dice**: que en producción no ocurra. Se deduce de esa condición, no se ha ejecutado con `NODE_ENV=production`. Dar por bueno un «en producción no pasa» sin reproducirlo es exactamente el error que costó tres módulos con [H-19](#h-19--las-respuestas-de-error-devuelven-traza-rutas-y-el-sql-ejecutado).

**Por qué no lo cazó `openapi:check`**: porque construye el documento **una sola vez, en un proceso nuevo**. Su primera construcción es correcta, así que el fichero versionado está bien y la comparación da verde con razón. El defecto vive en el servidor, no en el fichero.

**Y por qué importa menos de lo que parece**: por [ADR-0007](adr/0007-el-contrato-se-genera-se-versiona-y-se-vigila-la-deriva.md). El contrato que se integra es `docs/api/openapi.json`, no la URL. La decisión de versionarlo se tomó por otro motivo -hacer la deriva visible en un diff- y resulta que también protege de esto. `/api.json` queda como conveniencia para mirar, no como fuente.

**Qué lo vigila**: una comprobación del verificador que exige `name` + `in` únicos por operación en el fichero versionado. No mira la URL -eso exigiría levantar el servidor en CI-, pero sí ataja el caso en que alguien genere el fichero desde un proceso ya calentado. Vista fallar duplicando el `id` de `GET /tasks/:id` a mano.

## Arreglo, 2026-09-09: el documento se construye una vez

Se retira `openapi.registerRoutes()` y las tres rutas se registran en `start/routes.ts`, sirviendo un documento **construido una sola vez**. La caché no distingue entornos porque el problema tampoco: en producción el documento no cambia mientras el proceso vive, y en desarrollo el servidor se reinicia con cada cambio que lo afectaría.

**Medido antes y después**, cuatro peticiones seguidas al servidor:

| | Parámetro `id` en `GET /tasks/{id}` |
|---|---|
| Antes | 5, 6, 7 · crecía una por llamada |
| **Después** | **1, 1, 1, 1** |

**Y algo que no se buscaba**: el documento servido pasa a ser **byte a byte idéntico** al versionado. Antes difería siempre, y `openapi:check` daba verde con razón porque compara el fichero contra una construcción nueva, no contra la URL. Ahora las tres cosas dicen lo mismo.

**Un cambio de contrato que conviene no dejar pasar en silencio**: las tres rutas de la propia documentación -`/api`, `/api.json`, `/api.yaml`- **salen del documento**. Estaban ahí porque el controlador de la librería lleva decoradores; los nuestros no. Aparecían con `responses: {default}` y `security: []`, es decir, sin decir nada útil sobre sí mismas. El contrato pasa de ocho rutas a ocho rutas de producto, y qué rutas existen sigue estando donde debe: en la tabla de `CLAUDE.md`, que el verificador contrasta contra `list:routes`.

**Lo que este arreglo no hace**: corregir la librería. `buildDocument()` sigue acumulando si se la llama dos veces en el mismo proceso. Lo que se ha hecho es llamarla una sola vez.

> **Y no la llamaba una sola vez.** La caché se rellenaba después del `await`, así que dos peticiones simultáneas al arrancar lanzaban dos construcciones solapadas. Lo encontró el revisor de CI tres días después, y es [H-35](#h-35--la-caché-del-contrato-servido-dejaba-pasar-dos-construcciones-a-la-vez).

## H-27 · La puerta del revisor buscaba el PR con una consulta que nunca encuentra nada

**Rama: `feat/portar-cierres-modulo-4` en adelante. Severidad: alta.** **Cerrado** el 2026-09-09.

El job del revisor dispara en `push` y, antes de gastar nada, comprueba que la rama tenga un pull request abierto arriba. Esa comprobación era:

```bash
gh pr list --repo "$upstream" --head "$duenio:$rama" --state open --json number --limit 1
```

**`gh pr list --head` espera solo el nombre de la rama.** El prefijo `duenio:` es la forma de la API REST, no la del CLI, y con él la consulta **devuelve siempre `[]`**.

**Cómo se verificó**, con la rama y el PR que existían en ese momento:

```
--head "rene2bcore:feat/sesion-5-guardarrailes"  ->  []
--head "feat/sesion-5-guardarrailes"             ->  [{"baseRefName":"s5/start","number":26}]
```

**Consecuencia**: el job se omitía **en verde** en cada push, escribiendo en el resumen «la rama no tiene PR abierto: no hay cambio propuesto que revisar». Un mensaje correcto en su forma y falso en su contenido: no es que no hubiera nada que revisar, es que no había mirado.

**Cuánto duró**: desde que se escribió el job. Las únicas revisiones que llegaron a ejecutarse fueron las del evento `pull_request`, y por eso la prueba del defecto plantado sí funcionó -era un PR recién abierto- mientras que todos los `push` posteriores decían que no había nada.

**Por qué no se notó antes**: porque hasta el 2026-09-09 no había credencial, así que la puerta salía por la primera rama -«sin credencial: se omite»- y nunca llegaba a la consulta. **Dos fallos apilados, y el de arriba escondía al de abajo.** Al arreglar el primero apareció el segundo, con el mismo síntoma verde.

**Arreglo**: consultar por `--head "$rama"` y filtrar después por `headRepositoryOwner.login`, que además evita confundir una rama del mismo nombre en otro fork.

**Lo que enseña, y es lo mismo que [H-24](#h-24--la-verificación-nunca-ha-corrido-en-el-repositorio-donde-vive-el-pr) por tercera vez**: un guardarraíl que puede decir «no hay nada que hacer» necesita que alguien compruebe que esa frase es cierta. Un verde por omisión y un verde por revisión sin hallazgos se ven idénticos desde fuera.

## H-28 · La lista de negación del revisor nombraba una herramienta que su versión no conoce

**Rama: `feat/portar-cierres-modulo-4` en adelante. Severidad: media.** **Cerrado** el 2026-09-09.

La primera ejecución real del revisor en CI -la primera de verdad, después de arreglar [H-27](#h-27--la-puerta-del-revisor-buscaba-el-pr-con-una-consulta-que-nunca-encuentra-nada)- **murió**:

```
Permission deny rule "SlashCommand" matches no known tool — check for typos.
```

`--disallowed-tools` incluía `SlashCommand`. La versión fijada del CLI no conoce esa herramienta y **aborta la ejecución entera** en vez de ignorar la regla.

**Fallar así es lo correcto**, y conviene decirlo: una regla de negación que no se aplica es peor que no tenerla, porque quien la escribió cree que está protegido. Abortar es la respuesta honesta.

**Lo que sí revela es un acoplamiento que no habíamos visto**: la versión del CLI está fijada a propósito -corre en el mismo entorno que la credencial, [ver la calibración](../.github/calibracion-revision.md)-, y ese pin **también fija el vocabulario de herramientas**. Mover la versión obliga a revisar la lista de negación en las dos direcciones: hacia arriba puede aparecer una herramienta nueva que habría que negar, hacia abajo puede desaparecer una que se nombra.

**Arreglo**: quitar `SlashCommand`. Las siete que quedan -`Bash`, `Write`, `Edit`, `NotebookEdit`, `WebFetch`, `WebSearch`, `Task`- sí las reconoce.

**Y el orden en que aparecieron los tres fallos es la parte que enseña.** Estaban apilados, cada uno tapando al siguiente:

| | Fallo | Lo tapaba |
|---|---|---|
| 1 | Sin credencial: el job se omitía en verde | — |
| 2 | [H-27](#h-27--la-puerta-del-revisor-buscaba-el-pr-con-una-consulta-que-nunca-encuentra-nada): la puerta nunca encontraba el PR | El 1, que salía antes |
| 3 | **H-28**: la lista de negación abortaba | El 2, que nunca llegaba a ejecutar |

Tres arreglos para que un guardarraíl se ejecutara una vez, y **los dos primeros salían en verde**. Es el argumento entero del Módulo 5 en una sola pieza de infraestructura.

## H-29 · Dos comprobaciones del verificador se satisfacían con un comentario

**Rama: `s4/start` en adelante. Severidad: alta.** **Cerrado** el 2026-09-09.

Lo encontró **el revisor adversarial en CI**, en su primera ejecución completa sobre `push`. Es el primer hallazgo que produce el guardarraíl automático sin que nadie le plantara nada.

Las comprobaciones «Toda operación que resuelve un id declara su 404» y «Toda operación decorada declara el error que no estaba previsto» leían el controlador con `leer()` -código crudo, comentarios incluidos- en vez de `leerCodigo()`, que los quita.

**Es exactamente la clase de defecto que la cabecera de ese fichero describe**, escrita meses antes:

> «La revisión adversarial del PR #21 demostró que cuatro de estas comprobaciones se satisfacían con un comentario. Una comprobación que un comentario puede satisfacer no comprueba nada.»

Cuatro se arreglaron entonces. **Estas dos se escribieron después y volvieron a nacer con el defecto**, con la advertencia treinta líneas más arriba en el mismo fichero.

**Cómo se verificó**: borrando el `@ApiResponse({ status: 404, ... })` real de `TasksController.show` y dejando en su lugar un comentario que contiene la cadena `status: 404`.

```
antes del arreglo:  OK    Toda operación que resuelve un id declara su 404 · 3 operaciones
después:            FALLA sin 404 declarado: tasks_controller.ts
```

**Arreglo**: las dos lecturas pasan por `leerCodigo()`.

**Lo que enseña, y no es lo obvio.** No es «acuérdate de usar el helper». Es que **una advertencia escrita en la cabecera de un fichero no impide repetir el defecto treinta líneas más abajo**, ni siquiera a quien la escribió. Lo que sí lo impidió fue un revisor leyendo el fichero entero y contrastándolo consigo mismo.

Es el argumento del Módulo 5 aplicado al propio verificador: **una regla escrita en un comentario es una petición**. Bajarla a código sería que `leer()` no estuviera disponible para leer controladores, y eso es trabajo pendiente.

## H-30 · El PR es demasiado grande para una sola revisión

**Rama: `feat/sesion-5-guardarrailes`. Severidad: media.** **Cerrado el 2026-09-09**, partiendo la unidad de trabajo. Es un hallazgo sobre **nuestro proceso**, no sobre el revisor.

Tras arreglar [H-27](#h-27--la-puerta-del-revisor-buscaba-el-pr-con-una-consulta-que-nunca-encuentra-nada) y [H-28](#h-28--la-lista-de-negación-del-revisor-nombraba-una-herramienta-que-su-versión-no-conoce), y después de una ejecución completa que produjo [H-29](#h-29--dos-comprobaciones-del-verificador-se-satisfacían-con-un-comentario), la siguiente murió:

```
Error: Reached max turns (40)
```

El diff de la rama contra `upstream/s5/start` son **10.049 líneas en 75 ficheros**. El revisor las lee con `Read` y agota el tope antes de terminar.

**Lo que dice nuestra propia calibración**, escrita antes de que ocurriera:

> «`--max-turns 40` es el tope duro. Si una revisión lo agota, el problema es el tamaño del diff, no el tope.»

Así que **no se sube el tope**. Lo que hay es un PR que apila el port del Módulo 4 y la sesión entera del 5 porque la base nunca se fusiona.

**Mitigación aplicada**: se excluyen del diff tres cosas que `REVIEW.md` ya declara fuera de revisión, porque pagarle al modelo por leerlas es gasto puro -`backend/.adonisjs/`, los `.html` de `docs/artefactos/` que duplican los `.md` del mismo diff, y los `package-lock.json`-. Baja de 10.049 a **8.541 líneas**, que ayuda y no basta.

`docs/api/openapi.json` **no se excluye** aunque se genere: es el contrato, y ahí vivía [H-25](#h-25--el-contrato-versionado-declaraba-públicas-dos-rutas-protegidas).

**Y se añade un aviso** en el resumen del job por encima de 6.000 líneas, para que la próxima vez se sepa antes de gastar cuatro minutos y una cuota.

**Primera mitigación, y no bastó.** Con 8.541 líneas el revisor completó una vez -devolvió «Ninguno / Ninguno», que es la respuesta correcta cuando no hay nada sobre el umbral- y **volvió a agotar los turnos en la siguiente**, con 8.607. El margen era de sesenta líneas: no era una mitigación, era suerte.

Lo digo así porque este documento llegó a afirmar «la mitigación basta para este tamaño» **después de una sola ejecución**. Es el error que el repositorio persigue, cometido al describirlo: una comprobación que pasa una vez no está probada.

**Segunda mitigación**: se excluye también **la prosa en `.md`**. El argumento no es que estorbe, es que **ninguna de las siete categorías graves de `REVIEW.md` puede darse en un fichero de prosa**: todas hablan de comportamiento del código y del contrato. Que un documento contradiga al código es justo lo que comprueba `verificar-docs.mjs`, y eso ya bloquea.

`docs/api/openapi.json` se queda dentro aunque viva en `docs/`: es el contrato, no prosa, y ahí vivía [H-25](#h-25--el-contrato-versionado-declaraba-públicas-dos-rutas-protegidas).

De **8.607 a 4.966 líneas**, en 46 ficheros. Sigue sin saberse dónde está el límite, y por eso el aviso de las 6.000 se queda.

## Cómo se cerró: partiendo la unidad, no subiendo el tope

**El diagnóstico era correcto y la solución no estaba en la herramienta.** La rama de la sesión sale de la del port, que sigue con su PR abierto porque la base nunca se fusiona. Son **dos unidades de trabajo en un mismo diff**, y el revisor pagaba por leer las dos.

Medidas por separado, con las exclusiones ya aplicadas:

| Unidad | Contra qué | Tamaño |
|---|---|---:|
| El port del Módulo 4 | `upstream/s5/start` | 3.265 líneas, 36 ficheros |
| **La sesión del Módulo 5** | **la rama del port** | **1.934 líneas, 17 ficheros** |
| Las dos juntas, que es lo que recibía | `upstream/s5/start` | 5.173 líneas, 49 ficheros |

**Lo que se cambió**: la base de revisión deja de ser la del pull request. Si la rama de **otro PR nuestro abierto** es ancestro de esta, ese trabajo ya tuvo su propia revisión y su propia base, así que se revisa contra ella. Si hay varias, gana la más cercana. Si no hay ninguna, la base del PR, que es el caso normal.

**Se descubre preguntando, no con una lista que mantener.** Un fichero con las ramas padre envejecería igual que la documentación que este repositorio persigue: la relación ya está en git y en los PR abiertos, y se lee en el momento.

**Cómo se comprobó**, extrayendo la función del propio YAML y ejecutándola contra el repositorio real:

```
feat/portar-cierres-modulo-4: ancestro, 26 commits por delante
s4/start, s3/start, docs/alcance-mvp, feat/login-frontend: no son ancestro
elegida: feat/portar-cierres-modulo-4
diff contra esa ref: 1934 lineas en 17 ficheros
```

Las cuatro ramas descartadas lo son **por el salto de rama**: ninguna es ancestro de esta, y por eso no se cuelan. La regla no necesita saber nada del curso ni de los módulos.

**Lo que sigue sin resolverse, y no es de herramienta**: un PR por módulo sobre una base que no avanza sigue siendo una unidad grande. Lo que se ha arreglado es que **el revisor vea una sola**. Si mañana la sesión del Módulo 6 sale de esta, la regla la encontrará sola; si alguien empieza tres unidades encadenadas sin abrir PR, no. Eso va a la conversación que la auditoría declara pendiente para R-01.

## H-31 · El change archivado que las decisiones citaban no cruzó de rama

**Rama: `s4/start` en adelante. Severidad: baja.** **Cerrado** el 2026-09-09.

Tres comentarios del código citaban decisiones de un documento que en esta rama no existía:

| Fichero | Cita |
|---|---|
| `backend/app/validators/user.ts:5` | «Solo se baja a minúsculas (design.md D2)» |
| `backend/app/validators/user.ts:38` | «en lugar de un "ese email ya está registrado" (design.md D1)» |
| `backend/database/migrations/1787726814926_normalize_user_emails.ts:5` | «Normaliza los emails ya guardados (design.md D3)» |

Lo señaló el revisor adversarial en CI. `openspec/changes/archive/` solo tenía los tres changes de tareas.

**No eran citas inventadas.** El documento existe: lo creó `6fbdde8` como `openspec/changes/archive/2026-08-26-fix-defectos-abiertos/design.md`, con D1, D2, D3, D4 y D5 exactamente donde el código dice. **Lo que pasó es que el change no cruzó el salto de rama**, y las citas sí.

Es [H-22](#h-22--la-tabla-lo-que-se-arrastra-dio-por-cerrados-tres-hallazgos-sin-comprobarlos-en-la-rama) otra vez, en su forma más barata: **la referencia sobrevive al salto y su destino no**. Un lector que buscara `design.md` concluiría que el comentario miente, cuando lo que falta es el fichero.

**Arreglo**: traer el change archivado entero desde `6fbdde8`. Es de la regla de arrastre, no de la de comentarios.

**Y de paso resolvió el hallazgo siguiente**: D4 de ese mismo documento es la decisión que gobierna H-32.

## H-32 · La regla del 401 estaba escrita en dos sitios

**Rama: `feat/portar-cierres-modulo-4` en adelante. Severidad: baja.** **Cerrado** el 2026-09-09.

En `frontend/src/auth/auth-provider.tsx`, un 401 durante la rehidratación inicial disparaba **dos manejadores**: el `.catch()` local del arranque y la suscripción `onUnauthorized`, porque `getProfile` no silencia el rechazo -a diferencia de `logout`, que sí lo hace con `silenciarRechazo: true`-.

**No era un defecto observable**: `clearSession()` es idempotente y los dos ponían el mismo mensaje. Lo señaló el revisor adversarial en CI, y bajo la calibración es **menor**, correctamente.

**Por qué se arregla igual**: porque la misma regla escrita en dos sitios es como las dos copias acaban divergiendo. Y esa regla ya tenía dueño declarado en **D4** del change que H-31 acaba de recuperar: «se engancha al único punto por el que pasan todas las respuestas, y no a cada pantalla».

**Arreglo**: el arranque devuelve el control ante un 401 y deja que `onUnauthorized` lo cierre. Se queda solo con lo que **sí** es propio del arranque, que también lo dice D4: **un fallo que no sea 401 no debe cerrar la sesión**.

**Cómo se verificó**, en el navegador y en las dos direcciones, porque la rama conservada era la que podía romperse:

| Escenario | Resultado |
|---|---|
| Token muerto en `localStorage`, recarga | `/login`, «Tu sesión ha caducado», y el token **borrado** |
| Backend parado, recarga con token bueno | `/login`, «No se pudo conectar con el servidor», y el token **sobrevive** |
| Backend de vuelta, recarga | Sesión restaurada en `/tasks` **sin volver a teclear credenciales** |

El tercero es el que justifica que la segunda rama exista: sin ella, un corte de red pasajero habría cerrado la sesión.

## H-33 · El tablero de Jira llevaba dieciséis días contradiciendo al repositorio

**Rama: ninguna, es de proceso. Severidad: media.** **Cerrado el 2026-09-09.**

El tablero `LID` no se tocaba desde el **2026-08-24**, el día que terminó el Módulo 2. Entre medias el repositorio pasó por los módulos 3, 4 y 5.

Resultado: **seis historias implementadas y probadas seguían en «Tareas por hacer»**. Quien mirase el tablero para saber qué existe habría concluido que no existía nada de la gestión de tareas.

**El propio backlog ya lo había previsto.** Dice, desde el Módulo 2: «el tablero es seguimiento del trabajo; si se contradice con el repositorio, manda el repositorio». La regla estaba escrita y no impidió nada, que es el argumento del Módulo 5 aplicado a una herramienta que no es código.

**Arreglo, con el respaldo en `docs/alcance-funcional.md` y no en la memoria**: 18 issues a Finalizada -LID-3, LID-5 a LID-15, LID-17 a LID-20, LID-24 y LID-25- y un comentario en la épica explicando cada una.

**Lo que se deja abierto, y no es olvido**:

| | Por qué |
|---|---|
| LID-21, LID-22, LID-23 | Declaradas **fuera del alcance** del MVP |
| LID-16 · persistencia del filtro | El filtro **sí persiste en la URL** con `useSearchParams`. No se cierra porque no está claro si la subtarea pedía eso o persistencia entre sesiones, y marcarla sin saberlo sería el defecto que este registro persigue |
| LID-4 · la épica E2 | Tiene hijas abiertas. Cerrarla exige resolver antes la ambigüedad de LID-16, y eso es una decisión de producto |

**Por qué no se puede bajar a un guardarraíl**, y conviene decirlo en vez de prometerlo: haría falta que algo supiera qué historia corresponde a qué código, y eso solo lo sabe una persona. Va donde va lo que no se puede comprobar: a la conversación, con la ventaja de que ahora hay un documento -`alcance-funcional.md`- contra el que contrastarlo en diez minutos.

## H-34 · Una decisión de producto declarada pendiente se resolvió en el código, y nadie la escribió

**Rama: `s3/start` en adelante. Severidad: media.** **Cerrado el 2026-09-09**, al registrarla.

`docs/backlog/E2-gestion-tareas/us-filtrar-por-estado.md` declara, en el ticket FS-142.1 y con un aviso en negrita:

> **⚠️ Decisión de producto pendiente antes de empezar:** CA-9 exige poder llegar con un estado pedido desde fuera de la interfaz, lo que implica un filtro direccionable; CA-17 exige que recargar devuelva a la vista por defecto. **Tal y como están escritas son incompatibles.** Cuesta una conversación y decide qué se construye.

**Esa conversación no ocurrió.** El filtro se implementó con `useSearchParams`, y con eso quedó decidido.

**Lo que salió, comprobado en el navegador el 2026-09-09:**

| Criterio | Qué hace hoy |
|---|---|
| **CA-9** · llegar con un estado desde fuera | `/tasks?status=done` aplica el filtro. **Cumplido** |
| **CA-17** · no quedarse pegado | Volver a `/tasks` da la vista por defecto, y `localStorage` no guarda ninguna clave de filtro. **Cumplido en lo que el criterio protege** |

**Salió bien, y no por casualidad del todo**: la URL resuelve la incompatibilidad en vez de elegir un lado, porque hace el filtro direccionable **sin** hacerlo persistente. El único borde es recargar la misma pestaña con el parámetro puesto, y eso no es que se quede pegado: es CA-9 funcionando.

**Por qué se registra igual.** Que una decisión salga bien no la convierte en una decisión tomada. El backlog decía «antes de empezar» y se empezó; decía «cuesta una conversación» y no la hubo. La siguiente vez que dos criterios se contradigan, lo que decida no será el criterio de nadie sino la primera implementación que compile.

**Y hay un segundo hallazgo dentro, sobre el tablero**: LID-12 a LID-16 son una descomposición que **solo existió en Jira**. La historia dice que sale con **un solo ticket**, FS-142.1, y que no hay ticket de frontend en ese alcance. Cinco subtareas siguiéndole la pista a un trabajo que el repositorio nunca declaró así. Es el hermano de [H-33](#h-33--el-tablero-de-jira-llevaba-dieciséis-días-contradiciendo-al-repositorio): allí el tablero iba por detrás, aquí iba por su cuenta.

**Qué lo vigilaría**: nada automático. Va con [R-13](auditoria-reglas-de-proceso.md) y con H-33 a la tercera categoría, la de lo que no se puede comprobar. Lo único que se puede hacer es lo que se ha hecho: dejar escrito en el propio criterio qué se decidió y cuándo, para que la próxima vez se lea antes de construir.

## H-35 · La caché del contrato servido dejaba pasar dos construcciones a la vez

**Rama: `feat/sesion-5-guardarrailes`. Severidad: media.** **Cerrado** el 2026-09-12, el día que se encontró. Lo introdujo el arreglo de [H-26](#h-26--el-documento-servido-en-apijson-crece-en-cada-petición).

El arreglo de H-26 construía el documento de `/api.json` una sola vez y lo guardaba:

```ts
contratoServido ??= JSON.stringify(await openapi.buildDocument())
```

`??=` comprueba la caché al empezar, pero no asigna hasta que el `await` resuelve. Dos peticiones que lleguen mientras se construye ven las dos la caché vacía y lanzan **dos construcciones solapadas**, que es exactamente lo que H-26 había que evitar.

**Lo encontró el revisor adversarial de CI**, sobre el commit de H-03, citando la línea y el caso. No lo buscaba nadie.

**Cómo se verificó**, y el orden importa porque la primera reproducción no salió:

1. **Por HTTP, no se reproduce.** Servidor de desarrollo en frío, 8 y luego 40 peticiones simultáneas a `/api.json` y `/api.yaml`: cero repetidos y documento idéntico al fichero. En desarrollo los controladores ya están importados, la construcción termina en microtareas, y la segunda petición no llega a atenderse hasta que la primera ha terminado. **No reproducir por HTTP no lo descartaba**: un arranque en frío con imports reales abre la ventana.
2. **Llamando a la función, sí, y de forma determinista.** Con el mismo arranque que `bin/openapi.ts`: dos llamadas seguidas a `buildDocument()` dan 0 y 3 parámetros repetidos, que es H-26. **Cuatro simultáneas dan 9, 9, 9 y 9**, el mismo documento las cuatro. No es que gane la última construcción: con solapamiento salen **todas** corruptas, y esa queda cacheada para toda la vida del proceso.

**El arreglo**: se cachea **la promesa**, que se asigna antes de ceder el control, así que una segunda petición espera a la misma construcción. Se mueve de `start/routes.ts` a `contratoServido()` en `app/openapi/document.ts` para poder probarla.

> **Corrección del mismo día.** El arreglo vaciaba la caché si la construcción fallaba, «para no servir el fallo durante toda la vida del proceso». El revisor de CI señaló que el reintento parte de metadata ya acumulada, y una sonda lo confirmó: fallo en el primer intento, **`200` con tres parámetros repetidos** en el segundo. Era cambiar un `500` que se nota por un contrato inválido que no. Ahora el fallo se queda hasta reiniciar: la misma sonda da error en los dos intentos y una sola construcción real. No tiene prueba en la suite porque la caché es del proceso y la prueba de la carrera exige ser la primera en construir; lo dice su commit con `Sin-prueba:`.

**Qué lo vigila**: `tests/functional/contrato_servido.spec.ts`, que llama a `contratoServido()` cuatro veces a la vez y exige cero repetidos y un único documento. Llama a la función y **no** va por HTTP a propósito: por HTTP pasaría con el defecto puesto, que es la trampa del punto 1. En rojo con la caché anterior (`expected [ …(9) ] to deeply equal []`, también dentro de la suite completa), en verde con la nueva: 84 de 84.

**Lo que enseña**: H-26 se cerró midiendo cuatro peticiones **seguidas**, y el defecto nuevo solo existe con peticiones **simultáneas**. Otra vez la mutación contigua a la que se comprobó.

## H-36 · R-08 se declaró cumplida y en cuatro días se incumplió nueve veces

**Rama: `feat/sesion-5-guardarrailes`. Severidad: media.** **Cerrado hacia delante** el 2026-09-12: CI lo impide desde ese día. Los nueve commits se quedan como están, porque el historial no se reescribe.

La auditoría del 2026-09-08 marcó R-08 -«un bug no se cierra sin reproducirlo, y deja una prueba detrás»- como **«Se cumple casi siempre: 10 de 12»**, y CLAUDE.md la clasifica como la regla que más rápido se erosiona. Las dos cosas eran ciertas a la vez.

**Cómo se verificó**: al escribir la comprobación de R-08, pasándola sobre los commits de la unidad que no están en ninguna otra rama.

| | Commits `fix:` |
|---|---:|
| Tocan una prueba o `scripts/verificar-docs.mjs` | 7 |
| **No tocan ninguna** | **9** |

Los nueve no son iguales, y conviene no meterlos en el mismo saco:

| Qué eran | Commits | Lectura |
|---|---|---|
| Arreglos de CI -el revisor, y la build rota en Linux- | `5681e8f` H-27, `b9582b0` H-28, `3a4c173`, `2ca8775` y `9d7f308` H-30, `88cf907` | **Verificados**, viendo la ejecución en rojo y en verde, y escrito en su hallazgo. Lo que no dejan es algo que vuelva a fallar si el defecto regresa. Es el caso para el que existe `Sin-prueba:` |
| Un arreglo que no lo era | `4fe72d0`, quitar una constante sin uso | **Mal etiquetado.** Era `refactor:` |
| Arreglos de código o entorno sin prueba | `9510769`, el 401 en `auth-provider.tsx`; `cf4312b`, el puerto de la suite | **El incumplimiento de verdad.** Verificados a mano en el momento, sin nada que lo repita. El segundo es de hoy, hecho el mismo día que se escribía esta entrada |

**Por qué el 10 de 12 no lo vio venir**: medía el pasado. Una regla que se cumple mientras alguien la está mirando dice poco de la semana siguiente, y la semana siguiente fue la del revisor en CI, llena de arreglos a un workflow que no tiene suite.

**Qué lo vigila**: `scripts/fix-con-prueba.mjs`, en `verificacion.yml` sobre los commits de cada push. Un `fix:` que no toque una prueba ni el verificador, y no lleve `Sin-prueba: <motivo>`, pone la build en rojo. `scripts/probar-fix-con-prueba.mjs` fija sus diez casos, y cuatro mutaciones del patrón -no reconocer `fix(ambito)!:`, aceptar una excusa vacía, contar un helper como prueba, no contar el verificador- tumban cada una el suyo.

**Lo que no vigila**: la primera mitad de la regla. Que el bug se reprodujera antes de arreglarlo no deja rastro en el commit, y sigue siendo criterio.

## H-37 · Rehidratar la sesión con un 401 depende de que otro efecto ya esté suscrito

**Rama: `feat/sesion-5-guardarrailes`. Severidad: baja.** **Vigilado** desde el 2026-09-13; registrado el 2026-09-12. La fragilidad del código sigue, a propósito, y ahora una prueba de navegador la vería.

`frontend/src/auth/auth-provider.tsx:66`, en la rehidratación de la sesión al arrancar:

```ts
if (error instanceof ApiError && error.status === 401) return
```

Ese `return` no cierra la sesión porque confía en que ya lo ha hecho el suscriptor de `onUnauthorized` (`auth-provider.tsx:102-107`), que desde H-13 es el dueño único de «una credencial rechazada cierra la sesión». Se dejó así el 2026-09-09 para no tener la misma regla escrita en dos sitios.

**Lo que hoy lo sostiene**: los dos `useEffect` están en el mismo componente y corren en el mismo ciclo. La suscripción se registra antes de que la petición de perfil pueda resolverse, así que el suscriptor siempre está ahí cuando llega el 401.

**Lo que lo rompería, y en silencio**: mover la suscripción a un componente que monte más tarde, a una condición, o a un hook que no siempre se use. El 401 llegaría sin nadie escuchando, el `return` no haría nada, y **`status` se quedaría en `loading` para siempre**: pantalla de carga sin error, ni en consola.

**Cómo se encontró**: el revisor adversarial de CI lo señaló **dos veces**, sobre `5bb9037` y sobre `bb9e609`, con el mismo razonamiento. La segunda vez es la que lo convierte en entrada: un menor que vuelve no es ruido.

**Por qué no se arregla ya**: las dos salidas obvias tienen coste. Volver a llamar a `clearSession()` en el `catch` deshace la decisión de H-13 y deja la regla en dos sitios. Hacer que el `catch` compruebe si hay suscriptor acopla el proveedor a un detalle interno de `lib/api.ts`. Lo que falta de verdad es **una prueba que lo fije**, y no hay runner que monte el proveedor: Vitest cubre `lib/api.ts` y nada más.

**Qué lo vigilaría**: una prueba de componente o de navegador que arranque con un token revocado y exija llegar a la pantalla de acceso. Hoy, nada.

**Qué lo vigila desde el 2026-09-13**: `frontend/e2e/sesion.e2e.ts`, «con un token revocado se llega al acceso explicando por qué», con Playwright y el backend real. Se vio fallar quitando el cierre de sesión del suscriptor: la página se quedó en `/tasks` sin llegar nunca a `/login`, que es exactamente el modo de fallo de arriba. Tiene entrada en el catálogo de mutaciones. No se ha tocado el código: la decisión de H-13 -un solo dueño para «una credencial rechazada cierra la sesión»- sigue en pie, y lo que faltaba era algo que se enterase si alguien la rompe.

## H-38 · Un comentario decía que el arranque no cierra la sesión, y la cierra

**Rama: `feat/sesion-5-guardarrailes`. Severidad: baja.** **Cerrado** el 2026-09-13, el día que se encontró.

`frontend/src/auth/auth-provider.tsx`, en la rehidratación, ante un fallo que no es 401. El comentario afirmaba «**un fallo que no sea 401 no debe cerrar la sesión**», y las tres líneas de debajo ponen el estado en `anonymous` y llevan a la pantalla de acceso.

**Lo encontró el revisor de CI** sobre `916df84`, como grave de la categoría «Comentario que miente» de `REVIEW.md`. La categoría existe porque ya pasó una vez: un comentario prometía tres condiciones de vencimiento y el código comprobaba dos.

**Cómo se verificó, antes de tocar nada**: el revisor leía que el comportamiento también estaba mal -«el estado en memoria y el almacenamiento quedan divergentes»-, y eso había que comprobarlo, no suponerlo. En navegador, con una cuenta de sonda:

1. Token guardado y **backend apagado**: al arrancar, se llega a `/login` con «No se pudo conectar con el servidor», y **el token sigue en `localStorage`**.
2. **Backend arrancado** y recarga: la sesión se restaura sola en `/tasks`, sin volver a entrar.

Es exactamente el escenario «Backend apagado al arrancar con sesión guardada» de la spec de `auth`. **El código era correcto y el comentario no**: sí cierra la sesión en memoria; lo que conserva es el token guardado, y la divergencia que señalaba el revisor es la que el requisito pide.

**El arreglo**: solo el comentario, que ahora dice qué se cierra, qué se conserva y por qué no se llama a `clearSession()`.

**Por qué no tiene prueba**: el proveedor de sesión no lo monta ningún runner, que es el mismo hueco de H-37. Y lo que se arregló no es comportamiento sino una afirmación sobre él.

**Desde el 2026-09-13 el comportamiento sí la tiene**: `frontend/e2e/sesion.e2e.ts`, «con el servidor caído se conserva el token y la sesión vuelve al recargar», simulando la caída con la petición de perfil cortada. Vista fallar llamando a `clearSession()` en esa rama: el token guardado pasa a `null`.

## H-39 · El resumen del revisor daba vacío el diagnóstico de una credencial rota

**Rama: `feat/sesion-5-guardarrailes`. Severidad: baja.** **Cerrado** el 2026-09-13, el día que se encontró.

`.github/workflows/revision-adversarial.yml`, en el paso «Revisar», cuando `claude -p` falla. El log volcaba stdout y stderr del CLI; el resumen del job, **solo stderr**. Con un token inválido el CLI escribe `401 Invalid bearer token` en **stdout**, así que el resumen salía con su título -«La revisión adversarial no pudo ejecutarse»- y un bloque de código vacío debajo.

**Cómo se encontró**: provocando a propósito lo que el workflow promete, que con la credencial configurada y rota el job sale en rojo. Salió en rojo, con el 401 en el log, y el resumen sin nada que leer.

**Por qué importa aunque sea baja**: es el mismo defecto que el comentario de ese bloque ya registraba para el log el 2026-09-09 -«no asumas en qué descriptor escribe un programa, mira los dos»-, arreglado en una de las dos salidas y no en la otra. Un rojo sin motivo visible manda a quien lo lee a buscar el log, que es justo lo que el resumen existe para ahorrar.

**El arreglo**: el resumen vuelca también `informe.md`. Commit `d44d034`, con `Sin-prueba:` porque es un workflow sin suite.

**Cómo se verificó**: con el token inválido todavía puesto, el push del arreglo volvió a salir en rojo con el 401 (`34788706888`), y con el token real, verde y con informe (`34789571139`). **Lo que no se leyó desde aquí es el resumen en sí**: GitHub no lo muestra sin sesión.

**Cómo se llegó a la prueba, que también enseña**: el primer intento salió **verde**, y no por un fallo del workflow. El valor inválido nunca se había guardado: `gh secret list` seguía fechando el secreto el 2026-09-09, y la ejecución hizo una revisión completa. Se comprobó la fecha antes de dar el verde por hallazgo.

---

# Al abrir el Módulo 5

## Estado en `s5/start`, comprobado al abrir el Módulo 5

> Comprobado el 2026-09-02 leyendo la rama fichero a fichero, antes de tocar nada, como manda la regla de arrastre.
> `s5/start` está en `449bb69`, idéntico a `upstream/s5/start`.
>
> **Esta sección era el plan. Se ejecutó el mismo día**, en `feat/portar-cierres-modulo-4`, y lo que salió al ejecutarlo no coincide con lo que decía el plan:
>
> - El plan contaba **seis** defectos vueltos. Fueron **nueve**. Los tres que faltaban aparecieron portando: **H-01** -la suite escribía sobre la base de desarrollo, y lo detectó `aislamiento.spec.ts` al fallar, no una lectura-, el runner de frontend, y el `.gitignore` que dejaba las notas propias sin proteger.
> - El plan decía «portar los siete ficheros de prueba que faltan» y eran **nueve**, y «el verificador con sus diecisiete comprobaciones», que aquí quedaron en **quince** por una decisión sobre el contrato.
>
> Se conserva como estaba, con esta nota encima, porque la distancia entre el plan y lo que salió es lo que enseña. **Leer una rama no sustituye a ejecutar sus pruebas en ella.**

### Los seis que vuelven

| # | Hallazgo | Evidencia en `s5/start` | Plan de acción |
|---|---|---|---|
| **H-19** · Alta | Las respuestas de error revelan traza, rutas y el SQL ejecutado | `backend/app/exceptions/handler.ts:9` declara `protected debug = !app.inProduction`, el valor con el que viene el framework, con el comentario original en inglés («display verbose errors with pretty printed stack traces»). El fichero entero son 30 líneas: **no hay rama para `E_ROW_NOT_FOUND`** ni intercepción de `5xx`. `backend/.env.example` no menciona `DEBUG_HTTP_ERRORS`. Vuelven las **dos mitades**: el volcado de Youch fuera de producción, y el `{ message: error.message }` del framework, que en un error de SQLite es la sentencia entera con el hash de la contraseña dentro | Portar `handler.ts` completo: la constante desde `env.get('DEBUG_HTTP_ERRORS', false)`, la normalización de `E_ROW_NOT_FOUND` a `{ errors: [...] }` con 404, y la intercepción de `status >= 500`. Añadir `DEBUG_HTTP_ERRORS=false` a `.env.example` y a `.env.test`, y `DEBUG_HTTP_ERRORS: Env.schema.boolean.optional()` a `start/env.ts`. Portar `tests/functional/errores.spec.ts` con sus cinco casos y los diecisiete rastros. **Verificar por mutación**: quitar la intercepción del `5xx` tiene que tumbar la prueba del error de base de datos. Traer [ADR-0005](adr/0005-el-volcado-de-depuracion-va-apagado.md), que es lo que convierte esto en una decisión escrita y no en un arreglo suelto |
| **H-11** · Alta | El email distingue mayúsculas: la misma persona se registra dos veces | `backend/app/validators/user.ts:6` es `const email = () => vine.string().email().maxLength(254)`, sin `.normalizeEmail()`. `backend/database/migrations/` tiene **cuatro** ficheros y ninguno es `normalize_user_emails` ni `unique_email_ignoring_case`. El índice de la tabla `users` compara byte a byte | Portar `app/validators/user.ts` entero, incluida la constante `SOLO_MINUSCULAS` con las transformaciones destructivas apagadas -las de Gmail, Outlook, Yahoo, iCloud y Yandex- y la función exportada `normalizeUserEmail`. Portar las dos migraciones: la que normaliza lo ya guardado usando esa misma función, y la que crea el índice único sobre `lower(email)`. Portar `tests/functional/auth/email_mayusculas.spec.ts` (6 pruebas). **Ojo al aplicar la migración**: si la base local tiene duplicados que solo se diferencian en la caja, falla a propósito y hay que resolverlos a mano antes. Ya pasó el 2026-09-02 |
| **H-15** · Alta | Una tarea hecha con la fecha pasada llega marcada como vencida | `backend/app/models/task.ts:52-56`: `isOverdueOn` son tres líneas, `if (this.dueDate === null) return false` y `return this.dueDate < referenceDay`. **Falta la condición del estado.** La pantalla anuncia «Vencida» en rojo debajo de una cabecera que dice «Hecho» | Añadir `if (this.status === 'done') return false` como segunda guarda. Portar `tests/functional/tasks/vencimiento.spec.ts` (8 pruebas), que cubre además el borde del `<` estricto: vencer hoy todavía no es estar vencida. **Verificar por mutación** las dos cosas: quitar la condición del estado, y cambiar `<` por `<=`. Cada una tiene que tumbar su prueba |
| **H-16** · Alta | Un estado inventado en el filtro devuelve 200 con lista vacía | `backend/app/validators/task.ts:29-31`: `listTasksValidator` declara `status: vine.string().optional()`, una cadena suelta. `/tasks?status=archivado` responde `200` con `[]`, que en la pantalla se lee como «el equipo no tiene nada en ese estado» en vez de «ese estado no existe». Es el fallo silencioso, no un error | Cambiar a `vine.enum(TASK_STATUSES).optional()`, importando la constante del modelo para que no haya dos listas de estados. Portar `tests/functional/tasks/filtro.spec.ts` (7 pruebas), incluida la que fija que el `422` lleva `meta.choices` con los tres estados válidos, que es de lo que el frontend construye el mensaje. **Verificar por mutación**: volver a `vine.string()` tiene que tumbarlas |
| **H-13** · Media | Una sesión que caduca con la lista abierta deja al usuario sin salida | `frontend/src/lib/api.ts:188-190` es `if (!response.ok) { throw toApiError(...) }`, sin ningún punto de suscripción: **cero apariciones de `onUnauthorized`** en todo `frontend/src/`. El proveedor de sesión solo limpia el token al rehidratar, así que un 401 posterior deja el estado en `authenticated`, el aviso pide volver a entrar y el guard de rutas públicas rebota `/login` de vuelta a `/tasks`. Solo recargar lo desatasca | Portar el punto de suscripción a `lib/api.ts` -`onUnauthorized`, el `Set` de manejadores y la opción `silenciarRechazo`- y engancharlo desde `auth-provider.tsx` con un `useEffect`. Solo el 401 dispara: un 500 o un corte de red no pueden cerrar la sesión de nadie. El cierre de sesión a propósito pasa `silenciarRechazo: true`, o salir aterriza en el acceso con un «tu sesión ha caducado» que no viene a cuento. **Verificar en navegador**, no leyendo: revocar la credencial contra el backend por fuera y pulsar algo en la lista tiene que llevar a `/login` sin recargar y con el token ya borrado |
| **H-14** · Baja | `updatedAt` vale distinto según el endpoint que lo devuelve | `backend/app/controllers/tasks_controller.ts` hace `await task.load('assignee')` y serializa el objeto en memoria, tanto en `store` como en `show`; `task_statuses_controller.ts` y `task_due_dates_controller.ts` repiten el patrón. El modelo recién guardado trae milisegundos y la base guarda con precisión de segundo, así que la escritura y la lectura siguiente dicen valores distintos del mismo campo sin que nada cambie en medio | Portar `Task.releerConResponsable(id)` al modelo -con `preload`, que cuesta dos consultas y no una- y usarlo en las **tres** escrituras. Va en el modelo y no repetido en cada controlador para que la cuarta lo herede. Portar `tests/functional/tasks/escritura_lectura.spec.ts` (3 pruebas), que compara el objeto **entero** y no el campo sospechoso: comparar solo `updatedAt` deja de morder en cuanto el desajuste se mude a otro campo, y ya pasó una vez |

### El que sí viene arreglado

| # | Hallazgo | Evidencia en `s5/start` | Plan de acción |
|---|---|---|---|
| **H-17** · Alta | La lista filtraba el email del responsable | `backend/app/transformers/task_transformer.ts:13` usa `TaskAssigneeTransformer.transform(...)`, que expone `id`, `fullName` e `initials` y nada más. Es lo que el directo corrige en su Demo 1 del Módulo 4 | Nada que portar. **Sí hay que traer la comprobación**: el verificador tiene una que falla si la lista vuelve al transformer que expone la cuenta. Que hoy esté bien no impide que vuelva mañana, y es el único de los siete que llegó arreglado sin que nada lo vigile |

### Y lo que no está, que es la mitad del problema

Ninguno de los seis tiene nada en la rama que lo detecte.

| Qué falta | Evidencia | Plan de acción |
|---|---|---|
| Las pruebas | `backend/tests/` tiene **cinco** ficheros: los cuatro de `auth` y `tasks/assignee.spec.ts`. Nosotros llevamos **catorce** y 71 pruebas | Portar los **nueve** que faltan más `tests/helpers/api.ts`, del que dependen todos. Sin el helper, cualquier prueba que lea un cuerpo de error o mande un payload inválido no compila: el registro tipado de Tuyau solo modela la respuesta de éxito |
| El verificador | No existe `scripts/`. Cero comprobaciones deterministas | Portar `scripts/verificar-docs.mjs` con sus **diecisiete** comprobaciones, y **volver a demostrar cada una mutando el código**. No vale darlas por buenas porque pasaban en `s4/start`: la rama tiene otro contrato -documento OpenAPI generado desde `app/openapi/schemas.ts`, no escrito a mano- y varias comprobaciones van a chocar con eso |
| La integración continua | No existe `.github/`. Nuestro `verificacion.yml` es nuestro | Portarlo, y comprobar que **falla de verdad** empujando una mutación a una rama, no solo que sale verde |
| El registro de hallazgos | No existen `docs/hallazgos.md` ni `docs/trazabilidad.md` | Traerlos antes de tocar código. Es el punto 1 de la regla de arrastre, y es el que se saltó al pasar de `s3` a `s4` |

### Lo que esto le dice al Módulo 5

El módulo va de que **una regla escrita en un fichero es una petición, no una garantía**, y de bajar a la capa que ejecuta lo que falla en silencio.

`s5/start` trae el caso de estudio dentro. Su `CLAUDE.md:132` declara una regla de proceso explícita:

> «Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día.»

Y en esa rama **no hay nada que lo compruebe**: ni `scripts/`, ni `.github/`, ni una prueba. La regla depende por completo de que el agente se acuerde en cada cambio. Es literalmente la petición que el módulo describe.

Nuestro contraste es que llevamos la misma clase de regla bajada a una comprobación que corre en CI y falla la build. Y aun así, el 2026-09-02 la quinta revisión adversarial demostró que **dos de esas comprobaciones daban luz verde a mutaciones reales**, y que la primera tabla que aplicó la regla de arrastre la incumplió el mismo día en que se escribió.

Así que la lección del módulo tiene una segunda mitad que el prework no anuncia: **bajar una regla a un guardarraíl no la garantiza tampoco; la garantiza haber visto fallar el guardarraíl a propósito.** Es lo que ADR-0004 llama «una comprobación que no se ha visto fallar no cuenta», escrito antes de saber cuántas veces íbamos a necesitarlo.

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

Lo que faltaba no era código, era la decisión. Está en [ADR-0005](adr/0005-el-volcado-de-depuracion-va-apagado.md).

**El volcado va apagado por defecto en todos los entornos**, con `DEBUG_HTTP_ERRORS=true` para encenderlo a propósito. El falso dilema era «apagarlo y perder el diagnóstico»: se comprobó leyendo el framework que `report()` sigue registrando el error completo en el log del servidor, así que el diagnóstico **cambia de sitio, no desaparece**. El desarrollador lo tiene en su terminal; quien deja de tenerlo es quien alcanza el puerto sin credenciales.

Se descartó apagarlo solo en `test`, que habría puesto la suite en verde sobre un defecto vivo. Es justo el error que este módulo entero enseña a no cometer.

### Y volvió a pasar lo mismo, en el commit que lo cerraba

La quinta revisión adversarial, sobre ese mismo commit, encontró que **apagar el volcado no cerraba el defecto**. Quitaba las trazas de Youch y dejaba intacta la respuesta que da el framework cuando la depuración está apagada: `{ message: error.message }`. En un error de base de datos ese mensaje **es la sentencia SQL**, y en el alta de una cuenta esa sentencia lleva dentro el hash de la contraseña. Reproducido contra el servidor con `debug` ya en `false`, en un endpoint público y sin sesión.

Es el patrón de D12 por tercera vez, y esta vez lo cometimos con el diagnóstico delante: **causa general entendida, arreglo aplicado a una de sus manifestaciones**. Primero se arregló una ruta, luego una excepción, luego el volcado. Cada paso era correcto y ninguno era el sitio general.

El sitio general era la costumbre de devolver el `message` de una excepción tal cual. El cierre definitivo intercepta todo `5xx` y responde una forma cerrada, y no depende de qué excepción sea, porque el agujero nunca lo abrió una excepción concreta.

**Y la frase que lo mantuvo abierto era falsa.** «En producción no ocurre» se repitió tres módulos como motivo para bajarlo de prioridad. `debug=false` es la configuración de producción, y es exactamente con la que se reprodujo la fuga del SQL. El argumento no era una prioridad discutible: era un error de hecho que nadie comprobó.

Tres módulos abierto, dos intentos de cierre, y lo caro nunca fue el código.

---

# Lo que enseñaron seis revisiones adversariales seguidas

Sobre el mismo trabajo se lanzaron seis revisiones. Las seis encontraron algo real, incluidas las dos últimas, que revisaron el trabajo hecho para cerrar lo que encontraron las anteriores. Vale la pena mirar el conjunto, porque el patrón dice más que los hallazgos sueltos.

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
1 bis. Traer `scripts/` y ejecutar `node scripts/mutaciones.mjs`. **Desde el 2026-09-12, esta es la parte del contraste que se computa**: cada entrada del catálogo es un arreglo, y en la rama nueva sale `NO APLICA` si el código que arreglaba ya no está, o `SOBREVIVE` si está pero nada lo vigila. Las dos cosas son un hallazgo que no cruzó. De los nueve que volvieron rotos en `s5/start`, siete tienen hoy entrada en el catálogo; el runner de frontend y el `.gitignore`, no, y siguen dependiendo del paso 2.
2. Releer las entradas abiertas y comprobar **una a una** si el defecto sigue vivo en esa rama. No suponerlo: la rama del curso llega a la misma funcionalidad por otro camino, así que algunas se arreglan solas y otras reaparecen.
3. Marcar en cada entrada **qué rama describe** cada apartado. Un «Resuelto» sin rama es una afirmación falsa esperando a que alguien la lea.

**Al cerrar cada módulo**, el reporte de análisis incluye una sección **«Lo que se arrastra»** con esta tabla:

| # | Hallazgo | Desde | Estado en esta rama | Qué falta |
|---|---|---|---|---|

**Lo que no vale**: dar un hallazgo por resuelto porque se arregló en otra rama, o porque el síntoma no se ve. H-19 sobrevivió tres módulos precisamente así, bajándose de prioridad cada vez con el argumento de que en producción no ocurre.
