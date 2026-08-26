# Hallazgos técnicos

> Cosas descubiertas trabajando sobre el repo, no supuestos. Cada una indica **cómo se verificó**.
>
> No son decisiones de producto: esas viven en `docs/prd/flowsync-mvp.md`, sección 10, como `D-nn`. Aquí van los hallazgos técnicos y de proceso que van a doler si nadie los conoce de antemano.
>
> Rama de referencia: `s3/start`. Última revisión: 2026-08-25.

## Índice por severidad

| # | Hallazgo | Severidad | Estado |
|---|---|---|---|
| H-01 | Los tests comparten base de datos con desarrollo | Alta | **Resuelto (2026-08-25)** |
| H-02 | Cero pruebas automatizadas en todo el proyecto | Alta | **Resuelto (2026-08-25)** |
| H-11 | El email distingue mayúsculas y minúsculas: la misma persona puede registrarse dos veces | Media | Abierto |
| H-03 | `/account/logout` no envuelve la respuesta en `data` | Media | Documentado y sorteado |
| H-04 | `fullName` es `nullable`, no `optional` | Media | Documentado y sorteado |
| H-05 | La traducción de errores compara cadenas exactas | Media | Vigilado por pruebas |
| H-06 | El token vive en `localStorage` | Media | Deuda aceptada |
| H-07 | El hook de formateo depende de `jq`, que no está instalado | Baja | Abierto |
| H-08 | `AGENTS.md` es un symlink que Windows no materializa | Baja | Sin impacto hoy |
| H-09 | `database/schema.ts` se regenera sin formato y rompe el lint | Baja | Reincidente |
| H-10 | Los tipos de issue de Jira en `LID` están en dos idiomas | Baja | Sorteado |
| H-12 | El registro tipado de Tuyau solo modela la respuesta de éxito | Baja | Sorteado |

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

**Resuelto el 2026-08-25** por el cambio `add-test-foundation`, y en efecto antes del primer test.

Se tomó el camino 2, el fichero separado por entorno, y no el 1.
La razón está en `design.md` D1: los hooks funcionan, pero dejan el aislamiento dependiendo de que cada fichero de prueba recuerde ponerlos.
Un test nuevo que olvidara el hook borraría los datos de desarrollo, y ese fallo aparece en el peor momento.
Con el fichero separado, olvidarlo es imposible.

Los hooks se usan igualmente, pero para lo que sirven bien: dejar limpio entre casos dentro de la misma ejecución.
Se enganchan una sola vez en `tests/bootstrap.ts` vía `suite.onGroup`, no fichero a fichero.

**Cómo se verificó**: se anotó la fecha de modificación de `backend/tmp/db.sqlite3`, se ejecutó la suite completa dos veces seguidas y se volvió a leer.
Idéntica. La base de test vive aparte, en `tmp/db-test.sqlite3`, y no está versionada.

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

**Resuelto el 2026-08-25** por el cambio `add-test-foundation`.

| | Estado hoy |
|---|---|
| Backend | 25 pruebas funcionales en `tests/functional/`, derivadas de las specs vivas de `auth` y `tasks` |
| Frontend | Vitest instalado, script `npm test`, 17 pruebas sobre `src/lib/api.ts` |

El runner del frontend es **Vitest** (`design.md` D5): comparte configuración y transformación con Vite, que el proyecto ya usa, así que resuelve el alias `@/*` sin configurarlo aparte y no introduce una segunda cadena de compilación.
Es la única dependencia nueva del cambio.

Lo que **no** cubre, declarado a propósito para que el hueco sea conocido: ver la sección «Escenarios sin cubrir» de `openspec/changes/archive/2026-08-25-add-test-foundation/tasks.md`.

**Cómo se verificó**: `node ace test` en el backend y `npm test` en el frontend, ambos en verde, más `lint`, `typecheck` y `build` en los dos proyectos.

---

## H-11 · El email distingue mayúsculas y minúsculas

**Severidad: media.** Abierto. Detectado al escribir la spec viva de `auth` en el Módulo 3.

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

**Cómo está sorteado**: `frontend/src/lib/api.ts` separa `send()` de `request()`, y logout usa el primero.

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

## H-05 · La traducción de errores compara cadenas exactas

**Severidad: media.** Abierto.

`frontend/src/lib/api.ts` traduce los mensajes del backend, que llegan en inglés, mediante un diccionario indexado por el **texto literal** del mensaje:

```ts
'The email has already been taken': 'Ya existe una cuenta con este email.'
```

**Cómo se verificó**: revisión adversarial del Módulo 1, que contrastó las claves contra los strings reales de `@vinejs/vine` y `@adonisjs/lucid` instalados. Todas coinciden hoy, carácter por carácter.

**El problema es de diseño, no de datos**. Cualquier cambio de redacción en una dependencia rompe la traducción **en silencio**: el usuario vuelve a ver inglés y ningún test lo detecta.

**Qué hacer**: mapear por `rule` y `field`, que son estables, en vez de por el texto del mensaje. Es refactor, no corrección, por eso sigue abierto.

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
