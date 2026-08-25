# Hallazgos técnicos

> Cosas descubiertas trabajando sobre el repo, no supuestos. Cada una indica **cómo se verificó**.
>
> No son decisiones de producto: esas viven en `docs/prd/flowsync-mvp.md`, sección 10, como `D-nn`. Aquí van los hallazgos técnicos y de proceso que van a doler si nadie los conoce de antemano.
>
> Rama de referencia: `s2/start`. Última revisión: 2026-08-24.

## Índice por severidad

| # | Hallazgo | Severidad | Estado |
|---|---|---|---|
| H-01 | Los tests comparten base de datos con desarrollo | Alta | Abierto |
| H-02 | Cero pruebas automatizadas en todo el proyecto | Alta | Abierto |
| H-03 | `/account/logout` no envuelve la respuesta en `data` | Media | Documentado y sorteado |
| H-04 | `fullName` es `nullable`, no `optional` | Media | Documentado y sorteado |
| H-05 | La traducción de errores compara cadenas exactas | Media | Abierto |
| H-06 | El token vive en `localStorage` | Media | Deuda aceptada |
| H-07 | El hook de formateo depende de `jq`, que no está instalado | Baja | Abierto |
| H-08 | `AGENTS.md` es un symlink que Windows no materializa | Baja | Sin impacto hoy |
| H-09 | `database/schema.ts` se regenera sin formato y rompe el lint | Baja | Reincidente |
| H-10 | Los tipos de issue de Jira en `LID` están en dos idiomas | Baja | Sorteado |

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
