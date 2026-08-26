import type { ApplicationService } from '@adonisjs/core/types'

/**
 * Dónde vive el documento versionado, contado desde la raíz del repositorio.
 * Se usa también en los mensajes de los dos comandos, para que lo que se lee
 * en consola sea lo que se busca en el árbol.
 */
export const OPENAPI_DOCUMENT_PATH = 'docs/api/openapi.json'

/**
 * La misma ruta, ya absoluta. La raíz de la aplicación es `backend/`, y el
 * documento cuelga del `docs/` del repositorio —junto a los ADR y a los README
 * de las capabilities—, de ahí el salto hacia arriba.
 */
export function openApiDocumentPath(app: ApplicationService) {
  return app.makePath('..', OPENAPI_DOCUMENT_PATH)
}

/**
 * Construye el documento desde el router, que es exactamente la misma fuente
 * de la que sale `GET /api.json`: el fichero versionado no es una copia escrita
 * a mano que pueda contradecir al código, es ese código serializado.
 *
 * `router.commit()` no sobra. Fuera del servidor HTTP nadie lo llama, y sin él
 * `buildDocument()` no ve ni una ruta y devuelve un documento vacío. Es lo
 * mismo que hace `node ace list:routes` antes de listar nada.
 */
export async function buildOpenApiDocument(app: ApplicationService) {
  const router = await app.container.make('router')
  router.commit()

  const openapi = await app.container.make('openapi')

  return serializeOpenApiDocument(await openapi.buildDocument())
}

/**
 * Sangría de dos espacios y salto de línea final. El fichero se versiona, así
 * que se escribe para que sus diffs se lean línea a línea, no para que ocupe
 * poco. Los dos comandos serializan por aquí: si `openapi:generate` y
 * `openapi:check` formatearan distinto, la comprobación fallaría sin que
 * hubiera cambiado nada del contrato.
 */
function serializeOpenApiDocument(document: unknown) {
  return `${JSON.stringify(document, null, 2)}\n`
}
