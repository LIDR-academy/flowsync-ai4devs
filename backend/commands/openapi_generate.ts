import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import { buildDocument, serializeDocument, versionedDocumentPath } from '#openapi/document'

/**
 * Escribe en `docs/api/openapi.json` el mismo documento que el servidor sirve
 * en `/api.json`. Es el único sitio desde el que se escribe ese fichero: la
 * comprobación (`openapi:check`) solo compara.
 */
export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Genera el documento OpenAPI y lo escribe en docs/api/openapi.json'

  /**
   * Hay que arrancar la aplicación: el documento sale de las rutas y de los
   * controladores, que solo existen con los preloads y el contenedor en pie.
   */
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const destination = versionedDocumentPath(this.app)
    const contents = serializeDocument(await buildDocument(this.app))

    const previous = await readFile(destination, 'utf-8').catch(() => null)

    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, contents, 'utf-8')

    const shown = relative(this.app.makePath('..'), destination)

    if (previous === null) {
      this.logger.success(`${shown} creado`)
    } else if (previous === contents) {
      this.logger.info(`${shown} sin cambios`)
    } else {
      this.logger.success(`${shown} actualizado`)
    }
  }
}
