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
   * No se pierde nada al apagarlo: `report()` sigue registrando el error con su
   * objeto completo en el log del servidor, que es donde se mira mientras se
   * desarrolla. La información cambia de sitio, no desaparece.
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
     * `E_ROW_NOT_FOUND` no se auto-maneja y cae al renderizador de depuración,
     * así que fuera de producción devolvía el nombre de la excepción, la traza,
     * la línea del ORM y rutas absolutas del disco. Todos los errores que el
     * proyecto sí controla viajan como `{ errors: [...] }`, y el contrato lo
     * documenta así para las tres rutas que resuelven un identificador.
     *
     * Se normaliza aquí y no en cada controlador porque son tres rutas hoy y
     * cualquiera que se añada mañana heredaría el mismo agujero.
     *
     * Esto normaliza la **forma** del cuerpo, para que las tres rutas que
     * resuelven un identificador respondan como el contrato documenta, con
     * `{ errors: [...] }`, en vez del `{ message }` escueto del framework.
     *
     * Que ninguna respuesta lleve el volcado de depuración es otra cosa, y la
     * decide ADR-0003 apagándolo en todos los entornos. Las dos piezas son
     * complementarias: sin esta, el 404 saldría limpio pero con otra forma.
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
