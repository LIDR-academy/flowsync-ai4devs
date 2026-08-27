import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import { buildDocumentJson, versionedDocumentPath } from '#openapi/document'

/**
 * Escribe el documento OpenAPI en `docs/api/openapi.json`.
 *
 * Es el único sitio desde el que se escribe ese fichero: no se edita a mano.
 * Si el diff que deja no es el esperado, lo que hay que cambiar son las rutas,
 * los controladores o los esquemas de `app/openapi/`, y volver a ejecutarlo.
 */
export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Genera el documento OpenAPI y lo escribe en docs/api/openapi.json'

  /**
   * El documento se construye desde el router y desde los decoradores de los
   * controladores, así que hace falta la aplicación booteada.
   */
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const document = await buildDocumentJson(this.app)
    const path = versionedDocumentPath(this.app)

    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, document, 'utf-8')

    this.logger.success(`documento escrito en ${relative(process.cwd(), path)}`)
  }
}
