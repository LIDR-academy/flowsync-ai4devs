# Backend de FlowSync

API HTTP en **AdonisJS 7** con Lucid 22 sobre SQLite, VineJS 4 para validar y access tokens opacos para autenticar. Escucha en `http://localhost:3333` y expone todo bajo `/api/v1`.

## Responsabilidades

- **Cuentas y sesión** (`auth`): registro, inicio y cierre de sesión, perfil propio. Detalle en [`docs/capabilities/auth/README.md`](../docs/capabilities/auth/README.md).
- **Tareas del equipo** (`tasks`): lista compartida, creación, cambio de estado, fecha de vencimiento y filtro. Detalle en [`docs/capabilities/tasks/README.md`](../docs/capabilities/tasks/README.md).
- **El contrato**: el documento OpenAPI servido en `/api`, `/api.json` y `/api.yaml`, y su copia versionada en [`docs/api/openapi.json`](../docs/api/openapi.json).
- **La forma de los errores**: toda respuesta de error sale con la forma del proyecto y sin traza, rutas del disco ni SQL.

Lo que **no** hace: servir el frontend, enviar correo, ni hablar con ningún sistema externo.

## Estructura

| Carpeta                     | Qué hay                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `start/routes.ts`           | Las rutas. Referencian controladores por el mapa generado en `.adonisjs/server/controllers.ts`           |
| `start/kernel.ts`           | Middleware: `silent_auth` en todas las rutas, `force_json_response`, y `auth()` en los grupos protegidos |
| `app/controllers/`          | Un controlador por recurso, decorado con `@foadonis/openapi`                                             |
| `app/validators/`           | VineJS 4 con `vine.create()`; los campos comunes (`email()`, `password()`) se comparten                  |
| `app/models/`               | `User` y `Task`. **No declaran columnas**: extienden las clases de `database/schema.ts`                  |
| `app/transformers/`         | Qué sale por el cable. Nunca se devuelve un modelo crudo                                                 |
| `app/exceptions/handler.ts` | La forma de los errores y el volcado de depuración, apagado por defecto                                  |
| `app/openapi/`              | Esquemas del contrato, construcción del documento y el comparador de `openapi:check`                     |
| `providers/api_provider.ts` | Inyecta `ctx.serialize()`, que envuelve toda respuesta en `{ data }`                                     |
| `database/migrations/`      | La única forma de cambiar el modelo de datos                                                             |
| `database/schema.ts`        | **Autogenerado** desde las migraciones. No se edita                                                      |
| `.adonisjs/`                | Código generado, **versionado** para que un clon limpio compile                                          |
| `tests/unit/`               | Reglas puras de los modelos, sin base ni HTTP: vencida e iniciales                                       |
| `tests/functional/`         | Pruebas Japa contra la API real, por capability                                                          |

## Cómo se usa

### Primera vez

```bash
npm install                                     # también activa el hook de git (script prepare)
cp .env.example .env && node ace generate:key
node ace migration:run                          # crea tmp/db.sqlite3 y regenera database/schema.ts
```

### Ejecutar

```bash
npm run dev        # node ace serve --hmr, en http://localhost:3333
```

