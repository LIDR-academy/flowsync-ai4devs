import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import {
  buildDocumentJson,
  describeDifferences,
  temporaryDocumentPath,
  versionedDocumentPath,
} from '#openapi/document'

/**
 * Comprueba que `docs/api/openapi.json` sigue siendo el documento que genera el
 * código de hoy.
 *
 * Regenera el documento en `tmp/openapi/openapi.json` y lo compara con el
 * versionado. **Solo compara**: nunca reescribe el fichero versionado, ni toca
 * las rutas. Si no coinciden termina con código 1 y dice en qué se diferencian,
 * para que el arreglo sea explícito (`npm run openapi:generate` y commit).
 */
export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description =
    'Comprueba que docs/api/openapi.json coincide con el documento que genera el código'

  static options: CommandOptions = {
    startApp: true,
  }

  /**
   * Cuántas diferencias se imprimen antes de cortar. Un documento que se ha
   * quedado muy atrás genera cientos: con las primeras ya se sabe qué pasó.
   */
  static #maxReportedDifferences = 25

  async run() {
    const versionedPath = versionedDocumentPath(this.app)
    const temporaryPath = temporaryDocumentPath(this.app)

    const regenerated = await buildDocumentJson(this.app)
    await mkdir(dirname(temporaryPath), { recursive: true })
    await writeFile(temporaryPath, regenerated, 'utf-8')

    const versioned = await this.#readVersionedDocument(versionedPath)

    if (versioned === null) {
      this.exitCode = 1
      this.logger.error(`no existe ${this.#display(versionedPath)}`)
      this.logger.info(`el documento regenerado está en ${this.#display(temporaryPath)}`)
      this.logger.info('ejecuta `npm run openapi:generate` y commitea el fichero')
      return
    }

    if (versioned === regenerated) {
      this.logger.success(`${this.#display(versionedPath)} está al día`)
      return
    }

    this.exitCode = 1
    this.logger.error(
      `${this.#display(versionedPath)} no coincide con el documento que genera el código`
    )
    this.logger.info(`versionado: ${this.#display(versionedPath)}`)
    this.logger.info(`regenerado: ${this.#display(temporaryPath)}`)
    this.#reportDifferences(versioned, regenerated)
    this.logger.info('ejecuta `npm run openapi:generate` y commitea el diff')
  }

  /**
   * El fichero versionado puede no existir todavía; cualquier otro error de
   * lectura (permisos, por ejemplo) sí es un fallo de verdad y se propaga.
   */
  async #readVersionedDocument(path: string): Promise<string | null> {
    try {
      return await readFile(path, 'utf-8')
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return null
      }

      throw error
    }
  }

  #reportDifferences(versioned: string, regenerated: string): void {
    const differences = describeDifferences(versioned, regenerated)
    const reported = differences.slice(0, OpenapiCheck.#maxReportedDifferences)

    for (const difference of reported) {
      this.logger.log(`  ${this.colors.yellow(difference)}`)
    }

    const remaining = differences.length - reported.length

    if (remaining > 0) {
      this.logger.log(`  ${this.colors.dim(`y ${remaining} diferencia(s) más`)}`)
    }
  }

  #display(path: string): string {
    return relative(process.cwd(), path)
  }
}
