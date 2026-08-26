import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import {
  buildOpenApiDocument,
  OPENAPI_DOCUMENT_PATH,
  openApiDocumentPath,
} from '#services/openapi_document'

/**
 * Saca el contrato de la API del proceso y lo deja en un fichero versionado.
 *
 * Hasta ahora el documento solo existía mientras el servidor corría: se
 * construía en cada petición y se servía por HTTP. Eso vale para leerlo, pero
 * no para revisarlo en un PR ni para notar que ha cambiado sin querer.
 */
export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = `Construye el documento OpenAPI desde el router y lo escribe en ${OPENAPI_DOCUMENT_PATH}`

  /**
   * Hace falta arrancar la aplicación: las rutas se registran en el preload
   * `#start/routes`, y sin ellas no hay documento que construir.
   */
  static options: CommandOptions = { startApp: true }

  async run() {
    const document = await buildOpenApiDocument(this.app)
    const path = openApiDocumentPath(this.app)

    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, document, 'utf-8')

    this.logger.success(`documento escrito en ${OPENAPI_DOCUMENT_PATH}`)
  }
}
