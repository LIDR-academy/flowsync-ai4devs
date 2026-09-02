# ADR-0003 · El volcado de depuración va apagado, salvo que alguien lo encienda

## Estado

Aceptada · 2026-09-02

Cierra **H-19**, el único defecto que se arrastraba desde el Módulo 3.

## Contexto

`app/exceptions/handler.ts` fijaba `debug = !app.inProduction`, que es el valor con el que viene el framework. Fuera de producción, cualquier error devolvía en el **cuerpo de la respuesta** el nombre de la excepción, la traza completa, el número de línea, rutas absolutas del disco y, si el error venía de la base de datos, la sentencia SQL ejecutada.

Se encontró tres veces, en tres momentos distintos:

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

La razón por la que sobrevivió tres módulos no fue la dificultad. Fue que cerrarlo no es un arreglo sino una decisión, y nadie la había escrito.

## Decisión

**El volcado de depuración va apagado por defecto en todos los entornos, no solo en producción.**

```ts
protected debug = env.get('DEBUG_HTTP_ERRORS', false)
```

Quien lo quiera lo enciende a propósito, poniendo `DEBUG_HTTP_ERRORS=true` en su `.env`.

Lo que hace defendible la decisión, y lo que se comprobó antes de tomarla: **el diagnóstico no se pierde, cambia de sitio**. `ExceptionHandler.report()` sigue registrando el error, y en nivel `error` o `fatal` incluye el objeto completo con su traza en el log del servidor. Verificado leyendo `@adonisjs/http-server`:

```js
const level = this.getErrorLogLevel(httpError)
ctx.logger.log(level, {
  ...(level === 'error' || level === 'fatal' ? { err: httpError } : {}),
  ...this.context(ctx)
}, httpError.message)
```

El desarrollador tiene la misma información en la terminal donde corre el servidor, que es donde mira. Lo que deja de tenerla es cualquiera que alcance el puerto.

## Alternativas consideradas

**Dejarlo como estaba y convivir con la fuga.** Es lo que se hizo tres módulos seguidos, cada vez con el mismo argumento: en producción no ocurre. Es cierto y es insuficiente. Una máquina de desarrollo con el puerto accesible en la red local expone la estructura del proyecto, sus rutas de disco y su SQL a cualquiera, sin credenciales. Y el argumento «en producción no ocurre» depende de que nadie despliegue nunca con `NODE_ENV` mal puesto.

**Normalizar excepción por excepción, como se venía haciendo.** Es lo que se hizo con `E_ROW_NOT_FOUND` y antes con `response.notFound`. Funciona para lo que se conoce y deja abierto lo que aparezca mañana, que es exactamente cómo este defecto sobrevivió a dos arreglos.

**Apagarlo solo en `test`.** Habría hecho pasar las pruebas sin cerrar el problema, que es la peor combinación posible: la suite en verde sobre un defecto vivo. Es justo el error que este módulo entero enseña a no cometer.

## Consecuencias

Un error inesperado ya no se lee en el navegador. Hay que mirar la terminal del servidor, o encender `DEBUG_HTTP_ERRORS` a propósito. Es un cambio de hábito real para quien esté acostumbrado al volcado de Youch.

A cambio, ninguna respuesta del sistema revela cómo está construido por dentro, en ningún entorno, sin que alguien lo haya decidido.

La normalización de `E_ROW_NOT_FOUND` del manejador **se mantiene**, y no es redundante: da a las tres rutas que resuelven un identificador la forma de error que el contrato documenta, con `{ errors: [...] }`, en vez del `{ message }` escueto que devolvería el framework.

Queda atado por `tests/functional/errores.spec.ts`, que comprueba el cuerpo entero de cuatro clases de error -ruta desconocida, método no admitido, falta de credencial y validación- contra siete rastros distintos. Encender el volcado tumba dos de esas pruebas.

**Lo que no cubre**: la decisión es sobre lo que sale por HTTP. Los logs del servidor siguen conteniendo trazas y SQL, que es su función, y quien tenga acceso a ellos los ve. Eso no es una fuga, es un permiso.