El documento navegable de la API queda en `http://localhost:3333/api`. Un recorrido completo con `curl`, de crear cuenta a poner una fecha, en el README de [`tasks`](../docs/capabilities/tasks/README.md#a-mano-contra-el-servidor-real).

### Variables de entorno

Validadas al arrancar por `start/env.ts`. Una nueva se añade con `node ace env:add`, que la escribe en `.env`, `.env.example` y el esquema.

| Variable            | Valor por defecto en `.env.example` | Para qué                                                                                                                                                 |
| ------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`, `HOST`      | `3333`, `localhost`                 | Dónde escucha. En pruebas, `PORT=3334` (`.env.test`)                                                                                                     |
| `NODE_ENV`          | `development`                       | `development`, `production` o `test`. Decide el fichero de base de datos                                                                                 |
| `APP_KEY`           | vacío                               | Secreto de la aplicación. Lo genera `node ace generate:key`                                                                                              |
| `APP_URL`           | `http://${HOST}:${PORT}`            | URL pública de la API                                                                                                                                    |
| `LOG_LEVEL`         | `info`                              | En pruebas, `fatal`, para que los errores provocados a propósito no llenen el log                                                                        |
| `SESSION_DRIVER`    | `cookie`                            | Configurado pero sin uso real: la autenticación va por access tokens                                                                                     |
| `DEBUG_HTTP_ERRORS` | `false`                             | Encendido, los errores devuelven traza y SQL. **Nunca fuera de una máquina local** ([ADR-0005](../docs/adr/0005-el-volcado-de-depuracion-va-apagado.md)) |

### Cambiar el modelo de datos

```bash
node ace make:migration <nombre>
node ace migration:run          # regenera database/schema.ts
```

Al modelo se añaden solo relaciones, mixins, getters y lógica.

**Política de migraciones**, escrita el 2026-09-13 leyendo las seis que hay:

- **Una migración fusionada no se edita.** Se escribe otra encima. Lo que ya corrió en una base no se puede reescribir.
- **Cada migración declara en su docblock si se puede deshacer.** Las de esquema tienen `down` real (`dropTable`, `dropColumn`, `drop index`). La que reescribe datos (`normalize_user_emails`) tiene `down` vacío **a propósito**: bajar a mayúsculas lo que se normalizó no tiene sentido, y un `down` que finge revertir es peor que uno que dice que no. Si una migración no puede deshacerse, lo dice ahí y en el hallazgo o ADR que la motivó.
- **Ningún `down` está probado en CI.** Es un hueco declarado (runbooks §7): antes de desplegar por primera vez, cada `down` se ejecuta contra una copia de la base y se anota.
- **Una migración que toca datos normaliza con la misma función que el runtime**, importada, no reimplementada: `normalizeUserEmail` sale de `validators/user.ts`. Que las dos normalicen distinto tiene que ser imposible, no cuestión de acordarse.
- **En pruebas, `--no-schema-generate`** en todo `migration:run`, `reset` y `fresh` que lance un script: el generador reescribe `database/schema.ts` y una vez lo dejó vacío (H-09). CI comprueba que Playwright no lo toca.
- El diagrama de las tablas está en [`docs/architecture.md`](../docs/architecture.md#modelo-de-datos).

### Cambiar una ruta, un controlador, un validador o un transformer

```bash
npm run openapi:generate        # reescribe docs/api/openapi.json
```

Se commitea en el mismo cambio, junto con el diff de `.adonisjs/` y el README de la capability. `npm run openapi:check` sale con código 1 y nombra lo que difiere si se olvida; CI lo ejecuta en cada push ([ADR-0007](../docs/adr/0007-el-contrato-se-genera-se-versiona-y-se-vigila-la-deriva.md)).

## Cómo se prueba

```bash
npm test                               # node ace test: unit y functional
node ace test unit                     # solo las unitarias, en milisegundos
node ace test --files=vencimiento      # un fichero
node ace test --tests="el título es lo único que hace falta"   # un caso por título
npm run lint && npm run typecheck
npm run openapi:check
```

- La suite escribe en `tmp/db-test.sqlite3`, **nunca** en la de desarrollo: `bin/test.ts` fuerza `NODE_ENV=test` y `config/database.ts` elige el fichero por entorno ([ADR-0003](../docs/adr/0003-aislamiento-de-la-base-de-datos-en-pruebas.md)).
- Cada fichero de prueba aísla sus casos con `testUtils.db().withGlobalTransaction()` en `group.each.setup`. Mantenlo en uno nuevo.
- No se lanza a la vez que `npm run test:e2e` del frontend: los dos usan la base de pruebas y el puerto 3334.
- Cuántas pruebas hay, y su desglose, lo dice [`AGENTS.md`](../AGENTS.md) y solo ahí; CI lo contrasta con lo que ejecuta Japa. Qué escenario cubre cada una, en [`docs/trazabilidad.md`](../docs/trazabilidad.md).

Para leer un error o mandar un payload inválido desde una prueba, están los helpers de `tests/helpers/api.ts`: el registro tipado de Tuyau solo tipa la respuesta de éxito.
