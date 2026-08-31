import type { ApplicationService } from '@adonisjs/core/types'

/**
 * El documento OpenAPI no vive en ninguna parte: `@foadonis/openapi` lo
 * construye en cada petición a `/api.json` a partir de las rutas y de los
 * decoradores de los controladores. Este módulo es lo único que comparten
 * `openapi:generate` —que lo escribe en el fichero versionado— y
 * `openapi:check` —que lo regenera aparte y compara—, para que los dos
 * obtengan exactamente los mismos bytes a partir del mismo código.
 */

/**
 * Construye el documento tal y como lo serviría el servidor.
 *
 * `router.commit()` no sobra: en consola nadie ha arrancado el servidor HTTP,
 * así que las rutas están declaradas pero no volcadas al store, y el cargador
 * de `@foadonis/openapi` las lee de ahí con `router.toJSON()`. Sin este commit
 * el documento saldría con `paths: {}`. Es idempotente, así que no rompe nada
 * si alguien lo llama con las rutas ya commiteadas.
 */
export async function buildDocument(app: ApplicationService) {
  const router = await app.container.make('router')
  router.commit()

  const openapi = await app.container.make('openapi')
  return openapi.buildDocument()
}

export type OpenApiDocument = Awaited<ReturnType<typeof buildDocument>>

/**
 * Serializa siempre igual: dos espacios de sangrado y salto de línea final.
 * La forma importa tanto como el contenido —el fichero se versiona y se
 * revisa—, así que un cambio de una operación tiene que ser un diff de unas
 * pocas líneas y no del fichero entero.
 */
export function serializeDocument(document: OpenApiDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`
}

/**
 * Ruta del documento versionado: `docs/api/openapi.json`, en la raíz del
 * repositorio y no dentro de `backend/`, porque documenta el contrato de la
 * API para todo el monorepo. `makePath` resuelve desde `backend/`.
 */
export function versionedDocumentPath(app: ApplicationService) {
  return app.makePath('..', 'docs', 'api', 'openapi.json')
}
