# ADR-0003 · El volcado de depuración va apagado, salvo que alguien lo encienda

## Estado

Aceptada · 2026-09-02

Cierra **H-19**, que se arrastraba desde el Módulo 3.

> **Revisada el 2026-09-02**, el mismo día. La quinta revisión adversarial demostró que apagar el volcado **no cerraba H-19**: quitaba las trazas y dejaba intacta la respuesta que da el framework con la depuración apagada, que filtra el mensaje crudo de la excepción. Las secciones marcadas abajo recogen la corrección. Se revisa en lugar de reemplazarse porque la decisión de fondo -el volcado va apagado- sigue vigente y es correcta; lo que era falso era darla por suficiente.

## Contexto

`app/exceptions/handler.ts` fijaba `debug = !app.inProduction`, que es el valor con el que viene el framework. Fuera de producción, cualquier error devolvía en el **cuerpo de la respuesta** el nombre de la excepción, la traza completa, el número de línea, rutas absolutas del disco y, si el error venía de la base de datos, la sentencia SQL ejecutada.

Se encontró cuatro veces, en cuatro momentos distintos:

**Módulo 3.** `/opsx:verify` destapó que un `PATCH` sobre una tarea inexistente devolvía la traza completa. El diagnóstico fue correcto y general, y quedó escrito en `design.md` del change `add-task-list` como D12:

> «Se probó, y el manejador la renderizaba igualmente con traza: el problema no era el tipo del error, sino que se lanzara.»

El arreglo, en cambio, fue **local a una ruta**: `Task.find` seguido de `response.notFound`. La conclusión general no se llevó al sitio general.

**Módulo 4.** La rama del curso resuelve identificadores con `findOrFail`, que lanza, así que el defecto reapareció idéntico en las tres rutas que resuelven un identificador. Se normalizó entonces `E_ROW_NOT_FOUND` en el manejador, que es el sitio que D12 ya había señalado. Pero solo esa excepción.

**Cuarta revisión adversarial.** Quedaba todo lo demás. Se evidenció con un `500` de SQLite:

```
PUT /api/v1/tasks/10/due-date
{"message":"update `tasks` set … - no such column: due_date","name":"SqliteError",
 "frames":[… "fileName":"C:/Users/renel/…/node_modules/better-sqlite3/…"],"stack":"…"}
```

Y con una ruta desconocida, que además **no exige sesión**: basta alcanzar el puerto.

**Quinta revisión adversarial, sobre el commit que lo cerraba.** Apagar el volcado no bastaba. La rama sin depuración del framework responde `{ message: error.message }`, y ese mensaje, en un error de base de datos, es el SQL:

```
POST /api/v1/auth/signup    (carrera de `unique`, con debug ya apagado)
500 {"message":"insert into `users` (…) values (…, '$scrypt$n=16384,r=8,p=1$…'"}
```

Sin sesión, en un endpoint público, y con el hash de la contraseña dentro.

La razón por la que sobrevivió tres módulos no fue la dificultad. Fue que cerrarlo no es un arreglo sino una decisión, y nadie la había escrito. Y la razón por la que sobrevivió a la decisión fue la de siempre en este defecto: se atacó una de sus manifestaciones y no el sitio general.

## Decisión

**El volcado de depuración va apagado por defecto en todos los entornos, no solo en producción.**

```ts
protected debug = env.get('DEBUG_HTTP_ERRORS', false)
```

Quien lo quiera lo enciende a propósito, poniendo `DEBUG_HTTP_ERRORS=true` en su `.env`.

**Y ningún `5xx` devuelve su mensaje** (añadido en la revisión del 2026-09-02).

```ts
if (httpError.status >= 500 && !this.isDebuggingEnabled(ctx)) {
  return ctx.response
    .status(httpError.status)
    .send({ errors: [{ message: 'Error interno del servidor' }] })
}
```

Apagar el volcado quita las trazas de Youch y deja la otra rama del framework, que responde `{ message: error.message }`. El `message` de un `SqliteError` **es la sentencia SQL entera**, con los valores insertados dentro. Se reprodujo con `debug` ya apagado, en el alta de una cuenta, sin sesión, devolviendo el `insert into users …` completo con el hash scrypt de la contraseña.

El mensaje de un error inesperado no es contrato: lo escribe la librería que falló y describe el fallo, no el producto. Va cerrado, y no depende de qué excepción sea, porque el agujero nunca lo abrió una excepción concreta sino la costumbre de devolver `message` tal cual.

Lo que hace defendible la decisión, y lo que se comprobó antes de tomarla: **el diagnóstico no se pierde, cambia de sitio**. `ExceptionHandler.report()` sigue registrando el error, y en nivel `error` o `fatal` incluye el objeto completo con su traza en el log del servidor. Verificado leyendo `@adonisjs/http-server`:

