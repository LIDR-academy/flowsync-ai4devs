import router from '@adonisjs/core/services/router'
import openapi from '@foadonis/openapi/services/main'
import type { OpenAPIDocument } from '@martin.xyz/openapi-decorators/types'

/**
 * El contrato vive en dos sitios y esta es la única función que lo construye,
 * para que `openapi:generate` y `openapi:check` no puedan divergir: si el
 * generador escribiera de una forma y el comprobador leyera de otra, el check
 * fallaría por la diferencia entre los dos comandos y no por el contrato.
 */
export async function construirDocumento(): Promise<OpenAPIDocument> {
  // Sin volcar las rutas al store, `buildDocument()` sale con `paths: {}` y el
  // contrato entero pasaría a estar vacío sin que nada se queje. El servidor
  // hace este commit al arrancar; un comando de ace no.
  router.commit()

  return openapi.buildDocument()
}

let contrato: Promise<string> | null = null

/**
 * El documento que sirven `/api.json` y `/api.yaml`, construido una sola vez
 * por proceso (H-26).
 *
 * Se cachea **la promesa**, no el resultado: se asigna antes del primer
 * `await`, así que una segunda petición que llegue mientras se construye
 * espera a la misma construcción en vez de lanzar otra. Cacheando el texto,
 * dos construcciones solapadas salían las dos con parámetros repetidos (H-35).
 *
 * Si la construcción falla, **el fallo se queda** hasta reiniciar el proceso,
 * a propósito. Vaciar la caché para reintentar parece más amable y es peor: la
 * construcción fallida ya acumuló metadata, y el reintento responde `200` con
 * parámetros repetidos, que es H-26 servido en silencio. Medido el 2026-09-12:
 * fallo en el primer intento, `200` con tres repetidos en el segundo. Un `500`
 * se nota; un contrato inválido con `200`, no.
 */
export function contratoServido(): Promise<string> {
  contrato ??= openapi.buildDocument().then((documento) => JSON.stringify(documento))
  return contrato
}

/**
 * Si el documento servido ya se construyó en este proceso. Lo usa la prueba de
 * H-35, que solo puede ver la carrera si es la primera en construirlo: la
 * librería acumula en cada construcción, así que vaciar la caché no la
 * devolvería a su estado de partida.
 */
export function contratoYaConstruido(): boolean {
  return contrato !== null
}

/**
 * Una sola serialización para los dos comandos: dos espacios y salto final.
 * Si cada uno eligiera la suya, el check fallaría por la indentación y no por
 * el contrato, que es ruido con apariencia de hallazgo.
 */
export function serializar(documento: OpenAPIDocument): string {
  return `${JSON.stringify(documento, null, 2)}\n`
}
