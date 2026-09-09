# Verificación de `npm test` (backend)

Registro tal cual salió de correr `npm test` en `backend/` (rama `feat/s04-repaso`). Solo constata el estado encontrado — sin propuestas de arreglo todavía. Los arreglos se irán documentando uno a uno, referenciando el número de fila de esta tabla, en la siguiente sección.

## Resultado

**Tests 6 passed, 17 failed (23)** · Tiempo: 1s · Exit code: 1

| # | Test | Error |
|---|---|---|
| 1 | Auth \| iniciales / un nombre de dos palabras da la inicial de cada una | `SqliteError: UNIQUE constraint failed: users.email` (email `ada@example.com`) |
| 2 | Auth \| iniciales / un nombre de una palabra da sus dos primeras letras | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 3 | Auth \| iniciales / sin nombre, las iniciales salen del email | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 4 | Auth \| login / con las credenciales correctas se emite un token que autentica | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 5 | Auth \| login / una contraseña equivocada no emite token | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 6 | Auth \| login / un email desconocido responde igual que una contraseña equivocada | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 7 | Auth \| sesión / el perfil devuelve la cuenta del token presentado | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 8 | Auth \| sesión / sin cabecera de autorización no se devuelve nada de la cuenta | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 9 | Auth \| sesión / un token inventado no abre las rutas de cuenta | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 10 | Auth \| sesión / cerrar sesión invalida el token usado | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 11 | Auth \| sesión / cerrar una sesión no cierra las demás de la misma cuenta | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 12 | Auth \| registro / registrarse devuelve la cuenta y un token que ya sirve | `AssertionError: expected 422 to equal 200` |
| 13 | Auth \| registro / la contraseña nunca sale en la respuesta | `TypeError: Cannot read properties of undefined (reading 'user')` |
| 14 | Auth \| registro / una contraseña corta se rechaza y no crea cuenta | `AssertionError: expected User{...} to equal null` |
| 15 | Auth \| registro / la confirmación tiene que coincidir | `AssertionError: expected User{...} to equal null` |
| 16 | Auth \| registro / un email ya registrado no crea una segunda cuenta | `SqliteError: UNIQUE constraint failed: users.email` (`ada@example.com`) |
| 17 | Tasks \| responsable / el assignee no incluye el email ni ningún otro dato de acceso, suelta o en la lista | `AssertionError: expected { id: 7, …(5) } to not have nested property 'email'` |

De los 23 tests totales, 6 pasan (no aparecen en la tabla de arriba): 4 de `Auth | registro` (`un email mal formado se rechaza` y los que no figuran como fallo) y 2 de `Tasks | responsable` (`el assignee trae el nombre y las iniciales del responsable`, `un responsable sin nombre llega con el nombre nulo y sus iniciales`).

## Arreglos aplicados

### #1 — Auth | iniciales / un nombre de dos palabras da la inicial de cada una

**Causa:** el fixture usa el email `ada@example.com`, que ya existe como cuenta real y persistida en `tmp/db.sqlite3` (id 2, compartido con el dev server porque `config/database.ts` no tiene override de entorno para tests). `testUtils.db().withGlobalTransaction()` aísla entre tests, pero no protege contra una fila que ya estaba comprometida antes de que arrancara la transacción.

**Mejora:** cambiar el email de este caso concreto por uno propio del test (`ada.iniciales-dos-palabras@example.com`), sin tocar `fullName` ni las iniciales esperadas — no dependen del email en este caso. Mismo patrón ya usado en `backend/tests/functional/tasks/assignee.spec.ts`.

**Fichero:** `backend/tests/functional/auth/initials.spec.ts`.

### #2 — Auth | iniciales / un nombre de una palabra da sus dos primeras letras

**Causa:** misma que #1 — el fixture usaba `ada@example.com`, colisiona con la cuenta real persistida en `tmp/db.sqlite3`.

**Mejora:** email propio del caso (`ada.iniciales-una-palabra@example.com`), sin tocar `fullName` ni las iniciales esperadas.

**Fichero:** `backend/tests/functional/auth/initials.spec.ts`.

### #3 — Auth | iniciales / sin nombre, las iniciales salen del email

**Causa:** misma que #1 y #2 — `ada@example.com` colisiona con la cuenta real persistida.

**Mejora:** email propio del caso (`ada.sin-nombre-iniciales@example.com`). A diferencia de #1 y #2, aquí las iniciales sí se derivan del email (no hay `fullName`), así que el email elegido conserva primera letra del local-part `a` y primera letra del dominio `e` — el resultado esperado `'AE'` no cambia.

**Fichero:** `backend/tests/functional/auth/initials.spec.ts`.

### #4 — Auth | login / con las credenciales correctas se emite un token que autentica

