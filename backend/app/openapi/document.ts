import type { ApplicationService } from '@adonisjs/core/types'
import router from '@adonisjs/core/services/router'
import openapi from '@foadonis/openapi/services/main'

/**
 * El documento OpenAPI tal y como lo construye `@foadonis/openapi`, sin pasar
 * por una petición HTTP.
 */
export type OpenApiDocument = Awaited<ReturnType<typeof openapi.buildDocument>>

/**
 * Construye el documento desde el router, que es de donde sale: el paquete
 * recorre las rutas registradas y lee los decoradores de cada controlador.
 *
 * El `commit()` no es opcional. Volcar las rutas al store lo hace el servidor
 * HTTP al arrancar, y en un comando de ace nadie ha arrancado ningún servidor:
 * sin él `router.toJSON()` no devuelve nada y el documento saldría con
 * `paths: {}`, con lo que la comprobación compararía dos vacíos y siempre
 * pasaría. Se consulta antes `commited` porque commitear dos veces lanza.
 */
export async function buildOpenApiDocument(): Promise<OpenApiDocument> {
  if (!router.commited) {
    router.commit()
  }

  return openapi.buildDocument()
}

/**
 * La única forma de volcar el documento a texto. Generar y comprobar
 * serializan por aquí a propósito: si cada uno lo hiciera a su manera,
 * `openapi:check` fallaría por una indentación distinta en vez de por el
 * contrato, que es lo único que queremos vigilar.
 *
 * Dos espacios y salto de línea final para que un cambio del contrato sea un
 * diff de unas pocas líneas y no de una sola línea kilométrica.
 */
export function serializeOpenApiDocument(document: OpenApiDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`
}

/**
 * El documento versionado, en `docs/api/openapi.json`. Vive en la raíz del
 * repositorio junto al resto de `docs/`, no dentro de `backend/`, así que se
 * resuelve subiendo un nivel desde la raíz de la aplicación.
 */
export function versionedDocumentPath(app: ApplicationService): string {
  return app.makePath('../docs/api/openapi.json')
}

/**
 * Donde `openapi:check` regenera para comparar. `backend/tmp/` está ignorado
 * por git, así que la copia recién construida nunca se cuela en un commit ni
 * se confunde con la versionada.
 */
export function scratchDocumentPath(app: ApplicationService): string {
  return app.tmpPath('openapi/openapi.json')
}
