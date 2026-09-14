# Runbooks de FlowSync

> Qué hacer cuando algo se rompe, en el orden en que conviene hacerlo.
>
> **FlowSync no está desplegado en ningún sitio.** No hay producción, ni monitoreo, ni guardia, y este documento no finge lo contrario: lo que opera de verdad es el entorno local y la CI del fork, y eso es lo que se describe con procedimiento. Lo que haría falta para desplegar va en su propia sección, marcado como **no ejecutado nunca**.
>
> Escrito el 2026-09-13. Cada procedimiento sale de un incidente que ya pasó en este repositorio, y lo cita.

## Índice

| Síntoma | Sección |
|---|---|
| No arranca, puerto ocupado, la base no responde | [1 · Entorno local](#1--entorno-local) |
| Un job de «Verificación» en rojo | [2 · CI: Verificación](#2--ci-verificación) |
| El revisor adversarial en rojo, o en verde sin informe | [3 · CI: Revisión adversarial](#3--ci-revisión-adversarial) |
| Hay que renovar la credencial del revisor | [4 · Rotar la credencial del revisor](#4--rotar-la-credencial-del-revisor) |
| Un commit roto ya empujado, o un commit rechazado por el hook | [5 · Recuperación en git](#5--recuperación-en-git) |
| Se salta a una rama nueva del curso | [6 · Salto de rama](#6--salto-de-rama) |
| Se quiere desplegar | [7 · Despliegue](#7--despliegue-no-ejecutado-nunca) |
| Monitoreo e incidentes en producción | [8 · Monitoreo y guardia](#8--monitoreo-y-guardia) |

---

## 1 · Entorno local

### El backend no arranca: `EADDRINUSE` en el 3333 o el 3334

El 3333 es el servidor de desarrollo; el 3334, la suite de Japa y el backend de Playwright, que **comparten puerto y base a propósito** para no poder correr a la vez.

1. Averigua qué lo ocupa. En Windows: `netstat -ano | findstr :3334`. En macOS o Linux: `lsof -i :3334`.
2. Si es un `node ace serve` o una ejecución de pruebas que quedó colgada, páralo.
3. No cambies el puerto en `.env.test`: hasta el 2026-09-12 la suite heredaba el 3333 del `.env` y caía con cero pruebas ejecutadas cuando el servidor de desarrollo estaba arriba.

### `make` no funciona, o no hay Node en la máquina

`docker compose up` desde la raíz levanta los dos servidores con la misma imagen de Node que CI. Las dependencias van en volúmenes propios y la base en `backend/tmp/`, que persiste. Para empezar de cero: `docker compose down -v`. **No ejecutado todavía en ninguna máquina**: el fichero pasa `docker compose config` y nada más; quien lo levante primero, que anote qué hubo que tocar.

### La base de desarrollo tiene datos basura

```bash
cd backend
node ace migration:fresh     # borra todas las tablas y vuelve a migrar
```

Borra **todo**, cuentas incluidas. Solo afecta a `tmp/db.sqlite3`: la de pruebas es otro fichero.

### Las pruebas fallan de forma rara tras interrumpir una ejecución

La base de pruebas puede haber quedado con tablas a medias, típicamente tras cortar Playwright antes de su teardown.

```bash
cd backend
rm tmp/db-test.sqlite3        # se recrea en la siguiente ejecución
```

### `database/schema.ts` aparece vacío o sin formato en `git status`

Lo regenera cualquier migración. Pasó el 2026-09-13 con `migration:reset`, que lo dejó vacío.

```bash
git restore backend/database/schema.ts
```

Si el cambio de esquema es intencionado, `node ace migration:run` lo regenera con el contenido correcto y se commitea. Es H-09, vigilado: CI comprueba que las pruebas de navegador no lo modifican.

### La SPA dice «No se pudo conectar con el servidor»

1. ¿Está el backend arrancado? `curl http://localhost:3333/api.json` debe responder.
2. ¿`VITE_API_URL` en `frontend/.env` apunta a él? Tras cambiarla, reinicia `npm run dev`: Vite la lee al arrancar.
3. El token guardado **se conserva** en este caso a propósito; al volver el backend, recargar restaura la sesión (H-38).

---

## 2 · CI: Verificación

`verificacion.yml` corre en cada push a cualquier rama del fork. Abre la ejecución y mira **qué job** falló; el resumen de color no dice por qué.

```bash
gh run list -R rene2bcore/flowsync-ai4devs -b <rama> -L 5
gh run view <id> -R rene2bcore/flowsync-ai4devs --log-failed
```

### Backend o Frontend

| Mensaje | Qué pasó | Qué hacer |
|---|---|---|
| Una prueba en rojo | Lo que dice | Reproducir en local con `node ace test --files=<fichero>` o `npx vitest run <fichero>`. Un bug no se cierra sin reproducirlo |
| `recuento de pruebas (backend): ...` | Se añadió o quitó una prueba y `AGENTS.md` no se actualizó | Actualizar total **y desglose** en `AGENTS.md`. Es el único sitio con el número |
| Lint o typecheck | Lo que dice | `npm run lint` y `npm run typecheck` (backend) o `npm run build` (frontend) en local |
| `npm run format:check`: `[warn] <fichero>` | Un fichero no sigue el formato de Prettier | `npm run format` en ese paquete y commitear el resultado. En Windows, `format:check` ya ignora los CRLF del árbol de trabajo |
| «Sin vulnerabilidades altas en las dependencias» | `npm audit` encontró una vulnerabilidad alta o crítica | Primero relanzar: consulta el registro de npm y puede fallar por red. Si se repite, `npm audit` en local para ver cuál, y `npm audit fix` **sin** `--force`; después, lint, tipos y pruebas. Si solo se arregla con un salto de versión mayor, se decide y se registra, no se fuerza |

### Las comprobaciones muerden (R-14)

`scripts/mutaciones.mjs` reintroduce defectos que ya existieron y exige que cada comprobación se ponga en rojo **nombrando** el motivo.

| Salida | Qué significa | Qué hacer |
|---|---|---|
| `ROJO sin mutar · <comprobación>` | La comprobación ya estaba roja antes de mutar nada | Arreglar eso primero: sin un verde de partida ningún rojo demuestra nada |
| `NO APLICA <id>` | El código cambió y el texto que la mutación busca ya no aparece exactamente una vez | Actualizar la entrada del catálogo al código nuevo, **y comprobar que el arreglo sigue ahí**: así se detectan los arreglos que no cruzan de rama |
| `SOBREVIVE <comprobación>` | Con el defecto puesto, sigue en verde | Es un hallazgo: la comprobación ya no protege lo que dice. Registrarlo en `docs/hallazgos.md` antes de tocar nada |
| `ROJO POR OTRO MOTIVO` | Falló, pero no por lo que la entrada dice | Leer el volcado que sigue. Pasó en Linux con las marcas de fallo de Japa (`❯` frente a `>`) |

Para repetir una sola: `node scripts/mutaciones.mjs <id>`. Para ver el catálogo: `node scripts/mutaciones.mjs --listar`. El script restaura los ficheros al terminar, también con `Ctrl-C`.

### Lo que se ve en pantalla (Playwright)

1. Descarga el artefacto `trazas-playwright` de la ejecución (se guarda siete días) y ábrelo con `npx playwright show-trace <fichero.zip>`.
2. Reproduce en local con `npm run test:e2e`, sin el backend de desarrollo ni Japa corriendo.
3. Si el paso que falla es «Las pruebas de navegador no tocan el esquema versionado», algo regeneró `database/schema.ts`: los comandos de migración del `webServer` y del teardown deben llevar `--no-schema-generate`.

### La documentación corresponde con el código

| Paso | Mensaje | Qué hacer |
|---|---|---|
| El contrato versionado sigue al día | `... sobra en el fichero`, `... falta en el fichero`, `valor distinto` | `cd backend && npm run openapi:generate`, revisar el diff de `docs/api/openapi.json` y commitearlo. Si el diff no era esperado, el cambio de código es el problema |
| Contrastar documentación contra código | Líneas `FALLA  <comprobación> · <detalle>` | Cada comprobación de `scripts/verificar-docs.mjs` explica en su comentario qué defecto previene. Arreglar el código o el documento, el que mienta |
| El hook de rama rechaza main y sN/* | `scripts/probar-hook-rama.mjs` | Alguien cambió `.githooks/pre-commit`. Ver sus casos en el script |
| Todo fix deja una prueba o dice por qué no (R-08) | `FALLA <sha> fix: ... · no toca ninguna prueba` | Si el arreglo tiene prueba, falta en el commit. Si no puede tenerla (un workflow), el mensaje necesita una línea `Sin-prueba: <motivo>`. Como el historial no se reescribe, se hace con un commit nuevo que añada la prueba; si era un error de tipo, el siguiente commit no debe ser `fix:` |
| Validar las specs vivas | Salida de `openspec validate --specs` | Un requisito sin escenario o con formato roto en `openspec/specs/` |

---

## 3 · CI: Revisión adversarial

`revision-adversarial.yml`. **No bloquea**: su trabajo es informar. Pero sus estados significan cosas distintas y conviene no confundirlos.

| Estado | Resumen del job | Significado | Qué hacer |
|---|---|---|---|
| Verde | «sin credencial de Claude: se omite la revisión» | No hay secreto configurado | Nada, si es a propósito. Si no, [sección 4](#4--rotar-la-credencial-del-revisor) |
| Verde | «la rama no tiene PR abierto» | La rama no es un cambio propuesto | Nada. Abre el PR si quieres revisión |
| Verde | El informe con Graves y Menores | Revisó | **Leerlo.** Un grave se reproduce antes de arreglarlo |
| Rojo | «La revisión adversarial no pudo ejecutarse» con `401 Invalid bearer token` | Credencial inválida o caducada | [Sección 4](#4--rotar-la-credencial-del-revisor). Provocado a propósito el 2026-09-13 |
| Rojo | `Reached max turns` | El diff es demasiado grande para 40 turnos (H-30) | Partir la unidad de trabajo. Por encima de ~6000 líneas de diff el job ya avisa en el resumen |
| Rojo | Error de herramienta desconocida en `--disallowed-tools` | La versión fijada del CLI no conoce una herramienta de la lista (H-28) | Comprobar la lista contra la versión instalada antes de subir el CLI |
| Rojo por `timeout-minutes: 10` | Cancelado | Algo se colgó | Relanzar con `gh workflow run revision-adversarial.yml --ref <rama>`. Si se repite, leer el log del paso «Revisar» |

**El informe no llega al PR del curso**, y es esperado: el token del fork no puede comentar en `LIDR-academy`. Queda en el resumen del job (H-24, aceptado por los mantenedores).

Para relanzarlo sin commit:

```bash
gh workflow run revision-adversarial.yml -R rene2bcore/flowsync-ai4devs --ref <rama>
```

---

## 4 · Rotar la credencial del revisor

Hacerlo cuando el revisor sale en rojo con `401`, cuando se sospeche que el token se ha filtrado, o al cambiar de suscripción. **El token no pasa nunca por un chat, un issue ni un fichero del repositorio.**

1. Genera uno nuevo en local: `claude setup-token`. Empieza por `sk-ant-oat01-` y mide más de 100 caracteres.
2. Cópialo **entero**. La terminal lo parte en varias líneas y es fácil llevarse solo un trozo. En PowerShell, `(Get-Clipboard -Raw).Trim().Length` dice la longitud sin mostrarlo.
3. Guárdalo, pegándolo una sola vez cuando lo pida:
   ```bash
   gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo rene2bcore/flowsync-ai4devs
   ```
4. **Comprueba que se guardó**: `gh secret list --repo rene2bcore/flowsync-ai4devs` debe fechar el secreto ahora. El 2026-09-13 un primer intento no cambió la fecha y la ejecución siguiente usó el token viejo; sin esta comprobación se habría leído como un fallo del workflow.
5. Relanza el revisor (sección 3) y comprueba que sale verde **con informe**, no con el aviso de «se omite».

`CLAUDE_CODE_OAUTH_TOKEN` gasta de la cuota de la suscripción. `ANTHROPIC_API_KEY` se factura aparte; no se cruzan, y cruzarlos falla en la primera llamada.

---

## 5 · Recuperación en git

### Un commit empujado rompe algo

No se reescribe historial compartido. Se revierte con un commit nuevo:

```bash
git revert <sha>
git push origin <rama>
```

Si el commit revertido era un `fix:`, el revert no es un `fix:` y no necesita prueba.

### El hook rechaza el commit: «no se commitea directo en ...»

Estás en `main` o en una `sN/*`. Los cambios no se pierden:

```bash
git switch -c feat/<slug>     # se lleva los cambios sin commitear
git commit ...
```

**No** uses `--no-verify`: es la única forma de saltarse la regla y es un acto deliberado.

### El hook rechaza el mensaje: «el asunto no sigue 'tipo(ámbito): qué'»

El asunto va como `feat: ...`, `fix(tasks): ...`, `docs: ...`. Los tipos admitidos los imprime el propio hook. R-08 lee ese prefijo para saber si un commit es un arreglo, así que no es estética. `Merge`, `Revert`, `fixup!` y `squash!` pasan.

### El hook no se ejecuta

Lo activa el script `prepare` al hacer `npm install` en `backend/` o `frontend/`. Si se clonó sin instalar: `git config core.hooksPath .githooks`.

---

## 6 · Salto de rama

Al empezar sobre una rama nueva del curso, los arreglos de la anterior **no cruzan solos**: en el Módulo 5 volvieron rotos nueve. Procedimiento completo al final de [`docs/hallazgos.md`](hallazgos.md); en corto:

1. Traer `docs/hallazgos.md` a la rama nueva.
2. `node scripts/mutaciones.mjs`. Cada `NO APLICA` o `SOBREVIVE` es un arreglo que no cruzó.
3. Registrar cada uno antes de tocar código.
4. Lo que no está en el catálogo, comprobarlo a mano, entrada por entrada. Leer la rama no basta: tres de los nueve solo aparecieron al ejecutar las pruebas.

---

## 7 · Despliegue (no ejecutado nunca)

No hay entorno de despliegue ni se ha construido nunca una versión de producción. Lo que sigue es **lo que el código exige**, leído de la configuración, no un procedimiento probado. Quien lo ejecute por primera vez debería convertirlo en uno y fecharlo.

**Bloqueante, antes de nada: CORS.** `backend/config/cors.ts` permite cualquier origen en desarrollo y en pruebas, y **ninguno** en producción (`origin: []`). Una SPA servida desde otro origen no podría llamar a la API. Hay que decidir el origen permitido y declararlo, con su prueba.

Lo demás que el código pide:

| | |
|---|---|
| Build del backend | `cd backend && npm ci && node ace build`, que deja la aplicación en `build/` |
| Variables | `NODE_ENV=production`, un `APP_KEY` propio y secreto, `HOST` y `PORT` del entorno, `APP_URL` real, `LOG_LEVEL=info` |
| Depuración | `DEBUG_HTTP_ERRORS=false` o sin definir. Encendido devuelve traza y SQL en el cuerpo de la respuesta (ADR-0005) |
| Base de datos | `node ace migration:run --force` antes de arrancar. SQLite en un fichero local no sirve para más de una instancia |
| Build del frontend | `cd frontend && npm ci && npm run build`, con `VITE_API_URL` apuntando a la API **en el momento de construir**: Vite la incrusta |
| Arranque | `node bin/server.js` desde la build del backend; la SPA es estática y la sirve cualquier servidor de ficheros |
| Vuelta atrás | Desplegar la build anterior. Las migraciones no tienen un `down` probado: una migración que borra datos no se deshace |

---

## 8 · Monitoreo y guardia

**No hay.** No hay producción que vigilar, ni alertas, ni rotación de guardia, ni métricas de servicio.

Lo que hace las veces de monitoreo hoy es CI en cada push, y quien la mira es quien empuja. Si el proyecto se desplegara, lo mínimo sería:

- **Salud**: una ruta de comprobación. Hoy la más cercana es `GET /api.json`, que no toca la base; `GET /api/v1/account/profile` sí la toca, pero exige sesión.
- **Errores**: el manejador ya registra en nivel `error` todo `500` con su contexto completo en el log del servidor, mientras la respuesta sale limpia. Ese log es lo que habría que recoger.
- **Guardia**: una persona responsable y este documento como punto de partida, ampliado con los incidentes reales que aparezcan.