**Causa:** el helper compartido `cuenta()` del fichero crea la cuenta con `ada@example.com` a fuego, y los tres tests de login que la usan (#4, #5, #6) colisionan con la cuenta real persistida.

**Mejora:** `cuenta()` pasa a aceptar el email por parámetro (con el valor de antes como default, para no tocar #5 y #6 hasta que les toque turno), y este test le pasa su propio email (`ada.login-credenciales-correctas@example.com`), usado también en las aserciones.

**Fichero:** `backend/tests/functional/auth/login.spec.ts`.

### #5 — Auth | login / una contraseña equivocada no emite token

**Causa:** misma que #4 — `cuenta()` sin argumento seguía usando el default `ada@example.com`, que colisiona con la cuenta real persistida.

**Mejora:** este test le pasa su propio email (`ada.login-password-equivocada@example.com`) a `cuenta()`, reutilizado también en la petición de login.

**Fichero:** `backend/tests/functional/auth/login.spec.ts`.

### #6 — Auth | login / un email desconocido responde igual que una contraseña equivocada

**Causa:** misma que #4 y #5 — `cuenta()` sin argumento y el email `ada@example.com` a fuego en la petición "equivocada" colisionan con la cuenta real persistida. `nadie@example.com` (la petición "desconocido") no tiene colisión, verificado contra `tmp/db.sqlite3`.

**Mejora:** este test le pasa `ada.login-email-desconocido@example.com` a `cuenta()` y a la petición "equivocada".

**Fichero:** `backend/tests/functional/auth/login.spec.ts`.

### #7 — Auth | sesión / el perfil devuelve la cuenta del token presentado

**Causa:** el helper compartido `sesion(client, email = 'ada@example.com')` de `session.spec.ts` ya aceptaba el email por parámetro, pero los cinco tests que lo usan lo llamaban sin argumento, cayendo en el default que colisiona con la cuenta real persistida.

**Mejora:** este test le pasa `ada.sesion-perfil@example.com`, reutilizado también en la aserción del email del perfil.

**Fichero:** `backend/tests/functional/auth/session.spec.ts`.

### #8 — Auth | sesión / sin cabecera de autorización no se devuelve nada de la cuenta

**Causa:** misma que #7 — `sesion(client)` sin argumento.

**Mejora:** `sesion(client, 'ada.sesion-sin-cabecera@example.com')`.

**Fichero:** `backend/tests/functional/auth/session.spec.ts`.

### #9 — Auth | sesión / un token inventado no abre las rutas de cuenta

**Causa:** misma que #7 y #8.

**Mejora:** `sesion(client, 'ada.sesion-token-inventado@example.com')`.

**Fichero:** `backend/tests/functional/auth/session.spec.ts`.

### #10 — Auth | sesión / cerrar sesión invalida el token usado

**Causa:** misma familia.

**Mejora:** `sesion(client, 'ada.sesion-cerrar@example.com')`.

**Fichero:** `backend/tests/functional/auth/session.spec.ts`.

### #11 — Auth | sesión / cerrar una sesión no cierra las demás de la misma cuenta

**Causa:** misma familia, con un segundo punto de colisión: el segundo login (`otroLogin`) también tenía `ada@example.com` a fuego en el body.

**Mejora:** email único (`ada.sesion-multiples@example.com`) reutilizado tanto en `sesion()` como en el segundo login, para que ambos apunten a la misma cuenta.

**Fichero:** `backend/tests/functional/auth/session.spec.ts`.

### #12 — Auth | registro / registrarse devuelve la cuenta y un token que ya sirve

**Causa:** el body de signup usaba `ada@example.com` a fuego; el registro fallaba con `422` (email ya existe) en vez del `200` esperado.

**Mejora:** email propio del test (`ada.signup-token-que-sirve@example.com`), reutilizado en las tres aserciones y en la comprobación del perfil.

**Fichero:** `backend/tests/functional/auth/signup.spec.ts`.

### #13 — Auth | registro / la contraseña nunca sale en la respuesta

**Causa:** mismo origen que #12 (`ada@example.com` a fuego) — el signup fallaba con `422`, así que `response.body().data` venía `undefined` y el acceso a `.user` explotaba antes de llegar a la aserción real.

**Mejora:** email propio del test. Primer intento (`ada.signup-password-oculta@example.com`) fue un error mío: el email contenía la palabra `password`, la misma que la aserción `assert.notInclude(serialized, 'password')` busca que no aparezca, y el email sí sale en el JSON serializado — auto-colisión, no un bug de la app. Corregido a `ada.signup-credenciales-ocultas@example.com`.

**Fichero:** `backend/tests/functional/auth/signup.spec.ts`.

### #14 — Auth | registro / una contraseña corta se rechaza y no crea cuenta

**Causa:** la contraseña corta sí se rechazaba (422) como debía, pero `assert.isNull(await User.findBy('email', 'ada@example.com'))` encontraba la cuenta real persistida en vez de `null`.

**Mejora:** email propio del test (`ada.signup-password-corta@example.com`) en el body y en la consulta `findBy`.

**Fichero:** `backend/tests/functional/auth/signup.spec.ts`.

### #15 — Auth | registro / la confirmación tiene que coincidir

**Causa:** mismo patrón que #14 con `assert.isNull`.

**Mejora:** email propio del test (`ada.signup-confirmacion@example.com`) en el body y en la consulta `findBy`.

**Fichero:** `backend/tests/functional/auth/signup.spec.ts`.

### #16 — Auth | registro / un email ya registrado no crea una segunda cuenta

**Causa:** el propio `User.create()` del arrange del test (que crea la "primera" cuenta a propósito) chocaba con la cuenta real ya persistida antes incluso de llegar al signup duplicado que el test quiere probar.

**Mejora:** email propio del test (`ada.signup-email-duplicado@example.com`) en el `User.create()` de arranque, en el body del signup y en la consulta final `User.query().where('email', ...)`.

**Fichero:** `backend/tests/functional/auth/signup.spec.ts`.

## Estado tras #1–#16

`npm test` completo: **22 passed, 1 failed (23)**. Solo queda el #17 (`Tasks | responsable / el assignee no incluye el email...`), que no comparte esta causa: es el bug real de `TaskTransformer` documentado en el PR de `assignee.spec.ts` (usa `UserTransformer`, que expone `email`, en vez de `TaskAssigneeTransformer`).

### #17 — Tasks | responsable / el assignee no incluye el email ni ningún otro dato de acceso, suelta o en la lista

**Causa:** distinta a todo lo anterior — no es un problema de fixtures de test, es un bug real de producción. `GET /api/v1/tasks` y `POST /api/v1/tasks` usan `TaskTransformer`, que serializaba el `assignee` con `UserTransformer` (`id`, `fullName`, `email`, `createdAt`, `updatedAt`, `initials`) en vez de con `TaskAssigneeTransformer` (`id`, `fullName`, `initials`, pensado explícitamente para no exponer el email). `GET /api/v1/tasks/:id` sí usaba el transformer correcto (`TaskDetailTransformer` → `TaskAssigneeTransformer`), por eso solo fallaba la lista/creación.

**Mejora:** `backend/app/transformers/task_transformer.ts` pasa a serializar `assignee` con `TaskAssigneeTransformer` en vez de `UserTransformer`. Único fichero de producción tocado en toda esta ronda de arreglos.

**Fichero:** `backend/app/transformers/task_transformer.ts`.

## Estado tras #1–#17

`npm test` completo: **23 passed, 0 failed (23)**.

## Hallazgos del `adversarial-reviewer` sobre el PR, y su corrección

Con la suite en verde se pasó el subagente `adversarial-reviewer` sobre el PR. Encontró 5 hallazgos; se corrigieron los de prioridad alta y media:

- **[ALTO, corregido]** `AGENTS.md` era un symlink con target absoluto (`C:/Dev/flowsync-ai4devs/CLAUDE.md`), roto fuera de esta máquina. Recreado con target relativo (`CLAUDE.md`) vía `git hash-object` + `git update-index --cacheinfo 120000` + `git checkout` — el `ln -s` directo en este Git Bash no crea symlinks reales, cae a copiar el contenido en silencio.
- **[ALTO, corregido]** `package-lock.json` en la raíz del repo, sin `package.json` que lo justifique, contradice `CLAUDE.md` ("monorepo sin package.json raíz"). Eliminado (`git rm`).
- **[MEDIO, corregido]** `docs/modulos/tareas.md` desactualizado: decía "no hay tests" (ya no es cierto) y su ejemplo de `GET /tasks` mostraba `email` en `assignee` (contradice el fix del #17). Corregidos ambos, más una nota sobre la colisión de fixtures para quien añada tests nuevos.
- **[MEDIO, corregido]** `cuenta()` (`login.spec.ts`) y `sesion()` (`session.spec.ts`) conservaban `email = 'ada@example.com'` como valor por defecto — una trampa latente para tests futuros que olviden pasar el email. Quitado el default, el parámetro pasa a ser obligatorio.
- **[BAJO, solo nota]** `assignee.spec.ts` no asserta directamente el body de `POST /tasks` (solo usa `tarea.id`); queda cubierto indirectamente porque comparte transformer con la lista. Dejado un `TODO` en el propio test en vez de implementar la aserción ahora.

**Pendiente sin resolver, encontrado aparte (no es de los 5 hallazgos):** `npm run typecheck` falla con 4 errores en `assignee.spec.ts` (tipo generado de Tuyau: `lista.body().data` no se infiere como array, `assignee` es opcional), preexistente desde que se escribió el fichero. Queda para una próxima unidad de trabajo.
