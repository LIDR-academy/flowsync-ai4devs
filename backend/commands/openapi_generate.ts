import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import {
  DOCUMENT_REPO_PATH,
  buildDocument,
  documentPath,
  serializeDocument,
} from '#services/openapi_document'

export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = `Construye el documento OpenAPI y lo escribe en ${DOCUMENT_REPO_PATH}`

  /**
   * El documento se construye desde el router, así que hace falta la
   * aplicación arrancada: los preloads de `adonisrc.ts` son los que cargan
   * `#start/routes`.
   */
  static options: CommandOptions = { startApp: true }

  async run() {
    const document = await buildDocument()
    const target = documentPath()

    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, serializeDocument(document), 'utf-8')

    this.logger.success(`documento OpenAPI escrito en ${DOCUMENT_REPO_PATH}`)
  }
}