```js
const level = this.getErrorLogLevel(httpError)
ctx.logger.log(level, {
  ...(level === 'error' || level === 'fatal' ? { err: httpError } : {}),
  ...this.context(ctx)
}, httpError.message)
```

El desarrollador tiene la misma información en la terminal donde corre el servidor, que es donde mira. Lo que deja de tenerla es cualquiera que alcance el puerto.

**Con un límite que la primera redacción de este ADR se dejó fuera** (corregido el 2026-09-02): eso vale para los `5xx` y **no** para los `4xx`. Tres líneas por encima del fragmento citado, `report()` corta antes:

```js
ignoreExceptions = [E_HTTP_EXCEPTION, E_ROUTE_NOT_FOUND, …]
ignoreStatuses = [400, 422, 401]
getErrorLogLevel(error) { if (error.status >= 500) return 'error'
                          if (error.status >= 400) return 'warn' … }
```

Así que una ruta desconocida, un 401 y un 422 **no dejan ninguna línea en el log**, y un 404 de `E_ROW_NOT_FOUND` deja una línea de nivel `warn` **sin el objeto `err`**: solo el mensaje. Comprobado capturando el log del servidor mientras se provocaban los cuatro.

Se acepta, y por eso se escribe en vez de cambiarlo: un `4xx` es tráfico esperado y su cuerpo ya dice lo que hay que saber -no existe, no tienes credencial, el campo está mal-. El diagnóstico que importa es el del error que nadie esperaba, y ese es el `5xx`, que sí se registra entero. La afirmación correcta es «el diagnóstico del `5xx` cambia de sitio», no «el diagnóstico cambia de sitio».

## Alternativas consideradas

**Dejarlo como estaba y convivir con la fuga.** Es lo que se hizo tres módulos seguidos, cada vez con el mismo argumento: en producción no ocurre. Es cierto y es insuficiente. Una máquina de desarrollo con el puerto accesible en la red local expone la estructura del proyecto, sus rutas de disco y su SQL a cualquiera, sin credenciales. Y el argumento «en producción no ocurre» depende de que nadie despliegue nunca con `NODE_ENV` mal puesto.

**Normalizar excepción por excepción, como se venía haciendo.** Es lo que se hizo con `E_ROW_NOT_FOUND` y antes con `response.notFound`. Funciona para lo que se conoce y deja abierto lo que aparezca mañana, que es exactamente cómo este defecto sobrevivió a dos arreglos.

**Apagarlo solo en `test`.** Habría hecho pasar las pruebas sin cerrar el problema, que es la peor combinación posible: la suite en verde sobre un defecto vivo. Es justo el error que este módulo entero enseña a no cometer.

## Consecuencias

Un error inesperado ya no se lee en el navegador. Hay que mirar la terminal del servidor, o encender `DEBUG_HTTP_ERRORS` a propósito. Es un cambio de hábito real para quien esté acostumbrado al volcado de Youch.

A cambio, ninguna respuesta del sistema revela cómo está construido por dentro, en ningún entorno, sin que alguien lo haya decidido.

Esa frase se escribió antes de ser cierta: con solo apagar el volcado, un `5xx` seguía devolviendo la sentencia SQL. Lo es desde que el manejador intercepta los `5xx`, y quien la sostiene es la prueba, no esta frase.

La normalización de `E_ROW_NOT_FOUND` del manejador **se mantiene**, y no es redundante: da a las tres rutas que resuelven un identificador la forma de error que el contrato documenta, con `{ errors: [...] }`, en vez del `{ message }` escueto que devolvería el framework.

Queda atado por `tests/functional/errores.spec.ts`, que comprueba el cuerpo entero de **cinco** clases de error -ruta desconocida, identificador inexistente, falta de credencial, validación y **un `500` real de la base de datos**- contra diecisiete rastros, entre ellos `insert into`, `SqliteError` y `$scrypt$`.

La primera redacción de este ADR decía «cuatro clases» y «siete rastros», y ninguna de las cuatro era un `5xx`: el spec que supuestamente ataba esta decisión no cubría el caso que la motivó. Dos de aquellos cuatro casos -el 401 y el 422- no podían morder nunca, porque esas excepciones se auto-manejan y jamás pasaron por el renderizador de depuración; un tercero era un duplicado del primero.

El `500` se provoca de forma determinista y no con una carrera: se guarda una cuenta en mayúsculas por debajo del validador -lo que haría un seeder- y se da de alta la misma en minúsculas, que el índice único sobre `lower(email)` detiene. Quitar la intercepción de `5xx` tumba esa prueba; comprobado.

**Lo que no cubre**: la decisión es sobre lo que sale por HTTP. Los logs del servidor siguen conteniendo trazas y SQL, que es su función, y quien tenga acceso a ellos los ve. Eso no es una fuga, es un permiso.
