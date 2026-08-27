import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import { describirDiferencias } from '#services/openapi_diff'
import {
  buildOpenApiDocument,
  openApiDocumentPath,
  writeOpenApiDocument,
} from '#services/openapi_document'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description =
    'Comprueba que docs/api/openapi.json coincide con el documento que genera el código'

  static options: CommandOptions = { startApp: true }

  async run() {
    const versionado = openApiDocumentPath(this.app)
    const relativo = relative(process.cwd(), versionado)

    // El documento regenerado se escribe fuera del repositorio, en un
    // directorio temporal. Este comando solo compara: nunca toca el fichero
    // versionado, ni siquiera cuando la comparación falla.
    const temporal = join(await mkdtemp(join(tmpdir(), 'flowsync-openapi-')), 'openapi.json')
    const regenerado = await buildOpenApiDocument()
    await writeOpenApiDocument(temporal, regenerado)

    let contenidoVersionado: string
    try {
      contenidoVersionado = await readFile(versionado, 'utf-8')
    } catch {
      this.logger.error(`no existe ${relativo}`)
      this.logger.info(`el documento generado está en ${temporal}`)
      this.logger.info('créalo con `npm run openapi:generate` y commitéalo')
      this.exitCode = 1
      return
    }

    const diferencias = describirDiferencias(contenidoVersionado, regenerado)

    if (diferencias.length === 0) {
      this.logger.success(`${relativo} coincide con el documento que genera el código`)
      return
    }

    this.logger.error(`${relativo} no coincide con el documento que genera el código`)
    for (const linea of diferencias) {
      this.logger.log(linea)
    }
    this.logger.log('')
    this.logger.info(`documento regenerado en ${temporal}`)
    this.logger.info('para ponerlo al día: `npm run openapi:generate` y commitea el resultado')

    this.exitCode = 1
  }
}
