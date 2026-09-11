import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { BaseCommand } from '@adonisjs/core/ace'
import router from '@adonisjs/core/services/router'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import openapi from '@foadonis/openapi/services/main'

/**
 * Construye el documento OpenAPI a partir de las rutas y decoradores
 * registrados, y lo escribe en `docs/api/openapi.json`. Es el único comando
 * que puede reescribir ese fichero: `openapi:check` solo lo lee.
 */
export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Genera el documento OpenAPI y lo escribe en docs/api/openapi.json'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    // `startApp` registra las rutas pero no las compila: sin este commit
    // el router está vacío y el documento sale sin `paths`, como el HTTP
    // server nunca llegó a arrancar (mismo motivo por el que list:routes
    // hace lo mismo antes de leer router.toJSON()).
    router.commit()

    const document = await openapi.buildDocument()
    const outputPath = fileURLToPath(new URL('../docs/api/openapi.json', this.app.appRoot))

    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf-8')

    this.logger.success(`Documento OpenAPI escrito en ${outputPath}`)
  }
}
