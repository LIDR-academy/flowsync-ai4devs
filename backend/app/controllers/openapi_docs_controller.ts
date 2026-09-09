import openapi from '@foadonis/openapi/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import type { OpenAPIV3 } from 'openapi-types'
import YAML from 'yaml'

/**
 * `OpenAPI#buildDocument()` reconstruye el documento entero salvo en
 * producción, y cada reconstrucción vuelve a fusionar los parámetros de ruta
 * sobre el almacén de metadatos del controlador (`RouterLoader`) sin
 * deduplicar: cada `GET /api.json` en desarrollo deja un `id` de más en los
 * endpoints con `:id`, sin límite, mientras viva el proceso. Se cachea una
 * sola construcción por arranque — el modo `--hmr` ya da una caché nueva en
 * cada cambio de código — para no depender de ese camino.
 */
let cachedDocument: OpenAPIV3.Document | null = null

async function getDocument(): Promise<OpenAPIV3.Document> {
  if (!cachedDocument) {
    cachedDocument = await openapi.buildDocument()
  }
  return cachedDocument
}

export default class OpenapiDocsController {
  async html({ response }: HttpContext) {
    const content = openapi.generateUi('/api.json')
    return response.status(200).header('Content-Type', 'text/html').send(content)
  }

  async json({ response }: HttpContext) {
    const document = await getDocument()
    return response
      .status(200)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify(document))
  }

  async yaml({ response }: HttpContext) {
    const document = await getDocument()
    return response
      .status(200)
      .header('Content-Type', 'application/yaml')
      .send(YAML.stringify(document))
  }
}
