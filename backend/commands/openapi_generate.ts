import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import {
  buildOpenApiDocument,
  serializeOpenApiDocument,
  versionedDocumentPath,
} from '#openapi/document'

/**
 * Escribe el documento OpenAPI en `docs/api/openapi.json`.
 *
 * Es el único sitio del proyecto desde el que se escribe ese fichero: cualquier
 * otra cosa que lo modifique lo saca de sincronía con el código y hace fallar
 * `openapi:check`, que es justo lo que ese comando existe para detectar.
 */
export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Genera el documento OpenAPI y lo escribe en docs/api/openapi.json'

  // El documento se construye leyendo el router y los controladores, así que
  // hace falta la aplicación en pie: sin esto solo tendríamos el fichero de
  // configuración.
  static options: CommandOptions = { startApp: true }

  async run() {
    const document = await buildOpenApiDocument()
    const path = versionedDocumentPath(this.app)

    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, serializeOpenApiDocument(document), 'utf-8')

    const paths = Object.keys(document.paths ?? {})
    const operations = paths.reduce(
      (total, route) => total + Object.keys(document.paths?.[route] ?? {}).length,
      0
    )
    const schemas = Object.keys(document.components?.schemas ?? {})

    this.logger.success(`documento escrito en ${relative(process.cwd(), path)}`)
    this.logger.info(`${paths.length} rutas, ${operations} operaciones, ${schemas.length} esquemas`)
  }
}
