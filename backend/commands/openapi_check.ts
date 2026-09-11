import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import { OPENAPI_DOCUMENT_PATH_SEGMENTS, serializeOpenapiDocument } from '#openapi/document'
import { diffJson } from '#openapi/diff'

/**
 * Comprueba que `docs/api/openapi.json` sigue siendo lo que el código genera
 * hoy. Regenera el documento en una ubicación temporal (fuera del
 * repositorio) y lo compara con el fichero versionado; nunca escribe sobre
 * este último ni toca rutas — si no coinciden, el arreglo es correr
 * `openapi:generate` y commitear el resultado, no que este comando lo haga
 * por su cuenta.
 */
export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description =
    'Comprueba que docs/api/openapi.json coincide con el contrato que genera el código'
  static options = {
    startApp: true,
  }

  async run() {
    const versionedPath = this.app.makePath(...OPENAPI_DOCUMENT_PATH_SEGMENTS)

    let versioned: string
    try {
      versioned = await readFile(versionedPath, 'utf-8')
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        this.logger.error(
          `No existe "${versionedPath}". Genera el documento primero con "node ace openapi:generate".`
        )
        this.exitCode = 1
        return
      }
      throw error
    }

    const router = await this.app.container.make('router')
    router.commit()

    const openapi = await this.app.container.make('openapi')
    const document = await openapi.buildDocument()
    const fresh = serializeOpenapiDocument(document)

    if (fresh === versioned) {
      this.logger.success('El documento OpenAPI versionado está al día.')
      return
    }

    const tempDir = await mkdtemp(join(tmpdir(), 'flowsync-openapi-'))
    const tempPath = join(tempDir, 'openapi.json')
    await writeFile(tempPath, fresh)

    this.logger.error(
      `"${versionedPath}" no coincide con el documento que genera el código ahora mismo.`
    )
    this.logger.log(`Documento recién generado, para comparar a mano si hace falta: "${tempPath}"`)
    this.logger.log('Diferencias:')
    for (const line of diffJson(JSON.parse(versioned), JSON.parse(fresh))) {
      this.logger.log(`  ${line}`)
    }
    this.logger.log(
      'Si el cambio es intencional: "node ace openapi:generate" y commitea el resultado.'
    )

    this.exitCode = 1
  }
}
