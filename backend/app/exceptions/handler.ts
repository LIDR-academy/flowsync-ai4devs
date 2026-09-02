import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    /**
     * `E_ROW_NOT_FOUND` no se auto-maneja y cae al renderizador de depuración,
     * así que fuera de producción devolvía el nombre de la excepción, la traza,
     * la línea del ORM y rutas absolutas del disco. Todos los errores que el
     * proyecto sí controla viajan como `{ errors: [...] }`, y el contrato lo
     * documenta así para las tres rutas que resuelven un identificador.
     *
     * Se normaliza aquí y no en cada controlador porque son tres rutas hoy y
     * cualquiera que se añada mañana heredaría el mismo agujero.
     *
     * **Esto no cierra H-19.** Fuera de producción, **cualquier** excepción que
     * el proyecto no controle sigue saliendo con el volcado de depuración: una
     * ruta desconocida, un fallo de la base de datos con su SQL, cualquier
     * error inesperado. Aquí solo se normaliza el caso que el contrato
     * documenta. Cerrar el resto es apagar el modo depuración, que cambia el
     * comportamiento del framework para todo el equipo y merece su propia
     * decisión.
     */
    if (error instanceof Error && 'code' in error && error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response
        .status(404)
        .send({ errors: [{ message: 'No se ha encontrado el recurso solicitado' }] })
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
