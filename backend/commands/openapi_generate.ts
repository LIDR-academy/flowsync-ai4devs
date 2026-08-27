import { relative } from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import {
  buildOpenApiDocument,
  openApiDocumentPath,
  writeOpenApiDocument,
} from '#services/openapi_document'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Genera el documento OpenAPI y lo escribe en docs/api/openapi.json'

  // El documento se construye desde el router, así que la aplicación tiene que
  // estar arrancada: sin los preloads no hay rutas que documentar.
  static options: CommandOptions = { startApp: true }

  async run() {
    const destino = openApiDocumentPath(this.app)

    await writeOpenApiDocument(destino, await buildOpenApiDocument())

    this.logger.success(`documento escrito en ${relative(process.cwd(), destino)}`)
  }
}
