import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import { OPENAPI_DOCUMENT_PATH_SEGMENTS, serializeOpenapiDocument } from '#openapi/document'

/**
 * Hoy el contrato de la API solo existe mientras el servidor corre: se
 * construye en cada petición a `/api.json` y no queda ni un fichero en el
 * repositorio. Este comando llama al mismo builder que esa ruta y vuelca el
 * resultado en `docs/api/openapi.json`, para que el contrato se pueda
 * versionar, revisar en PRs y comprobar con `openapi:check`.
 */
export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Genera el documento OpenAPI y lo escribe en docs/api/openapi.json'
  static options = {
    startApp: true,
  }

  async run() {
    // El servidor HTTP confirma las rutas al arrancar; un comando ace no pasa
    // por ahí, así que sin este commit el router seguiría "abierto" y
    // buildDocument() vería cero rutas (mismo truco que usa `list:routes`).
    const router = await this.app.container.make('router')
    router.commit()

    const openapi = await this.app.container.make('openapi')
    const document = await openapi.buildDocument()
    const outputPath = this.app.makePath(...OPENAPI_DOCUMENT_PATH_SEGMENTS)

    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, serializeOpenapiDocument(document))

    this.logger.success(`Documento OpenAPI escrito en "${outputPath}"`)
  }
}
