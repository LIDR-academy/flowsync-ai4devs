import env from '#start/env'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * El volcado de depuración va **apagado por defecto en todos los entornos**
   * (ADR-0003), no solo en producción.
   *
   * Encendido devolvía en el cuerpo de la respuesta la traza, el nombre de la
   * excepción, rutas absolutas del disco y, si el error venía de la base, la
   * sentencia SQL ejecutada. Bastaba alcanzar el puerto para leerlo, sin
   * sesión. Es H-19, que se arrastraba desde el Módulo 3.
   *
   * Apagarlo quita el volcado, y **no basta**: ver `handle()`.
   *
   * Quien quiera el volcado en el navegador lo enciende a propósito con
   * `DEBUG_HTTP_ERRORS=true` en su `.env`.
   */
  protected debug = env.get('DEBUG_HTTP_ERRORS', false)

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    /**
     * `E_ROW_NOT_FOUND` no se auto-maneja y cae al renderizador genérico, que
     * responde `{ message }` a secas. Todos los errores que el proyecto sí
     * controla viajan como `{ errors: [...] }`, y el contrato lo documenta así
     * para las tres rutas que resuelven un identificador.
     *
     * Se normaliza aquí y no en cada controlador porque son tres rutas hoy y
     * cualquiera que se añada mañana heredaría el mismo agujero.
     *
     * Esto normaliza la **forma** del cuerpo. Que ninguna respuesta revele
     * internals es otra cosa, y se decide abajo.
     */
    if (error instanceof Error && 'code' in error && error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response
        .status(404)
        .send({ errors: [{ message: 'No se ha encontrado el recurso solicitado' }] })
    }

    /**
     * Un `5xx` responde siempre lo mismo, y nunca su `message`.
     *
     * Apagar el volcado quitó las trazas y **dejó abierta la mitad grande**:
     * la rama sin depuración del framework responde `{ message: error.message }`,
     * y el `message` de un `SqliteError` es la sentencia SQL entera. La carrera
     * de `unique` en el alta devolvía así el `insert into users …` completo, con
     * el hash scrypt de la contraseña dentro, en un endpoint público y sin
     * sesión. Con `debug` ya apagado, que es la configuración de producción.
     *
     * El mensaje de un error inesperado no es contrato: lo escribe la librería
     * que falló, y describe el fallo, no el producto. Va cerrado a propósito, y
     * no depende de qué excepción sea, porque el agujero no lo abría una
     * excepción concreta sino la costumbre de devolver `message` tal cual.
     *
     * El diagnóstico no se pierde. `report()` corre aparte y registra los `5xx`
     * en nivel `error`, que es el nivel en el que el framework adjunta el objeto
     * completo con su traza al log del servidor.
     */
    const httpError = this.toHttpError(error)

    if (httpError.status >= 500 && !this.isDebuggingEnabled(ctx)) {
      return ctx.response
        .status(httpError.status)
        .send({ errors: [{ message: 'Error interno del servidor' }] })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
